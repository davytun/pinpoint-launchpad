import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    is_featured_in_spotlight?: boolean;
    founder?: Founder | null;
}

interface Interest {
    id: string;
    investor_id: string;
    profile_id: string;
    type: 'data_room_access' | 'founder_call' | 'more_details';
    message: string | null;
    status: 'pending' | 'approved' | 'denied';
    founder_decision?: 'approved' | 'declined' | 'pending' | null;
    reviewed_by_founder?: string | null;
    reviewed_at?: string | null;
    scheduled_at?: string | null;
    completed_at?: string | null;
    meeting_link?: string | null;
    admin_notes?: string | null;
    founder_notes?: string | null;
    created_at: string;
    investor?: InvestorUser | null;
    profile?: FounderProfileData | null;
    reviewer?: Founder | null;
}

interface Totals {
    all: number;
    pending: number;
    approved: number;
    denied: number;
    data_room_requests: number;
    founder_call_requests: number;
    more_details_requests: number;
    scheduled_calls?: number;
    completed_calls?: number;
    pending_introductions?: number;
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
    interests: PaginatedData<Interest>;
    activeStatus: 'all' | 'pending' | 'approved' | 'denied';
    activeType: 'all' | 'data_room_access' | 'founder_call' | 'more_details';
    activeSector: string;
    search: string;
    sectors: string[];
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

function humanizeType(type: string): string {
    switch (type) {
        case 'data_room_access':
            return 'Data Room Access';
        case 'founder_call':
            return 'Founder Call';
        case 'more_details':
            return 'More Details';
        default:
            return type.replace(/_/g, ' ');
    }
}

function TypeBadge({ type }: { type: Interest['type'] }) {
    const icon =
        type === 'data_room_access'
            ? 'solar:key-linear'
            : type === 'founder_call'
            ? 'solar:phone-calling-linear'
            : 'solar:info-circle-linear';

    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 border border-zinc-200/80 px-2.5 py-1 text-xs font-medium text-zinc-800">
            <Icon icon={icon} className="size-3.5 text-zinc-500" />
            <span>{humanizeType(type)}</span>
        </span>
    );
}

function StatusBadge({ status }: { status: Interest['status'] }) {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-600" />
                    <span>Approved</span>
                </span>
            );
        case 'denied':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                    <Icon icon="solar:close-circle-linear" className="size-3 text-rose-600" />
                    <span>Declined</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <Icon icon="solar:clock-circle-linear" className="size-3 text-amber-600" />
                    <span>Pending</span>
                </span>
            );
    }
}

function buildParams(overrides: Record<string, string | undefined>, current: Partial<PageProps>) {
    const p: Record<string, string> = {};
    const status = overrides.status !== undefined ? overrides.status : current.activeStatus !== 'all' ? current.activeStatus : undefined;
    const type = overrides.type !== undefined ? overrides.type : current.activeType !== 'all' ? current.activeType : undefined;
    const sector = overrides.sector !== undefined ? overrides.sector : current.activeSector !== 'all' ? current.activeSector : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    if (status) p.status = status;
    if (type) p.type = type;
    if (sector) p.sector = sector;
    if (srch) p.search = srch;
    return p;
}

// ─── Slide-Over Interest Inspection Drawer ───────────────────────────────────

function InterestDrawer({
    interest,
    onClose,
    onUpdateInterest,
}: {
    interest: Interest;
    onClose: () => void;
    onUpdateInterest: (updated: Interest) => void;
}) {
    const [updating, setUpdating] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [scheduledAt, setScheduledAt] = useState(interest.scheduled_at ? interest.scheduled_at.slice(0, 16) : '');
    const [meetingLink, setMeetingLink] = useState(interest.meeting_link ?? '');
    const [coordinationNotes, setCoordinationNotes] = useState(interest.admin_notes ?? '');
    const [isScheduling, setIsScheduling] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const investorName = interest.investor?.profile?.full_name ?? interest.investor?.email ?? 'Investor';
    const investorFirm = interest.investor?.profile?.company_name ?? 'Private Syndicate';
    const startupName = interest.profile?.founder?.company_name ?? 'Startup';
    const founderName = interest.profile?.founder?.full_name ?? 'Founder';

    function setStatus(status: 'approved' | 'denied' | 'pending') {
        setUpdating(true);
        router.patch(
            `/admin/dealflow/interests/${interest.id}`,
            { status },
            {
                onSuccess: () => {
                    onUpdateInterest({
                        ...interest,
                        status,
                        reviewed_at: status === 'pending' ? null : new Date().toISOString(),
                    });
                },
                onFinish: () => setUpdating(false),
                preserveScroll: true,
            },
        );
    }

    function handleScheduleCall(e: React.FormEvent) {
        e.preventDefault();
        if (!scheduledAt) return;
        setIsScheduling(true);
        router.patch(
            `/admin/dealflow/interests/${interest.id}/schedule`,
            {
                scheduled_at: scheduledAt,
                meeting_link: meetingLink,
                notes: coordinationNotes,
            },
            {
                onSuccess: () => {
                    onUpdateInterest({
                        ...interest,
                        status: 'approved',
                        scheduled_at: new Date(scheduledAt).toISOString(),
                        meeting_link: meetingLink,
                        admin_notes: coordinationNotes,
                    });
                },
                onFinish: () => setIsScheduling(false),
                preserveScroll: true,
            },
        );
    }

    function handleCompleteCall() {
        setIsCompleting(true);
        router.patch(
            `/admin/dealflow/interests/${interest.id}/complete`,
            {
                notes: coordinationNotes,
            },
            {
                onSuccess: () => {
                    onUpdateInterest({
                        ...interest,
                        completed_at: new Date().toISOString(),
                    });
                },
                onFinish: () => setIsCompleting(false),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        if (!interest.investor?.email) return;
        navigator.clipboard.writeText(interest.investor.email);
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
                                <StatusBadge status={interest.status} />
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {investorFirm} · Requested {formatRelativeTime(interest.created_at)}
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

                {/* ── Quick Action Strip (When Pending) ──────────────────────── */}
                {interest.status === 'pending' && (
                    <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#FAFBFD] border-b border-zinc-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setStatus('approved')}
                                disabled={updating}
                                className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs disabled:opacity-50"
                            >
                                {updating ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:check-circle-linear" className="size-3.5 text-emerald-400" />
                                )}
                                <span>Approve Request</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatus('denied')}
                                disabled={updating}
                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition-all shadow-2xs disabled:opacity-50"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5 text-zinc-500" />
                                <span>Decline</span>
                            </button>
                        </div>

                        <span className="text-[11px] font-medium text-zinc-400">Admin Clearance</span>
                    </div>
                )}

                {/* ── Drawer Body ───────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
                    {/* Section 1: Request Specification Card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4.5 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                Engagement Type
                            </span>
                            <TypeBadge type={interest.type} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
                            <div>
                                <span className="text-zinc-400 block text-[11px]">Submitted</span>
                                <span className="font-medium text-zinc-800">{formatDate(interest.created_at)}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400 block text-[11px]">Status</span>
                                <span className="font-medium text-zinc-950 capitalize">{interest.status}</span>
                            </div>
                        </div>

                        {interest.type === 'data_room_access' && (
                            <div className="rounded-xl border border-zinc-200/70 bg-white p-3 text-xs text-zinc-700 flex items-start gap-2">
                                <Icon icon="solar:shield-keyhole-linear" className="size-4 shrink-0 text-zinc-600 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-zinc-900">Data Room Clearance</p>
                                    <p className="text-[11px] text-zinc-500">
                                        Approving this request provisions secure access to financial models and diligence documents.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 1.5: Founder Authorization Status (Pinpoint Mediation) */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">
                                Founder Authorization
                            </span>
                            {interest.founder_decision === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                    <Icon icon="solar:check-circle-bold" className="size-3.5 text-emerald-600" />
                                    <span>Authorized by Founder</span>
                                </span>
                            ) : interest.founder_decision === 'declined' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                                    <Icon icon="solar:close-circle-bold" className="size-3.5 text-rose-600" />
                                    <span>Declined by Founder</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                    <Icon icon="solar:clock-circle-bold" className="size-3.5 text-amber-600" />
                                    <span>Awaiting Founder Response</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11.5px] text-zinc-500">
                            {interest.founder_decision === 'approved'
                                ? 'The founder has authorized Pinpoint to finalize and execute this engagement.'
                                : interest.founder_decision === 'declined'
                                ? 'The founder declined willingness to proceed with this request.'
                                : 'Pinpoint has requested authorization from the founder via the Founder Portal.'}
                        </p>
                    </div>

                    {/* Section 2: Investor Message / Note */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                                Investor Note / Inquiry
                            </h4>
                            <span className="text-[11px] text-zinc-400">Attached note</span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs text-zinc-800 shadow-2xs leading-relaxed">
                            {interest.message ? (
                                <p className="italic text-zinc-700">&ldquo;{interest.message}&rdquo;</p>
                            ) : (
                                <p className="text-zinc-400 italic">No custom message attached.</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2.5: Introduction & Call Coordination (If Founder Call) */}
                    {interest.type === 'founder_call' && (
                        <div className="rounded-2xl border border-indigo-200/80 bg-[#f8faff] p-4.5 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:phone-calling-bold-duotone" className="size-4 text-indigo-600" />
                                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                                        Founder Introduction Coordination
                                    </h4>
                                </div>
                                <span className="text-[11px] font-bold text-indigo-700">
                                    {interest.completed_at ? 'Completed' : interest.scheduled_at ? 'Scheduled' : interest.status === 'approved' ? 'Approved — Ready' : 'Pending Request'}
                                </span>
                            </div>

                            {interest.completed_at ? (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <Icon icon="solar:check-circle-bold" className="size-4 text-emerald-600" />
                                        <span>Introduction Call Completed</span>
                                    </div>
                                    <p className="text-[11.5px] text-emerald-700">
                                        Concluded on {formatDate(interest.completed_at)}. Diligence and follow-ups can continue via Data Room or direct IR coordination.
                                    </p>
                                </div>
                            ) : interest.status === 'approved' ? (
                                <form onSubmit={handleScheduleCall} className="space-y-3 text-xs">
                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                            Scheduled Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-[#3A54A5] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                            Meeting Link / Access Details
                                        </label>
                                        <input
                                            type="text"
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="https://meet.google.com/..."
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-[#3A54A5] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                                            Internal IR Coordination Notes
                                        </label>
                                        <textarea
                                            value={coordinationNotes}
                                            onChange={(e) => setCoordinationNotes(e.target.value)}
                                            placeholder="Context or preparation notes for the session..."
                                            rows={2}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-[#3A54A5] focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="submit"
                                            disabled={isScheduling}
                                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-2xs disabled:opacity-50"
                                        >
                                            <Icon icon="solar:calendar-linear" className="size-3.5" />
                                            <span>{interest.scheduled_at ? 'Update Schedule' : 'Schedule Call'}</span>
                                        </button>

                                        {interest.scheduled_at && (
                                            <button
                                                type="button"
                                                onClick={handleCompleteCall}
                                                disabled={isCompleting}
                                                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-2xs disabled:opacity-50"
                                            >
                                                <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                                <span>Mark Call Completed</span>
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <p className="text-[11.5px] text-indigo-700">
                                    Approve this request to enable date/time scheduling and coordination with the founder and investor.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Section 3: Target Startup Dossier */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                                Target Startup Profile
                            </h4>
                            <span className="text-[11px] font-semibold text-zinc-600">
                                Score: {interest.profile?.overall_score ?? '—'}/100
                            </span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700">
                                        {getInitials(startupName)}
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-zinc-950">{startupName}</h5>
                                        <p className="text-[11px] text-zinc-400">{interest.profile?.sector}</p>
                                    </div>
                                </div>

                                {interest.profile?.is_featured_in_spotlight && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 text-[10.5px] font-medium text-zinc-700">
                                        <Icon icon="solar:crown-linear" className="size-3 text-zinc-600" />
                                        <span>Spotlight</span>
                                    </span>
                                )}
                            </div>

                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Founder</span>
                                    <span className="font-medium text-zinc-900">{founderName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Founder Email</span>
                                    <span className="font-medium text-zinc-900 font-mono text-[11px]">
                                        {interest.profile?.founder?.email ?? '—'}
                                    </span>
                                </div>
                                {interest.profile?.batch && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-zinc-400">Batch</span>
                                        <span className="font-medium text-zinc-900">{interest.profile.batch}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Investor Dossier & Verification */}
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
                                    <span className="text-zinc-400">Full Legal Name</span>
                                    <span className="font-semibold text-zinc-950">{investorName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Investor Entity</span>
                                    <span className="font-medium text-zinc-900">{investorFirm}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-400">Direct Email</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900 font-mono text-[11px]">
                                            {interest.investor?.email ?? '—'}
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
                                        <span>{interest.investor?.kyc_status ?? 'Approved'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Review & Audit Information */}
                    {interest.reviewed_at && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4 text-xs space-y-2">
                            <div className="flex items-center justify-between text-zinc-500">
                                <span className="font-semibold text-zinc-800">Decision Audit Log</span>
                                <span>{formatDate(interest.reviewed_at)}</span>
                            </div>
                            <p className="text-[11.5px] text-zinc-500">
                                Action was recorded on {new Date(interest.reviewed_at).toLocaleTimeString()} by{' '}
                                <span className="font-medium text-zinc-800">
                                    {interest.reviewer?.full_name ?? 'Admin'}
                                </span>
                                .
                            </p>
                        </div>
                    )}
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

                    <div className="flex items-center gap-2">
                        {interest.status !== 'pending' && (
                            <button
                                type="button"
                                onClick={() => setStatus('pending')}
                                disabled={updating}
                                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
                            >
                                <Icon icon="solar:restart-linear" className="size-3.5 text-zinc-400" />
                                <span>Reset to Pending</span>
                            </button>
                        )}

                        {interest.status !== 'approved' && (
                            <button
                                type="button"
                                onClick={() => setStatus('approved')}
                                disabled={updating}
                                className="flex items-center gap-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                            >
                                {updating ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:check-circle-linear" className="size-3.5 text-emerald-400" />
                                )}
                                <span>Approve Access</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Dealflow Interests Workspace ────────────────────────────────────────

export default function AdminInterests({
    interests,
    activeStatus = 'all',
    activeType = 'all',
    activeSector = 'all',
    search: initialSearch = '',
    sectors = [],
    totals = {
        all: 0,
        pending: 0,
        approved: 0,
        denied: 0,
        data_room_requests: 0,
        founder_call_requests: 0,
        more_details_requests: 0,
    },
}: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeDrawerInterest, setActiveDrawerInterest] = useState<Interest | null>(null);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const sectorDropdownRef = useRef<HTMLDivElement>(null);

    // Keep activeDrawerInterest reactive to Inertia page prop updates
    useEffect(() => {
        if (activeDrawerInterest) {
            const updated = interests.data.find((item) => item.id === activeDrawerInterest.id);
            if (updated) {
                setActiveDrawerInterest(updated);
            }
        }
    }, [interests, activeDrawerInterest]);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const query = buildParams(overrides, { activeStatus, activeType, activeSector, search });
            router.get('/admin/dealflow/interests', query, { replace: true, preserveState: true });
        },
        [activeStatus, activeType, activeSector, search],
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
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
            if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
                setIsSectorDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const typeLabels: Record<string, string> = {
        all: 'All request types',
        data_room_access: 'Data Room Access',
        founder_call: 'Founder Intro Call',
        more_details: 'More Details',
    };

    return (
        <AdminLayout>
            <Head title="Investor Interests & Dealflow — Admin" />

            {/* ── Main Full-Height Container ───────────────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-xs overflow-hidden p-6 lg:p-8">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0 mb-6">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-950">Investor Interests & Dealflow</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Monitor, audit, and approve investor engagement, data room clearances, and founder introductions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/dealflow/diligence')}
                            className="flex items-center gap-1.5 rounded-xl border border-indigo-200/90 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition-colors"
                        >
                            <Icon icon="solar:folder-with-files-bold" className="size-3.5 text-indigo-600" />
                            <span>Post-Intro Diligence</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.get('/admin/dealflow/data-rooms')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                        >
                            <Icon icon="solar:key-linear" className="size-3.5 text-zinc-500" />
                            <span>Data Room Grants</span>
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
                            Total Inquiries
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.all}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Pending Decision
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.pending}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Data Room Granted
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.data_room_requests}
                        </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] p-3.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                            Founder Calls
                        </span>
                        <span className="text-xl font-bold text-zinc-950 tabular-nums mt-1 block">
                            {totals.founder_call_requests}
                        </span>
                    </div>
                </div>

                {/* ── Navigation Tabs ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4 shrink-0 pb-3 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {(
                            [
                                { key: 'all', label: 'All Requests' },
                                { key: 'pending', label: 'Pending Review' },
                                { key: 'approved', label: 'Approved Access' },
                                { key: 'denied', label: 'Declined' },
                            ] as const
                        ).map(({ key, label }) => {
                            const isSelected = activeStatus === key;
                            const count =
                                key === 'all'
                                    ? totals.all
                                    : key === 'pending'
                                    ? totals.pending
                                    : key === 'approved'
                                    ? totals.approved
                                    : totals.denied;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => applyFilters({ status: key === 'all' ? '' : key })}
                                    className={cn(
                                        'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                        isSelected
                                            ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                                    )}
                                >
                                    <span>{label}</span>
                                    {count !== undefined && count > 0 && (
                                        <span
                                            className={cn(
                                                'rounded-full px-1.5 py-0.2 text-[10.5px] font-bold tabular-nums',
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
                </div>

                {/* ── Search & Multi-Filters Strip ────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 shrink-0 mb-3">
                    {/* Live Search */}
                    <div className="relative w-full max-w-md">
                        <Icon
                            icon="solar:minimalistic-magnifer-linear"
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search investor, startup, or message text..."
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

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2">
                        {/* Request Type Dropdown */}
                        <div className="relative shrink-0" ref={typeDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="flex h-8 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
                            >
                                <span>{typeLabels[activeType] ?? 'All request types'}</span>
                                <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-zinc-400" />
                            </button>

                            {isTypeDropdownOpen && (
                                <div className="absolute right-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                                    {(['all', 'data_room_access', 'founder_call', 'more_details'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => {
                                                applyFilters({ type: t === 'all' ? '' : t });
                                                setIsTypeDropdownOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors',
                                                activeType === t
                                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                                    : 'text-zinc-700 hover:bg-zinc-50',
                                            )}
                                        >
                                            <span>{typeLabels[t]}</span>
                                            {activeType === t && (
                                                <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sector Dropdown */}
                        {sectors.length > 0 && (
                            <div className="relative shrink-0" ref={sectorDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                                    className="flex h-8 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
                                >
                                    <span>{activeSector === 'all' ? 'All sectors' : activeSector}</span>
                                    <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-zinc-400" />
                                </button>

                                {isSectorDropdownOpen && (
                                    <div className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                applyFilters({ sector: 'all' });
                                                setIsSectorDropdownOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs transition-colors',
                                                activeSector === 'all'
                                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                                    : 'text-zinc-700 hover:bg-zinc-50',
                                            )}
                                        >
                                            <span>All sectors</span>
                                            {activeSector === 'all' && (
                                                <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />
                                            )}
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
                                                    activeSector === s
                                                        ? 'bg-zinc-100 font-semibold text-zinc-950'
                                                        : 'text-zinc-700 hover:bg-zinc-50',
                                                )}
                                            >
                                                <span className="truncate pr-2">{s}</span>
                                                {activeSector === s && (
                                                    <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Table Container with Fixed Non-Scrolling Header ─────────── */}
                <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                    {/* Fixed Table Header */}
                    <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 select-none shrink-0">
                        <div className="w-52 shrink-0">Investor / Entity</div>
                        <div className="w-48 shrink-0">Target Startup</div>
                        <div className="w-40 shrink-0">Engagement Type</div>
                        <div className="min-w-0 flex-1">Inquiry / Note</div>
                        <div className="w-28 shrink-0">Status</div>
                        <div className="w-28 shrink-0">Submitted</div>
                        <div className="w-28 shrink-0 text-right">Action</div>
                    </div>

                    {/* Scrollable Rows */}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-zinc-100">
                        {interests.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Icon icon="solar:inbox-line-linear" className="size-8 text-zinc-300 mb-2" />
                                <p className="text-xs text-zinc-400">No investor interest requests found matching this filter.</p>
                            </div>
                        ) : (
                            interests.data.map((item) => {
                                const investorName =
                                    item.investor?.profile?.full_name ?? item.investor?.email ?? 'Investor';
                                const companyName = item.profile?.founder?.company_name ?? 'Startup';

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setActiveDrawerInterest(item)}
                                        className="group flex items-center gap-4 px-4 py-3 text-xs transition-colors duration-150 hover:bg-zinc-50/80 cursor-pointer"
                                    >
                                        {/* Investor Column */}
                                        <div className="w-52 shrink-0 flex items-center gap-2.5 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-700">
                                                {getInitials(investorName)}
                                            </div>
                                            <div className="min-w-0 pr-1">
                                                <span className="font-semibold text-zinc-950 group-hover:underline text-[12.5px] block truncate">
                                                    {investorName}
                                                </span>
                                                <span className="text-zinc-400 text-[11px] truncate block">
                                                    {item.investor?.profile?.company_name ?? item.investor?.email}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Startup Column */}
                                        <div className="w-48 shrink-0 min-w-0">
                                            <span className="font-medium text-zinc-900 truncate block text-[12px]">
                                                {companyName}
                                            </span>
                                            <span className="text-[11px] text-zinc-400 truncate block">
                                                {item.profile?.sector}
                                            </span>
                                        </div>

                                        {/* Request Type */}
                                        <div className="w-40 shrink-0">
                                            <TypeBadge type={item.type} />
                                        </div>

                                        {/* Message Preview */}
                                        <div className="min-w-0 flex-1 pr-4">
                                            {item.message ? (
                                                <span className="text-zinc-600 truncate block text-[11.5px]">
                                                    &ldquo;{item.message}&rdquo;
                                                </span>
                                            ) : (
                                                <span className="text-zinc-300 italic text-[11px]">No note attached</span>
                                            )}
                                        </div>

                                        {/* Status & Founder Auth */}
                                        <div className="w-28 shrink-0 space-y-0.5">
                                            <StatusBadge status={item.status} />
                                            {item.founder_decision === 'approved' && (
                                                <span className="text-[10px] text-emerald-600 font-semibold block">Founder Authorized</span>
                                            )}
                                            {item.founder_decision === 'declined' && (
                                                <span className="text-[10px] text-rose-600 font-semibold block">Founder Declined</span>
                                            )}
                                            {(item.founder_decision === null || item.founder_decision === 'pending') && item.status === 'pending' && (
                                                <span className="text-[10px] text-amber-600 font-medium block">Awaiting Founder</span>
                                            )}
                                        </div>

                                        {/* Submitted Date */}
                                        <div className="w-28 shrink-0 text-zinc-500 text-[11.5px]">
                                            {formatRelativeTime(item.created_at)}
                                        </div>

                                        {/* Action Button */}
                                        <div className="w-28 shrink-0 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDrawerInterest(item);
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

                    {/* ── Table Footer & Pagination ────────────────────────────── */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-400 shrink-0">
                        <p>
                            Showing {interests.from ?? 0} to {interests.to ?? 0} of {interests.total} requests
                        </p>

                        {interests.links.length > 3 && (
                            <div className="flex items-center gap-1">
                                {interests.links.map((link, i) => (
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

                {/* ── Slide-Over Detail Drawer ─────────────────────────────────── */}
                {activeDrawerInterest && (
                    <InterestDrawer
                        interest={activeDrawerInterest}
                        onClose={() => setActiveDrawerInterest(null)}
                        onUpdateInterest={(updated) => setActiveDrawerInterest(updated)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
