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
                    {/* Concept / Pre-Seed Card */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 01</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Concept / Pre-Seed</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">Pricing depends on founder location and the selected tier.</p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Starting From</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">₦350,000</span>
                                </div>
                                <p className="mt-2 text-xs font-medium text-zinc-500">
                                    Starting From N350,000 for Domestic & Local Founders or $500 for Diaspora & International Founders
                                </p>
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
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Full PARAGON scan (weighted to Potential)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>1 founder interview (60 min)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Analyst-delivered 12–15 page report</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>1 debrief call (10–12 hours total)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Turnaround: 7 working days</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Seed / Early Traction Card (Featured style without Recommended Badge) */}
                    <div className="relative flex flex-col justify-between rounded-4xl bg-[#2D4182] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#25366D]">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#93C5FD] uppercase">Stage 02</span>
                            <h3 className="mt-1 text-2xl font-bold text-white">Seed / Early Traction</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">
                                Working model, ARR under $500k, ready for a first institutional cheque.
                            </p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-white/50">Total Price</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-white">$1,500</span>
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
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Everything in Stage 01</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Financial review (up to 24 months)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Unit-economics and LTV: CAC build</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Cap table & founding docs review</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>3 interviews (25–30 hours total)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Partner-reviewed 25–30 page report</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Turnaround: 12 working days</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Seed+ / Growth Card */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 03</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Seed+ / Growth</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                                ARR above $500k, established processes, larger round or growth equity.
                            </p>

                            {/* Price */}
                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Total Price</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">$3,500+</span>
                                    <span className="text-xs text-zinc-400">floor</span>
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
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Everything in Stage 02</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Full data-room review</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Corporate and governance analysis</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Material contract & IP review</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>5+ interviews (60+ hours total)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Board-ready presentation (Partner-led)</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <Check className="h-3 w-3 stroke-3" />
                                    </span>
                                    <span>Turnaround: 20 working days</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
