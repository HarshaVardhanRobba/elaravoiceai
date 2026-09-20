"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { MeetingIDviewHeader } from "../components/meeting-id-view-header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "../../hooks/use-confirm";
import { useState, useEffect } from "react";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { UpcommingState } from "../components/upcomming-state";
import { ActiveState } from "../components/active-state";
import { Cancel } from "@radix-ui/react-alert-dialog";
import { CancelledState } from "../components/cancelled-state";
import { PendingState } from "../components/pending-state";
import { CompletedState } from "../components/completed-state";

interface MeetingIdViewProps {
  meetingsId: string;
}

export const MeetingIdView = ({ meetingsId }: MeetingIdViewProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, refetch } = useSuspenseQuery({
    ...trpc.meetings.getOne.queryOptions({ id: meetingsId }),
    refetchInterval: (query) => {
      // Poll while the meeting is still changing: live (active) and while
      // the summary / transcript / recording are being generated (pending).
      const status = query.state.data?.status;
      if (status === "active") return 2000;
      if (status === "pending") return 3000;
      return false;
    },
  });

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Remove",
    "Are you sure you want to remove this meeting?"
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}),
        );
        queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions(),
        );
        router.push("/meetings");
        toast.success("Meeting removed");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleRemoveMeeting = async () => {
    setShowRemoveConfirm(true);

    const ok = await confirmRemove();
    setShowRemoveConfirm(false);

    if (!ok) return;

    await removeMeeting.mutateAsync({ id: meetingsId });
  };

  const isActive = data.status === "active";
  const isUpcomming = data.status === "upcomming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isPending = data.status === "pending";

  return (
  <>
    {showRemoveConfirm && <RemoveConfirmation />}

    <UpdateMeetingDialog
      open={updateDialogOpen}
      onOpenChange={setUpdateDialogOpen}
      initialvalues={data}
    />

    <div className="min-h-[calc(100vh-80px)] w-full bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <MeetingIDviewHeader
            meetingId={meetingsId}
            meetingname={data.name}
            onEdit={() => setUpdateDialogOpen(true)}
            onremove={handleRemoveMeeting}
          />
        </div>

        {/* Status Content */}
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          {isCancelled && <CancelledState />}
          {isCompleted && <CompletedState data={data} />}
          {isPending && <PendingState />}
          {isUpcomming && (
            <UpcommingState
              meetingId={meetingsId}
              isCancelling={false}
            />
          )}
          {isActive && (
            <ActiveState meetingId={meetingsId} />
          )}
        </div>
      </div>
    </div>
  </>
);
};

export const MeetingsIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading meetings"
      description="Please wait while we load your meeting."
    />
  );
};

export const MeetingsIdViewError = () => {
  return (
    <ErrorState
      title="Something went wrong"
      description="Please try again later."
    />
  );
};
