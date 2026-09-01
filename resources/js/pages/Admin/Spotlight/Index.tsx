import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PitchDeck {
    id: string;
    original_filename: string;
    is_reviewed: boolean;
    file_size: number;
    analyst_note?: string | null;
    download_url?: string;
}

interface Badge {
    id: string;
    label: string;
    badge_type: string;
}

interface SpotlightProfile {
    id: string;
    founder_id: string;
    slug: string;
    company_name: string;
    founder_name: string;
    founder_email: string;
    sector: string;
    batch: string | null;
    overall_score: number | null;
    is_live: boolean;
    spotlight_one_liner: string;
    spotlight_summary: string;
    has_reviewed_pitch_deck: boolean;
    is_published: boolean;
    published_at: string | null;
    is_ready: boolean;
    needs_review: boolean;
    verified_badges_count: number;
    publish_requirements: string[];
    badges: Badge[];
    pitch_deck: PitchDeck | null;
}

interface Totals {
    all: number;
    published: number;
    ready: number;
    needs_review: number;
}

interface PageProps {
    profiles: SpotlightProfile[];
    activeStatus: 'all' | 'published' | 'ready' | 'needs_review';
    activeSector: string;
    search: string;
    sectors: string[];
    totals: Totals;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return 'SP';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatBytes(bytes?: number): string {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function buildParams(overrides: Record<string, string | undefined>, current: Partial<PageProps>) {
    const p: Record<string, string> = {};
    const status = overrides.status !== undefined ? overrides.status : current.activeStatus !== 'all' ? current.activeStatus : undefined;
    const sector = overrides.sector !== undefined ? overrides.sector : current.activeSector !== 'all' ? current.activeSector : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    if (status) p.status = status;
    if (sector) p.sector = sector;
    if (srch) p.search = srch;
    return p;
}

// ─── Slide-Over Spotlight Curation Drawer ─────────────────────────────────────

function SpotlightDrawer({
    profile,
    onClose,
    onUpdateProfile,
}: {
    profile: SpotlightProfile;
    onClose: () => void;
    onUpdateProfile: (updated: SpotlightProfile) => void;
}) {
    const [oneLiner, setOneLiner] = useState(profile.spotlight_one_liner);
    const [summary, setSummary] = useState(profile.spotlight_summary);
    const [sector, setSector] = useState(profile.sector);
    const [batch, setBatch] = useState(profile.batch ?? '');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [reviewingDeck, setReviewingDeck] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setOneLiner(profile.spotlight_one_liner);
        setSummary(profile.spotlight_summary);
        setSector(profile.sector);
        setBatch(profile.batch ?? '');
    }, [profile.id, profile.spotlight_one_liner, profile.spotlight_summary, profile.sector, profile.batch]);

    function saveCopy(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setSaving(true);
        setErrors({});

        router.patch(
            `/admin/spotlight/${profile.id}`,
            {
                spotlight_one_liner: oneLiner,
                spotlight_summary: summary,
                sector,
                batch,
            },
            {
                onSuccess: () => {
                    const remainingRequirements = profile.publish_requirements.filter(
                        (r) => !r.toLowerCase().includes('one-liner') && !r.toLowerCase().includes('summary'),
                    );
                    onUpdateProfile({
                        ...profile,
                        spotlight_one_liner: oneLiner,
                        spotlight_summary: summary,
                        sector,
                        batch,
                        publish_requirements: remainingRequirements,
                        is_ready: remainingRequirements.length === 0,
                    });
                },
                onFinish: () => setSaving(false),
                onError: (err) => setErrors(err as Record<string, string>),
                preserveScroll: true,
            },
        );
    }

    function togglePublish(publish: boolean) {
        setPublishing(true);
        router.patch(
            `/admin/spotlight/${profile.id}`,
            {
                publish,
                spotlight_one_liner: oneLiner,
                spotlight_summary: summary,
                sector,
                batch,
            },
            {
                onSuccess: () => {
                    onUpdateProfile({
                        ...profile,
                        is_published: publish,
                        spotlight_one_liner: oneLiner,
                        spotlight_summary: summary,
                        sector,
                        batch,
                    });
                },
                onFinish: () => setPublishing(false),
                preserveScroll: true,
            },
        );
    }

    function markDeckReviewed() {
        setReviewingDeck(true);
        router.patch(
            `/admin/spotlight/${profile.id}`,
            { mark_deck_reviewed: true },
            {
                onSuccess: () => {
                    const remainingRequirements = profile.publish_requirements.filter((r) => !r.toLowerCase().includes('pitch deck'));
                    onUpdateProfile({
                        ...profile,
                        has_reviewed_pitch_deck: true,
                        pitch_deck: profile.pitch_deck ? { ...profile.pitch_deck, is_reviewed: true } : null,
                        publish_requirements: remainingRequirements,
                        is_ready: remainingRequirements.length === 0,
                    });
                },
                onFinish: () => setReviewingDeck(false),
                preserveScroll: true,
            },
        );
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveCopy();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [oneLiner, summary, onClose, saveCopy]);

    const canPublish = profile.is_published || profile.publish_requirements.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} />

            {/* Panel */}
            <div className="animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-xl flex-col justify-between overflow-hidden border-l border-zinc-200 bg-white shadow-2xl duration-200">
                {/* ── Drawer Header ────────────────────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-xs font-bold text-white shadow-xs">
                            {getInitials(profile.company_name)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-zinc-950">{profile.company_name}</h3>
                                {profile.is_published ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                        <span>Live in Spotlight</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10.5px] font-medium text-zinc-500">
                                        Draft
                                    </span>
                                )}
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {profile.sector} {profile.batch && `· ${profile.batch}`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                    >
                        <Icon icon="solar:close-circle-linear" className="size-5" />
                    </button>
                </div>

                {/* ── Drawer Body ───────────────────────────────────────────── */}
                <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Publishing Readiness Warning (if requirements pending) */}
                    {!profile.is_published && profile.publish_requirements.length > 0 && (
                        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                                <Icon icon="solar:danger-triangle-linear" className="size-4 text-amber-600" />
                                <span>Requirements to Publish ({profile.publish_requirements.length})</span>
                            </div>
                            <ul className="list-disc space-y-1 pl-5 text-[11.5px] text-amber-800">
                                {profile.publish_requirements.map((req, idx) => (
                                    <li key={idx}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Section 1: Investor Copy */}
                    <div className="space-y-4">
                        {/* Sector & Batch */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-800">Category / Sector</label>
                                <input
                                    type="text"
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    placeholder="e.g. B2B SaaS, FinTech, AI..."
                                    className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-800">Syndicate Cohort / Batch</label>
                                <input
                                    type="text"
                                    value={batch}
                                    onChange={(e) => setBatch(e.target.value)}
                                    placeholder="e.g. Cohort 2026-Q1"
                                    className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* One-Liner */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-zinc-800">One-Liner Proposition</label>
                                <span className={cn('font-mono text-[10.5px]', oneLiner.length > 110 ? 'font-bold text-amber-600' : 'text-zinc-400')}>
                                    {oneLiner.length} / 120
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={120}
                                value={oneLiner}
                                onChange={(e) => setOneLiner(e.target.value)}
                                placeholder="Clear, concise one-sentence value proposition..."
                                className="w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                            />
                            {errors.spotlight_one_liner && <p className="text-xs font-medium text-rose-600">{errors.spotlight_one_liner}</p>}
                        </div>

                        {/* Executive Summary */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-zinc-800">Executive Summary</label>
                                <span className={cn('font-mono text-[10.5px]', summary.length > 450 ? 'font-bold text-amber-600' : 'text-zinc-400')}>
                                    {summary.length} / 500
                                </span>
                            </div>
                            <textarea
                                rows={4}
                                maxLength={500}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Detailed summary highlighting market opportunity, growth metrics, and traction..."
                                className="w-full resize-none rounded-xl border border-zinc-200/90 bg-white p-3 text-xs leading-relaxed text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                            />
                            {errors.spotlight_summary && <p className="text-xs font-medium text-rose-600">{errors.spotlight_summary}</p>}
                        </div>
                    </div>

                    {/* Section 2: Pitch Deck Attachment */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">Spotlight Pitch Deck</h4>
                            <span className="text-[11px] text-zinc-400">Required for investor portal</span>
                        </div>

                        {profile.pitch_deck ? (
                            <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200/60 bg-red-50 text-red-600">
                                            <Icon icon="solar:document-text-linear" className="size-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-zinc-950">{profile.pitch_deck.original_filename}</p>
                                            <p className="text-[11px] text-zinc-400">{formatBytes(profile.pitch_deck.file_size)}</p>
                                        </div>
                                    </div>

                                    {profile.pitch_deck.is_reviewed ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                            <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-600" />
                                            <span>Reviewed</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                            <Icon icon="solar:clock-circle-linear" className="size-3 text-amber-600" />
                                            <span>Pending Review</span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-zinc-100 pt-1 text-xs">
                                    <a
                                        href={profile.pitch_deck.download_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                                    >
                                        <Icon icon="solar:download-minimalistic-linear" className="size-3.5 text-zinc-500" />
                                        <span>Download PDF</span>
                                    </a>

                                    {!profile.pitch_deck.is_reviewed && (
                                        <button
                                            type="button"
                                            onClick={markDeckReviewed}
                                            disabled={reviewingDeck}
                                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100"
                                        >
                                            {reviewingDeck ? (
                                                <Icon icon="solar:refresh-linear" className="size-3 animate-spin" />
                                            ) : (
                                                <Icon icon="solar:check-circle-linear" className="size-3" />
                                            )}
                                            <span>Mark as Reviewed</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center">
                                <p className="text-xs font-medium text-zinc-400">No spotlight pitch deck uploaded.</p>
                            </div>
                        )}
                    </div>

                    {/* Section 3: PARAGON Audit & Badges */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">PARAGON Audit & Badges</h4>
                            <span className="text-[11px] font-bold text-emerald-700">Score: {profile.overall_score ?? '—'}/100</span>
                        </div>

                        {profile.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {profile.badges.map((b) => (
                                    <span
                                        key={b.id}
                                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/70 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                                    >
                                        <Icon icon="solar:verified-check-linear" className="size-3 text-emerald-600" />
                                        <span>{b.label}</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-400">No verified badges awarded yet.</p>
                        )}
                    </div>
                </div>

                {/* ── Sticky Action Footer ─────────────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-100 bg-[#FAFBFD] px-6 py-3.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => saveCopy()}
                            disabled={saving}
                            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-all hover:bg-zinc-50 disabled:opacity-50"
                        >
                            {saving ? (
                                <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                            ) : (
                                <Icon icon="solar:diskette-linear" className="size-3.5 text-zinc-500" />
                            )}
                            <span>Save Copy</span>
                            <kbd className="py-0.2 rounded bg-zinc-100 px-1 font-mono text-[10px] text-zinc-400">⌘↵</kbd>
                        </button>

                        {profile.is_published ? (
                            <button
                                type="button"
                                onClick={() => togglePublish(false)}
                                disabled={publishing}
                                className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition-all hover:bg-rose-100"
                            >
                                {publishing ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:eye-closed-linear" className="size-3.5 text-rose-600" />
                                )}
                                <span>Unpublish</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => togglePublish(true)}
                                disabled={publishing || !canPublish}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-2xs transition-all',
                                    canPublish
                                        ? 'bg-zinc-950 text-white hover:bg-zinc-800'
                                        : 'cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400',
                                )}
                            >
                                {publishing ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:crown-linear" className="size-3.5 text-amber-300" />
                                )}
                                <span>Publish to Spotlight</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Spotlight Workspace ─────────────────────────────────────────────────

export default function SpotlightIndex({ profiles, activeStatus, activeSector, search: initialSearch, sectors, totals }: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeDrawerProfile, setActiveDrawerProfile] = useState<SpotlightProfile | null>(null);
    const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

    const sectorDropdownRef = useRef<HTMLDivElement>(null);

    // Synchronize activeDrawerProfile with latest Inertia page props
    useEffect(() => {
        if (activeDrawerProfile) {
            const updated = profiles.find((p) => p.id === activeDrawerProfile.id);
            if (updated) {
                setActiveDrawerProfile(updated);
            }
        }
    }, [profiles, activeDrawerProfile]);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const query = buildParams(overrides, { activeStatus, activeSector, search });
            router.get('/admin/spotlight', query, { replace: true, preserveState: true });
        },
        [activeStatus, activeSector, search],
    );

    useEffect(() => {
        if (search === initialSearch) return;
        const t = setTimeout(() => {
            applyFilters({ search });
        }, 300);
        return () => clearTimeout(t);
    }, [search, applyFilters, initialSearch]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
                setIsSectorDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <AdminLayout>
            <Head title="Spotlight Management — Admin" />

            {/* ── Main Full-Height Container ───────────────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:rounded-[22px] lg:p-7">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="mb-4 flex shrink-0 items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-950">Spotlight Management</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.get('/admin/founders')}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                    >
                        <Icon icon="solar:users-group-two-rounded-linear" className="size-3.5 text-zinc-500" />
                        <span>Founder Pipeline</span>
                    </button>
                </div>

                {/* ── Tabs & Metric Counters ──────────────────────────────────── */}
                <div className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {(
                            [
                                { key: 'all', label: 'All Startups' },
                                { key: 'published', label: 'Published' },
                                { key: 'ready', label: 'Ready to Publish' },
                                { key: 'needs_review', label: 'Needs Review' },
                            ] as const
                        ).map(({ key, label }) => {
                            const isSelected = activeStatus === key;
                            const count =
                                key === 'all'
                                    ? totals?.all
                                    : key === 'published'
                                      ? totals?.published
                                      : key === 'ready'
                                        ? totals?.ready
                                        : totals?.needs_review;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => applyFilters({ status: key === 'all' ? '' : key })}
                                    className={cn(
                                        'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                        isSelected
                                            ? 'border border-zinc-200/80 bg-zinc-100 font-semibold text-zinc-950 shadow-2xs'
                                            : 'border border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                                    )}
                                >
                                    <span>{label}</span>
                                    {count !== undefined && count > 0 && (
                                        <span
                                            className={cn(
                                                'py-0.2 rounded-full px-1.5 text-[10.5px] font-bold tabular-nums',
                                                isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-200/70 text-zinc-600',
                                            )}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Metrics */}
                    <div className="hidden items-center gap-5 text-xs sm:flex">
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400">Total:</span>
                            <span className="font-semibold text-zinc-950 tabular-nums">{totals?.all ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400">Live in Spotlight:</span>
                            <span className="font-semibold text-emerald-600 tabular-nums">{totals?.published ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400">Ready:</span>
                            <span className="font-semibold text-zinc-950 tabular-nums">{totals?.ready ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* ── Search & Sector Filter ──────────────────────────────────── */}
                <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                    <div className="relative w-full max-w-md">
                        <Icon
                            icon="solar:minimalistic-magnifer-linear"
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search startup name, sector, or one-liner..."
                            className="w-full rounded-xl border border-zinc-200/90 bg-white py-1.5 pr-8 pl-9 text-xs text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="relative shrink-0" ref={sectorDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                            className="flex h-8 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <span>{activeSector === 'all' ? 'All sectors' : activeSector}</span>
                            <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-zinc-400" />
                        </button>

                        {isSectorDropdownOpen && (
                            <div className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        applyFilters({ sector: 'all' });
                                        setIsSectorDropdownOpen(false);
                                    }}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors',
                                        activeSector === 'all' ? 'bg-zinc-100 font-semibold text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50',
                                    )}
                                >
                                    <span>All sectors</span>
                                    {activeSector === 'all' && <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />}
                                </button>

                                {sectors.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            applyFilters({ sector: s });
                                            setIsSectorDropdownOpen(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors',
                                            activeSector === s ? 'bg-zinc-100 font-semibold text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50',
                                        )}
                                    >
                                        <span className="truncate pr-2">{s}</span>
                                        {activeSector === s && <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Table Container with Fixed Non-Scrolling Header ─────────── */}
                <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
                    {/* Fixed Table Header */}
                    <div className="flex shrink-0 items-center gap-4 border-b border-zinc-100 px-4 py-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase select-none">
                        <div className="min-w-0 flex-1">Startup / Value Proposition</div>
                        <div className="w-36 shrink-0">Sector</div>
                        <div className="w-28 shrink-0">PARAGON Score</div>
                        <div className="w-32 shrink-0">Pitch Deck</div>
                        <div className="w-28 shrink-0">Status</div>
                        <div className="w-32 shrink-0 text-right">Action</div>
                    </div>

                    {/* Scrollable Rows */}
                    <div className="no-scrollbar min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto">
                        {profiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-xs text-zinc-400">No spotlight startups found matching this filter.</p>
                            </div>
                        ) : (
                            profiles.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setActiveDrawerProfile(p)}
                                    className="group flex cursor-pointer items-center gap-4 px-4 py-3 text-xs transition-colors duration-150 hover:bg-zinc-50/80"
                                >
                                    {/* Startup & Value Proposition */}
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-700">
                                            {getInitials(p.company_name)}
                                        </div>
                                        <div className="min-w-0 pr-2">
                                            <span className="block truncate text-[13px] font-semibold text-zinc-900 group-hover:underline">
                                                {p.company_name}
                                            </span>
                                            <span className="block truncate text-[11.5px] font-normal text-zinc-400">
                                                {p.spotlight_one_liner || 'One-liner not configured'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sector */}
                                    <div className="w-36 shrink-0">
                                        <span className="block truncate text-[12px] font-medium text-zinc-800">{p.sector}</span>
                                        {p.batch && <span className="block truncate text-[11px] font-normal text-zinc-400">{p.batch}</span>}
                                    </div>

                                    {/* Score */}
                                    <div className="w-28 shrink-0">
                                        <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-zinc-900">
                                            <span>Score {p.overall_score ?? '—'}</span>
                                        </span>
                                        <span className="block text-[10.5px] font-normal text-zinc-400">
                                            {p.verified_badges_count} badges verified
                                        </span>
                                    </div>

                                    {/* Pitch Deck */}
                                    <div className="w-32 shrink-0">
                                        {p.pitch_deck ? (
                                            p.has_reviewed_pitch_deck ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                                    <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-600" />
                                                    <span>Reviewed</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                                                    <Icon icon="solar:clock-circle-linear" className="size-3 text-amber-600" />
                                                    <span>Needs Review</span>
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-[11px] text-zinc-300 italic">No deck</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="w-28 shrink-0">
                                        {p.is_published ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                <span>Published</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                                                Unpublished
                                            </span>
                                        )}
                                    </div>

                                    {/* Single Action Button */}
                                    <div className="w-32 shrink-0 text-right">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDrawerProfile(p);
                                            }}
                                            className="rounded-lg border border-zinc-200/80 bg-white px-3 py-1 text-xs font-semibold whitespace-nowrap text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                        >
                                            Review & Edit
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400">
                        <p>Showing {profiles.length} startups</p>
                        <p className="font-medium text-zinc-600">{totals?.published ?? 0} live on Investor Portal</p>
                    </div>
                </div>

                {/* ── Slide-Over Drawer ────────────────────────────────────────── */}
                {activeDrawerProfile && (
                    <SpotlightDrawer
                        profile={activeDrawerProfile}
                        onClose={() => setActiveDrawerProfile(null)}
                        onUpdateProfile={(updated) => setActiveDrawerProfile(updated)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
