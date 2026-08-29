import { PinpointLogo } from '@/components/pinpoint-logo';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck } from 'lucide-react';

type Entry = {
    slug: string;
    company_name: string | null;
    spotlight_one_liner: string;
    sector: string | null;
    batch: string | null;
    overall_score: number | null;
    verified_badges_count: number;
};

export default function SpotlightIndex({ entries }: { entries: Entry[] }) {
    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title="Spotlight" />
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <PinpointLogo height={24} />
                <Link
                    href={route('investor.dashboard')}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white hover:text-zinc-950"
                >
                    Dashboard
                </Link>
            </header>
            <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
                <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">PIN Spotlight</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Curated startups, prepared for investor review.</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
                    Explore founders who have completed Pinpoint’s PARAGON process. Detailed materials remain protected until your KYC is approved.
                </p>
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {entries.map((entry) => (
                        <Link
                            key={entry.slug}
                            href={route('investor.spotlight.show', entry.slug)}
                            className="group rounded-2xl border border-white/80 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)] transition hover:-translate-y-0.5 hover:border-[#3A54A5]/30"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-bold tracking-[0.14em] text-[#3A54A5] uppercase">{entry.sector ?? 'PIN startup'}</p>
                                <span className="rounded-full bg-[#3A54A5]/10 px-2.5 py-1 text-xs font-bold text-[#3A54A5]">
                                    {entry.overall_score ?? '—'} score
                                </span>
                            </div>
                            <h2 className="mt-5 text-xl font-extrabold tracking-tight">{entry.company_name ?? 'PIN startup'}</h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">{entry.spotlight_one_liner}</p>
                            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-zinc-500">
                                <span className="inline-flex items-center gap-1">
                                    <BadgeCheck className="size-4 text-[#3A54A5]" />
                                    {entry.verified_badges_count} verified badges
                                </span>
                                <span className="inline-flex items-center gap-1 text-[#3A54A5]">
                                    View <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
                {entries.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                        <p className="font-bold text-zinc-900">Spotlight is being prepared.</p>
                        <p className="mt-2 text-sm text-zinc-600">New curated opportunities will appear here as they are published.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
