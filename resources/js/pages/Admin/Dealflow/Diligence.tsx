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

function formatDate(isoString?: string | null): string {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'submitted':
            return { label: 'Submitted to Pinpoint', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
        case 'waiting_for_founder':
            return { label: 'Waiting for Founder', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
        case 'founder_responded':
            return { label: 'Founder Responded', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
        case 'resolved':
            return { label: 'Resolved / Published', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
        case 'declined':
            return { label: 'Declined', bg: 'bg-red-500/10 text-red-500 border-red-500/20' };
        default:
            return { label: status, bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
    }
}

export default function DiligenceIndex({
    requests,
    activeStatus,
    activeCategory,
    activeQueue,
    totals,
}: PageProps) {
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
        router.get(route('admin.dealflow.diligence.index'), {
            queue,
            status: activeStatus !== 'all' ? activeStatus : undefined,
            category: activeCategory !== 'all' ? activeCategory : undefined,
        }, { preserveState: true });
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
            }
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
            }
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
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="Post-Introduction Diligence Orchestration — Pinpoint Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Post-Introduction Diligence</h1>
                        <p className="text-sm text-zinc-400">
                            Admin-mediated post-call questions, operational follow-ups, and confidential document requests.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.get(route('admin.dealflow.interests.index'))}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700/80 transition"
                        >
                            <Icon icon="solar:users-group-two-rounded-bold" className="size-4 text-zinc-400" />
                            View Dealflow Interests
                        </button>
                    </div>
                </div>

                {/* Queue Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {[
                        { label: 'All Requests', count: totals.all, queue: 'all', icon: 'solar:folder-with-files-bold' },
                        { label: 'Awaiting IR Review', count: totals.submitted, queue: 'submitted', icon: 'solar:hourglass-bold', highlight: totals.submitted > 0 },
                        { label: 'With Founder', count: totals.waiting_for_founder, queue: 'waiting_for_founder', icon: 'solar:user-speak-bold' },
                        { label: 'Founder Responded', count: totals.founder_responded, queue: 'founder_responded', icon: 'solar:chat-round-check-bold', highlight: totals.founder_responded > 0 },
                        { label: 'Resolved / Published', count: totals.resolved, queue: 'resolved', icon: 'solar:check-circle-bold' },
                    ].map((card) => {
                        const active = activeQueue === card.queue;
                        return (
                            <button
                                key={card.queue}
                                onClick={() => handleFilterQueue(card.queue)}
                                className={cn(
                                    'flex flex-col gap-2 rounded-xl border p-4 text-left transition',
                                    active
                                        ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <Icon icon={card.icon} className={cn('size-5', active ? 'text-indigo-400' : 'text-zinc-500')} />
                                    {card.highlight && (
                                        <span className="inline-flex size-2 rounded-full bg-amber-500 animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">{card.count}</span>
                                    <p className="text-xs font-medium text-zinc-400">{card.label}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-300">
                            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4">Startup & Investor</th>
                                    <th className="px-6 py-4">Category & Subject</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No diligence requests found matching the current queue.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => {
                                        const badge = getStatusBadge(req.status);
                                        return (
                                            <tr key={req.id} className="hover:bg-zinc-800/30 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-white">
                                                        {req.profile?.founder?.company_name || 'Startup'}
                                                    </div>
                                                    <div className="text-xs text-zinc-400">
                                                        By: {req.investor?.profile?.full_name || req.investor?.email || 'Investor'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                            {req.category.replace('_', ' ')}
                                                        </span>
                                                        {req.data_room_required && (
                                                            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                                                                <Icon icon="solar:shield-check-bold" className="size-3" />
                                                                Data Room
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 font-medium text-zinc-200 line-clamp-1">
                                                        {req.subject}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', badge.bg)}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-400">
                                                    {formatDate(req.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => openModal(req)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
                                                    >
                                                        <Icon icon="solar:tuning-bold" className="size-3.5" />
                                                        Orchestrate
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Orchestration Slide-over / Modal */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6 my-8">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold uppercase text-indigo-300">
                                        {selectedReq.category.replace('_', ' ')}
                                    </span>
                                    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', getStatusBadge(selectedReq.status).bg)}>
                                        {getStatusBadge(selectedReq.status).label}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold text-white">{selectedReq.subject}</h2>
                                <p className="text-xs text-zinc-400">
                                    Investor: <strong className="text-zinc-200">{selectedReq.investor?.profile?.full_name || 'Investor'}</strong> · Startup: <strong className="text-zinc-200">{selectedReq.profile?.founder?.company_name || 'Startup'}</strong>
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                            >
                                <Icon icon="solar:close-circle-bold" className="size-5" />
                            </button>
                        </div>

                        {/* Investor's Inquiry */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Investor Request Details</h3>
                            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{selectedReq.request_details}</p>
                        </div>

                        {/* Founder Coordination / Response */}
                        <div className="space-y-4 rounded-xl border border-blue-900/30 bg-blue-950/10 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                                <Icon icon="solar:user-hand-up-bold" className="size-4" />
                                Pinpoint ↔ Founder Coordination
                            </h3>

                            {selectedReq.founder_notes_to_admin ? (
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 space-y-1">
                                    <div className="text-xs font-semibold text-emerald-400">
                                        Founder Response (Received {formatDate(selectedReq.founder_responded_at)}):
                                    </div>
                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedReq.founder_notes_to_admin}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-zinc-400">
                                        Admin Instructions for Founder (optional guidance sent with prompt):
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="E.g., Please provide your Q3 2026 revenue retention cohort breakdown..."
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-white focus:border-indigo-500 focus:outline-hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRequestFounder}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50"
                                    >
                                        <Icon icon="solar:forward-bold" className="size-4" />
                                        {selectedReq.status === 'waiting_for_founder' ? 'Update Founder Prompt' : 'Forward Request to Founder'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Investor-Facing Response Release */}
                        <div className="space-y-4 rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                <Icon icon="solar:check-read-bold" className="size-4" />
                                Approved Investor-Facing Response
                            </h3>

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-zinc-400">
                                    Verified Response for Investor (sanitized & formatted by Admin/IR):
                                </label>
                                <textarea
                                    rows={4}
                                    value={investorResponse}
                                    onChange={(e) => setInvestorResponse(e.target.value)}
                                    placeholder="Write or refine the verified response visible to the investor..."
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-white focus:border-emerald-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-zinc-400">
                                    Internal Admin Notes (never visible to investor or founder):
                                </label>
                                <input
                                    type="text"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Private staff notes..."
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-zinc-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={markResolved}
                                        onChange={(e) => setMarkResolved(e.target.checked)}
                                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-0"
                                    />
                                    Mark inquiry as fully resolved
                                </label>

                                <button
                                    type="button"
                                    onClick={handleReleaseResponse}
                                    disabled={submitting || !investorResponse.trim()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                                >
                                    <Icon icon="solar:send-bold" className="size-4" />
                                    Release Approved Response to Investor
                                </button>
                            </div>
                        </div>

                        {/* Decline Option */}
                        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                                <input
                                    type="text"
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    placeholder="Decline reason for investor..."
                                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleDecline}
                                    disabled={submitting}
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                                >
                                    Decline Inquiry
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
