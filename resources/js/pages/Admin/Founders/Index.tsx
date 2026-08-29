import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analyst {
    id: number;
    name: string;
    email: string;
}

interface FounderProfileSummary {
    id: string;
    slug: string;
    sector: string;
    batch?: string | null;
    is_public: boolean;
}

interface FounderRow {
    id: string;
    full_name: string | null;
    company_name: string | null;
    email: string;
    phone?: string | null;
    score: number | null;
    score_band: string | null;
    tier: string | null;
    tier_label: string;
    audit_status: string;
    assigned_analyst: Analyst | null;
    assigned_at: string | null;
    audit_notes: string | null;
    documents_count: number;
    pillar_scores: Record<string, number> | null;
    profile: FounderProfileSummary | null;
    created_at: string;
    created_at_human: string;
}

interface Totals {
    total: number;
    pending: number;
    in_progress: number;
    needs_info: number;
    on_hold: number;
    complete: number;
    unassigned: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    founders: PaginatedData<FounderRow>;
    analysts: Analyst[];
    user_role: 'superadmin' | 'analyst' | 'support' | 'investor_relations';
    activeStatus: string;
    activeAnalyst: string;
    search: string;
    totals: Totals;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return 'FD';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatDate(isoString?: string | null): string {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatRelativeTime(isoString?: string | null): string {
    if (!isoString) return '—';
    const now = new Date();
    const d = new Date(isoString);
    const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return formatDate(isoString);
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'complete':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                    <span>Complete</span>
                </span>
            );
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    <span>In Progress</span>
                </span>
            );
        case 'needs_info':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Needs Info</span>
                </span>
            );
        case 'on_hold':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>On Hold</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <span>Pending</span>
                </span>
            );
    }
}

function ScoreBadge({ score }: { score: number | null }) {
    if (score === null || score === undefined) {
        return <span className="text-xs font-medium text-zinc-400">—</span>;
    }

    const isHigh = score >= 85;
    const isMid = score >= 75;

    return (
        <div className="flex items-center gap-1.5">
            <span className={cn('font-mono text-xs font-bold tabular-nums', isHigh ? 'text-zinc-950' : isMid ? 'text-zinc-800' : 'text-zinc-600')}>
                {score}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">/100</span>
            {isHigh && (
                <span title="High Velocity">
                    <Icon icon="solar:bolt-linear" className="size-3 text-amber-500" />
                </span>
            )}
        </div>
    );
}

// ─── Slide-Over Founder Detail & Audit Drawer ─────────────────────────────────

function FounderAuditDrawer({
    founder,
    analysts,
    userRole,
    onClose,
    onUpdateFounder,
}: {
    founder: FounderRow;
    analysts: Analyst[];
    userRole: string;
    onClose: () => void;
    onUpdateFounder: (updated: FounderRow) => void;
}) {
    const isSuperAdmin = userRole === 'superadmin';
    const [selectedAnalystId, setSelectedAnalystId] = useState<string>(founder.assigned_analyst ? String(founder.assigned_analyst.id) : '');
    const [notes, setNotes] = useState(founder.audit_notes ?? '');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingAnalyst, setUpdatingAnalyst] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const founderName = founder.full_name ?? founder.email;
    const companyName = founder.company_name ?? 'Startup';

    function handleStatusChange(newStatus: string) {
        setUpdatingStatus(true);
        router.patch(
            route('admin.founders.audit-status', { founder: founder.id }),
            { audit_status: newStatus },
            {
                onSuccess: () => {
                    onUpdateFounder({
                        ...founder,
                        audit_status: newStatus,
                    });
                },
                onFinish: () => setUpdatingStatus(false),
                preserveScroll: true,
            },
        );
    }

    function handleAssignAnalyst(e: React.FormEvent) {
        e.preventDefault();
        setUpdatingAnalyst(true);
        router.post(
            route('admin.founders.assign', { founder: founder.id }),
            {
                analyst_id: selectedAnalystId ? selectedAnalystId : null,
                notes: notes,
            },
            {
                onSuccess: () => {
                    const matched = analysts.find((a) => String(a.id) === selectedAnalystId) ?? null;
                    onUpdateFounder({
                        ...founder,
                        assigned_analyst: matched,
                        assigned_at: matched ? new Date().toISOString() : null,
                        audit_notes: notes,
                    });
                },
                onFinish: () => setUpdatingAnalyst(false),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        navigator.clipboard.writeText(founder.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} />

            {/* Slide-over Content Canvas */}
            <div className="animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-xl flex-col justify-between overflow-hidden border-l border-zinc-200 bg-white shadow-2xl duration-200">
                {/* ── Drawer Header ────────────────────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6 py-4.5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white shadow-xs">
                            {getInitials(founderName)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-zinc-950">{founderName}</h3>
                                <StatusBadge status={founder.audit_status} />
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {companyName} · Registered {formatRelativeTime(founder.created_at)}
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

                {/* ── Fast Action Toolbar ───────────────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 bg-[#FAFBFD] px-6 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Audit Status:</span>
                        <div className="flex items-center gap-1">
                            {['pending', 'in_progress', 'needs_info', 'complete'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(st)}
                                    disabled={updatingStatus || founder.audit_status === st}
                                    className={cn(
                                        'rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all',
                                        founder.audit_status === st
                                            ? 'bg-zinc-950 text-white shadow-2xs'
                                            : 'border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50',
                                    )}
                                >
                                    {st.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {updatingStatus && <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin text-zinc-400" />}
                </div>

                {/* ── Drawer Body (Scrollable, No scrollbars) ───────────────── */}
                <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Section 1: PARAGON Diagnostic Scores Card */}
                    <div className="space-y-3.5 rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-[11px] font-bold tracking-wider text-zinc-400 uppercase">PARAGON Diagnostic Score</span>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="font-mono text-2xl font-bold text-zinc-950">{founder.score ?? '—'}</span>
                                    <span className="font-mono text-xs text-zinc-400">/ 100</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-[11px] font-medium text-zinc-400">Venture Tier</span>
                                <span className="text-xs font-semibold text-zinc-900 capitalize">{founder.tier_label}</span>
                            </div>
                        </div>

                        {/* Pillar Progress Bars */}
                        {founder.pillar_scores && (
                            <div className="space-y-2 border-t border-zinc-100 pt-2">
                                {Object.entries(founder.pillar_scores).map(([pillar, val]) => (
                                    <div key={pillar} className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-medium text-zinc-600 capitalize">{pillar}</span>
                                            <span className="font-mono font-bold text-zinc-900">{val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/60">
                                            <div
                                                className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                                                style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Analyst Assignment & Internal Notes */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">Assigned Analyst & Review Notes</h4>
                            <span className="text-[11px] text-zinc-400">{founder.assigned_analyst ? 'Lead Assigned' : 'Unassigned'}</span>
                        </div>

                        <form onSubmit={handleAssignAnalyst} className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs">
                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-zinc-500">Assigned Audit Lead</label>
                                {isSuperAdmin ? (
                                    <select
                                        value={selectedAnalystId}
                                        onChange={(e) => setSelectedAnalystId(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-zinc-400 focus:outline-none"
                                    >
                                        <option value="">No Analyst Assigned (Unassigned)</option>
                                        {analysts.map((a) => (
                                            <option key={a.id} value={String(a.id)}>
                                                {a.name} ({a.email})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-xs font-semibold text-zinc-900">
                                        {founder.assigned_analyst?.name ?? 'No analyst assigned yet'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-[11px] font-semibold text-zinc-500">
                                    Internal Analyst Notes & Audit Directives
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Internal verification notes, requested documents, or cap table observations..."
                                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={updatingAnalyst}
                                    className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {updatingAnalyst ? (
                                        <Icon icon="solar:refresh-linear" className="size-3 animate-spin" />
                                    ) : (
                                        <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-400" />
                                    )}
                                    <span>Save Assignment & Notes</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 3: Founder & Venture Record */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">Founder Dossier & Contact</h4>
                            <span className="text-[11px] text-zinc-400">KYC Profile</span>
                        </div>

                        <div className="space-y-2.5 rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs shadow-2xs">
                            <div className="flex items-center justify-between border-b border-zinc-100 py-1.5">
                                <span className="text-zinc-400">Full Legal Name</span>
                                <span className="font-semibold text-zinc-950">{founderName}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 py-1.5">
                                <span className="text-zinc-400">Company Name</span>
                                <span className="font-medium text-zinc-900">{companyName}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 py-1.5">
                                <span className="text-zinc-400">Official Email</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] font-medium text-zinc-900">{founder.email}</span>
                                    <button onClick={copyEmail} className="text-zinc-400 transition-colors hover:text-zinc-800" title="Copy Email">
                                        <Icon icon={copiedEmail ? 'solar:check-circle-linear' : 'solar:copy-linear'} className="size-3.5" />
                                    </button>
                                </div>
                            </div>

                            {founder.phone && (
                                <div className="flex items-center justify-between border-b border-zinc-100 py-1.5">
                                    <span className="text-zinc-400">Direct Phone</span>
                                    <span className="font-mono text-[11px] font-medium text-zinc-900">{founder.phone}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-zinc-400">Audit Documents Submitted</span>
                                <span className="font-semibold text-zinc-900">{founder.documents_count} Files</span>
                            </div>
                        </div>
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
                            onClick={() => router.get('/admin/messages')}
                            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                            <span>Message Founder</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.get(route('admin.founders.show', { founder: founder.id }))}
                            className="flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800"
                        >
                            <span>Open Full Dossier</span>
                            <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Founders Workspace Component ────────────────────────────────────────

export default function AdminFoundersIndex({
    founders,
    analysts = [],
    user_role = 'superadmin',
    activeStatus = 'all',
    activeAnalyst = 'all',
    search: initialSearch = '',
    totals = {
        total: 0,
        pending: 0,
        in_progress: 0,
        needs_info: 0,
        on_hold: 0,
        complete: 0,
        unassigned: 0,
    },
}: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeDrawerFounder, setActiveDrawerFounder] = useState<FounderRow | null>(null);

    // Keep drawer reactive to prop changes
    useEffect(() => {
        if (activeDrawerFounder) {
            const updated = founders.data.find((f) => f.id === activeDrawerFounder.id);
            if (updated) {
                setActiveDrawerFounder(updated);
            }
        }
    }, [founders, activeDrawerFounder]);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const p: Record<string, string> = {};
            const st = overrides.status !== undefined ? overrides.status : activeStatus !== 'all' ? activeStatus : undefined;
            const an = overrides.analyst_id !== undefined ? overrides.analyst_id : activeAnalyst !== 'all' ? activeAnalyst : undefined;
            const sr = overrides.search !== undefined ? overrides.search : search;

            if (st) p.status = st;
            if (an) p.analyst_id = an;
            if (sr) p.search = sr;

            router.get('/admin/founders', p, { replace: true, preserveState: true });
        },
        [activeStatus, activeAnalyst, search],
    );

    useEffect(() => {
        if (search === initialSearch) return;
        const t = setTimeout(() => {
            applyFilters({ search });
        }, 300);
        return () => clearTimeout(t);
    }, [search, applyFilters, initialSearch]);

    return (
        <AdminLayout>
            <Head title="Founders Directory & Audit Hub — Admin" />

            {/* ── Main Full-Height Container ─────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-xs lg:p-8">
                {/* ── Top Header Strip ────────────────────────────────────────── */}
                <div className="mb-6 flex shrink-0 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Founders Directory & Audit Hub</h1>
                        <p className="mt-2 text-[15px] font-medium text-zinc-500">
                            Manage diagnostic assessments, PARAGON audit progress, venture tiering, and analyst assignments.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/messages')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                            <span>Founder Messages</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.get('/admin/spotlight')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:crown-linear" className="size-3.5 text-zinc-500" />
                            <span>Spotlight Startups</span>
                        </button>
                    </div>
                </div>

                {/* ── Minimalist Monochrome Metric Strip ────────── */}
                <div className="mb-8 grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Total Founders</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals.total}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Audit In Progress</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals.in_progress}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Audits Complete</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals.complete}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Needs Attention</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                            {totals.needs_info + totals.on_hold}
                        </span>
                    </div>
                </div>

                {/* ── Status Tab Navigation ────────────────────────────────────── */}
                <div className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[
                            { id: 'all', label: 'All Founders', count: totals.total },
                            { id: 'in_progress', label: 'In Progress', count: totals.in_progress },
                            { id: 'complete', label: 'Complete', count: totals.complete },
                            { id: 'needs_info', label: 'Needs Info', count: totals.needs_info },
                            { id: 'pending', label: 'Pending', count: totals.pending },
                            { id: 'on_hold', label: 'On Hold', count: totals.on_hold },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => applyFilters({ status: tab.id === 'all' ? '' : tab.id })}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                    (tab.id === 'all' && activeStatus === 'all') || activeStatus === tab.id
                                        ? 'border border-zinc-200/80 bg-zinc-100 font-semibold text-zinc-950 shadow-2xs'
                                        : 'border border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                                )}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={cn(
                                        'py-0.2 rounded-full px-1.5 text-[10.5px] font-bold tabular-nums',
                                        (tab.id === 'all' && activeStatus === 'all') || activeStatus === tab.id
                                            ? 'bg-zinc-950 text-white'
                                            : 'bg-zinc-200/70 text-zinc-600',
                                    )}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Analyst Lead Filter */}
                    <div className="flex shrink-0 items-center gap-2">
                        <select
                            value={activeAnalyst}
                            onChange={(e) => applyFilters({ analyst_id: e.target.value === 'all' ? '' : e.target.value })}
                            className="rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs focus:border-zinc-400 focus:outline-none"
                        >
                            <option value="all">All Audit Leads</option>
                            <option value="unassigned">Unassigned Only ({totals.unassigned})</option>
                            {analysts.map((a) => (
                                <option key={a.id} value={String(a.id)}>
                                    Lead: {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Search Bar Strip ────────────────────────────────────────── */}
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
                            placeholder="Search founder name, company, or email..."
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
                </div>

                {/* ── Data Table (Fixed Header + No-Scrollbar Rows) ────────────── */}
                <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
                    {/* Fixed Table Header */}
                    <div className="flex shrink-0 items-center gap-4 border-b border-zinc-100 px-4 py-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase select-none">
                        <div className="w-56 shrink-0">Founder / Contact</div>
                        <div className="w-48 shrink-0">Company</div>
                        <div className="w-28 shrink-0">PARAGON Score</div>
                        <div className="w-36 shrink-0">Venture Tier</div>
                        <div className="w-32 shrink-0">Audit Status</div>
                        <div className="min-w-0 flex-1">Assigned Analyst</div>
                        <div className="w-32 shrink-0 text-right">Actions</div>
                    </div>

                    {/* Scrollable Table Rows (No scrollbar) */}
                    <div className="no-scrollbar min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto">
                        {founders.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Icon icon="solar:user-speak-linear" className="mb-2 size-8 text-zinc-300" />
                                <p className="text-xs text-zinc-400">No founders found matching this filter.</p>
                            </div>
                        ) : (
                            founders.data.map((f) => {
                                const founderName = f.full_name ?? f.email;
                                const companyName = f.company_name ?? 'Startup';

                                return (
                                    <div
                                        key={f.id}
                                        onClick={() => setActiveDrawerFounder(f)}
                                        className="group flex cursor-pointer items-center gap-4 px-4 py-3 text-xs transition-colors duration-150 hover:bg-zinc-50/80"
                                    >
                                        {/* Founder Column */}
                                        <div className="flex w-56 min-w-0 shrink-0 items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-700">
                                                {getInitials(founderName)}
                                            </div>
                                            <div className="min-w-0 pr-1">
                                                <span className="block truncate text-[12.5px] font-semibold text-zinc-950 group-hover:underline">
                                                    {founderName}
                                                </span>
                                                <span className="block truncate font-mono text-[11px] text-zinc-400">{f.email}</span>
                                            </div>
                                        </div>

                                        {/* Company Column */}
                                        <div className="w-48 min-w-0 shrink-0">
                                            <span className="block truncate text-[12px] font-medium text-zinc-900">{companyName}</span>
                                            <span className="block truncate text-[11px] text-zinc-400">{f.profile?.sector ?? 'General Tech'}</span>
                                        </div>

                                        {/* PARAGON Score */}
                                        <div className="w-28 shrink-0">
                                            <ScoreBadge score={f.score} band={f.score_band} />
                                        </div>

                                        {/* Venture Tier */}
                                        <div className="w-36 shrink-0">
                                            <span className="text-[11.5px] font-medium text-zinc-700">{f.tier_label}</span>
                                        </div>

                                        {/* Audit Status */}
                                        <div className="w-32 shrink-0">
                                            <StatusBadge status={f.audit_status} />
                                        </div>

                                        {/* Assigned Analyst */}
                                        <div className="min-w-0 flex-1 truncate">
                                            {f.assigned_analyst ? (
                                                <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-zinc-800">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white">
                                                        {getInitials(f.assigned_analyst.name)}
                                                    </div>
                                                    <span className="truncate">{f.assigned_analyst.name}</span>
                                                </div>
                                            ) : (
                                                <span className="py-0.2 inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/80 px-2 text-[10.5px] font-medium text-amber-700">
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="w-32 shrink-0 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDrawerFounder(f);
                                                }}
                                                className="rounded-lg border border-zinc-200/80 bg-white px-3 py-1 text-xs font-semibold whitespace-nowrap text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                            >
                                                Inspect & Act
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Table Footer & Pagination */}
                    <div className="flex shrink-0 items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400">
                        <p>
                            Showing {founders.from ?? 0} to {founders.to ?? 0} of {founders.total} founders
                        </p>

                        {founders.links.length > 3 && (
                            <div className="flex items-center gap-1">
                                {founders.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        disabled={!link.url}
                                        className={cn(
                                            'rounded-md px-2 py-1 text-xs font-medium',
                                            link.active
                                                ? 'bg-zinc-950 font-bold text-white'
                                                : link.url
                                                  ? 'text-zinc-600 hover:bg-zinc-100'
                                                  : 'cursor-not-allowed text-zinc-300',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Slide-Over Founder Audit Drawer ──────────────────────────── */}
                {activeDrawerFounder && (
                    <FounderAuditDrawer
                        founder={activeDrawerFounder}
                        analysts={analysts}
                        userRole={user_role}
                        onClose={() => setActiveDrawerFounder(null)}
                        onUpdateFounder={(updated) => setActiveDrawerFounder(updated)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
