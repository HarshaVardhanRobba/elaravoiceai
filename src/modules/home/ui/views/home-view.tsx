import Link from "next/link";
import {
  AudioLinesIcon,
  BotIcon,
  FileTextIcon,
  MessageSquareIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import { WaveRibbon } from "@/components/wave-ribbon";

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
  { icon: AudioLinesIcon, title: "Real-time voice", text: "Natural back-and-forth speech in the call, powered by a realtime voice model." },
  { icon: BotIcon, title: "Custom agents", text: "Create as many agents as you need, each with its own instructions you can edit any time." },
  { icon: FileTextIcon, title: "Transcripts and recordings", text: "Every call is transcribed and recorded, and stored against the meeting for later." },
  { icon: SparklesIcon, title: "AI summaries", text: "A written summary of each meeting is generated automatically once the transcript is ready." },
  { icon: MessageSquareIcon, title: "Post-call chat", text: "Ask the agent follow-up questions afterwards. It answers from the summary and chat history." },
  { icon: SearchIcon, title: "Search and filter", text: "Find any meeting by name, agent or status, with paginated lists for agents and meetings." },
];

const pillPrimary =
  "rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90";
const pillOutline =
  "glass rounded-full px-7 py-3.5 text-base font-medium text-foreground transition hover:bg-white/10";

export default function HomeView() {
  return (
    <div className="app-glow relative min-h-screen overflow-hidden text-foreground">
      {/* NAV */}
      <header className="relative z-10 mx-auto mt-4 flex h-16 max-w-[1200px] items-center justify-between rounded-full border border-white/10 bg-black/30 px-6 backdrop-blur-xl sm:mx-6 lg:mx-auto">
        <div className="font-display text-2xl font-semibold tracking-tight">Elara</div>
        <nav className="hidden gap-9 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#summaries" className="transition hover:text-foreground">Summaries</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-foreground/90 transition hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-14 px-6 pb-24 pt-16 lg:flex-row lg:gap-16 lg:pt-24">
        <div className="flex flex-1 flex-col items-start gap-7">
          <div className="rounded-full bg-highlight-soft px-4 py-1.5 text-sm font-medium text-highlight">
            AI voice agent for meetings
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Your meetings, with a teammate who{" "}
            actually listens.
          </h1>
          <p className="max-w-[520px] text-lg leading-relaxed text-muted-foreground">
            Elara joins your video call as a live voice agent you have instructed, talks with everyone
            in real time, then hands you the transcript, recording and a written summary.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5">
            <Link href="/sign-up" className={pillPrimary}>Create your first agent</Link>
            <a href="#how" className={pillOutline}>See how it works</a>
          </div>
        </div>

        <div className="glass w-full max-w-[560px] rounded-[32px] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] lg:w-[560px] lg:shrink-0">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="block size-3 rounded-full bg-[#ff5f57]" />
              <span className="block size-3 rounded-full bg-[#febc2e]" />
              <span className="block size-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="text-sm text-muted-foreground">Weekly product sync</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="block size-2 rounded-full bg-glow" />
              Live
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-[190px] flex-1 items-end rounded-3xl bg-white/5 p-4 text-sm text-muted-foreground">
              You
            </div>
            <div className="flex h-[190px] flex-1 flex-col justify-between rounded-3xl bg-[radial-gradient(90%_120%_at_80%_0%,#e8672a,#7a2e10)] p-4">
              <div className="flex h-[120px] items-center justify-center gap-1" aria-hidden="true">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-white ${i % 3 === 0 ? "opacity-60" : ""}`}
                    style={{ height: h }}
                  />
                ))}
              </div>
              <div className="text-sm text-white">Elara &middot; speaking</div>
            </div>
          </div>
          <div className="mt-4 rounded-3xl bg-white/5 px-5 py-4 text-[15px] leading-relaxed text-foreground/90">
            &ldquo;Two open items from last week: the pricing page copy and the webhook retry logic.
            Want me to walk through both?&rdquo;
          </div>
        </div>
      </section>

      <WaveRibbon className="pointer-events-none relative z-0 -mt-16 h-40 w-full opacity-80" />

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-24">
        <h2 className="max-w-[820px] font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          From call to written record, without lifting a finger.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass flex flex-col gap-3 rounded-[28px] p-7">
              <div className="font-display text-3xl font-semibold text-brand">{`0${i + 1}`}</div>
              <div className="text-xl font-semibold">{s.title}</div>
              <div className="text-[15px] leading-relaxed text-muted-foreground">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-24">
        <h2 className="max-w-[820px] font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Built for the whole meeting, not just the part on screen.
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass flex flex-col gap-3 rounded-[28px] p-7 transition hover:bg-white/10">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <f.icon className="size-5" />
              </div>
              <div className="text-lg font-semibold">{f.title}</div>
              <div className="text-[15px] leading-relaxed text-muted-foreground">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARIES */}
      <section id="summaries" className="relative z-10 mx-auto max-w-[1200px] px-6 py-16">
        <div className="glass flex flex-col items-center gap-12 rounded-[36px] p-8 sm:p-12 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col gap-5">
            <div className="text-sm font-medium uppercase tracking-[0.08em] text-brand">After the call</div>
            <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Ask it what you missed.
            </h2>
            <p className="max-w-[460px] text-lg leading-relaxed text-muted-foreground">
              The agent that sat in on your meeting stays available in chat. It remembers its instructions
              and has the summary in hand, so follow-ups take one message.
            </p>
          </div>
          <div className="flex w-full max-w-[520px] flex-col gap-3.5 lg:shrink-0">
            <div className="max-w-[400px] self-end rounded-[22px] rounded-br-md bg-primary px-5 py-3.5 text-[15px] leading-snug text-primary-foreground">
              What did we decide about the webhook retries?
            </div>
            <div className="max-w-[440px] self-start rounded-[22px] rounded-bl-md bg-[linear-gradient(135deg,#e8672a,#a63d12)] px-5 py-3.5 text-[15px] leading-snug text-white">
              Answers come from the meeting summary and transcript.
            </div>
            <div className="max-w-[400px] self-end rounded-[22px] rounded-br-md bg-primary px-5 py-3.5 text-[15px] leading-snug text-primary-foreground">
              Who owns the follow-up?
            </div>
            <div className="max-w-[440px] self-start rounded-[22px] rounded-bl-md bg-[linear-gradient(135deg,#e8672a,#a63d12)] px-5 py-3.5 text-[15px] leading-snug text-white">
              The agent names the owner and next step, taken from what was said.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-7 px-6 py-28 text-center">
        <h2 className="max-w-[780px] font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
          Bring Elara to your next meeting.
        </h2>
        <p className="max-w-[520px] text-lg leading-relaxed text-muted-foreground">
          Sign in with Google, GitHub or email and have your first agent in a call in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href="/sign-up" className={pillPrimary}>Get started</Link>
          <a href="#how" className={pillOutline}>Learn more</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex h-28 max-w-[1200px] items-center justify-between px-6">
          <div className="font-display text-xl font-semibold tracking-tight">Elara</div>
          <div className="text-sm text-muted-foreground">&copy; Elara. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
