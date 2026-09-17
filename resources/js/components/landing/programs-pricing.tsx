import { Check } from 'lucide-react';

export default function ProgramsPricing() {
    return (
        <section id="pricing" className="relative z-10 w-full py-20 font-sans sm:py-24">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="mb-14 max-w-2xl space-y-4">
                    <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Programs & Pricing</span>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                        Choose the Assessment for your stage.
                    </h2>
                    <p className="text-base leading-relaxed text-zinc-500">
                        Start free with Self-Scan. Paid Assessment fees are fixed for the work delivered, not contingent on whether you raise capital.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
                    {/* Concept / Pre-Seed */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 01</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Concept / Pre-Seed</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                                For founders validating an idea before approaching investors. See where you stand and what to fix.
                            </p>

                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Starting From</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">₦350,000</span>
                                </div>
                                <p className="mt-2 text-xs font-medium text-zinc-500">
                                    From ₦350,000 for domestic founders, or $500 for diaspora & international founders
                                </p>
                            </div>

                            <a
                                href="/assessment"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full border border-[#3A54A5] bg-transparent text-sm font-bold text-[#3A54A5] transition-all duration-200 hover:bg-[#3A54A5] hover:text-white active:scale-[0.98]"
                            >
                                Start Assessment
                            </a>
                            <a href="/diagnostic" className="mt-3 block text-center text-xs font-bold text-zinc-500 hover:text-[#3A54A5]">
                                Or take the free Self-Scan first
                            </a>

                            <ul className="mt-8 space-y-4 border-t border-zinc-200/50 pt-6 text-sm text-zinc-600">
                                {[
                                    'Full PARAGON scan (weighted to Potential)',
                                    '1 founder interview (60 min)',
                                    'Analyst-delivered 12-15 page report',
                                    '1 debrief call (10-12 hours total)',
                                    'Turnaround: 7 working days',
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2.5">
                                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                            <Check className="h-3 w-3 stroke-3" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Seed / Early Traction */}
                    <div className="relative flex flex-col justify-between rounded-4xl bg-[#2D4182] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#25366D]">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#93C5FD] uppercase">Stage 02</span>
                            <h3 className="mt-1 text-2xl font-bold text-white">Seed / Early Traction</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">
                                For founders with a working model and ARR under $500k, preparing for a first institutional cheque.
                            </p>

                            <div className="mt-6">
                                <span className="text-xs font-medium text-white/50">Total Price</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-white">$1,500</span>
                                </div>
                            </div>

                            <a
                                href="/assessment"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-bold text-[#2D4182] transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98]"
                            >
                                Start Assessment
                            </a>
                            <a href="/diagnostic" className="mt-3 block text-center text-xs font-bold text-white/60 hover:text-white">
                                Or take the free Self-Scan first
                            </a>

                            <ul className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-white/80">
                                {[
                                    'Everything in Stage 01',
                                    'Financial review (up to 24 months)',
                                    'Unit-economics and LTV: CAC build',
                                    'Cap table & founding docs review',
                                    '3 interviews (25-30 hours total)',
                                    'Partner-reviewed 25-30 page report',
                                    'Turnaround: 12 working days',
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2.5">
                                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                            <Check className="h-3 w-3 stroke-3" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Seed+ / Growth */}
                    <div className="flex flex-col justify-between rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Stage 03</span>
                            <h3 className="mt-1 text-2xl font-bold text-zinc-950">Seed+ / Growth</h3>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                                For founders with ARR above $500k raising a larger round or growth equity. Deepest verification depth.
                            </p>

                            <div className="mt-6">
                                <span className="text-xs font-medium text-zinc-400">Total Price</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">$3,500+</span>
                                    <span className="text-xs text-zinc-400">floor</span>
                                </div>
                            </div>

                            <a
                                href="/assessment"
                                className="group mt-6 flex h-11 w-full items-center justify-center rounded-full border border-[#3A54A5] bg-transparent text-sm font-bold text-[#3A54A5] transition-all duration-200 hover:bg-[#3A54A5] hover:text-white active:scale-[0.98]"
                            >
                                Start Assessment
                            </a>
                            <a href="/diagnostic" className="mt-3 block text-center text-xs font-bold text-zinc-500 hover:text-[#3A54A5]">
                                Or take the free Self-Scan first
                            </a>

                            <ul className="mt-8 space-y-4 border-t border-zinc-200/50 pt-6 text-sm text-zinc-600">
                                {[
                                    'Everything in Stage 02',
                                    'Full data-room review',
                                    'Corporate and governance analysis',
                                    'Material contract & IP review',
                                    '5+ interviews (60+ hours total)',
                                    'Board-ready presentation (Partner-led)',
                                    'Turnaround: 20 working days',
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2.5">
                                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                            <Check className="h-3 w-3 stroke-3" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
