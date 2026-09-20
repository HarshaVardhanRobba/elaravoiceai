"use client";

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingId: string;
  meetingName: string;
}

export const CallUI = ({ meetingId, meetingName }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const call = useCall();
  const [phase, setPhase] = useState<"lobby" | "call" | "ended">("lobby");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!call || isJoining) return;

    setIsJoining(true);
    try {
      await call.join({ create: true });
      setPhase("call");
    } catch (err) {
      console.error("Join failed", err);
      toast.error("Couldn't join the call. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    // The meeting moves active -> pending -> completed on the server after
    // the call, so anything cached from before the call is stale.
    queryClient.invalidateQueries(
      trpc.meetings.getOne.queryOptions({ id: meetingId })
    );
    queryClient.invalidateQueries(trpc.meetings.getMany.pathFilter());

    setPhase("ended");
  };

  return (
    <StreamTheme className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full">
        {phase === "lobby" && (
          <CallLobby onJoin={handleJoin} isJoining={isJoining} />
        )}

        {phase === "call" && (
          <CallActive
            onLeave={handleLeave}
            meetingName={meetingName}
          />
        )}

        {phase === "ended" && (
          <CallEnded meetingId={meetingId} meetingName={meetingName} />
        )}
      </div>
    </StreamTheme>
  );
};
