"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AgentIDviewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "../../hooks/use-confirm";
import { UpdateAgentDialog } from "../components/update-agent-dialog";

interface AgentIDviewProps {
  agentId: string;
}

export const AgentIdview = ({ agentId }: AgentIDviewProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.premium.getFreeUsage.queryOptions()
        );
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [ConfirmDialog, confirmRemove] = useConfirm(
    "Delete Agent",
    `Are you sure you want to delete this agent? This will remove ${data.meetingsCount} associated meetings.`
  );

  const handleRemoveAgent = async () => {
    setConfirmVisible(true);
    const ok = await confirmRemove();

    if (!ok) {
      setConfirmVisible(false);
      return;
    }

    await removeAgent.mutateAsync({ id: agentId });
    setConfirmVisible(false);
  };

  return (
    <>
      {isConfirmVisible && <ConfirmDialog />}
      <UpdateAgentDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        initialvalues={data}
      />

      <div className="min-h-full px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <AgentIDviewHeader
            agentId={agentId}
            agentname={data.name}
            onEdit={() => setUpdateDialogOpen(true)}
            onremove={handleRemoveAgent}
          />

          <div className="glass overflow-hidden rounded-[28px]">
            <div className="relative flex flex-wrap items-center gap-4 overflow-hidden bg-[radial-gradient(70%_140%_at_90%_0%,rgba(232,103,42,0.55),transparent_62%)] p-6 sm:p-8">
              <GeneratedAvatar
                seed={data.name}
                variant="botttsNeutral"
                className="size-16 shrink-0 border-2 border-white/30"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {data.name}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium text-foreground">
                    <VideoIcon className="h-4 w-4 text-brand" />
                    {data.meetingsCount}{" "}
                    {data.meetingsCount === 1
                      ? "meeting"
                      : "meetings"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/10 p-6 sm:p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Instructions
              </h3>
              <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground/85">
                {data.instructions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const AgentsIdViewLoading = () => (
  <LoadingState
    title="Loading Agent"
    description="Please wait while we load the agent details."
  />
);

export const AgentsIdViewError = () => (
  <ErrorState
    title="Something went wrong"
    description="Please try again later."
  />
);