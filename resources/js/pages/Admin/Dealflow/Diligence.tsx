import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvestorProfile {
    full_name: string;
    company_name?: string | null;
    investor_type?: string | null;
}

interface InvestorUser {
    id: string;
    email: string;
    profile?: InvestorProfile | null;
}

interface Founder {
    id: string;
    company_name: string;
    full_name: string;
}

interface FounderProfileData {
    id: string;
    slug: string;
    sector: string;
    spotlight_one_liner?: string | null;
    founder?: Founder | null;
}

interface DiligenceRequestItem {
    id: string;
    investor_id: string;
    profile_id: string;
    interest_id?: string | null;
    category: string;
    subject: string;
    request_details: string;
    status: 'submitted' | 'under_review' | 'waiting_for_founder' | 'founder_responded' | 'resolved' | 'declined';
    admin_instructions_for_founder?: string | null;
    founder_notes_to_admin?: string | null;
    founder_responded_at?: string | null;
    investor_visible_response?: string | null;
    admin_notes?: string | null;
    data_room_required: boolean;
    created_at: string;
    resolved_at?: string | null;
    investor?: InvestorUser | null;
    profile?: FounderProfileData | null;
}

interface Totals {
    all: number;
    submitted: number;
    waiting_for_founder: number;
    founder_responded: number;
    resolved: number;
    declined: number;
    financial: number;
    operational: number;
    legal_governance: number;
    document_request: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    requests: PaginatedData<DiligenceRequestItem>;
    activeStatus: string;
    activeCategory: string;
    activeQueue: string;
    search: string;
    totals: Totals;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return 'IN';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatDate(isoString?: string | null): string {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function humanizeCategory(category: string): string {
    return category.replace(/_/g, ' ');
}

function getStatusBadge(status: DiligenceRequestItem['status']) {
    switch (status) {
        case 'submitted':
            return { label: 'At Pinpoint', cls: 'border-amber-200/80 bg-amber-50 text-amber-700', icon: 'solar:clock-circle-linear' };
        case 'under_review':
            return { label: 'Under review', cls: 'border-amber-200/80 bg-amber-50 text-amber-700', icon: 'solar:magnifer-linear' };
        case 'waiting_for_founder':
            return { label: 'With Founder', cls: 'border-sky-200/80 bg-sky-50 text-sky-700', icon: 'solar:user-speak-linear' };
        case 'founder_responded':
            return { label: 'Responded', cls: 'border-violet-200/80 bg-violet-50 text-violet-700', icon: 'solar:chat-round-dots-linear' };
        case 'resolved':
            return { label: 'Resolved', cls: 'border-emerald-200/80 bg-emerald-50 text-emerald-700', icon: 'solar:check-circle-linear' };
        case 'declined':
            return { label: 'Declined', cls: 'border-rose-200/80 bg-rose-50 text-rose-700', icon: 'solar:close-circle-linear' };
        default:
            return { label: status, cls: 'border-zinc-200/80 bg-zinc-50 text-zinc-600', icon: 'solar:info-circle-linear' };
    }
}

function StatusBadge({ status }: { status: DiligenceRequestItem['status'] }) {
    const badge = getStatusBadge(status);
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', badge.cls)}>
            <Icon icon={badge.icon} className="size-3" />
            <span>{badge.label}</span>
        </span>
    );
}

// ─── Cross-desk navigation ────────────────────────────────────────────────────

const DESK_LINKS = [
    { key: 'interests', label: 'Interests', icon: 'solar:hand-money-linear', path: '/admin/investors/dealflow/interests' },
    { key: 'data-rooms', label: 'Data Room Grants', icon: 'solar:key-linear', path: '/admin/investors/dealflow/data-rooms' },
    { key: 'diligence', label: 'Post-Intro Diligence', icon: 'solar:magnifer-linear', path: '/admin/investors/dealflow/diligence' },
    { key: 'spotlight', label: 'Spotlight', icon: 'solar:crown-linear', path: '/admin/investors/spotlight' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiligenceIndex({ requests, activeQueue, totals }: PageProps) {
    const [selectedReq, setSelectedReq] = useState<DiligenceRequestItem | null>(null);
    const [instructions, setInstructions] = useState('');
    const [investorResponse, setInvestorResponse] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [markResolved, setMarkResolved] = useState(true);
    const [declineReason, setDeclineReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openModal = (req: DiligenceRequestItem) => {
        setSelectedReq(req);
        setInstructions(req.admin_instructions_for_founder || '');
        setInvestorResponse(req.investor_visible_response || req.founder_notes_to_admin || '');
        setAdminNotes(req.admin_notes || '');
        setDeclineReason('');
    };

    const closeModal = () => {
        setSelectedReq(null);
    };

    const handleFilterQueue = (queue: string) => {
        router.get(route('admin.dealflow.diligence.index'), { queue }, { preserveState: true, replace: true });
    };

    const handleRequestFounder = () => {
        if (!selectedReq) return;
        setSubmitting(true);
        router.patch(
            route('admin.dealflow.diligence.request-founder', selectedReq.id),
            { admin_instructions_for_founder: instructions },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    closeModal();
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    const handleReleaseResponse = () => {
        if (!selectedReq) return;
        setSubmitting(true);
        router.patch(
            route('admin.dealflow.diligence.release', selectedReq.id),
            {
                investor_visible_response: investorResponse,
                mark_resolved: markResolved,
                admin_notes: adminNotes,
            },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    closeModal();
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    const handleDecline = () => {
        if (!selectedReq) return;
        setSubmitting(true);
        router.patch(
            route('admin.dealflow.diligence.decline', selectedReq.id),
            { reason: declineReason },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    closeModal();
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    const queues = [
        { key: 'all', label: 'All Requests', count: totals.all },
        { key: 'submitted', label: 'Awaiting IR Review', count: totals.submitted },
        { key: 'waiting_for_founder', label: 'With Founder', count: totals.waiting_for_founder },
        { key: 'founder_responded', label: 'Founder Responded', count: totals.founder_responded },
        { key: 'resolved', label: 'Resolved', count: totals.resolved },
    ];

    return (
        <AdminLayout>
            <Head title="Post-Introduction Diligence Orchestration — Pinpoint Admin" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs lg:rounded-[22px] lg:p-8">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="mb-6 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">Dealflow desk</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">Post-Introduction Diligence</h1>
                        <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-zinc-500">
                            IR-mediated post-call questions, operational follow-ups, and confidential document requests.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {DESK_LINKS.map((link) => {
                            const active = link.key === 'diligence';
                            return (
                                <button
                                    key={link.key}
                                    type="button"
                                    onClick={() => router.get(link.path)}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
                                        active
                                            ? 'bg-zinc-950 text-white shadow-2xs hover:bg-zinc-800'
                                            : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                                    )}
                                >
                                    <Icon icon={link.icon} className="size-3.5" />
                                    <span>{link.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Category-mix metrics strip (status counts live in the tabs below) ── */}
                <div className="mb-6 grid shrink-0 grid-cols-2 gap-x-3 divide-zinc-200 border-y border-zinc-200 py-3.5 sm:grid-cols-4 sm:divide-x sm:px-5">
                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">Financial</span>
                        <span className="mt-0.5 block font-mono text-lg leading-none font-semibold text-zinc-950">{totals.financial}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">Operational</span>
                        <span className="mt-0.5 block font-mono text-lg leading-none font-semibold text-zinc-950">{totals.operational}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">Legal &amp; governance</span>
                        <span className="mt-0.5 block font-mono text-lg leading-none font-semibold text-zinc-950">{totals.legal_governance}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">Document requests</span>
                        <span className="mt-0.5 block font-mono text-lg leading-none font-semibold text-zinc-950">{totals.document_request}</span>
                    </div>
                </div>

                {/* ── Queue tabs ──────────────────────────────────────────────── */}
                <div className="mb-4 flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-zinc-100 pb-3">
                    {queues.map((q) => {
                        const active = activeQueue === q.key;
                        return (
                            <button
                                key={q.key}
                                type="button"
                                onClick={() => handleFilterQueue(q.key)}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                                    active
                                        ? 'bg-zinc-950 font-semibold text-white shadow-2xs'
                                        : 'border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                                )}
                            >
                                <span>{q.label}</span>
                                {q.count > 0 && (
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 text-[10.5px] font-bold tabular-nums',
                                            active ? 'bg-white text-zinc-950' : 'bg-zinc-200/70 text-zinc-600',
                                        )}
                                    >
                                        {q.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Table ───────────────────────────────────────────────────── */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-[13rem_minmax(0,1fr)] items-center gap-4 border-b border-zinc-100 px-4 pb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase lg:grid-cols-[13rem_minmax(0,1fr)_10rem_8.5rem_7.5rem]">
                        <span>Startup &amp; Investor</span>
                        <span>Category &amp; Subject</span>
                        <span className="hidden lg:block">Status</span>
                        <span className="hidden lg:block">Submitted</span>
                        <span className="hidden text-right lg:block">Action</span>
                    </div>

                    {requests.data.length === 0 ? (
                        <div className="mx-auto max-w-md py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                <Icon icon="solar:magnifer-linear" className="size-5" />
                            </div>
                            <h2 className="mt-4 text-sm font-semibold text-zinc-950">No requests in this queue</h2>
                            <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
                                When an investor raises a post-call question it lands here for IR to triage.
                            </p>
                        </div>
                    ) : (
                        requests.data.map((req) => {
                            const investorName = req.investor?.profile?.full_name ?? req.investor?.email ?? 'Investor';
                            const companyName = req.profile?.founder?.company_name ?? 'Startup';
                            return (
                                <div
                                    key={req.id}
                                    onClick={() => openModal(req)}
                                    className="group grid cursor-pointer grid-cols-[13rem_minmax(0,1fr)] items-center gap-4 border-b border-zinc-50 px-4 py-3 text-xs transition-colors duration-150 last:border-0 hover:bg-zinc-50/80 lg:grid-cols-[13rem_minmax(0,1fr)_10rem_8.5rem_7.5rem]"
                                >
                                    {/* Startup & Investor */}
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-700">
                                            {getInitials(companyName)}
                                        </div>
                                        <div className="min-w-0 pr-1">
                                            <span className="block truncate text-[12.5px] font-semibold text-zinc-950 group-hover:underline">
                                                {companyName}
                                            </span>
                                            <span className="block truncate text-[11px] text-zinc-400">By: {investorName}</span>
                                        </div>
                                    </div>

                                    {/* Category & Subject */}
                                    <div className="min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-lg border border-zinc-200/80 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-700 uppercase">
                                                {humanizeCategory(req.category)}
                                            </span>
                                            {req.data_room_required && (
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-[#3A54A5]/20 bg-[#3A54A5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3A54A5]">
                                                    <Icon icon="solar:shield-check-linear" className="size-3" />
                                                    Data Room
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 line-clamp-1 text-[12px] font-medium text-zinc-900">{req.subject}</div>
                                    </div>

                                    {/* Status */}
                                    <div className="hidden shrink-0 lg:block">
                                        <StatusBadge status={req.status} />
                                    </div>

                                    {/* Submitted */}
                                    <div className="hidden shrink-0 font-mono text-[11.5px] text-zinc-500 lg:block">{formatDate(req.created_at)}</div>

                                    {/* Action */}
                                    <div className="hidden shrink-0 text-right lg:block">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal(req);
                                            }}
                                            className="rounded-lg border border-zinc-200/80 bg-white px-3 py-1 text-xs font-semibold whitespace-nowrap text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                        >
                                            Inspect &amp; Act
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Orchestration panel ─────────────────────────────────────────── */}
            {selectedReq && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-zinc-950/30 backdrop-blur-xs" onClick={closeModal} />
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="w-full max-w-3xl space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-lg border border-zinc-200/80 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-700 uppercase">
                                                {humanizeCategory(selectedReq.category)}
                                            </span>
                                            <StatusBadge status={selectedReq.status} />
                                        </div>
                                        <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-zinc-950">{selectedReq.subject}</h2>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            Investor{' '}
                                            <strong className="font-medium text-zinc-800">
                                                {selectedReq.investor?.profile?.full_name || 'Investor'}
                                            </strong>{' '}
                                            · Startup{' '}
                                            <strong className="font-medium text-zinc-800">
                                                {selectedReq.profile?.founder?.company_name || 'Startup'}
                                            </strong>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                    >
                                        <Icon icon="solar:close-circle-linear" className="size-5" />
                                    </button>
                                </div>

                                {/* Investor request details */}
                                <div className="space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                                    <h3 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Investor request details</h3>
                                    <p className="text-sm leading-6 whitespace-pre-wrap text-zinc-700">{selectedReq.request_details}</p>
                                </div>

                                {/* Founder coordination */}
                                <div className="space-y-3 rounded-xl border border-sky-200/70 bg-sky-50/40 p-4">
                                    <h3 className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
                                        <Icon icon="solar:user-hand-up-linear" className="size-4" />
                                        Pinpoint &rarr; Founder coordination
                                    </h3>

                                    {selectedReq.founder_notes_to_admin ? (
                                        <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-3">
                                            <div className="text-xs font-semibold text-emerald-700">
                                                Founder response (received {formatDate(selectedReq.founder_responded_at)})
                                            </div>
                                            <p className="text-sm leading-6 whitespace-pre-wrap text-zinc-700">
                                                {selectedReq.founder_notes_to_admin}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                                                Instructions for founder (optional guidance sent with the prompt)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                placeholder="e.g. Please provide your Q3 2026 revenue retention cohort breakdown."
                                                className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRequestFounder}
                                                disabled={submitting}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800 disabled:opacity-50"
                                            >
                                                <Icon icon="solar:forward-linear" className="size-3.5" />
                                                {selectedReq.status === 'waiting_for_founder'
                                                    ? 'Update founder prompt'
                                                    : 'Forward request to founder'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Investor-facing response release */}
                                <div className="space-y-3 rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4">
                                    <h3 className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                                        <Icon icon="solar:check-read-linear" className="size-4" />
                                        Approved investor-facing response
                                    </h3>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                                            Verified response for investor (sanitized and formatted by IR)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={investorResponse}
                                            onChange={(e) => setInvestorResponse(e.target.value)}
                                            placeholder="Write or refine the verified response visible to the investor."
                                            className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-hidden"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                                            Internal admin notes (never visible to investor or founder)
                                        </label>
                                        <input
                                            type="text"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Private staff notes"
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-hidden"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                                            <input
                                                type="checkbox"
                                                checked={markResolved}
                                                onChange={(e) => setMarkResolved(e.target.checked)}
                                                className="rounded border-zinc-300 bg-white text-zinc-900 focus:ring-0"
                                            />
                                            Mark inquiry as fully resolved
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleReleaseResponse}
                                            disabled={submitting || !investorResponse.trim()}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            <Icon icon="solar:send-linear" className="size-3.5 text-emerald-400" />
                                            Release response to investor
                                        </button>
                                    </div>
                                </div>

                                {/* Decline / close */}
                                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                                    <div className="flex max-w-md flex-1 items-center gap-2">
                                        <input
                                            type="text"
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                            placeholder="Decline reason for investor"
                                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleDecline}
                                            disabled={submitting}
                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                                        >
                                            Decline inquiry
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
