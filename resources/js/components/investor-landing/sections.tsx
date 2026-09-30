import { useState } from 'react';
import { Check, Eye, FileSearch, FileText, Gauge, LayoutGrid, ListChecks, MessageSquare, Radar, ShieldCheck, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import InvestorBlogTeaser from '@/components/investor-landing/blog-teaser';
import LandingCta from '@/components/landing/landing-cta';

const PROBLEM_POINTS: { title: string; description: string; icon: LucideIcon; tint: string }[] = [
    {
        title: 'Clear first look',
        description: 'Open a structured profile instead of guessing from a deck. See the company summary, status checks, and what is already in place.',
        icon: Eye,
        tint: 'bg-[#E4EAF8] text-[#2F468B]',
    },
    {
        title: 'Readiness signal',
        description: 'One score across seven business areas, with where the company looks strong and where evidence is still thin.',
        icon: Radar,
        tint: 'bg-[#D4F5A4] text-[#3A7D2C]',
    },
    {
        title: 'Coordinated follow-up',
        description: 'Ask a question, request documents, or arrange a founder call when you want more. Pinpoint helps coordinate access.',
        icon: MessageSquare,
        tint: 'bg-[#E4EAF8] text-[#2F468B]',
    },
];

const OUTCOMES: { title: string; body: string; icon: LucideIcon }[] = [
    {
        icon: LayoutGrid,
        title: 'Browse reviewed startups',
        body: 'See companies that finished Pinpoint’s Assessment and chose to be visible. Less noise than an open inbox of decks.',
    },
    {
        icon: FileSearch,
        title: 'Open a clear first look',
        body: 'Each profile shows a readiness score, where the company looks strong or thin, a short company summary, and status on key checks.',
    },
    {
        icon: MessageSquare,
        title: 'Dig deeper when you want',
        body: 'Ask a question, request more documents, or arrange a founder call. Pinpoint helps coordinate access. You decide next steps.',
    },
];

const PROFILE_FACTS: { title: string; body: string; icon: LucideIcon }[] = [
    {
        icon: Gauge,
        title: 'Readiness score',
        body: 'One overall signal across seven business areas — a clearer first look, not advice to invest.',
    },
    {
        icon: ListChecks,
        title: 'Strengths and gaps',
        body: 'Where the company looks solid, and where evidence is still thin.',
    },
    {
        icon: FileText,
        title: 'Company summary',
        body: 'A short structured brief prepared for investor review on Pinpoint.',
    },
    {
        icon: ShieldCheck,
        title: 'Status checks',
        body: 'Progress on items such as legal, financials, and ownership before you dig deeper.',
    },
];

const ACCESS: { title: string; body: string; icon: LucideIcon }[] = [
    {
        icon: ShieldCheck,
        title: 'Join and verify your identity',
        body: 'Admitted investors complete KYC so protected materials stay behind approved access.',
    },
    {
        icon: LayoutGrid,
        title: 'Enter Spotlight',
        body: 'Browse published startups and open profiles that match your focus.',
    },
    {
        icon: MessageSquare,
        title: 'Request what you need',
        body: 'Ask for details, documents, or a founder call. Founders and Pinpoint handle the workflow.',
    },
];

const PINPOINT_IS = [
    'A place to discover startups that completed Assessment',
    'Clear readiness information on one platform',
    'Help coordinating access when you want to go deeper',
];

const PINPOINT_IS_NOT = [
    'A broker or investment adviser',
    'A recommendation to invest',
    'A guarantee of outcomes or funding',
];

const FAQS = [
    {
        q: 'Is this an investment recommendation?',
        a: 'No. A readiness score and a published profile are information tools. They are not advice to invest, and Pinpoint does not recommend deals.',
    },
    {
        q: 'Who reviewed these startups?',
        a: 'Pinpoint analysts review submitted information against the PARAGON framework during Assessment. Visibility on Spotlight still requires founder consent and Pinpoint’s publication criteria.',
    },
    {
        q: 'What can I do after I find a startup?',
        a: 'You can ask a question, request document access, or arrange a mediated founder call. Detailed materials stay behind authentication and approvals.',
    },
    {
        q: 'Is Pinpoint a broker or adviser?',
        a: 'No. Pinpoint provides curated visibility and helps coordinate access. It does not broker investments, give investment advice, or guarantee outcomes.',
    },
    {
        q: 'Who can see founder information?',
        a: 'Only admitted investors with approved KYC can access Spotlight. Detailed documents need extra permission. Founders control whether they are visible.',
    },
];

interface BlogPostItem {
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    reading_time_mins: number;
    published_at: string;
}

interface Props {
    cta: { label: string; url: string; enabled: boolean };
    latest_posts?: BlogPostItem[];
}

export default function InvestorLandingSections({ cta, latest_posts = [] }: Props) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            {/* Problem */}
            <section className="relative z-10 w-full py-16 font-sans sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Most first looks leave you guessing what is real.
                        </h2>
                        <p className="text-base leading-relaxed text-zinc-500 sm:text-lg">
                            Pinpoint puts structured readiness information in front of you first, so you spend diligence time where it matters.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
                        {PROBLEM_POINTS.map(({ title, description, icon: Icon, tint }) => (
                            <div key={title}>
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                                    <Icon className="h-5 w-5 stroke-[1.5]" />
                                </div>
                                <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-zinc-950">{title}</h3>
                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="relative z-10 w-full py-16 font-sans sm:py-20">
                <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
                    <div className="lg:pt-2">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">How it works</p>
                        <h2 className="font-display mt-3 max-w-sm text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                            Three steps. Then you decide.
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 sm:text-base">
                            Browse assessed startups, open a clear first look, then dig deeper when something earns your time. You stay in control of
                            every next step.
                        </p>
                        {cta.enabled ? (
                            <LandingCta href={cta.url} tone="green" direction="up-right" className="mt-7">
                                {cta.label}
                            </LandingCta>
                        ) : null}
                    </div>

                    <ol className="divide-y divide-zinc-200/70 border-y border-zinc-200/70">
                        {OUTCOMES.map((step) => {
                            const Icon = step.icon;

                            return (
                                <li key={step.title} className="flex gap-4 py-6 sm:gap-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4EAF8] text-[#2F468B]">
                                        <Icon className="h-5 w-5 stroke-[1.75]" aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold tracking-tight text-zinc-950 sm:text-lg">{step.title}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{step.body}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* What you review + sample CTA */}
            <section id="what-you-see" className="relative z-10 w-full scroll-mt-24 py-16 font-sans sm:py-20">
                <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
                    <div className="lg:pt-2">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">What you review</p>
                        <h2 className="font-display mt-3 max-w-sm text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                            The information that belongs before a deep dive.
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 sm:text-base">
                            Each published profile gives you a structured first look — enough to decide whether to spend more time. Ask a question,
                            request documents, or arrange a founder call when you want more. A score is a signal, not advice to invest.
                        </p>
                        <LandingCta href="/verify/sample-unicorn" tone="green" direction="up-right" className="mt-7">
                            See a sample profile
                        </LandingCta>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {PROFILE_FACTS.map((fact) => {
                            const Icon = fact.icon;

                            return (
                                <div key={fact.title} className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4EAF8] text-[#2F468B]">
                                        <Icon className="h-5 w-5 stroke-[1.75]" aria-hidden />
                                    </div>
                                    <h3 className="mt-4 text-base font-bold tracking-tight text-zinc-950">{fact.title}</h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{fact.body}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Access */}
            <section id="access" className="relative z-10 w-full scroll-mt-24 bg-white py-16 font-sans sm:py-20">
                <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
                    <div className="lg:pt-2">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Access</p>
                        <h2 className="font-display mt-3 max-w-sm text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                            How you get started
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 sm:text-base">
                            Join as an investor, complete identity checks, then browse published startups on Pinpoint. Protected materials stay behind
                            approved access until you are admitted.
                        </p>
                        {cta.enabled ? (
                            <LandingCta href={cta.url} tone="green" direction="up-right" className="mt-7">
                                {cta.label}
                            </LandingCta>
                        ) : (
                            <p className="mt-7 text-sm font-semibold text-zinc-500">Investor applications are temporarily unavailable.</p>
                        )}
                    </div>

                    <ol className="divide-y divide-zinc-200/70 border-y border-zinc-200/70">
                        {ACCESS.map((item) => {
                            const Icon = item.icon;

                            return (
                                <li key={item.title} className="flex gap-4 py-6 sm:gap-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4EAF8] text-[#2F468B]">
                                        <Icon className="h-5 w-5 stroke-[1.75]" aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold tracking-tight text-zinc-950 sm:text-lg">{item.title}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.body}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* Trust */}
            <section className="relative z-10 w-full py-16 font-sans sm:py-20">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="mx-auto max-w-3xl space-y-4 text-center">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Legal clarity</p>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            What Pinpoint is, and is not
                        </h2>
                        <p className="text-base leading-relaxed text-zinc-500 sm:text-lg">
                            Pinpoint gives you structured information and helps coordinate access. It does not tell you where to put your money.
                        </p>
                    </div>

                    <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-10">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Pinpoint is</p>
                            <ul className="mt-6 space-y-5">
                                {PINPOINT_IS.map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4F5A4] text-[#3A7D2C]">
                                            <Check className="h-4 w-4 stroke-[2.5]" aria-hidden />
                                        </span>
                                        <span className="pt-0.5 text-sm leading-relaxed text-zinc-700 sm:text-[15px]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Pinpoint is not</p>
                            <ul className="mt-6 space-y-5">
                                {PINPOINT_IS_NOT.map((item) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                            <X className="h-4 w-4 stroke-[2.5]" aria-hidden />
                                        </span>
                                        <span className="pt-0.5 text-sm leading-relaxed text-zinc-700 sm:text-[15px]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-zinc-500">
                        Being visible on Pinpoint is not an endorsement.{' '}
                        <a href="/investor-terms" className="font-semibold text-[#3A54A5] transition-colors hover:text-[#2D4182]">
                            Read the Investor Terms
                        </a>
                        .
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="relative z-10 w-full scroll-mt-24 bg-white py-16 font-sans sm:py-24">
                <div className="mx-auto max-w-6xl px-6 md:px-8">
                    <div className="mb-14 max-w-2xl">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">FAQ</p>
                        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-7">
                            <div className="divide-y divide-zinc-200/60 border-t border-zinc-200/60">
                                {FAQS.map((faq, idx) => {
                                    const isOpen = openFaq === idx;
                                    return (
                                        <div key={faq.q} className="py-5">
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaq(isOpen ? null : idx)}
                                                className="group flex w-full items-start justify-between gap-4 text-left focus:outline-none"
                                            >
                                                <span className="pr-4 text-base font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-[#3A54A5]">
                                                    {faq.q}
                                                </span>
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-all duration-200 group-hover:border-[#3A54A5]/30 group-hover:text-[#3A54A5]">
                                                    <span
                                                        className={`text-base leading-none font-medium transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                                                    >
                                                        ＋
                                                    </span>
                                                </span>
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <p className="pr-4 text-sm leading-relaxed text-zinc-500 sm:pr-8">{faq.a}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative lg:col-span-5">
                            <div className="lg:sticky lg:top-24">
                                <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 sm:p-9">
                                    <h3 className="font-display text-xl font-bold text-zinc-950">Still got questions?</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">We reply within 24 hours on investor access and how profiles work.</p>
                                    <LandingCta
                                        href="mailto:hello@pinpoint.network"
                                        tone="green"
                                        direction="up-right"
                                        className="mt-6 w-full justify-between sm:w-auto"
                                    >
                                        Email us
                                    </LandingCta>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <InvestorBlogTeaser posts={latest_posts} />

            {/* Final CTA */}
            <section className="relative z-10 w-full py-20 text-center font-sans">
                <div className="mx-auto max-w-2xl space-y-6 px-6">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                        Ready for a clearer first look?
                    </h2>
                    <p className="text-base leading-relaxed text-zinc-500 sm:text-lg">
                        Join as an investor to browse reviewed startups, or open a sample profile first.
                    </p>
                    <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 pt-2 sm:mx-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                        {cta.enabled ? (
                            <LandingCta href={cta.url} tone="green" size="lg" direction="up-right" className="w-full sm:w-auto">
                                {cta.label}
                            </LandingCta>
                        ) : null}
                        <a
                            href="/verify/sample-unicorn"
                            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#3A54A5]/30 bg-white/70 px-6 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white hover:text-[#2D4182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                        >
                            See a sample profile
                        </a>
                    </div>
                    <a href="/" className="inline-block text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2D4182]">
                        Looking to get your startup assessed?
                    </a>
                </div>
            </section>
        </>
    );
}
