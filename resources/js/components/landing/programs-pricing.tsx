import { Check } from 'lucide-react';

export default function ProgramsPricing() {
    return (
        <section id="pricing" className="relative z-10 w-full py-24 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                {/* Header Grid */}
                <div className="mb-16 max-w-2xl space-y-4">
                    <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Programs & Pricing</span>
                    <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Simple, transparent pricing.</h2>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
                    {/* Foundation Card */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 01</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Foundation</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">Early-stage roadmap. Evaluates baseline venture readiness.</p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Starting at</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">$350</span>
                                    <span className="text-xs text-zinc-400">/ base</span>
                                </div>
                            </div>

                            {/* Button */}
                            <a
                                href="/diagnostic"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full border border-[#3A54A5] bg-transparent text-sm font-bold text-[#3A54A5] transition-all duration-200 hover:bg-[#3A54A5] hover:text-white active:scale-[0.98]"
                            >
                                Qualify
                            </a>

                            {/* Features list */}
                            <ul className="mt-8 space-y-4 border-t border-zinc-200/50 pt-6 text-xs text-zinc-600">
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>65+ score qualification gate</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>7-pillar radar chart & gap analysis</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>$150 initial assessment gate fee</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>Email-based analyst guidance</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Growth Card (Featured / Primary Color) */}
                    <div className="relative flex flex-col justify-between rounded-4xl bg-[#2D4182] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#25366D]">
                        {/* Featured Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-sm">
                                Recommended
                            </span>
                        </div>

                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#93C5FD] uppercase">Stage 02</span>
                            <h3 className="mt-1 text-2xl font-bold text-white">Growth</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">
                                Seed round preparation. Detailed stress-testing for validation.
                            </p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-white/50">Starting at</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-white">$750</span>
                                    <span className="text-xs text-white/50">/ base</span>
                                </div>
                            </div>

                            {/* Button */}
                            <a
                                href="/diagnostic"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-bold text-[#2D4182] transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98]"
                            >
                                Qualify
                            </a>

                            {/* Features list */}
                            <ul className="mt-8 space-y-4 border-t border-white/10 pt-6 text-xs text-white/80">
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>70+ score qualification gate</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>Cap table audit & financial stress-test</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>5 dedicated forensic analyst hours</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>$150 initial assessment gate fee</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Institutional Card */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 03</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Institutional</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">Series A/B & SMEs. Full credit warrant success model.</p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Starting at</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">$1,500</span>
                                    <span className="text-xs text-zinc-400">/ base</span>
                                </div>
                            </div>

                            {/* Button */}
                            <a
                                href="/diagnostic"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full border border-[#3A54A5] bg-transparent text-sm font-bold text-[#3A54A5] transition-all duration-200 hover:bg-[#3A54A5] hover:text-white active:scale-[0.98]"
                            >
                                Qualify
                            </a>

                            {/* Features list */}
                            <ul className="mt-8 space-y-4 border-t border-zinc-200/50 pt-6 text-xs text-zinc-600">
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>80+ score qualification gate</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>Secure diligence URL & credit model</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>15 dedicated forensic analyst hours</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span>Success model: fully credited fee</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
