import Link from "next/link";
import { DM_Sans, Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600"] });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

const BARS = [24, 46, 72, 40, 96, 60, 110, 84, 50, 100, 66, 36, 78, 28];

const STEPS = [
  {
    title: "Write its instructions",
    text: "Create an agent and tell it who it is and how to behave: a note-taker, an interviewer, a coach. Those instructions stay with it.",
  },
  {
    title: "Start a meeting",
    text: "Pick the agent, open the call and it joins right away, speaking and listening over live video with transcription and recording on.",
  },
  {
    title: "Get the summary",
    text: "When the call ends, Elara processes the transcript in the background and marks the meeting completed with a summary ready to read.",
  },
];

const FEATURES = [
  { title: "Real-time voice", text: "Natural back-and-forth speech in the call, powered by a realtime voice model." },
  { title: "Custom agents", text: "Create as many agents as you need, each with its own instructions you can edit any time." },
  { title: "Transcripts and recordings", text: "Every call is transcribed and recorded, and stored against the meeting for later." },
  { title: "AI summaries", text: "A written summary of each meeting is generated automatically once the transcript is ready." },
  { title: "Post-call chat", text: "Ask the agent follow-up questions afterwards. It answers from the summary and chat history." },
  { title: "Search and filter", text: "Find any meeting by name, agent or status, with paginated lists for agents and meetings." },
];

const pillPrimary =
  "rounded-full bg-[#0F766E] px-7 py-4 text-[17px] font-semibold text-white transition hover:bg-[#0B5C56]";
const pillOutline =
  "rounded-full border border-[#14181F] px-6 py-4 text-[17px] font-medium text-[#14181F] transition hover:bg-[#14181F] hover:text-[#F4F1EA]";

export default function HomeView() {
  return (
    <div className={`${body.className} min-h-screen bg-[#F4F1EA] text-[#14181F]`}>
      {/* NAV */}
      <header className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 lg:px-24">
        <div className={`${display.className} text-[30px] font-semibold tracking-tight`}>Elara</div>
        <nav className="hidden gap-10 text-base text-[#4A505B] md:flex">
          <a href="#how" className="hover:text-[#14181F]">How it works</a>
          <a href="#features" className="hover:text-[#14181F]">Features</a>
          <a href="#summaries" className="hover:text-[#14181F]">Summaries</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="px-5 py-3 text-base font-medium">Sign in</Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-[#14181F] px-[22px] py-3 text-base font-medium text-[#F4F1EA] transition hover:bg-[#232A34]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-6 py-16 lg:flex-row lg:px-24 lg:py-20">
        <div className="flex flex-1 flex-col gap-7">
          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#0F766E]">
            AI voice agent for meetings
          </div>
          <h1
            className={`${display.className} text-5xl font-normal leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[76px]`}
          >
            Your meetings, with a teammate who actually listens.
          </h1>
          <p className="max-w-[540px] text-xl leading-[1.55] text-[#4A505B]">
            Elara joins your video call as a live voice agent you have instructed, talks with everyone
            in real time, then hands you the transcript, recording and a written summary.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5">
            <Link href="/sign-up" className={pillPrimary}>Create your first agent</Link>
            <a href="#how" className={pillOutline}>See how it works</a>
          </div>
        </div>

        <div className="flex w-full max-w-[600px] flex-col gap-[22px] rounded-[28px] bg-[#14181F] p-7 text-[#F4F1EA] lg:w-[600px] lg:shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[15px] text-[#A9AFBA]">Weekly product sync</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="block size-2 rounded-full bg-[#F2664B]" />
              Live
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-[200px] flex-1 items-end rounded-[18px] bg-[#232A34] p-3.5 text-sm">You</div>
            <div className="flex h-[200px] flex-1 flex-col justify-between rounded-[18px] bg-[#0F766E] p-3.5">
              <div className="flex h-[130px] items-center justify-center gap-1" aria-hidden="true">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-[#F4F1EA] ${i % 3 === 0 ? "opacity-70" : ""}`}
                    style={{ height: h }}
                  />
                ))}
              </div>
              <div className="text-sm">Elara &middot; speaking</div>
            </div>
          </div>
          <div className="rounded-2xl bg-[#232A34] px-5 py-[18px] text-base leading-normal text-[#E4E0D6]">
            &ldquo;Two open items from last week: the pricing page copy and the webhook retry logic.
            Want me to walk through both?&rdquo;
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-24 lg:px-24">
        <h2
          className={`${display.className} max-w-[900px] text-4xl font-normal leading-[1.1] tracking-[-0.02em] lg:text-5xl`}
        >
          From call to written record, without lifting a finger.
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-3 border-t-2 border-[#14181F] pt-6">
              <div className={`${display.className} text-xl text-[#0F766E]`}>{`0${i + 1}`}</div>
              <div className="text-2xl font-semibold">{s.title}</div>
              <div className="text-[17px] leading-[1.55] text-[#4A505B]">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-24 lg:px-24">
        <h2
          className={`${display.className} max-w-[900px] text-4xl font-normal leading-[1.1] tracking-[-0.02em] lg:text-5xl`}
        >
          Built for the whole meeting, not just the part on screen.
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-2.5 rounded-[20px] border border-[#DDD8CC] bg-white p-7">
              <div className="text-xl font-semibold">{f.title}</div>
              <div className="text-base leading-[1.55] text-[#4A505B]">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARIES */}
      <section id="summaries" className="bg-[#14181F] text-[#F4F1EA]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-6 py-24 lg:flex-row lg:gap-20 lg:px-24">
          <div className="flex flex-1 flex-col gap-6">
            <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#5EC9BE]">After the call</div>
            <h2
              className={`${display.className} text-4xl font-normal leading-[1.1] tracking-[-0.02em] lg:text-5xl`}
            >
              Ask it what you missed.
            </h2>
            <p className="max-w-[480px] text-[19px] leading-[1.6] text-[#C9CEC6]">
              The agent that sat in on your meeting stays available in chat. It remembers its instructions
              and has the summary in hand, so follow-ups take one message.
            </p>
          </div>
          <div className="flex w-full max-w-[620px] flex-col gap-4 rounded-3xl bg-[#232A34] p-7 lg:w-[620px] lg:shrink-0">
            <div className="max-w-[420px] self-end rounded-[18px] rounded-br-[4px] bg-[#F4F1EA] px-[18px] py-3.5 text-base leading-[1.45] text-[#14181F]">
              What did we decide about the webhook retries?
            </div>
            <div className="max-w-[480px] self-start rounded-[18px] rounded-bl-[4px] bg-[#0F766E] px-[18px] py-3.5 text-base leading-[1.45] text-white">
              Answers come from the meeting summary and transcript.
            </div>
            <div className="max-w-[420px] self-end rounded-[18px] rounded-br-[4px] bg-[#F4F1EA] px-[18px] py-3.5 text-base leading-[1.45] text-[#14181F]">
              Who owns the follow-up?
            </div>
            <div className="max-w-[480px] self-start rounded-[18px] rounded-bl-[4px] bg-[#0F766E] px-[18px] py-3.5 text-base leading-[1.45] text-white">
              The agent names the owner and next step, taken from what was said.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-7 px-6 py-24 text-center lg:px-24">
        <h2
          className={`${display.className} max-w-[820px] text-5xl font-normal leading-[1.05] tracking-[-0.03em] lg:text-[60px]`}
        >
          Bring Elara to your next meeting.
        </h2>
        <p className="max-w-[560px] text-xl leading-normal text-[#4A505B]">
          Sign in with Google, GitHub or email and have your first agent in a call in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href="/sign-up" className={pillPrimary}>Get started</Link>
          <a href="#how" className={pillOutline}>Learn more</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#DDD8CC]">
        <div className="mx-auto flex h-[140px] max-w-[1440px] items-center justify-between px-6 lg:px-24">
          <div className={`${display.className} text-2xl font-semibold`}>Elara</div>
          <div className="text-[15px] text-[#4A505B]">&copy; Elara. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
