import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { GenerateAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { streamVideo } from "@/lib/stream-video";
import { promoteMeetingIfReady } from "@/modules/meetings/server/promote-meeting";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
  CallRecordingReadyEvent,
  CallSessionEndedEvent,
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
  CallTranscriptionReadyEvent,
  MessageNewEvent,
} from "@stream-io/node-sdk";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Same model the meeting summarizer already runs on with this API key.
const CHAT_MODEL = "gpt-4o-mini";

// The agent's call token has to outlive the whole meeting.
const AGENT_TOKEN_TTL_SECONDS = 3 * 60 * 60;

// The call id is the meeting id (see meetings.create), so it is a safe
// fallback when `custom.meetingId` is missing (e.g. call created via join).
const getMeetingId = (call?: { id?: string; custom?: Record<string, unknown> }) =>
  (call?.custom?.meetingId as string | undefined) ?? call?.id;

export async function POST(request: NextRequest) {
  console.log("🔔 Webhook request received");

  try {
    const signature = request.headers.get("x-signature");

    if (!signature) {
      console.error("❌ Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();

    const isValid = streamVideo.verifyWebhook(body, signature);
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      console.error("❌ Invalid JSON payload", err);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>).type;
    console.log("📦 Incoming event type:", eventType);

    // ===============================
    // CALL SESSION STARTED
    // ===============================
    if (eventType === "call.session_started") {
      console.log("🚀 Handling call.session_started");

      const event = payload as CallSessionStartedEvent;
      const meetingId = getMeetingId(event.call);

      if (!meetingId) {
        console.error("❌ Missing meetingId in session_started");
        return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
      }

      // Atomic claim: only one delivery can flip upcomming -> active, so a
      // redelivered webhook can never connect a second agent.
      const [claimed] = await db
        .update(meetings)
        .set({ status: "active", startedAt: new Date() })
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, "upcomming")))
        .returning();

      let meeting = claimed;

      if (!meeting) {
        // Already active: a new session may have started without an agent
        // (e.g. an earlier connect could not be rolled back). Reconnect only
        // if the agent is really missing from the call.
        const [existingMeeting] = await db
          .select()
          .from(meetings)
          .where(eq(meetings.id, meetingId));

        if (!existingMeeting || existingMeeting.status !== "active") {
          console.warn("⚠️ Meeting not found or already started:", meetingId);
          return NextResponse.json({ status: "ignored" });
        }

        meeting = existingMeeting;
      }

      // Undo the claim so Stream's retry (or the next session) can try again.
      const releaseClaim = async () => {
        if (!claimed) return;
        await db
          .update(meetings)
          .set({ status: "upcomming", startedAt: null })
          .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
      };

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, meeting.agentId));

      if (!existingAgent) {
        console.error("❌ Agent not found:", meeting.agentId);
        await releaseClaim();
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      try {
        const call = streamVideo.video.call("default", meetingId);
        const { call: callData } = await call.get();

        if (!claimed) {
          const agentAlreadyInCall = callData.session?.participants?.some(
            (participant) => participant.user.id === existingAgent.id
          );

          if (agentAlreadyInCall) {
            console.warn("⚠️ Agent already in call:", meetingId);
            return NextResponse.json({ status: "ignored" });
          }
        }

        const realtimeClient = await streamVideo.video.connectOpenAi({
          call,
          openAiApiKey: process.env.OPENAI_API_KEY!,
          agentUserId: existingAgent.id,
          validityInSeconds: AGENT_TOKEN_TTL_SECONDS,
        });

        // Without these the socket can drop with nothing in the logs (an
        // OpenAI-side rejection was exactly how the agent used to vanish
        // 2-3s after joining).
        realtimeClient.realtime.on("server.error", (event) => {
          console.error("❌ OpenAI realtime error", { meetingId, event });
        });
        realtimeClient.realtime.on("close", (event) => {
          console.warn("⚠️ OpenAI realtime socket closed", { meetingId, event });
        });

        // `model` is not a session option (the realtime model is picked in
        // connectOpenAi), so only the instructions are sent here.
        await realtimeClient.updateSession({
          instructions: existingAgent.instructions,
        });

        console.log("🤖 OpenAI realtime agent connected");
      } catch (err) {
        console.error("❌ Failed to connect OpenAI realtime:", err);
        await releaseClaim();
        return NextResponse.json(
          { error: "Failed to connect agent" },
          { status: 500 }
        );
      }
    }

    // ===============================
    // CALL PARTICIPANT LEFT
    // ===============================
    else if (eventType === "call.session_participant_left") {
      console.log("👋 Handling call.session_participant_left");

      const event = payload as CallSessionParticipantLeftEvent;
      const meetingId = event.call_cid?.split(":")[1];

      if (!meetingId) {
        console.error("❌ Missing meetingId in participant_left");
        return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
      }

      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

      if (!existingMeeting) {
        return NextResponse.json({ status: "ignored" });
      }

      // The agent dropping must never end the call.
      if (event.participant.user.id === existingMeeting.agentId) {
        console.warn("⚠️ Agent left the call:", meetingId);
        return NextResponse.json({ status: "ignored" });
      }

      const call = streamVideo.video.call("default", meetingId);
      const { call: callData } = await call.get();

      const humansStillInCall = (callData.session?.participants ?? []).filter(
        (participant) =>
          participant.user.id !== existingMeeting.agentId &&
          participant.user_session_id !== event.participant.user_session_id
      );

      if (humansStillInCall.length > 0) {
        return NextResponse.json({ status: "ignored" });
      }

      // Last human left: hang up so the agent disconnects and
      // call.session_ended fires.
      await call.end();
      console.log("📴 Last human left, call ended:", meetingId);
    }

    // ===============================
    // CALL TRANSCRIPTION READY
    // ===============================
    else if (eventType === "call.transcription_ready") {
      console.log("📝 Handling call.transcription_ready");

      const event = payload as CallTranscriptionReadyEvent;
      const callCid = event.call_cid;

      if (!callCid) {
        console.error("❌ Missing call_cid");
        return NextResponse.json({ error: "Missing call_cid" }, { status: 400 });
      }

      const meetingId = callCid.split(":")[1];

      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, meetingId));

      if (!existingMeeting) {
        console.error("❌ Meeting not found for transcription:", meetingId);
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({ transcriptUrl: event.call_transcription?.url })
        .where(eq(meetings.id, meetingId))
        .returning();

      console.log("📤 Sending event to Inngest:", meetingId);

      try {
        await inngest.send({
          name: "meetings/processing",
          data: {
            meetingId: updatedMeeting.id,
            transcriptUrl: updatedMeeting.transcriptUrl,
          },
        });
        console.log("✅ Inngest event sent successfully");
      } catch (err) {
        console.error("❌ Failed to send event to Inngest:", err);
      }

      await promoteMeetingIfReady(meetingId);
    }

    // ===============================
    // CALL SESSION ENDED
    // ===============================
    else if (eventType === "call.session_ended") {
      console.log("🔚 Handling call.session_ended");

      const event = payload as CallSessionEndedEvent;
      const meetingId = getMeetingId(event.call);

      if (!meetingId) {
        console.error("❌ Missing meetingId in session_ended", {
          callCid: event.call_cid,
        });
        return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
      }

      // "pending" = call is over, summary / transcript / recording are still
      // being generated. promoteMeetingIfReady flips it to "completed".
      await db
        .update(meetings)
        .set({ status: "pending", endedAt: new Date() })
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

      console.log("✅ Meeting marked pending:", meetingId);

      // The artifacts can land before the session-ended event does.
      await promoteMeetingIfReady(meetingId);
    }

    // ===============================
    // RECORDING READY
    // ===============================
    else if (eventType === "call.recording_ready") {
      console.log("🎥 Handling call.recording_ready");

      const event = payload as CallRecordingReadyEvent;
      const meetingId = event.call_cid?.split(":")[1];

      if (!meetingId) {
        console.warn("⚠️ Missing meetingId for recording_ready");
        return NextResponse.json({ status: "ignored" });
      }

      await db
        .update(meetings)
        .set({ recordingUrl: event.call_recording?.url })
        .where(eq(meetings.id, meetingId));

      console.log("✅ Recording URL saved:", meetingId);

      await promoteMeetingIfReady(meetingId);
    }

    // ===============================
    // CHAT MESSAGE (Ask AI)
    // ===============================
    else if (eventType === "message.new") {
      const event = payload as MessageNewEvent;
      const userId = event.user?.id;
      const channelId = event.channel_id;
      const text = event.message?.text;

      if (!userId || !channelId || !text) {
        return NextResponse.json({ status: "ignored" });
      }

      // The chat channel id is the meeting id; Ask AI only exists for
      // completed meetings, so anything else is not ours.
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

      if (!existingMeeting) {
        return NextResponse.json({ status: "ignored" });
      }

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId));

      if (!existingAgent) {
        console.error("❌ Agent not found for chat:", existingMeeting.agentId);
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      // The agent's own replies also arrive as message.new.
      if (userId === existingAgent.id) {
        return NextResponse.json({ status: "ignored" });
      }

      console.log("💬 Handling message.new for meeting:", channelId);

      const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:

      ${existingMeeting.summary ?? "No summary is available for this meeting."}

      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:

      ${existingAgent.instructions}

      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.

      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.

      If the summary does not contain enough information to answer a question, politely let the user know.

      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;

      const avatarUrl = GenerateAvatarUri({
        seed: existingAgent.name,
        variant: "botttsNeutral",
      });

      // The agent needs a Stream Chat identity (it only exists in Stream
      // Video otherwise) so its replies render with its own name and avatar.
      await streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      });

      const channel = streamChat.channel("messaging", channelId);
      await channel.watch();

      try {
        await channel.addMembers([existingAgent.id]);
      } catch (err) {
        console.warn("⚠️ Could not add agent to chat channel:", err);
      }

      // The incoming message is already in channel state; it is appended
      // explicitly below, so leave it out of the history.
      const previousMessages = channel.state.messages
        .filter((message) => message.id !== event.message?.id)
        .slice(-5)
        .filter((message) => message.text && message.text.trim() !== "")
        .map<ChatCompletionMessageParam>((message) => ({
          role: message.user?.id === existingAgent.id ? "assistant" : "user",
          content: message.text || "",
        }));

      const GPTResponse = await openaiClient.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: instructions },
          ...previousMessages,
          { role: "user", content: text },
        ],
      });

      const GPTResponseText = GPTResponse.choices[0]?.message?.content;

      if (!GPTResponseText) {
        console.error("❌ Empty AI response for meeting:", channelId);
        return NextResponse.json({ error: "GPTResponseText not found" }, { status: 400 });
      }

      // Awaited: on serverless the function can be frozen once the response
      // is returned, which would silently drop the reply.
      await channel.sendMessage({
        text: GPTResponseText,
        user: {
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        },
      });

      console.log("✅ AI reply sent for meeting:", channelId);
    }

    else {
      console.log("ℹ️ Unhandled event type:", eventType);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("💥 Fatal webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
