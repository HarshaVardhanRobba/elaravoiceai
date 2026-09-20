import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { meetings } from "@/db/schema";

/**
 * Moves a meeting from "pending" to "completed" once the summary, transcript
 * and recording have all been generated. Safe to call from every completion
 * point (session end, transcript, recording, summary): the update is a single
 * conditional statement, so it is a no-op until everything is ready and
 * idempotent under webhook redelivery.
 */
export async function promoteMeetingIfReady(meetingId: string) {
  const [promoted] = await db
    .update(meetings)
    .set({ status: "completed" })
    .where(
      and(
        eq(meetings.id, meetingId),
        eq(meetings.status, "pending"),
        isNotNull(meetings.summary),
        isNotNull(meetings.transcriptUrl),
        isNotNull(meetings.recordingUrl),
      ),
    )
    .returning({ id: meetings.id });

  return Boolean(promoted);
}
