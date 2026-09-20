import Image from "next/image";
import Link from "next/link";
import { DM_Sans, Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600"] });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

interface CallEndedProps {
  meetingId: string;
  meetingName: string;
}

export const CallEnded = ({ meetingId, meetingName }: CallEndedProps) => {
  return (
    <div
      className={`${body.className} flex min-h-screen w-full items-center justify-center bg-[#F4F1EA] px-4 py-10 text-[#14181F]`}
    >
      <div className="w-full max-w-lg rounded-[28px] border border-[#DDD8CC] bg-white p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F1EA]">
          <Image src="/logo.svg" alt="Elara" width={28} height={28} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#0F766E]">
          Call ended
        </p>

        <h1
          className={`${display.className} mt-3 text-3xl font-normal leading-[1.1] tracking-[-0.02em] sm:text-4xl`}
        >
          Thanks for joining
        </h1>

        <p className="mt-2 text-base font-medium text-[#14181F]">
          {meetingName}
        </p>

        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[#4A505B]">
          Elara is now putting together your summary, transcript and recording.
          This usually takes a few minutes, and you can follow along on the
          meeting page.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/meetings/${meetingId}`}
            className="rounded-full bg-[#0F766E] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0B5C56]"
          >
            View meeting
          </Link>
          <Link
            href="/meetings"
            className="rounded-full border border-[#14181F] px-6 py-3.5 text-[16px] font-medium text-[#14181F] transition hover:bg-[#14181F] hover:text-[#F4F1EA]"
          >
            Back to meetings
          </Link>
        </div>
      </div>
    </div>
  );
};
