import { InvestorHeader } from '@/components/investor-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Entry = {
    slug: string;
    company_name: string | null;
    founder_name?: string | null;
    spotlight_one_liner: string;
    sector: string | null;
    batch: string | null;
    overall_score: number | null;
    radar_data?: Record<string, number> | null;
    verified_badges_count: number;
    badges?: { id: number; label: string; badge_type: string }[];
    published_at?: string;
};

type Investor = {
    full_name: string;
    kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    email?: string;
};

interface PageProps {
    entries: Entry[];
    investor?: Investor | null;
    categories?: string[];
}

const PILLARS = [
    ['potential', 'Potential'],
    ['agility', 'Agility'],
    ['risk', 'Risk'],
    ['alignment', 'Alignment'],
    ['governance', 'Governance'],
    ['operations', 'Operations'],
    ['network', 'Network'],
] as const;
const pillarBarTone = (v: number) => (v >= 85 ? 'bg-emerald-500' : v >= 70 ? 'bg-[#3A54A5]' : v >= 55 ? 'bg-amber-500' : 'bg-rose-400');

export default function SpotlightIndex({ entries = [], categories = ['All'] }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('All');
    const [sortBy, setSortBy] = useState<'score' | 'badges' | 'latest'>('score');

    // Dynamic categories from backend + entries (No hardcoded arrays)
    const allCategories = useMemo(() => {
        const set = new Set<string>(categories);
        entries.forEach((e) => {
            if (e.sector) set.add(e.sector);
        });
        const list = Array.from(set).filter(Boolean);
        if (!list.includes('All')) list.unshift('All');
        return list;
    }, [categories, entries]);

    // Filter & Sort
    const filteredEntries = useMemo(() => {
        return entries
            .filter((entry) => {
                const matchesSector = selectedSector === 'All' || (entry.sector && entry.sector.toLowerCase() === selectedSector.toLowerCase());
                const matchesSearch =
                    searchQuery.trim() === '' ||
                    (entry.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                    (entry.founder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                    (entry.spotlight_one_liner?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                    (entry.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
                return matchesSector && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === 'score') return (b.overall_score ?? 0) - (a.overall_score ?? 0);
                if (sortBy === 'badges') return (b.verified_badges_count ?? 0) - (a.verified_badges_count ?? 0);
                return 0;
            });
    }, [entries, selectedSector, searchQuery, sortBy]);

    function getInitials(name?: string | null): string {
        if (!name) return 'SP';
        return name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    return (
        <main className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Spotlight — Verified Ventures" />
            <InvestorHeader activeTab="spotlight" />

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {/* Header */}
                <div className="border-b border-zinc-200 pb-8 sm:flex sm:items-end sm:justify-between sm:pb-10">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">Verified deal flow</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl">Startup Spotlight</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                            Every venture here cleared Pinpoint's seven-pillar PARAGON audit. Diligence signals are verified by our analysts, not
                            self-reported.
                        </p>
                    </div>
                    <p className="mt-5 text-sm text-zinc-500 sm:mt-0">
                        <span className="font-mono font-semibold text-zinc-900">{filteredEntries.length}</span> verified{' '}
                        {filteredEntries.length === 1 ? 'venture' : 'ventures'}
                    </p>
                </div>

                {/* Toolbar: search · sort */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Icon icon="solar:magnifer-linear" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ventures, founders, sectors"
                            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pr-9 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <Icon icon="solar:close-circle-bold" className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-zinc-400">Sort</span>
                        <Select
                            value={sortBy}
                            onValueChange={(val) => {
                                if (val === 'score' || val === 'badges' || val === 'latest') setSortBy(val);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[210px] rounded-xl border-zinc-200 bg-white text-[13px] font-medium text-zinc-700 focus:ring-1 focus:ring-zinc-900">
                                <SelectValue placeholder="Select Sort Order" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="score" className="text-sm font-medium text-zinc-700">
                                    Highest PARAGON Score
                                </SelectItem>
                                <SelectItem value="badges" className="text-sm font-medium text-zinc-700">
                                    Most Diligence Badges
                                </SelectItem>
                                <SelectItem value="latest" className="text-sm font-medium text-zinc-700">
                                    Recently Published
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sector filters */}
                {allCategories.length > 1 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                        {allCategories.map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setSelectedSector(sec)}
                                className={cn(
                                    'rounded-lg px-3 py-1 text-[13px] font-medium transition-colors',
                                    selectedSector === sec ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900',
                                )}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>
                )}

                {/* Venture rows */}
                <div className="mt-8">
                    {filteredEntries.length > 0 ? (
                        <div className="space-y-3">
                            {filteredEntries.map((entry) => {
                                const companyName = entry.company_name ?? 'Featured Startup';
                                const score = entry.overall_score;

                                return (
                                    <Link
                                        key={entry.slug}
                                        href={route('investor.spotlight.show', entry.slug)}
                                        className="group grid gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-5 transition-colors hover:border-zinc-300 hover:shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
                                    >
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-[15px] font-bold text-white">
                                                {getInitials(companyName)}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="truncate text-[15px] font-semibold text-zinc-950">{companyName}</h2>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-zinc-500">
                                                    <span className="truncate">{entry.founder_name ?? 'Founder'}</span>
                                                    <span className="text-zinc-300">·</span>
                                                    <span className="shrink-0 text-[11px] tracking-wide text-zinc-400 uppercase">
                                                        {entry.sector ?? 'General'}
                                                    </span>
                                                </p>
                                                <p className="mt-1.5 line-clamp-1 text-[13px] text-zinc-600">
                                                    {entry.spotlight_one_liner || 'Audited venture in the Pinpoint Spotlight syndicate.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 sm:justify-end">
                                            {entry.radar_data && (
                                                <div className="hidden items-end gap-1 lg:flex" aria-hidden="true">
                                                    {PILLARS.map(([key, label]) => {
                                                        const v = entry.radar_data?.[key] ?? 0;
                                                        return (
                                                            <div key={key} className="flex flex-col items-center gap-1" title={`${label}: ${v}`}>
                                                                <div className="flex h-8 w-2.5 items-end overflow-hidden rounded-[2px] bg-zinc-100">
                                                                    <div
                                                                        className={cn('w-full rounded-[2px]', pillarBarTone(v))}
                                                                        style={{ height: `${Math.max(v, 8)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[8px] font-bold text-zinc-400">{label.charAt(0)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="shrink-0 text-right">
                                                {score != null ? (
                                                    <>
                                                        <p className="font-mono text-2xl leading-none font-semibold text-zinc-950">
                                                            {score}
                                                            <span className="text-sm text-zinc-400">/100</span>
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-medium tracking-wider text-zinc-400 uppercase">PARAGON</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[12px] text-zinc-400">Unscored</p>
                                                )}
                                            </div>

                                            <div className="hidden w-16 shrink-0 border-l border-zinc-100 pl-4 text-right xl:block">
                                                <p className="font-mono text-sm font-semibold text-zinc-900">{entry.verified_badges_count}</p>
                                                <p className="text-[10px] tracking-wider text-zinc-400 uppercase">checks</p>
                                            </div>

                                            <Icon
                                                icon="solar:arrow-right-linear"
                                                className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900"
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mx-auto max-w-xl py-20 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                <Icon icon="solar:magnifer-linear" className="size-5" />
                            </div>
                            <h2 className="mt-5 text-lg font-semibold text-zinc-950">No ventures match that filter</h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Try a different sector or clear your search to see the full spotlight.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedSector('All');
                                }}
                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 underline underline-offset-4"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
