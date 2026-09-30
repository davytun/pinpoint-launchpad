import LandingCta from '@/components/landing/landing-cta';
import { Check } from 'lucide-react';

type Plan = {
    name: string;
    badge: string;
    price: string;
    unit: string;
    note?: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    featured?: boolean;
};

const PLANS: Plan[] = [
    {
        name: 'Concept / Pre-Seed',
        badge: 'Stage 01',
        price: '₦350,000',
        unit: 'from',
        note: 'Or $500 for diaspora & international founders',
        description: 'Perfect for founders validating an idea before approaching investors. See where you stand and what to fix.',
        features: [
            'Full PARAGON scan (weighted to Potential)',
            '1 founder interview (60 min)',
            'Analyst-delivered 12-15 page report',
            '1 debrief call (10-12 hours total)',
            'Turnaround: 7 working days',
        ],
        cta: 'Start Assessment',
        href: '/assessment',
    },
    {
        name: 'Seed / Early Traction',
        badge: 'Stage 02',
        price: '$1,500',
        unit: 'fixed fee',
        description: 'For growing startups with ARR under $500k, preparing for a first institutional cheque.',
        features: [
            'Everything in Stage 01',
            'Financial review (up to 24 months)',
            'Unit-economics and LTV: CAC build',
            'Cap table & founding docs review',
            'Partner-reviewed 25-30 page report',
        ],
        cta: 'Start Assessment',
        href: '/assessment',
        featured: true,
    },
    {
        name: 'Seed+ / Growth',
        badge: 'Stage 03',
        price: '$3,500+',
        unit: 'floor',
        description: 'For founders with ARR above $500k raising a larger round or growth equity. Deepest verification depth.',
        features: [
            'Everything in Stage 02',
            'Full data-room review',
            'Corporate and governance analysis',
            'Material contract & IP review',
            'Board-ready presentation (Partner-led)',
        ],
        cta: 'Start Assessment',
        href: '/assessment',
    },
];

export default function ProgramsPricing() {
    return (
        <section id="pricing" className="relative z-10 w-full scroll-mt-24 bg-[#F4F4F2] py-16 font-sans sm:py-20 md:py-24">
            <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex rounded-full bg-white px-3.5 py-1 text-xs font-medium text-zinc-500 shadow-sm">
                        Pricing Plan
                    </span>
                    <h2 className="font-display mt-5 text-3xl font-bold tracking-tight text-[#1B2A4A] sm:text-4xl md:text-5xl md:leading-[1.12]">
                        Choose the Assessment for your stage.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Start free with Self-Scan. Paid Assessment fees are fixed for the work delivered, not contingent on whether you raise capital.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
                    {PLANS.map((plan) => (
                        <article
                            key={plan.name}
                            className="flex h-full flex-col rounded-[1.75rem] border border-zinc-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-lg font-bold tracking-tight text-[#1B2A4A] sm:text-xl">{plan.name}</h3>
                                <span className="inline-flex shrink-0 items-center rounded-full bg-[#F0F0EE] px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                                    {plan.badge}
                                </span>
                            </div>

                            <div className="mt-5 flex items-baseline gap-1.5">
                                <span className="font-display text-[2.35rem] leading-none font-bold tracking-tight text-zinc-950">
                                    {plan.price}
                                </span>
                                <span className="text-sm text-zinc-400">/{plan.unit}</span>
                            </div>
                            {plan.note ? <p className="mt-1.5 text-xs text-zinc-400">{plan.note}</p> : null}

                            <p className="mt-4 text-sm leading-relaxed text-zinc-500">{plan.description}</p>

                            <div className="mt-6 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                                <p className="text-sm font-semibold text-[#1B2A4A]">What&apos;s included</p>
                                <ul className="mt-4 space-y-3.5">
                                    {plan.features.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-500">
                                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F0F0EE] text-zinc-500">
                                                <Check className="size-3 stroke-[2.5]" aria-hidden />
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <LandingCta
                                href={plan.href}
                                tone={plan.featured ? 'navy' : 'outline'}
                                direction="right"
                                className="mt-6 w-full justify-between"
                            >
                                {plan.cta}
                            </LandingCta>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
