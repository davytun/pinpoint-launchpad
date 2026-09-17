import { ArrowRight, TrendingUp } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';

const PILLARS = [
    { name: 'Potential', pct: 83 },
    { name: 'Agility', pct: 83 },
    { name: 'Risk', pct: 75 },
    { name: 'Alignment', pct: 81 },
    { name: 'Governance', pct: 75 },
    { name: 'Operations', pct: 83 },
    { name: 'Network', pct: 80 },
];

export default function ParagonMockup() {
    return (
        <div className="overflow-hidden rounded-[1.625rem] border border-zinc-200 bg-white text-left shadow-inner">
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3 sm:px-6">
                <PinpointLogo height={20} />
            </div>

            <div className="space-y-5 p-5 sm:space-y-6 sm:p-6 md:p-8">
                <p className="font-display text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl md:text-3xl">
                    Your PARAGON Readiness Snapshot
                </p>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                    {/* Score block */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-[#f7f9ff] px-6 py-8 lg:col-span-4">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                            PARAGON READINESS SCORE
                        </p>
                        <p className="mt-3 font-display text-6xl font-black tracking-tight text-zinc-950 sm:text-7xl">
                            85
                            <span className="text-2xl font-bold text-zinc-400 sm:text-3xl">/100</span>
                        </p>
                        <p className="mt-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                            READINESS SCORE · ILLUSTRATIVE
                        </p>
                    </div>

                    {/* What this means + CTA */}
                    <div className="flex flex-col justify-between gap-5 rounded-2xl border border-zinc-200/80 bg-white px-5 py-6 sm:px-6 lg:col-span-8">
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-[#3A54A5] uppercase">What this means</p>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
                                Strong readiness signal. You have the fundamentals in place, with clear gaps to close before investors dig in. The
                                paid Assessment reviews your evidence and builds a profile investors can evaluate.
                            </p>
                        </div>
                        <a
                            href="/assessment"
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#2D4182] sm:w-fit"
                        >
                            SEE THE ASSESSMENT
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Pillar breakdown */}
                <div>
                    <p className="mb-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Pillar breakdown</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                        {PILLARS.map((pillar) => (
                            <div
                                key={pillar.name}
                                className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-3 text-center"
                            >
                                <p className="text-[11px] font-semibold text-zinc-800">{pillar.name}</p>
                                <p className="mt-1 text-sm font-bold text-[#3A54A5]">{pillar.pct}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
