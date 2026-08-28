import { Icon } from '@iconify/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileRow {
    id: number;
    slug: string;
    company_name: string | null;
    founder_name: string | null;
    founder_email: string;
    overall_score: number | null;
    is_public: boolean;
    is_live: boolean;
    is_expired: boolean;
    verified_badges_count: number;
    expires_at: string | null;
    batch: string | null;
    sector: string | null;
}

interface PageProps {
    profiles: ProfileRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return 'PR';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function pct(value: number, total: number): string | null {
    if (total === 0 || value === 0 || value === total) return null;
    return Math.round((value / total) * 100) + '%';
}

function StatusBadge({ row }: { row: ProfileRow }) {
    if (!row.is_public || (!row.is_live && !row.is_expired)) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>Draft</span>
            </span>
        );
    }
    if (row.is_expired) {
        return (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Expired</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Live</span>
        </span>
    );
}

// ─── Main Page (Mercury Layout) ───────────────────────────────────────────────

export default function AdminProfilesIndex({ profiles }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'live' | 'draft' | 'expired'>('all');

    // Filter Logic
    const filteredProfiles = profiles.filter((p) => {
        const matchesSearch =
            !searchQuery.trim() ||
            (p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (p.founder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            p.founder_email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = true;
        const isDraft = !p.is_public || (!p.is_live && !p.is_expired);
        if (activeTab === 'live') matchesTab = p.is_live && !isDraft;
        else if (activeTab === 'draft') matchesTab = isDraft;
        else if (activeTab === 'expired') matchesTab = p.is_expired && !isDraft;

        return matchesSearch && matchesTab;
    });

    // Metric Totals
    const totalCount = profiles.length;
    const liveCount = profiles.filter((p) => p.is_live && p.is_public).length;
    const draftCount = profiles.filter((p) => !p.is_public || (!p.is_live && !p.is_expired)).length;
    const expiredCount = profiles.filter((p) => p.is_expired && p.is_public).length;

    return (
        <AdminLayout>
            <Head title="Verification Profiles | Admin" />
            {/* ── Outer Card Container (Mercury Spec) ────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                    {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                    <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-zinc-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Verification Profiles</h1>
                            </div>
                            <p className="mt-0.5 text-[12px] font-normal text-zinc-500">
                                Manage verified public pages, audit scores, and investor access.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:border-zinc-300 hover:bg-zinc-50">
                                <Icon icon="solar:chart-square-linear" className="size-3.5 text-zinc-500" />
                                <span>Export Data</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Inline Metric Ribbon (Mercury Style) ─────────────────────── */}
                    <div className="grid shrink-0 grid-cols-2 divide-x divide-zinc-100 border-b border-zinc-100 bg-[#FAFBFD] sm:grid-cols-4">
                        <div className="px-6 py-3">
                            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Total Profiles</span>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totalCount}</span>
                            </div>
                        </div>

                        <div className="px-6 py-3">
                            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Live & Public</span>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{liveCount}</span>
                                {pct(liveCount, totalCount) && (
                                    <span className="text-[11px] font-medium text-emerald-600">{pct(liveCount, totalCount)}</span>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-3">
                            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Draft Status</span>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{draftCount}</span>
                                {pct(draftCount, totalCount) && (
                                    <span className="text-[11px] font-medium text-zinc-400">{pct(draftCount, totalCount)}</span>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-3">
                            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Expired</span>
                            <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{expiredCount}</span>
                                {pct(expiredCount, totalCount) && (
                                    <span className="text-[11px] font-medium text-amber-600">{pct(expiredCount, totalCount)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Toolbar: Segmented Views & Integrated Search ─────────────── */}
                    <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-b border-zinc-100 bg-white px-6 py-3 sm:flex-row">
                        {/* Filter Segmented Control */}
                        <div className="flex items-center gap-1 rounded-xl border border-zinc-200/60 bg-[#F4F4F6] p-1">
                            {(
                                [
                                    { key: 'all', label: 'All' },
                                    { key: 'live', label: 'Live' },
                                    { key: 'draft', label: 'Draft' },
                                    { key: 'expired', label: 'Expired' },
                                ] as const
                            ).map(({ key, label }) => {
                                const isSelected = activeTab === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-150',
                                            isSelected ? 'bg-white font-bold text-zinc-950 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900',
                                        )}
                                    >
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-76">
                            <Icon
                                icon="solar:minimalistic-magnifer-linear"
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search company, founder..."
                                className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] py-1.5 pr-8 pl-9 text-[13px] text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Table Container (Independently Scrollable) ──────────────── */}
                    <div className="min-h-0 flex-1 overflow-auto">
                        {filteredProfiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                                    <Icon icon="solar:users-group-two-rounded-linear" className="size-6" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900">No profiles found</h3>
                                <p className="mt-1 max-w-sm text-xs text-zinc-500">
                                    {searchQuery
                                        ? `No profiles match "${searchQuery}". Try clearing your search.`
                                        : 'Verified profiles will appear here once audits are complete.'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left text-xs">
                                <thead className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur-xs">
                                    <tr>
                                        <th className="w-[30%] px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Company & Founder
                                        </th>
                                        <th className="w-[15%] px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Sector & Batch
                                        </th>
                                        <th className="w-[15%] px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Score</th>
                                        <th className="w-[15%] px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Status</th>
                                        <th className="w-[15%] px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Verification
                                        </th>
                                        <th className="w-[10%] px-5 py-3 text-right text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 bg-white">
                                    {filteredProfiles.map((profile) => (
                                        <tr key={profile.id} className="group transition-colors duration-150 hover:bg-[#F9F9FB]">
                                            {/* Company & Founder (Soft Avatar) */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100 text-[10.5px] font-bold text-zinc-700">
                                                        {getInitials(profile.company_name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-semibold text-zinc-950">
                                                            {profile.company_name ?? '—'}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-[11.5px] font-normal text-zinc-400">
                                                            {profile.founder_name ?? 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Sector & Batch */}
                                            <td className="px-5 py-3.5">
                                                <p className="truncate text-[13px] font-medium text-zinc-900">{profile.sector ?? '—'}</p>
                                                {profile.batch && (
                                                    <p className="mt-0.5 truncate text-[11.5px] font-normal text-zinc-400">{profile.batch}</p>
                                                )}
                                            </td>

                                            {/* Score */}
                                            <td className="px-5 py-3.5">
                                                {profile.overall_score !== null ? (
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-[13.5px] font-bold text-zinc-950 tabular-nums">
                                                            {profile.overall_score}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-zinc-400">/100</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[13.5px] font-medium text-zinc-400">—</span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-3.5">
                                                <StatusBadge row={profile} />
                                            </td>

                                            {/* Verification Badges */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Icon icon="solar:shield-check-linear" className="size-4 text-emerald-500" />
                                                    <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">
                                                        {profile.verified_badges_count}{' '}
                                                        <span className="text-[11px] font-normal text-zinc-400">/ 7</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1 text-zinc-400">
                                                    <a
                                                        href={`/verify/${profile.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                                        title="View Public Page"
                                                    >
                                                        <Icon icon="solar:external-link-linear" className="size-4" />
                                                    </a>
                                                    <Link
                                                        href={`/admin/profiles/${profile.id}`}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                                        title="Full Profile Editor"
                                                    >
                                                        <Icon icon="solar:pen-new-square-linear" className="size-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
            </div>
        </AdminLayout>
    );
}
