import { useState } from 'react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';

import ParagonRadarChart from '@/components/ParagonRadarChart';
import LandingCta from '@/components/landing/landing-cta';
import {
    APPLY_STEPS,
    DEAL_STOPPERS,
    EVIDENCE_EXAMPLES,
    MECHANISM_STEPS,
    PILLARS,
    REPORT_INCLUDES,
    TIERS,
} from '@/components/assessment/data';
import AssessmentApplicationForm from '@/components/assessment/application-form';
import { cn } from '@/lib/utils';

function SideDots() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none absolute top-[10%] bottom-[10%] left-0 -z-10 w-20 sm:w-32 md:w-44"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(100, 116, 139, 0.28) 1px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                    maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-[10%] bottom-[10%] right-0 -z-10 w-20 sm:w-32 md:w-44"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(100, 116, 139, 0.28) 1px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                    maskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
                }}
            />
        </>
    );
}

function ParagonAccordion() {
    const [open, setOpen] = useState(0);

    return (
        <div className="space-y-2">
            {PILLARS.map((pillar, idx) => {
                const isOpen = open === idx;
                return (
                    <div key={pillar.name} className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white">
                        <button
                            type="button"
                            onClick={() => setOpen(isOpen ? -1 : idx)}
                            className="flex w-full items-center gap-4 px-5 py-4 text-left"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4EAF8] text-sm font-bold text-[#2F468B]">
                                {pillar.letter}
                            </span>
                            <span className="flex-1 font-semibold text-zinc-950">{pillar.name}</span>
                            <ChevronDown className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform', isOpen && 'rotate-180')} />
                        </button>
                        {isOpen ? (
                            <div className="border-t border-zinc-100 px-5 pb-5 pt-2">
                                <p className="text-sm leading-relaxed text-zinc-500">{pillar.summary}</p>
                                <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-medium leading-relaxed text-zinc-800">
                                    {pillar.question}
                                </p>
                                <p className="mt-3 text-xs text-zinc-400">{pillar.criteria} audit criteria in this dimension</p>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

export default function AssessmentLanding() {
    const heroTitle = 'Most founders who fail to raise never find out why.';
    const accent = 'never find out why';
    const accentAt = heroTitle.toLowerCase().indexOf(accent);

    return (
        <main className="flex w-full flex-1 flex-col">
            {/* Hero */}
            <section className="relative isolate flex flex-col items-center px-6 pb-16 pt-4 text-center md:pb-24">
                <SideDots />
                <div className="hero-bubble absolute top-[18%] left-[12%] -z-10 opacity-70 max-sm:top-[12%] max-sm:left-[5%]" />
                <div className="hero-bubble absolute right-[15%] bottom-[22%] -z-10 opacity-60 max-sm:right-[8%] max-sm:bottom-[15%]" />
                <div className="mx-auto max-w-3xl">
                    <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Pinpoint Investment Assessment</p>
                    <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl md:leading-[1.08]">
                        {accentAt === -1 ? (
                            heroTitle
                        ) : (
                            <>
                                {heroTitle.slice(0, accentAt)}
                                <span className="text-[#2F468B]">{heroTitle.slice(accentAt, accentAt + accent.length)}</span>
                                {heroTitle.slice(accentAt + accent.length)}
                            </>
                        )}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                        Investors rarely tell you the real reason they passed. The Assessment is diligence run on your side of the table — so you see
                        what they would find before you spend months on a process.
                    </p>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
                        Built for African founders raising from roughly $100k to $10m. Fixed fee for analyst work — not contingent on whether you close
                        a round.
                    </p>
                    <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                        <LandingCta href="#apply" size="lg" direction="up-right" className="w-full sm:w-auto">
                            Apply for assessment
                        </LandingCta>
                        <a
                            href="/diagnostic"
                            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#3A54A5]/30 bg-white/70 px-6 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white hover:text-[#2D4182] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                        >
                            Start with free Self-Scan
                        </a>
                    </div>
                </div>
            </section>

            {/* Substance + evidence */}
            <section className="border-t border-zinc-200/60 bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">How scoring works</p>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                Every score is graded twice.
                            </h2>
                            <p className="mt-4 text-base font-semibold text-zinc-800">Once for substance, once for proof. The lower grade governs.</p>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                                A strong business with weak evidence still scores badly — because investors cannot act on what is not documented. That
                                gap is usually the distance between you and a term sheet.
                            </p>
                            <ul className="mt-8 space-y-4">
                                {MECHANISM_STEPS.map((step) => (
                                    <li key={step} className="flex gap-3">
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4EAF8] text-[#2F468B]">
                                            <Check className="h-4 w-4 stroke-[2.5]" aria-hidden />
                                        </span>
                                        <span className="text-sm leading-relaxed text-zinc-600">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="mb-4 text-sm font-semibold text-zinc-800">Three claims. Three evidence outcomes.</p>
                            <div className="divide-y divide-zinc-200/80 overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50/50">
                                {EVIDENCE_EXAMPLES.map((row) => (
                                    <div key={row.claim} className="grid gap-3 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{row.claim}</p>
                                            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{row.note}</p>
                                        </div>
                                        <span
                                            className={cn(
                                                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
                                                row.grade === 'A' && 'bg-emerald-50 text-emerald-700',
                                                row.grade === 'B' && 'bg-amber-50 text-amber-700',
                                                row.grade === 'C' && 'bg-rose-50 text-rose-700',
                                            )}
                                        >
                                            {row.grade}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PARAGON */}
            <section id="paragon" className="scroll-mt-24 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">PARAGON</p>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                Thirty-seven criteria. Seven dimensions.
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
                                Each dimension includes audit criteria and at least one uncomfortable question — the kind investors ask when the
                                room goes quiet.
                            </p>
                            <div className="mt-8 max-w-sm">
                                <ParagonRadarChart />
                            </div>
                        </div>
                        <ParagonAccordion />
                    </div>
                </div>
            </section>

            {/* Deal register */}
            <section className="bg-[#1B2E58] py-16 font-sans text-white sm:py-20">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-white/50 uppercase">Deal-stopper register</p>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                22 findings that end a process — regardless of score.
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                                Unassigned IP, a customer at 60% of revenue with nothing in writing, PAYE deducted but never remitted — these do not
                                always lower your score. They end the conversation. We list every deal-stopper on page one of your report, with what
                                it takes to fix it.
                            </p>
                            <p className="mt-4 text-xs leading-relaxed text-white/45">
                                The full register is not published. Gaming the list would defeat the purpose.
                            </p>
                        </div>
                        <ul className="divide-y divide-white/10 border-y border-white/10">
                            {DEAL_STOPPERS.map((item) => (
                                <li key={item} className="flex gap-4 py-5 sm:gap-5">
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/85"
                                        aria-hidden
                                    >
                                        <AlertCircle className="h-4 w-4 stroke-[1.75]" />
                                    </span>
                                    <p className="min-w-0 flex-1 pt-1.5 text-sm font-medium leading-relaxed text-white/90">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="scroll-mt-24 bg-[#F4F4F2] py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Scope and fee</span>
                        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-[#1B2A4A] sm:text-4xl md:text-5xl">
                            Choose the depth for your stage.
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
                            Every tier assesses the same criteria. Verification depth, sessions, and third-party calls increase by stage.
                        </p>
                    </div>

                    <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600">
                        {REPORT_INCLUDES.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-[#3A54A5]" aria-hidden />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
                        {TIERS.map((tier) => (
                            <article
                                key={tier.key}
                                className="flex h-full flex-col rounded-[1.75rem] border border-zinc-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-bold tracking-tight text-[#1B2A4A]">{tier.name}</h3>
                                    <span className="rounded-full bg-[#F0F0EE] px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                                        {tier.badge}
                                    </span>
                                </div>
                                <div className="mt-5 flex items-baseline gap-1.5">
                                    <span className="font-display text-[2.35rem] leading-none font-bold text-zinc-950">{tier.price}</span>
                                    <span className="text-sm text-zinc-400">/ {tier.unit}</span>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-zinc-500">{tier.description}</p>
                                <ul className="mt-6 flex-1 space-y-3 border-t border-zinc-100 pt-5">
                                    {tier.features.map((f) => (
                                        <li key={f} className="flex gap-2.5 text-sm text-zinc-600">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3A54A5]" aria-hidden />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{tier.meta}</p>
                                <LandingCta
                                    href="#apply"
                                    tone={tier.featured ? 'navy' : 'outline'}
                                    direction="up-right"
                                    className="mt-5 w-full justify-between"
                                >
                                    Apply for this stage
                                </LandingCta>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Honesty */}
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl md:text-4xl">
                        You will find this out eventually. The question is who pays for the lesson.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-zinc-500">
                        A failed raise costs months, burned introductions, and a valuation set by desperation. We will tell you if you are not ready —
                        we would rather lose the fee than run a process you are going to lose.
                    </p>
                </div>
            </section>

            {/* Apply */}
            <section id="apply" className="scroll-mt-24 border-t border-zinc-200/60 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16 lg:items-start">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Application</p>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Apply for an assessment</h2>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
                                Tell us your stage and raise target. We respond within 48 hours with scope and fee confirmation.
                            </p>
                            <ol className="mt-8 space-y-4">
                                {APPLY_STEPS.map((step) => (
                                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-600">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" aria-hidden />
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <AssessmentApplicationForm />
                    </div>
                </div>
            </section>

            <p className="mx-auto max-w-xl px-6 pb-12 text-center text-xs leading-relaxed text-zinc-400">
                The Assessment is investment-readiness work — not an audit, legal opinion, or investment advice. Findings depend on evidence provided
                within the assessment window.
            </p>
        </main>
    );
}
