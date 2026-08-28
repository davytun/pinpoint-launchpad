import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvestorProfile {
    full_name: string;
    company_name?: string | null;
    investor_type?: string | null;
    phone?: string | null;
    address?: string | null;
}

interface InvestorUser {
    id: string;
    email: string;
    account_status: string;
    kyc_status: string;
    profile?: InvestorProfile | null;
}

interface Founder {
    id: string;
    company_name: string;
    full_name: string;
    email: string;
}

interface FounderProfileData {
    id: string;
    slug: string;
    sector: string;
    batch?: string | null;
    overall_score?: number | null;
    spotlight_one_liner?: string | null;
    founder?: Founder | null;
}

interface Grant {
    id: string;
    investor_id: string;
    profile_id: string;
    granted_by_founder?: string | null;
    granted_at: string;
    revoked_at: string | null;
    created_at: string;
    investor?: InvestorUser | null;
    profile?: FounderProfileData | null;
    grantor?: Founder | null;
}

interface AuditEvent {
    id: number;
    event: string;
    created_at: string | null;
    actor: string;
    profile_id: string | null;
    startup_name: string | null;
    metadata?: Record<string, unknown> | null;
    ip_address?: string | null;
}

interface Totals {
    total: number;
    active: number;
    revoked: number;
    unique_startups: number;
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
    grants: PaginatedData<Grant>;
    audit_events: AuditEvent[];
    activeStatus: 'all' | 'active' | 'revoked';
    activeTab: 'grants' | 'audit_trail';
    search: string;
    totals: Totals;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return 'DR';
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

function humanizeEvent(event: string): { label: string; icon: string } {
    if (event.includes('granted')) {
        return { label: 'Data Room Granted', icon: 'solar:shield-keyhole-linear' };
    }
    if (event.includes('revoked')) {
        return { label: 'Access Revoked', icon: 'solar:shield-cross-linear' };
    }
    if (event.includes('reinstated')) {
        return { label: 'Access Reinstated', icon: 'solar:restart-linear' };
    }
    if (event.includes('interest_submitted')) {
        return { label: 'Interest Submitted', icon: 'solar:inbox-line-linear' };
    }
    if (event.includes('approved')) {
        return { label: 'Request Approved', icon: 'solar:check-circle-linear' };
    }
    if (event.includes('denied')) {
        return { label: 'Request Declined', icon: 'solar:close-circle-linear' };
    }
    return {
        label: event.replace(/\./g, ' · ').replace(/_/g, ' '),
        icon: 'solar:info-circle-linear',
    };
}

// ─── Slide-Over Data Room Grant Drawer ────────────────────────────────────────

function DataRoomDrawer({
    grant,
    onClose,
    onUpdateGrant,
}: {
    grant: Grant;
    onClose: () => void;
    onUpdateGrant: (updated: Grant) => void;
}) {
    const [processing, setProcessing] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const isActive = grant.revoked_at === null;
    const investorName = grant.investor?.profile?.full_name ?? grant.investor?.email ?? 'Investor';
    const investorFirm = grant.investor?.profile?.company_name ?? 'Private Syndicate';
    const startupName = grant.profile?.founder?.company_name ?? 'Startup';
    const founderName = grant.profile?.founder?.full_name ?? 'Founder';

    function toggleRevocation() {
        setProcessing(true);
        const url = isActive
            ? `/admin/dealflow/data-rooms/${grant.id}/revoke`
            : `/admin/dealflow/data-rooms/${grant.id}/reinstate`;

        router.patch(
            url,
            {},
            {
                onSuccess: () => {
                    onUpdateGrant({
                        ...grant,
                        revoked_at: isActive ? new Date().toISOString() : null,
                        granted_at: !isActive ? new Date().toISOString() : grant.granted_at,
                    });
                },
                onFinish: () => setProcessing(false),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        if (!grant.investor?.email) return;
        navigator.clipboard.writeText(grant.investor.email);
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
            <div
                className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Slide Panel */}
            <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-zinc-200 animate-in slide-in-from-right duration-200">
                {/* ── Drawer Header ────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 shrink-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-xs">
                            {getInitials(investorName)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-zinc-950">{investorName}</h3>
                                {isActive ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        <Icon icon="solar:shield-keyhole-linear" className="size-3 text-emerald-600" />
                                        <span>Active Clearance</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                                        <Icon icon="solar:shield-cross-linear" className="size-3 text-zinc-500" />
                                        <span>Revoked</span>
                                    </span>
                                )}
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {investorFirm} · Granted {formatRelativeTime(grant.granted_at)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors shrink-0"
                    >
                        <Icon icon="solar:close-circle-linear" className="size-5" />
                    </button>
                </div>

                {/* ── Quick Action Strip ────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#FAFBFD] border-b border-zinc-100 shrink-0">
                    <div>
                        {isActive ? (
                            <button
                                type="button"
                                onClick={toggleRevocation}
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition-all shadow-2xs disabled:opacity-50"
                            >
                                {processing ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:shield-cross-linear" className="size-3.5 text-rose-500" />
                                )}
                                <span>Revoke Data Room Access</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleRevocation}
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs disabled:opacity-50"
                            >
                                {processing ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:shield-keyhole-linear" className="size-3.5 text-emerald-400" />
                                )}
                                <span>Reinstate Clearance</span>
                            </button>
                        )}
                    </div>

                    <span className="text-[11px] font-medium text-zinc-400">
                        {isActive ? 'Security clearance active' : 'Access terminated'}
                    </span>
                </div>

                {/* ── Drawer Body (No scrollbars) ───────────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
                    {/* Section 1: Security & Clearance Specification */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4.5 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                Clearance Status
                            </span>
                            <span className="text-xs font-semibold text-zinc-900">
                                {isActive ? 'Permitted Read / Download' : 'Revoked / Terminated'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
                            <div>
                                <span className="text-zinc-400 block text-[11px]">Granted At</span>
                                <span className="font-medium text-zinc-800">{formatDate(grant.granted_at)}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400 block text-[11px]">Authorized By</span>
                                <span className="font-medium text-zinc-800">
                                    {grant.grantor?.full_name ?? 'Founder / Admin'}
                                </span>
                            </div>
                        </div>

                        {grant.revoked_at && (
                            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-xs text-zinc-600">
                                <span className="font-semibold text-zinc-900 block">Revocation Recorded</span>
                                <span className="text-[11px] text-zinc-500">
                                    Access was officially revoked on {new Date(grant.revoked_at).toLocaleString()}.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Target Startup Dossier */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                                Shared Startup Data Room
                            </h4>
                            <span className="text-[11px] font-semibold text-zinc-600">
                                Score: {grant.profile?.overall_score ?? '—'}/100
                            </span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700">
                                    {getInitials(startupName)}
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-zinc-950">{startupName}</h5>
                                    <p className="text-[11px] text-zinc-400">{grant.profile?.sector}</p>
                                </div>
                            </div>

                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Founder & CEO</span>
                                    <span className="font-medium text-zinc-900">{founderName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Founder Email</span>
                                    <span className="font-medium text-zinc-900 font-mono text-[11px]">
                                        {grant.profile?.founder?.email ?? '—'}
                                    </span>
                                </div>
                                {grant.profile?.batch && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-zinc-400">Cohort / Batch</span>
                                        <span className="font-medium text-zinc-900">{grant.profile.batch}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Investor Dossier & Identification */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                                Investor Dossier
                            </h4>
                            <span className="text-[11px] text-zinc-400">Identity Record</span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-2xs">
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Legal Representative</span>
                                    <span className="font-semibold text-zinc-950">{investorName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Entity / Firm</span>
                                    <span className="font-medium text-zinc-900">{investorFirm}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Direct Email</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900 font-mono text-[11px]">
                                            {grant.investor?.email ?? '—'}
                                        </span>
                                        <button
                                            onClick={copyEmail}
                                            className="text-zinc-400 hover:text-zinc-800 transition-colors"
                                            title="Copy Email"
                                        >
                                            <Icon
                                                icon={copiedEmail ? 'solar:check-circle-linear' : 'solar:copy-linear'}
                                                className="size-3.5"
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">KYC Status</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-800 bg-zinc-100 border border-zinc-200/80 rounded-full px-2 py-0.2">
                                        <Icon icon="solar:verified-check-linear" className="size-3 text-zinc-600" />
                                        <span>{grant.investor?.kyc_status ?? 'Approved'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Sticky Action Footer ─────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-zinc-100 bg-[#FAFBFD] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                    >
                        Close
                    </button>

                    <div>
                        {isActive ? (
                            <button
                                type="button"
                                onClick={toggleRevocation}
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
                            >
                                <Icon icon="solar:shield-cross-linear" className="size-3.5 text-zinc-500" />
                                <span>Revoke Access</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleRevocation}
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                            >
                                <Icon icon="solar:shield-keyhole-linear" className="size-3.5 text-emerald-400" />
                                <span>Reinstate Clearance</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Data Room Workspace Component ───────────────────────────────────────

export default function AdminDataRooms({
    grants,
    audit_events: auditEvents = [],
    activeStatus = 'all',
    activeTab: initialTab = 'grants',
    search: initialSearch = '',
    totals = {
        total: 0,
        active: 0,
        revoked: 0,
        unique_startups: 0,
    },
}: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState<'grants' | 'audit_trail'>(initialTab);
    const [activeDrawerGrant, setActiveDrawerGrant] = useState<Grant | null>(null);

    // Keep drawer reactive to prop changes
    useEffect(() => {
        if (activeDrawerGrant) {
            const updated = grants.data.find((g) => g.id === activeDrawerGrant.id);
            if (updated) {
                setActiveDrawerGrant(updated);
            }
        }
    }, [grants, activeDrawerGrant]);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const p: Record<string, string> = {};
            const st = overrides.status !== undefined ? overrides.status : activeStatus !== 'all' ? activeStatus : undefined;
            const sr = overrides.search !== undefined ? overrides.search : search;
            const tb = overrides.tab !== undefined ? overrides.tab : activeTab;
            if (st) p.status = st;
            if (sr) p.search = sr;
            if (tb && tb !== 'grants') p.tab = tb;

            router.get('/admin/dealflow/data-rooms', p, { replace: true, preserveState: true });
        },
        [activeStatus, search, activeTab],
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
            <Head title="Data Room Grants & Security — Admin" />

            {/* ── Main Full-Height Container ───────────────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-xs overflow-hidden p-6 lg:p-8">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0 mb-6">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-950">Data Room Clearances & Security</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Monitor active data room credentials, investor diligence access, and security audit events.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/dealflow/interests')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                        >
                            <Icon icon="solar:hand-money-linear" className="size-3.5 text-zinc-500" />
                            <span>Investor Interests</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.get('/admin/spotlight')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                        >
                            <Icon icon="solar:crown-linear" className="size-3.5 text-zinc-500" />
                            <span>Spotlight Startups</span>
                        </button>
                    </div>
                </div>

                {/* ── Minimal Monochrome Stats Strip (Refero Clean Look) ───────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 mb-6">
                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Active Clearances
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.active}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Revoked Access
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.revoked}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Unique Startups Shared
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.unique_startups}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Security Logs
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {auditEvents.length}
                        </span>
                    </div>
                </div>

                {/* ── Navigation Tabs ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4 shrink-0 pb-3 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('grants');
                                applyFilters({ tab: 'grants', status: '' });
                            }}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                activeTab === 'grants' && activeStatus === 'all'
                                    ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                            )}
                        >
                            <span>All Grants</span>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.2 text-[10.5px] font-bold tabular-nums',
                                    activeTab === 'grants' && activeStatus === 'all'
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-200/70 text-zinc-600',
                                )}
                            >
                                {totals.total}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('grants');
                                applyFilters({ tab: 'grants', status: 'active' });
                            }}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                activeTab === 'grants' && activeStatus === 'active'
                                    ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                            )}
                        >
                            <span>Active Clearances</span>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.2 text-[10.5px] font-bold tabular-nums',
                                    activeTab === 'grants' && activeStatus === 'active'
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-200/70 text-zinc-600',
                                )}
                            >
                                {totals.active}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('grants');
                                applyFilters({ tab: 'grants', status: 'revoked' });
                            }}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                activeTab === 'grants' && activeStatus === 'revoked'
                                    ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                            )}
                        >
                            <span>Revoked Access</span>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.2 text-[10.5px] font-bold tabular-nums',
                                    activeTab === 'grants' && activeStatus === 'revoked'
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-200/70 text-zinc-600',
                                )}
                            >
                                {totals.revoked}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('audit_trail');
                                applyFilters({ tab: 'audit_trail' });
                            }}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                activeTab === 'audit_trail'
                                    ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                            )}
                        >
                            <span>Security Audit Trail</span>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.2 text-[10.5px] font-bold tabular-nums',
                                    activeTab === 'audit_trail'
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-200/70 text-zinc-600',
                                )}
                            >
                                {auditEvents.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── Search Bar (When on Grants Tab) ─────────────────────────── */}
                {activeTab === 'grants' && (
                    <div className="flex items-center justify-between gap-3 shrink-0 mb-3">
                        <div className="relative w-full max-w-md">
                            <Icon
                                icon="solar:minimalistic-magnifer-linear"
                                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search investor email, name, or startup..."
                                className="w-full rounded-xl border border-zinc-200/90 bg-white py-1.5 pr-8 pl-9 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none shadow-2xs transition-colors"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Main Tab Content ────────────────────────────────────────── */}
                {activeTab === 'grants' ? (
                    <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                        {/* Fixed Table Header */}
                        <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 select-none shrink-0">
                            <div className="w-64 shrink-0">Investor / Entity</div>
                            <div className="w-56 shrink-0">Target Startup</div>
                            <div className="w-36 shrink-0">Clearance Status</div>
                            <div className="w-36 shrink-0">Granted Date</div>
                            <div className="min-w-0 flex-1">Authorized By</div>
                            <div className="w-32 shrink-0 text-right">Action</div>
                        </div>

                        {/* Scrollable Rows (No scrollbar) */}
                        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-zinc-100">
                            {grants.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Icon icon="solar:shield-keyhole-linear" className="size-8 text-zinc-300 mb-2" />
                                    <p className="text-xs text-zinc-400">No data room credentials found matching this filter.</p>
                                </div>
                            ) : (
                                grants.data.map((grant) => {
                                    const isActive = grant.revoked_at === null;
                                    const investorName =
                                        grant.investor?.profile?.full_name ?? grant.investor?.email ?? 'Investor';
                                    const companyName = grant.profile?.founder?.company_name ?? 'Startup';

                                    return (
                                        <div
                                            key={grant.id}
                                            onClick={() => setActiveDrawerGrant(grant)}
                                            className={cn(
                                                'group flex items-center gap-4 px-4 py-3 text-xs transition-colors duration-150 hover:bg-zinc-50/80 cursor-pointer',
                                                !isActive && 'opacity-60',
                                            )}
                                        >
                                            {/* Investor Column */}
                                            <div className="w-64 shrink-0 flex items-center gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-700">
                                                    {getInitials(investorName)}
                                                </div>
                                                <div className="min-w-0 pr-1">
                                                    <span className="font-semibold text-zinc-950 group-hover:underline text-[12.5px] block truncate">
                                                        {investorName}
                                                    </span>
                                                    <span className="text-zinc-400 text-[11px] truncate block">
                                                        {grant.investor?.profile?.company_name ?? grant.investor?.email}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Startup Column */}
                                            <div className="w-56 shrink-0 min-w-0">
                                                <span className="font-medium text-zinc-900 truncate block text-[12px]">
                                                    {companyName}
                                                </span>
                                                <span className="text-[11px] text-zinc-400 truncate block">
                                                    {grant.profile?.sector}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="w-36 shrink-0">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                        <Icon icon="solar:shield-keyhole-linear" className="size-3 text-emerald-600" />
                                                        <span>Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                                                        <Icon icon="solar:shield-cross-linear" className="size-3 text-zinc-500" />
                                                        <span>Revoked</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Granted Date */}
                                            <div className="w-36 shrink-0 text-zinc-500 text-[11.5px]">
                                                {formatRelativeTime(grant.granted_at)}
                                            </div>

                                            {/* Authorized By */}
                                            <div className="min-w-0 flex-1 text-zinc-600 text-[11.5px] truncate">
                                                {grant.grantor?.full_name ?? 'Founder / Admin'}
                                            </div>

                                            {/* Action Button */}
                                            <div className="w-32 shrink-0 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDrawerGrant(grant);
                                                    }}
                                                    className="whitespace-nowrap rounded-lg border border-zinc-200/80 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
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
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-400 shrink-0">
                            <p>
                                Showing {grants.from ?? 0} to {grants.to ?? 0} of {grants.total} grants
                            </p>

                            {grants.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {grants.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            disabled={!link.url}
                                            className={cn(
                                                'px-2 py-1 rounded-md text-xs font-medium',
                                                link.active
                                                    ? 'bg-zinc-950 text-white font-bold'
                                                    : link.url
                                                    ? 'text-zinc-600 hover:bg-zinc-100'
                                                    : 'text-zinc-300 cursor-not-allowed',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Security Audit Trail View ────────────────────────────── */
                    <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                        {/* Fixed Table Header */}
                        <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 select-none shrink-0">
                            <div className="w-56 shrink-0">Security Action</div>
                            <div className="w-52 shrink-0">Actor / Operator</div>
                            <div className="w-56 shrink-0">Target Startup</div>
                            <div className="min-w-0 flex-1">IP Address / Node</div>
                            <div className="w-36 shrink-0 text-right">Timestamp</div>
                        </div>

                        {/* Scrollable Audit Rows (No scrollbar) */}
                        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-zinc-100">
                            {auditEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Icon icon="solar:shield-check-linear" className="size-8 text-zinc-300 mb-2" />
                                    <p className="text-xs text-zinc-400">No security audit logs recorded yet.</p>
                                </div>
                            ) : (
                                auditEvents.map((evt) => {
                                    const { label, icon } = humanizeEvent(evt.event);

                                    return (
                                        <div
                                            key={evt.id}
                                            className="flex items-center gap-4 px-4 py-3 text-xs transition-colors duration-150 hover:bg-zinc-50/80"
                                        >
                                            {/* Action Name */}
                                            <div className="w-56 shrink-0 flex items-center gap-2 font-medium text-zinc-950">
                                                <Icon icon={icon} className="size-3.5 text-zinc-500 shrink-0" />
                                                <span className="truncate">{label}</span>
                                            </div>

                                            {/* Actor */}
                                            <div className="w-52 shrink-0 text-zinc-700 truncate font-mono text-[11.5px]">
                                                {evt.actor}
                                            </div>

                                            {/* Target Startup */}
                                            <div className="w-56 shrink-0 font-medium text-zinc-900 truncate">
                                                {evt.startup_name ?? (evt.profile_id ? `#${evt.profile_id.substring(0, 8)}` : '—')}
                                            </div>

                                            {/* IP / Host */}
                                            <div className="min-w-0 flex-1 text-zinc-400 font-mono text-[11px] truncate">
                                                {evt.ip_address ?? 'VPC Internal Gateway'}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="w-36 shrink-0 text-right text-zinc-500 text-[11.5px] tabular-nums">
                                                {formatRelativeTime(evt.created_at)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Audit Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-400 shrink-0">
                            <p>Displaying latest {auditEvents.length} cryptographic audit logs</p>
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2 py-0.5">
                                Real-Time Logged
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Slide-Over Detail Drawer ─────────────────────────────────── */}
                {activeDrawerGrant && (
                    <DataRoomDrawer
                        grant={activeDrawerGrant}
                        onClose={() => setActiveDrawerGrant(null)}
                        onUpdateGrant={(updated) => setActiveDrawerGrant(updated)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
