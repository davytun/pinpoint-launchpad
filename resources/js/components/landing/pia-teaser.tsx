import { ArrowRight, FileSearch, Scale, ShieldAlert } from 'lucide-react';

const POINTS = [
    {
        icon: FileSearch,
        headline: '37 criteria. 7 dimensions.',
        body: 'Every criterion is assessed at every tier. What changes is how far we go to verify it.',
    },
    {
        icon: Scale,
        headline: 'Every score is graded twice.',
        body: 'Once for substance, once for proof. The lower one governs. Belief in your own numbers is not a flaw of character. It is a condition of the job.',
    },
    {
        icon: ShieldAlert,
        headline: '22 findings that end a process.',
        body: 'A company can score 78 and be unfundable. The register tells you what they are, before anyone else does.',
    },
];

export default function PiaTeaser() {
    return (
        <section id="pia-teaser" className="relative z-10 w-full overflow-hidden py-16 font-sans sm:py-20 md:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
                {/* ── Section header row ── */}
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">The Pinpoint Investment Assessment</span>
                    <a
                        href="/assessment"
                        className="hidden items-center gap-1.5 text-[11px] font-bold text-zinc-400 transition hover:text-[#3A54A5] sm:flex"
                    >
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>

                {/* ── Responsive Bento Grid ── */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
                    {/* ── Left Hero Card ── */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#1A2850] p-6 shadow-lg sm:p-10">
                        {/* Glow Blobs */}
                        <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-[#3A54A5]/35 blur-[80px]" />
                        <div className="pointer-events-none absolute -top-16 -left-8 h-56 w-56 rounded-full bg-[#93C5FD]/10 blur-[70px]" />

                        {/* Content */}
                        <div className="relative z-10">
                            <span className="mb-4 inline-block text-[10px] font-bold tracking-widest text-[#93C5FD]/60 uppercase">
                                Pinpoint Launchpad
                            </span>
                            <h2 className="font-display sm:text-3.5xl text-2xl leading-tight font-black text-white md:text-4xl">
                                Most founders who fail to raise never find out why.
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/50 sm:max-w-md">
                                Investors do not tell you. They thank you for your time, they say the timing is not right, and they stop replying. The
                                PIA is the diligence process run on your side of the table, by people whose job is to find what an investor would find
                                — and to tell you.
                            </p>
                        </div>

                        {/* CTAs with clean primary pill and elegant secondary text link */}
                        <div className="relative z-10 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <a
                                href="/assessment"
                                id="pia-teaser-learn-more"
                                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-white px-6 text-center text-sm font-bold text-[#1A2850] transition hover:bg-zinc-100 active:scale-[0.98] sm:w-auto"
                            >
                                Learn about the Assessment
                            </a>
                            <a
                                href="/diagnostic"
                                id="pia-teaser-free-scan"
                                className="inline-flex w-full items-center justify-center gap-1.5 py-2 text-sm font-bold text-white/80 transition hover:text-white sm:w-auto sm:py-0"
                            >
                                Take the free Self-Scan <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* ── Right: 3 Stacked Cards ── */}
                    <div className="flex flex-col gap-4">
                        {POINTS.map((point, i) => {
                            const Icon = point.icon;
                            return (
                                <div
                                    key={i}
                                    className="group rounded-3xl border border-white/80 bg-white/30 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/50"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#3A54A5]/8 transition-colors duration-300 group-hover:bg-[#3A54A5]/15">
                                            <Icon className="h-5 w-5 text-[#3A54A5]" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm leading-snug font-bold text-zinc-950">{point.headline}</h3>
                                            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{point.body}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile-only bottom link */}
                <div className="mt-6 flex justify-center sm:hidden">
                    <a href="/assessment" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-[#3A54A5]">
                        Learn more about the Assessment <ArrowRight className="h-3 w-3" />
                    </a>
                </div>
            </div>
        </section>
    );
}
