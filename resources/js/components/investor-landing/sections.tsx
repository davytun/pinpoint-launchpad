import { useState } from 'react';
import { ArrowRight, FileSearch, MessageSquare, Phone } from 'lucide-react';

import BlogTeaser from '@/components/landing/blog-teaser';

const OUTCOMES = [
    {
        title: 'Browse reviewed startups',
        body: 'See companies that finished Pinpoint’s Assessment and chose to be visible. Less noise than an open inbox of decks.',
    },
    {
        title: 'Open a clear first look',
        body: 'Each profile shows a readiness score, where the company looks strong or thin, a short company summary, and status on key checks.',
    },
    {
        title: 'Dig deeper when you want',
        body: 'Ask a question, request more documents, or arrange a founder call. Pinpoint helps coordinate access. You decide next steps.',
    },
];

const PROFILE_FACTS = [
    { label: 'Readiness score', detail: 'One overall signal across seven business areas' },
    { label: 'Strengths and gaps', detail: 'Where the company looks solid, and where evidence is thin' },
    { label: 'Company summary', detail: 'A short structured brief prepared for investor review' },
    { label: 'Status checks', detail: 'Progress on items such as legal, financials, and ownership' },
    { label: 'Next steps', detail: 'Question, documents, or founder call when you want more' },
];

const ACCESS = [
    { title: 'Join and verify your identity', body: 'Admitted investors complete KYC so protected materials stay behind approved access.' },
    { title: 'Enter Spotlight', body: 'Browse published startups and open profiles that match your focus.' },
    { title: 'Request what you need', body: 'Ask for details, documents, or a founder call. Founders and Pinpoint handle the workflow.' },
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
            <section className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <div className="max-w-3xl">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Most first looks leave you guessing what is real.
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                            Pinpoint puts structured readiness information in front of you first, so you spend diligence time where it matters.
                        </p>
                    </div>
                    <div className="mt-10 flex flex-col gap-4 border-t border-zinc-200/80 pt-8 sm:mt-12 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-zinc-200/80">
                        {['Clear first look', 'Readiness signal', 'Coordinated follow-up'].map((item) => (
                            <p key={item} className="text-sm font-semibold tracking-tight text-zinc-700 sm:flex-1 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">How it works</span>
                        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Three steps. Then you decide.
                        </h2>
                    </div>
                    <ol className="mt-12 divide-y divide-zinc-200/70 border-y border-zinc-200/70">
                        {OUTCOMES.map((step, idx) => (
                            <li
                                key={step.title}
                                className="grid grid-cols-1 gap-3 py-8 sm:grid-cols-[4.5rem_1fr] sm:items-start sm:gap-10 lg:grid-cols-[4.5rem_16rem_1fr]"
                            >
                                <span className="font-display text-2xl font-black text-[#3A54A5]/25">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 sm:text-base lg:pt-1">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* What you review + sample CTA */}
            <section id="what-you-see" className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-7">
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">What you review</span>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                The information that belongs before a deep dive.
                            </h2>
                            <ul className="mt-10 divide-y divide-zinc-200/80 border-y border-zinc-200/80">
                                {PROFILE_FACTS.map((item) => (
                                    <li key={item.label} className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
                                        <span className="text-sm font-semibold text-zinc-950">{item.label}</span>
                                        <span className="text-sm leading-relaxed text-zinc-500">{item.detail}</span>
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="/verify/sample-unicorn"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                            >
                                See a sample profile
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="lg:col-span-5">
                            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">When you want more</p>
                            <ul className="mt-5 divide-y divide-zinc-200/80 border-y border-zinc-200/80">
                                {[
                                    { icon: MessageSquare, label: 'Ask a question', detail: 'Request context or a specific follow-up.' },
                                    {
                                        icon: FileSearch,
                                        label: 'Request documents',
                                        detail: 'Cap table, legal, financials, and related materials when granted.',
                                    },
                                    { icon: Phone, label: 'Arrange founder call', detail: 'A mediated briefing coordinated through Pinpoint.' },
                                ].map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <li key={action.label} className="flex gap-4 py-5">
                                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3A54A5]" strokeWidth={1.5} />
                                            <div>
                                                <h3 className="text-sm font-bold text-zinc-950">{action.label}</h3>
                                                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{action.detail}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <p className="mt-5 text-xs leading-relaxed text-zinc-500">
                                The readiness score is a signal, not an investment decision or a recommendation to fund.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Access */}
            <section id="access" className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
                        <div className="lg:col-span-5">
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Access</span>
                            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                How you get started
                            </h2>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
                                Join as an investor, complete identity checks, then browse published startups on Pinpoint.
                            </p>
                            {cta.enabled ? (
                                <a
                                    href={cta.url}
                                    className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-6 text-sm font-bold text-white transition-colors hover:bg-[#2D4182]"
                                >
                                    {cta.label}
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            ) : (
                                <p className="mt-8 text-sm font-semibold text-zinc-500">Investor applications are temporarily unavailable.</p>
                            )}
                        </div>
                        <ol className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 lg:col-span-7">
                            {ACCESS.map((item, idx) => (
                                <li key={item.title} className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6">
                                    <span className="font-display text-2xl font-black text-[#3A54A5]/25">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-950 sm:text-lg">{item.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Trust */}
            <section className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">What Pinpoint is, and is not</h2>
                    <div className="mt-10 grid grid-cols-1 gap-10 border-t border-zinc-200/80 pt-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Pinpoint is</p>
                            <ul className="mt-5 space-y-4">
                                {[
                                    'A place to discover startups that completed Assessment',
                                    'Clear readiness information on one platform',
                                    'Help coordinating access when you want to go deeper',
                                ].map((item) => (
                                    <li key={item} className="text-[15px] leading-relaxed text-zinc-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Pinpoint is not</p>
                            <ul className="mt-5 space-y-4">
                                {[
                                    'A broker or investment adviser',
                                    'A recommendation to invest',
                                    'A guarantee of outcomes or funding',
                                ].map((item) => (
                                    <li key={item} className="text-[15px] leading-relaxed text-zinc-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="mt-10 max-w-2xl text-sm leading-relaxed text-zinc-500">
                        Being visible on Pinpoint is not an endorsement.{' '}
                        <a href="/investor-terms" className="font-semibold text-[#3A54A5] transition-colors hover:text-[#2D4182]">
                            Read the Investor Terms
                        </a>
                        .
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="relative z-10 w-full py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-6 md:px-8">
                    <h2 className="font-display mb-12 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Frequently asked questions</h2>
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
                                                className="flex w-full items-start justify-between gap-4 text-left"
                                            >
                                                <span className="text-base font-semibold text-zinc-900 transition-colors hover:text-[#3A54A5]">
                                                    {faq.q}
                                                </span>
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400">
                                                    <span className={`text-base leading-none transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                                                        ＋
                                                    </span>
                                                </span>
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'mt-3 max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <p className="pr-8 text-sm leading-relaxed text-zinc-500">{faq.a}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="lg:col-span-5">
                            <div className="rounded-3xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md lg:sticky lg:top-24">
                                <h3 className="text-xl font-bold text-zinc-950">Still got questions?</h3>
                                <a
                                    href="mailto:hello@pinpoint.network"
                                    className="mt-6 flex w-full items-center justify-center rounded-full bg-[#3A54A5] py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#2D4182]"
                                >
                                    Email us
                                </a>
                                <p className="mt-6 text-xs leading-relaxed text-zinc-500">We reply within 24 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BlogTeaser posts={latest_posts} />

            {/* Final CTA */}
            <section className="relative z-10 w-full py-16 text-center sm:py-20">
                <div className="mx-auto max-w-2xl px-6">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                        Ready for a clearer first look?
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-zinc-500">
                        Join as an investor to browse reviewed startups, or open a sample profile first.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        {cta.enabled ? (
                            <a
                                href={cta.url}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-7 text-sm font-bold text-white transition-colors hover:bg-[#2D4182]"
                            >
                                {cta.label}
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        ) : null}
                        <a
                            href="/verify/sample-unicorn"
                            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3A54A5]/30 bg-white/50 px-7 text-sm font-semibold text-[#3A54A5] transition-colors hover:border-[#3A54A5] hover:bg-white"
                        >
                            See a sample profile
                        </a>
                    </div>
                    <a href="/" className="mt-6 inline-block text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2D4182]">
                        Looking to get your startup assessed?
                    </a>
                </div>
            </section>
        </>
    );
}
