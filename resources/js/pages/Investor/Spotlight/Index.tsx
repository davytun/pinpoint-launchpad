import { InvestorHeader } from '@/components/investor-header';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

export default function SpotlightIndex({ entries = [], investor, categories = ['All'] }: PageProps) {
    const unreadNotifications =
        usePage<{ platform_unread_notifications?: { investor?: number } }>().props.platform_unread_notifications?.investor ?? 0;

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
                const matchesSector =
                    selectedSector === 'All' || (entry.sector && entry.sector.toLowerCase() === selectedSector.toLowerCase());
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
        <div className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Spotlight — Verified Ventures" />

            <Head title="Spotlight — Verified Ventures" />
            <InvestorHeader activeTab="spotlight" />

            {/* ── Main Canvas ─────────────────────────────────────────────── */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Spotlight Header & Controls ── */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                                Startup Spotlight
                            </h1>
                            <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
                                Verified ventures audited across Pinpoint's 7-pillar diagnostic framework. Discover and co-invest in high-quality startups.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs">
                                {filteredEntries.length} {filteredEntries.length === 1 ? 'Startup' : 'Startups'} Verified
                            </span>
                        </div>
                    </div>

                    {/* Search & Sort Bar */}
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Icon
                                icon="solar:magnifer-linear"
                                className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-zinc-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search startups, founders, or sectors..."
                                className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pr-4 pl-10 text-sm text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                >
                                    <Icon icon="solar:close-circle-bold" className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sort By</span>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                                <SelectTrigger className="w-[220px] rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 shadow-2xs focus:ring-1 focus:ring-zinc-900 h-9">
                                    <SelectValue placeholder="Select Sort Order" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="score" className="text-sm font-medium text-zinc-700">Highest PARAGON Score</SelectItem>
                                    <SelectItem value="badges" className="text-sm font-medium text-zinc-700">Most Diligence Badges</SelectItem>
                                    <SelectItem value="latest" className="text-sm font-medium text-zinc-700">Recently Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category Filter Pills (Dynamically loaded from backend) */}
                    {allCategories.length > 1 && (
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            {allCategories.map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setSelectedSector(sec)}
                                    className={cn(
                                        'rounded-xl px-4 py-1.5 text-xs font-semibold transition-all',
                                        selectedSector === sec
                                            ? 'bg-zinc-900 text-white shadow-md'
                                            : 'border border-zinc-200 bg-white text-zinc-600 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950',
                                    )}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Startup Grid ─────────────────────────────────────────── */}
                <div className="mt-8">
                    {filteredEntries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEntries.map((entry) => {
                                const companyName = entry.company_name ?? 'Featured Startup';
                                const score = entry.overall_score ?? 89;

                                return (
                                    <Link
                                        key={entry.slug}
                                        href={route('investor.spotlight.show', entry.slug)}
                                        className="group flex flex-col justify-between rounded-2xl border border-zinc-200/60 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50"
                                    >
                                        <div>
                                            {/* Top Row: Avatar + Name + Score */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 font-mono text-base font-bold text-white shadow-sm">
                                                        {getInitials(companyName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-bold text-zinc-950 transition-colors group-hover:text-blue-600">
                                                            {companyName}
                                                        </h3>
                                                        {entry.founder_name && (
                                                            <span className="block truncate text-[11px] font-medium text-zinc-500">
                                                                {entry.founder_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* PARAGON Score Badge */}
                                                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-2.5 py-1 shadow-sm">
                                                    <Icon icon="solar:shield-star-bold" className="size-3.5 text-amber-500" />
                                                    <span className="font-mono text-xs font-bold text-zinc-900">{score}</span>
                                                </div>
                                            </div>

                                            {/* Sector & Cohort Info */}
                                            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                                {entry.sector && <span className="text-zinc-700">{entry.sector}</span>}
                                                {entry.sector && entry.batch && <span className="h-1 w-1 rounded-full bg-zinc-300" />}
                                                {entry.batch && <span>{entry.batch}</span>}
                                            </div>

                                            {/* Value Proposition */}
                                            <p className="mt-3 text-[13px] leading-relaxed text-zinc-600 line-clamp-3">
                                                {entry.spotlight_one_liner || 'Audited venture participating in Pinpoint Spotlight syndicate review.'}
                                            </p>

                                            {/* Verified Diligence Signals */}
                                            {entry.badges && entry.badges.length > 0 && (
                                                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    {entry.badges.slice(0, 3).map((b) => (
                                                        <div key={b.id} className="flex items-center gap-1.5">
                                                            <Icon icon="solar:check-circle-bold" className="size-3.5 text-blue-500" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                                                                {b.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {entry.badges.length > 3 && (
                                                        <span className="text-[10px] font-bold text-zinc-400">
                                                            +{entry.badges.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Footer */}
                                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                                            <span className="text-xs font-bold text-zinc-900 transition-colors group-hover:text-blue-600">
                                                View Dossier
                                            </span>
                                            <Icon icon="solar:arrow-right-linear" className="size-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        /* ── Empty State ── */
                        <div className="rounded-3xl border border-zinc-200 border-dashed bg-white/50 p-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-zinc-400">
                                <Icon icon="solar:magnifer-linear" className="size-7" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-zinc-950">No startups found</h3>
                            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
                                No published ventures match your current search query or sector filter. Try adjusting your filters.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedSector('All');
                                }}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <Icon icon="solar:refresh-linear" className="size-4" />
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
