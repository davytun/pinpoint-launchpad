import { ArrowRight, Check, FileSearch, Scale, ShieldAlert } from 'lucide-react';

const POINTS = [
    {
        icon: FileSearch,
        headline: 'Self-Scan vs Assessment',
        body: 'Self-Scan is free, automated, and private. The Assessment is paid, analyst-led, and produces a written report from your evidence.',
    },
    {
        icon: Scale,
        headline: 'What “analyst-reviewed” means',
        body: 'Analysts assess your information against PARAGON. It is a professional opinion on readiness, not a guarantee you will raise, and not investment advice.',
    },
    {
        icon: ShieldAlert,
        headline: 'What happens after Assessment',
        body: 'You get a report, gaps to fix, and a profile path. Eligible startups can be published to Spotlight so investors on Pinpoint can discover you.',
    },
];

const DELIVERABLES = [
    'PARAGON readiness score',
    'Seven-pillar breakdown',
    'Identified gaps and next steps',
    'Written Assessment Report (paid PIA)',
    'Startup profile for investor review',
    'Path to Spotlight discoverability',
];

export default function PiaTeaser() {
    return (
        <section id="pia-teaser" className="relative z-10 w-full overflow-hidden py-16 font-sans sm:py-20 md:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">What you get</span>
                    <a
                        href="/assessment"
                        className="hidden items-center gap-1.5 text-[11px] font-bold text-zinc-400 transition hover:text-[#3A54A5] sm:flex"
                    >
                        Learn about the Assessment <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
                    <div className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md sm:p-10">
                        <div>
                            <span className="mb-4 inline-block text-[10px] font-bold tracking-widest text-[#3A54A5] uppercase">
                                Pinpoint for founders
                            </span>
                            <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-zinc-950 sm:text-3xl md:text-4xl">
                                Not getting investor interest? Find out what is missing.
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:max-w-md sm:text-base">
                                Get a clear view of the areas that may be holding your startup back, then build an analyst-reviewed profile investors
                                on Pinpoint can actually evaluate.
                            </p>

                            <ul className="mt-8 space-y-3">
                                {DELIVERABLES.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                            <Check className="h-3 w-3 stroke-[3]" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <a
                                href="/assessment"
                                id="pia-teaser-learn-more"
                                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-[#3A54A5] px-6 text-center text-sm font-bold text-white transition hover:bg-[#2D4182] active:scale-[0.98] sm:w-auto"
                            >
                                Start Assessment
                            </a>
                            <a
                                href="/diagnostic"
                                id="pia-teaser-free-scan"
                                className="inline-flex w-full items-center justify-center gap-1.5 py-2 text-sm font-bold text-[#3A54A5] transition hover:text-[#2D4182] sm:w-auto sm:py-0"
                            >
                                Take the free Self-Scan <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

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
                                            <h3 className="text-sm leading-snug font-bold text-zinc-950 sm:text-base">{point.headline}</h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{point.body}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex justify-center sm:hidden">
                    <a href="/assessment" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-[#3A54A5]">
                        Learn more about the Assessment <ArrowRight className="h-3 w-3" />
                    </a>
                </div>
            </div>
        </section>
    );
}
