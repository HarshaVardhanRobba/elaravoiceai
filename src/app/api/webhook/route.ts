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
import { createHash, createHmac } from "crypto";
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

// Realtime errors are not always Error instances (the OpenAI socket rejects
// with the raw server message), so flatten anything into loggable JSON.
const describeError = (err: unknown) => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      code: (err as { code?: unknown }).code,
      status: (err as { status?: unknown }).status,
      cause: err.cause instanceof Error ? err.cause.message : err.cause,
      stack: err.stack?.split("\n").slice(0, 6).join("\n"),
    };
  }
  return err;
};

// Turns the usual failure strings into a one-line pointer to the real cause.
const agentFailureHint = (err: unknown) => {
  const text = JSON.stringify(describeError(err)) ?? String(err);
  if (/invalid_api_key|incorrect api key|401/i.test(text))
    return "OpenAI rejected the API key (OPENAI_API_KEY wrong, revoked, or from another project).";
  if (/insufficient_quota|exceeded your current quota|billing/i.test(text))
    return "OpenAI account is out of credit/quota. Check billing on platform.openai.com.";
  if (/model_not_found|does not have access|not have access to model/i.test(text))
    return "This OpenAI key/project has no access to the Realtime model.";
  if (/rate_limit/i.test(text)) return "OpenAI rate limit hit.";
  if (/Closed without any messages/i.test(text))
    return "Socket closed before any message arrived: Stream or OpenAI refused the connection right away (bad Stream token, bad OpenAI key, or no Realtime access).";
  if (/Could not connect/i.test(text))
    return "WebSocket to Stream connect_agent failed (network, Stream API key/secret, or call does not exist).";
  if (/not connected/i.test(text))
    return "Socket dropped before updateSession ran, so the connection itself died right after opening.";
  if (/Already connected/i.test(text)) return "Realtime client was connected twice.";
  return "No known pattern matched. Send the whole [agent] block above.";
};

// One realtime agent per meeting per server process. Stream re-sends
// call.session_started when the first delivery is slow (a cold Next compile),
// and both deliveries then run at once: each sees no agent in the call yet and
// connects its own. Kept on globalThis so dev hot reloads do not reset it.
type AgentSlot = { connecting: boolean; client?: { isConnected(): boolean } };
const agentSlots = ((globalThis as { __elaraAgentSlots?: Map<string, AgentSlot> })
  .__elaraAgentSlots ??= new Map<string, AgentSlot>());

// Server events that fire many times per second and would bury the log.
const NOISY_EVENT = /(\.delta|rate_limits|input_audio_buffer\.append)/;

export async function POST(request: NextRequest) {
  console.log("🔔 Webhook request received");

  try {
    const signature = request.headers.get("x-signature");

    if (!signature) {
      console.error("❌ Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify against the exact bytes Stream signed; decoding to a string
    // first can rewrite invalid UTF-8 and break the HMAC.
    const rawBody = Buffer.from(await request.arrayBuffer());
    const body = rawBody.toString("utf8");

    const isValid = streamVideo.verifyWebhook(rawBody, signature);
    if (!isValid) {
      const secret = process.env.STREAM_VIDEO_SECRET_KEY ?? "";
      console.error("❌ Invalid webhook signature", {
        eventHeader: request.headers.get("x-webhook-event-type"),
        apiKeyHeaderMatches:
          request.headers.get("x-api-key") === process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
        bodyBytes: rawBody.length,
        contentLength: request.headers.get("content-length"),
        contentEncoding: request.headers.get("content-encoding"),
        receivedSignature: signature.slice(0, 12),
        expectedSignature: createHmac("sha256", secret).update(rawBody).digest("hex").slice(0, 12),
        secretLength: secret.length,
        secretFingerprint: createHash("sha256").update(secret).digest("hex").slice(0, 8),
      });
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

      const slot = agentSlots.get(meetingId);
      if (slot && (slot.connecting || slot.client?.isConnected())) {
        console.warn(
          `[agent ${meetingId}] duplicate call.session_started ignored (agent already ${
            slot.connecting ? "connecting" : "connected"
          })`
        );
        return NextResponse.json({ status: "ignored" });
      }
      // No await between the check above and this line, so only one delivery wins.
      const mySlot: AgentSlot = { connecting: true };
      agentSlots.set(meetingId, mySlot);

      // Every line of the agent hand-off is tagged [agent] so one grep (or
      // one copy-paste of the terminal) shows the whole story.
      const tag = `[agent ${meetingId}]`;
      let step = "start";
      const startedAt = Date.now();
      const at = () => `+${Date.now() - startedAt}ms`;

      try {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log(`${tag} ${at()} preflight`, {
          meetingStatus: meeting.status,
          claimedThisDelivery: Boolean(claimed),
          agentId: existingAgent.id,
          agentName: existingAgent.name,
          instructionsLength: existingAgent.instructions?.length ?? 0,
          openAiKeyPresent: Boolean(apiKey),
          openAiKeyShape: apiKey
            ? `${apiKey.slice(0, 7)}…(${apiKey.length} chars)`
            : null,
          streamKeyPresent: Boolean(process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY),
          streamSecretPresent: Boolean(process.env.STREAM_VIDEO_SECRET_KEY),
        });

        if (!apiKey) {
          throw new Error("OPENAI_API_KEY is not set in the server environment");
        }
        if (!existingAgent.instructions?.trim()) {
          console.warn(`${tag} agent has empty instructions; it will join but have no persona`);
        }

        step = "call.get";
        const call = streamVideo.video.call("default", meetingId);
        const { call: callData } = await call.get();
        console.log(`${tag} ${at()} call.get ok`, {
          callCid: callData.cid,
          participantsNow: callData.session?.participants?.map((p) => p.user.id) ?? [],
        });

        if (!claimed) {
          const agentAlreadyInCall = callData.session?.participants?.some(
            (participant) => participant.user.id === existingAgent.id
          );

          if (agentAlreadyInCall) {
            console.warn(`${tag} agent already in call, skipping`);
            if (agentSlots.get(meetingId) === mySlot) agentSlots.delete(meetingId);
            return NextResponse.json({ status: "ignored" });
          }
        }

        step = "connectOpenAi";
        console.log(`${tag} ${at()} connecting to Stream connect_agent + OpenAI realtime...`);
        const realtimeClient = await streamVideo.video.connectOpenAi({
          call,
          openAiApiKey: apiKey,
          agentUserId: existingAgent.id,
          validityInSeconds: AGENT_TOKEN_TTL_SECONDS,
        });
        console.log(`${tag} ${at()} socket open, connected=${realtimeClient.isConnected()}`);
        mySlot.connecting = false;
        mySlot.client = realtimeClient;

        // Attached right after connect. Wildcards catch everything OpenAI
        // sends so the reason for a drop is always in the terminal.
        realtimeClient.realtime.on("server.error", (event: unknown) => {
          console.error(`${tag} ${at()} ❌ OpenAI server.error`, JSON.stringify(event));
          console.error(`${tag} HINT: ${agentFailureHint(event)}`);
        });
        realtimeClient.realtime.on("close", (event: unknown) => {
          if (agentSlots.get(meetingId) === mySlot) agentSlots.delete(meetingId);
          console.warn(
            `${tag} ${at()} ⚠️ realtime socket CLOSED`,
            JSON.stringify(event),
            "(error:true = socket error, error:false = clean close by remote)"
          );
        });
        realtimeClient.realtime.on("server.*", (raw: unknown) => {
          const event = raw as { type?: string };
          if (event?.type && NOISY_EVENT.test(event.type)) return;
          console.log(`${tag} ${at()} ⬇ server`, event?.type, JSON.stringify(event).slice(0, 400));
        });
        realtimeClient.realtime.on("client.*", (raw: unknown) => {
          const event = raw as { type?: string };
          if (event?.type && NOISY_EVENT.test(event.type)) return;
          console.log(`${tag} ${at()} ⬆ client`, event?.type, JSON.stringify(event).slice(0, 400));
        });
        realtimeClient.on("error", (event: unknown) => {
          console.error(`${tag} ${at()} ❌ client error`, JSON.stringify(event));
        });

        // `model` is not a session option (the realtime model is picked in
        // connectOpenAi), so only the instructions are sent here.
        step = "updateSession";
        // turn_detection defaults to null, which means OpenAI never decides
        // the caller stopped talking and the agent stays silent forever.
        await realtimeClient.updateSession({
          instructions: existingAgent.instructions,
          turn_detection: { type: "server_vad" },
        });
        console.log(`${tag} ${at()} updateSession sent`);

        // Nothing triggers a reply until someone speaks, so open the call
        // with a short spoken greeting.
        step = "greeting";
        realtimeClient.sendUserMessageContent([
          {
            type: "input_text",
            text: "Greet the participants in one short sentence and introduce yourself.",
          },
        ]);
        console.log(`${tag} ${at()} greeting requested`);

        // Heartbeat: shows whether the agent is still alive after the usual
        // 2-3s drop window and after it should have greeted.
        for (const delay of [3000, 10000]) {
          setTimeout(() => {
            console.log(
              `${tag} ${at()} still connected? ${realtimeClient.isConnected()} (checked ${delay / 1000}s after connect)`
            );
          }, delay);
        }

        console.log(`${tag} ${at()} 🤖 OpenAI realtime agent connected`);
      } catch (err) {
        console.error(`${tag} ${at()} ❌ FAILED at step "${step}"`, describeError(err));
        console.error(`${tag} HINT: ${agentFailureHint(err)}`);
        if (agentSlots.get(meetingId) === mySlot) agentSlots.delete(meetingId);
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
