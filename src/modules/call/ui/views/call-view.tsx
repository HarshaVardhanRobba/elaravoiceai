"use client";

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "../components/call-provider";

interface CallViewProps {
  meetingId: string;
}

export const CallView = ({ meetingId }: CallViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  // Handle meetings that can no longer be joined. "pending" means the call
  // already ended and the summary is still being generated.
  if (
    data.status === "completed" ||
    data.status === "cancelled" ||
    data.status === "pending"
  ) {
    const title =
      data.status === "completed"
        ? "Meeting Completed"
        : data.status === "pending"
          ? "Meeting Ended"
          : "Meeting Cancelled";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <ErrorState
            title={title}
            description="You can no longer join this meeting."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CallProvider
        meetingId={meetingId}
        meetingname={data.name}
      />
    </div>
  );
};