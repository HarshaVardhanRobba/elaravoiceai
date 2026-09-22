"use client";

import { authClient } from "@/lib/auth-client";
import { GenerateAvatarUri } from "@/lib/avatar";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import Link from "next/link";

interface CallLobbyProps {
  onJoin: () => void;
  isJoining?: boolean;
}

const DisabledVideoPreview = () => {
  const { data } = authClient.useSession();

  return (
    <DefaultVideoPlaceholder
      participant={
        {
          name: data?.user.name ?? "",
          image:
            data?.user.image ??
            GenerateAvatarUri({
              seed: data?.user.name ?? "",
              variant: "initials",
            }),
        } as StreamVideoParticipant
      }
    />
  );
};

const AllowBrowserPermissions = () => {
  return (
    <p className="text-sm text-muted-foreground text-center px-4">
      Please grant browser access to your camera and microphone
    </p>
  );
};

export const CallLobby = ({ onJoin, isJoining = false }: CallLobbyProps) => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission } =
    useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission } =
    useCameraState();

  const hasBrowserMediaPermission =
    hasMicPermission && hasCameraPermission;

  return (
    <div className="app-glow flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl glass rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-8">
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ready to join
            </h2>
            <p className="text-sm text-muted-foreground">
              Set up your camera and microphone before joining
            </p>
          </div>

          {/* Video Preview */}
          <div className="w-full aspect-video max-h-[50vh] overflow-hidden rounded-xl bg-muted flex items-center justify-center">
            <VideoPreview
              DisabledVideoPreview={
                hasBrowserMediaPermission
                  ? DisabledVideoPreview
                  : AllowBrowserPermissions
              }
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onJoin}
              disabled={!hasBrowserMediaPermission || isJoining}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? "Joining..." : "Join Call"}
            </button>

            <Link
              href="/meetings"
              className="w-full text-center rounded-full border border-white/15 bg-white/5 text-foreground py-3 font-medium transition hover:opacity-90"
            >
              Leave
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};