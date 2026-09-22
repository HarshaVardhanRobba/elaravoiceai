import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Image from "next/image";
import Link from "next/link";

interface CallActiveProps {
  onLeave: () => void;
  meetingName: string;
}

export const CallActive = ({ 
  onLeave, 
  meetingName 
}: CallActiveProps) => {
  return (
    <div className="flex h-screen w-full flex-col bg-[#0e0d0c] text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1917]">
        <Link href="/meetings">
          <Image 
            src="/logo.svg"
            alt="logo"
            width={22}
            height={22}
          />
        </Link>
        <h4 className="text-sm font-medium">{meetingName}</h4>
      </div>

      {/* VIDEO AREA */}
      <div className="flex flex-1 items-center justify-center bg-[#0e0d0c]">
        <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-[#22211f]">
          <SpeakerLayout />
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center py-4 bg-[#1a1917]">
        <CallControls onLeave={onLeave} />
      </div>

    </div>
  );
};
