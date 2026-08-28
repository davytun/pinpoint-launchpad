import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvestorApplication {
    id: string;
    investor_type: 'angel' | 'vc' | 'family_office' | 'syndicate' | 'dfi' | 'corporate';
    name: string;
    email: string;
    organisation: string | null;
    role: string | null;
    country: string;
    website: string | null;
    stages: string[] | null;
    sectors: string[] | null;
    geographies: string[] | null;
    cheque_size: string | null;
    instrument: string | null;
    deals_per_year: string | null;
    fund_detail: string | null;
    thesis_notes: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'request_more_info';
    confirmations: {
        investor_status?: boolean;
        risk_understood?: boolean;
        no_recommendation?: boolean;
        aml_source_of_funds?: boolean;
        terms_agreed?: boolean;
    } | null;
    submitted_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Totals {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    request_more_info: number;
}

interface PageProps {
    applications: Paginated<InvestorApplication>;
    activeStatus: 'all' | 'pending' | 'approved' | 'rejected' | 'request_more_info';
    activeType: string;
    search: string;
    sort: string;
    dir: 'asc' | 'desc';
    totals: Totals;
}

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const INVESTOR_TYPES = [
    { key: 'all', label: 'All contacts' },
    { key: 'vc', label: 'Venture Funds' },
    { key: 'angel', label: 'Angel Investors' },
    { key: 'family_office', label: 'Family Offices' },
    { key: 'syndicate', label: 'Syndicates' },
    { key: 'dfi', label: 'DFI / Impact' },
    { key: 'corporate', label: 'Corporate / CVC' },
];

const INVESTOR_TYPE_LABELS: Record<string, string> = {
    angel: 'Angel Investor',
    vc: 'Venture Fund',
    family_office: 'Family Office',
    syndicate: 'Syndicate / Network',
    dfi: 'DFI / Impact Investor',
    corporate: 'Corporate / CVC',
};

const INFO_PRESETS = [
    { id: 'funds', label: 'Proof of Capital / Ticket Capacity' },
    { id: 'kyc', label: 'KYC & Beneficial Ownership Verification' },
    { id: 'mandate', label: 'Investment Mandate & Stage Clarification' },
    { id: 'structure', label: 'Syndicate / SPV Legal Structure' },
];

function getInitials(name?: string | null): string {
    if (!name) return 'I';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 5) return 'just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function humanize(str: string | null): string {
    if (!str) return '—';
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildParams(overrides: Record<string, string | undefined>, current: Partial<PageProps>) {
    const p: Record<string, string> = {};
    const status = overrides.status !== undefined ? overrides.status : current.activeStatus !== 'all' ? current.activeStatus : undefined;
    const type = overrides.type !== undefined ? overrides.type : current.activeType !== 'all' ? current.activeType : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    const srt = overrides.sort !== undefined ? overrides.sort : current.sort;
    const dir = overrides.dir !== undefined ? overrides.dir : current.dir;
    if (status) p.status = status;
    if (type) p.type = type;
    if (srch) p.search = srch;
    if (srt && srt !== 'created_at') p.sort = srt;
    if (dir && dir !== 'desc') p.dir = dir;
    return p;
}

// ─── Status Pill Capsule (Resend Refero Style) ────────────────────────────────

function StatusPill({ status }: { status: InvestorApplication['status'] }) {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Approved
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Pending
                </span>
            );
        case 'request_more_info':
            return (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    Needs Info
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Rejected
                </span>
            );
        default:
            return null;
    }
}

// ─── State-of-the-Art Refero Request Info Modal (Step 4 Spec) ─────────────────

function RequestInfoModal({
    application,
    onClose,
    onSuccess,
}: {
    application: InvestorApplication;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>(['funds']);
    const [note, setNote] = useState(
        `Hi ${application.name}, to complete your investor verification for Pinpoint Launchpad, please share additional verification details regarding your allocation capacity.`,
    );
    const [submitting, setSubmitting] = useState(false);

    function toggleId(id: string) {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    }

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setSubmitting(true);
        router.patch(
            `/admin/investors/${application.id}/status`,
            { status: 'request_more_info' },
            {
                onFinish: () => {
                    setSubmitting(false);
                    onSuccess();
                },
                preserveScroll: true,
            },
        );
    }

    // Keyboard support: Esc to cancel, Cmd+Enter to submit
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, note, handleSubmit, onClose]);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md rounded-[22px] border border-zinc-200/90 bg-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-zinc-950">
                            Request information
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {application.name} · {application.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                    >
                        <Icon icon="solar:close-circle-linear" className="size-4" />
                    </button>
                </div>

                {/* Items Needed (Clean Check Rows) */}
                <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Required items
                    </span>

                    <div className="space-y-1.5">
                        {INFO_PRESETS.map((preset) => {
                            const isChecked = selectedIds.includes(preset.id);
                            return (
                                <div
                                    key={preset.id}
                                    onClick={() => toggleId(preset.id)}
                                    className={cn(
                                        'flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer select-none',
                                        isChecked
                                            ? 'border-zinc-900 bg-[#FAFBFD] text-zinc-950 font-medium'
                                            : 'border-zinc-200/70 bg-white text-zinc-600 hover:border-zinc-300',
                                    )}
                                >
                                    <span>{preset.label}</span>
                                    <div
                                        className={cn(
                                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors',
                                            isChecked
                                                ? 'bg-zinc-950 border-zinc-950 text-white'
                                                : 'border-zinc-300 bg-white',
                                        )}
                                    >
                                        {isChecked && <Icon icon="solar:check-read-linear" className="size-3" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Note message */}
                <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Custom Note
                    </span>
                    <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-[#FAFBFD] p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-400 focus:outline-none resize-none transition-colors leading-relaxed"
                    />
                </div>

                {/* Footer Buttons (Refero Step 4 Spec with Keycaps) */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    >
                        <span>Cancel</span>
                        <kbd className="rounded bg-zinc-100 px-1 py-0.2 text-[10px] font-mono text-zinc-500">Esc</kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                        ) : (
                            <Icon icon="solar:plain-linear" className="size-3.5" />
                        )}
                        <span>Send Request</span>
                        <kbd className="rounded bg-zinc-800 px-1 py-0.2 text-[10px] font-mono text-zinc-300">⌘↵</kbd>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── State-of-the-Art Refero Reject Modal ──────────────────────────────────────

function RejectModal({
    application,
    onClose,
    onSuccess,
}: {
    application: InvestorApplication;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [reason, setReason] = useState('Outside Mandate Focus');
    const [submitting, setSubmitting] = useState(false);

    function handleReject() {
        setSubmitting(true);
        router.patch(
            `/admin/investors/${application.id}/status`,
            { status: 'rejected' },
            {
                onFinish: () => {
                    setSubmitting(false);
                    onSuccess();
                },
                preserveScroll: true,
            },
        );
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md rounded-[22px] border border-zinc-200/90 bg-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-[15px] font-bold tracking-tight text-zinc-950">
                            Decline Admission
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {application.name} · {application.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                    >
                        <Icon icon="solar:close-circle-linear" className="size-4" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Reason for decline
                    </span>
                    <div className="space-y-1.5">
                        {[
                            'Outside Mandate / Sector Focus',
                            'Incomplete KYC or Identity Verification',
                            'Ticket Size Below Platform Minimum',
                            'Cohort Allocation Full',
                        ].map((r) => (
                            <div
                                key={r}
                                onClick={() => setReason(r)}
                                className={cn(
                                    'flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer select-none',
                                    reason === r
                                        ? 'border-zinc-900 bg-[#FAFBFD] text-zinc-950 font-medium'
                                        : 'border-zinc-200/70 bg-white text-zinc-600 hover:border-zinc-300',
                                )}
                            >
                                <span>{r}</span>
                                <div
                                    className={cn(
                                        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        reason === r
                                            ? 'border-zinc-950 bg-zinc-950'
                                            : 'border-zinc-300 bg-white',
                                    )}
                                >
                                    {reason === r && <div className="size-1.5 rounded-full bg-white" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleReject}
                        disabled={submitting}
                        className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                        ) : (
                            <Icon icon="solar:close-circle-linear" className="size-3.5" />
                        )}
                        <span>Decline Application</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Polar Slide-Over Dossier Inspector ───────────────────────────────────────

function DossierDrawer({
    application,
    onClose,
}: {
    application: InvestorApplication;
    onClose: () => void;
}) {
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    function updateStatus(status: string) {
        setUpdatingStatus(status);
        router.patch(
            `/admin/investors/${application.id}/status`,
            { status },
            {
                onFinish: () => setUpdatingStatus(null),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        navigator.clipboard.writeText(application.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div
                    className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200"
                    onClick={onClose}
                />

                <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-zinc-200/80 animate-in slide-in-from-right duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 shrink-0 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
                                {getInitials(application.name)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate text-sm font-bold text-zinc-950">
                                        {application.name}
                                    </h3>
                                    <StatusPill status={application.status} />
                                </div>
                                <p className="truncate text-[11.5px] text-zinc-500">
                                    {application.organisation ?? 'Independent Investor'}
                                    {application.role && ` · ${application.role}`}
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

                    {/* Quick Action Decision Bar (Refero Style) */}
                    <div className="flex items-center justify-between gap-2 px-6 py-3 bg-[#FAFBFD] border-b border-zinc-100 shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => updateStatus('approved')}
                                disabled={updatingStatus !== null || application.status === 'approved'}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs',
                                    application.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                                        : 'bg-zinc-950 hover:bg-zinc-800 text-white',
                                )}
                            >
                                {updatingStatus === 'approved' ? (
                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                )}
                                <span>Approve</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsRequestModalOpen(true)}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs',
                                    application.status === 'request_more_info'
                                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                                        : 'border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-800',
                                )}
                            >
                                <Icon icon="solar:info-circle-linear" className="size-3.5 text-blue-600" />
                                <span>Request Info</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {application.status !== 'rejected' && (
                                <button
                                    type="button"
                                    onClick={() => setIsRejectModalOpen(true)}
                                    className="text-xs font-medium text-zinc-400 hover:text-rose-600 px-2 py-1 transition-colors"
                                >
                                    Decline
                                </button>
                            )}
                            {application.status !== 'pending' && (
                                <button
                                    type="button"
                                    onClick={() => updateStatus('pending')}
                                    disabled={updatingStatus !== null}
                                    className="text-xs font-medium text-zinc-400 hover:text-zinc-700 px-2 py-1 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Stream: Polar 2-Column Key-Value Properties */}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6">
                        {/* Section: Applicant Details */}
                        <div>
                            <h4 className="text-xs font-semibold text-zinc-950 mb-3">Applicant Details</h4>
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Full Name</span>
                                    <span className="font-medium text-zinc-900">{application.name}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Email Address</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900">{application.email}</span>
                                        <button onClick={copyEmail} className="text-zinc-400 hover:text-zinc-800" title="Copy Email">
                                            <Icon
                                                icon={copied ? 'solar:check-circle-linear' : 'solar:copy-linear'}
                                                className="size-3.5"
                                            />
                                        </button>
                                        <a
                                            href={`mailto:${application.email}`}
                                            className="text-zinc-400 hover:text-zinc-800 ml-0.5"
                                            title="Send Email"
                                        >
                                            <Icon icon="solar:letter-linear" className="size-3.5" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Organisation</span>
                                    <span className="font-medium text-zinc-900">
                                        {application.organisation ?? 'Independent Investor'}
                                    </span>
                                </div>

                                {application.role && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Role / Title</span>
                                        <span className="font-medium text-zinc-900">{application.role}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Investor Type</span>
                                    <span className="font-medium text-zinc-900">
                                        {INVESTOR_TYPE_LABELS[application.investor_type] || humanize(application.investor_type)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Jurisdiction</span>
                                    <span className="font-medium text-zinc-900">{application.country}</span>
                                </div>

                                {application.website && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Website</span>
                                        <a
                                            href={application.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:underline"
                                        >
                                            <span>{application.website.replace(/^https?:\/\//, '')}</span>
                                            <Icon icon="solar:arrow-right-up-linear" className="size-3 text-zinc-400" />
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Submitted</span>
                                    <span className="font-medium text-zinc-900">{formatDate(application.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section: Investment Mandate */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h4 className="text-xs font-semibold text-zinc-950 mb-3">Investment Mandate</h4>
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Cheque Size</span>
                                    <span className="font-medium text-zinc-900">{application.cheque_size ?? '—'}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Deals per Year</span>
                                    <span className="font-medium text-zinc-900">{application.deals_per_year ?? '—'}</span>
                                </div>

                                {application.sectors && application.sectors.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Target Sectors</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.sectors.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(s)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.stages && application.stages.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Target Stages</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.stages.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(s)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.geographies && application.geographies.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Geographies</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.geographies.map((g) => (
                                                <span
                                                    key={g}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(g)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.instrument && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Preferred Instrument</span>
                                        <span className="font-medium text-zinc-900">{application.instrument}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section: Thesis Notes */}
                        {application.thesis_notes && (
                            <div className="pt-4 border-t border-zinc-100">
                                <h4 className="text-xs font-semibold text-zinc-950 mb-2">Thesis & Strategic Focus</h4>
                                <p className="text-xs text-zinc-700 leading-relaxed font-normal bg-zinc-50/70 border border-zinc-100 p-3.5 rounded-xl">
                                    "{application.thesis_notes}"
                                </p>
                            </div>
                        )}

                        {/* Section: Regulatory Affirmations */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h4 className="text-xs font-semibold text-zinc-950 mb-3">Regulatory Confirmations</h4>
                            <div className="space-y-2.5 text-xs">
                                {[
                                    {
                                        key: 'investor_status',
                                        label: 'Qualifies as a sophisticated / professional / HNW investor.',
                                    },
                                    {
                                        key: 'risk_understood',
                                        label: 'Understands venture investment is high-risk and illiquid.',
                                    },
                                    {
                                        key: 'aml_source_of_funds',
                                        label: 'Confirms capital derives from lawful sources and agrees to KYC.',
                                    },
                                    {
                                        key: 'terms_agreed',
                                        label: 'Agrees to Platform Investor Terms & Syndicate Rules.',
                                    },
                                ].map((item) => {
                                    const checked =
                                        application.confirmations?.[
                                            item.key as keyof typeof application.confirmations
                                        ] ?? true;

                                    return (
                                        <div key={item.key} className="flex items-center gap-2">
                                            <Icon
                                                icon={checked ? 'solar:check-circle-linear' : 'solar:close-circle-linear'}
                                                className={cn('size-3.5 shrink-0', checked ? 'text-emerald-600' : 'text-rose-500')}
                                            />
                                            <span className="text-zinc-600">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Info Modal */}
            {isRequestModalOpen && (
                <RequestInfoModal
                    application={application}
                    onClose={() => setIsRequestModalOpen(false)}
                    onSuccess={() => setIsRequestModalOpen(false)}
                />
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <RejectModal
                    application={application}
                    onClose={() => setIsRejectModalOpen(false)}
                    onSuccess={() => {
                        setIsRejectModalOpen(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
}

// ─── Main Applications Workspace ──────────────────────────────────────────────

export default function ApplicationsIndex({
    applications,
    activeStatus,
    activeType,
    search: initialSearch,
    sort,
    dir,
    totals,
}: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeDossier, setActiveDossier] = useState<InvestorApplication | null>(null);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [requestModalApp, setRequestModalApp] = useState<InvestorApplication | null>(null);
    const [rejectModalApp, setRejectModalApp] = useState<InvestorApplication | null>(null);

    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const query = buildParams(overrides, { activeStatus, activeType, search, sort, dir });
            router.get('/admin/investors', query, { replace: true, preserveState: true });
        },
        [activeStatus, activeType, search, sort, dir],
    );

    useEffect(() => {
        if (search === initialSearch) return;
        const t = setTimeout(() => {
            applyFilters({ search });
        }, 350);
        return () => clearTimeout(t);
    }, [search, applyFilters, initialSearch]);

    // Close popovers on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedTypeLabel = INVESTOR_TYPES.find((t) => t.key === activeType)?.label ?? 'All contacts';

    return (
        <AdminLayout>
            <Head title="Applications — Admin" />

            {/* ── Main Container (Refero Design Spec) ─────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden p-6 lg:p-8">
                {/* ── Page Header (Refero Audience Spec) ──────────────────────── */}
                <div className="flex items-center justify-between shrink-0 mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Applications</h1>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/waitlist')}
                            className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 transition-colors"
                        >
                            <Icon icon="solar:user-plus-linear" className="size-3.5" />
                            <span>Invite Investor</span>
                        </button>
                    </div>
                </div>

                {/* ── Navigation Tabs (Resend Style) ──────────────────────────── */}
                <div className="flex items-center gap-2 shrink-0 mb-6 overflow-x-auto pb-1">
                    {(
                        [
                            { key: 'all', label: 'All Applications' },
                            { key: 'pending', label: 'Pending Review' },
                            { key: 'approved', label: 'Approved Members' },
                            { key: 'request_more_info', label: 'Needs Info' },
                            { key: 'rejected', label: 'Rejected' },
                        ] as const
                    ).map(({ key, label }) => {
                        const isSelected = activeStatus === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => applyFilters({ status: key === 'all' ? '' : key })}
                                className={cn(
                                    'shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                                    isSelected
                                        ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Metrics Strip (Resend Refero Style with Sparkline) ────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0 py-4 border-y border-zinc-100 mb-6">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            All Applications
                        </span>
                        <p className="mt-1 text-2xl font-semibold text-zinc-950 tabular-nums">{totals.all}</p>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            Pending Review
                        </span>
                        <p className="mt-1 text-2xl font-semibold text-zinc-950 tabular-nums">{totals.pending}</p>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            Approved Members
                        </span>
                        <p className="mt-1 text-2xl font-semibold text-zinc-950 tabular-nums">{totals.approved}</p>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            Metrics
                        </span>
                        <div className="mt-2 h-7 w-full max-w-35 flex items-end">
                            {/* Resend Green Sparkline Ramp SVG */}
                            <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="metricGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>
                                <polygon points="0,24 100,2 100,24" fill="url(#metricGrad)" />
                                <polyline points="0,24 100,2" fill="none" stroke="#10B981" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── Search and Filter Toolbar (Resend Style) ────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 mb-3">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-96">
                        <Icon
                            icon="solar:minimalistic-magnifer-linear"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or firm..."
                            className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pr-8 pl-10 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none shadow-2xs transition-colors"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={typeDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
                            >
                                <span>{selectedTypeLabel}</span>
                                <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-zinc-400" />
                            </button>

                            {isTypeDropdownOpen && (
                                <div className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                                    {INVESTOR_TYPES.map((t) => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => {
                                                applyFilters({ type: t.key === 'all' ? '' : t.key });
                                                setIsTypeDropdownOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors',
                                                activeType === t.key
                                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                                    : 'text-zinc-700 hover:bg-zinc-50',
                                            )}
                                        >
                                            <span>{t.label}</span>
                                            {activeType === t.key && (
                                                <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Table Container (Resend Refero Spec) ────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-between">
                    <div>
                        {/* Clean Minimalist Header*/}
                        <div className="flex items-center gap-4 px-5 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 select-none mb-1">
                            <div className="w-[32%] min-w-0">Applicant / Email</div>
                            <div className="w-[28%] min-w-0">Organisation & Role</div>
                            <div className="w-[18%] min-w-0">Mandate</div>
                            <div className="w-[12%] min-w-0">Status</div>
                            <div className="w-[10%] min-w-0 text-right">Applied</div>
                            <div className="w-6 shrink-0" />
                        </div>

                        {/* Data Rows */}
                        {applications.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-xs text-zinc-400">No investor applications found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {applications.data.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => setActiveDossier(app)}
                                        className="group flex items-center gap-4 px-5 py-3.5 text-xs transition-colors duration-150 hover:bg-zinc-50/80 cursor-pointer"
                                    >
                                        {/* Applicant & Email with Monogram */}
                                        <div className="w-[32%] min-w-0 flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-[10.5px] font-bold text-zinc-700">
                                                {getInitials(app.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-semibold text-zinc-900 group-hover:underline text-[13px]">
                                                    {app.name}
                                                </span>
                                                <span className="text-zinc-400 font-normal ml-1.5 truncate">
                                                    {app.email}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Organisation & Role */}
                                        <div className="w-[28%] min-w-0">
                                            <span className="font-medium text-zinc-800 truncate block text-[13px]">
                                                {app.organisation ?? 'Independent Investor'}
                                            </span>
                                            {app.role && (
                                                <span className="text-[11.5px] text-zinc-400 font-normal truncate block">
                                                    {app.role}
                                                </span>
                                            )}
                                        </div>

                                        {/* Mandate / Cheque */}
                                        <div className="w-[18%] min-w-0 text-zinc-600">
                                            <span className="font-medium text-zinc-900 block truncate">
                                                {humanize(app.investor_type)}
                                            </span>
                                            <span className="text-[11.5px] text-zinc-400 truncate block">
                                                {app.cheque_size ?? '—'}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="w-[12%] min-w-0">
                                            <StatusPill status={app.status} />
                                        </div>

                                        {/* Applied Date */}
                                        <div className="w-[10%] min-w-0 text-right text-zinc-400">
                                            {formatDate(app.created_at)}
                                        </div>

                                        {/* Actions Context Menu (Three Dots) */}
                                        <div className="w-6 shrink-0 relative flex justify-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === app.id ? null : app.id);
                                                }}
                                                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                                            >
                                                <Icon icon="solar:menu-dots-bold" className="size-3.5" />
                                            </button>

                                            {openMenuId === app.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDossier(app);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 hover:bg-zinc-100 font-medium"
                                                    >
                                                        <Icon icon="solar:document-text-linear" className="size-3.5 text-zinc-500" />
                                                        <span>Inspect Details</span>
                                                    </button>

                                                    <div className="my-1 border-t border-zinc-100" />

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.patch(
                                                                `/admin/investors/${app.id}/status`,
                                                                { status: 'approved' },
                                                                { preserveScroll: true },
                                                            );
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                                                    >
                                                        <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                                        <span>Approve</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRequestModalApp(app);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Icon icon="solar:info-circle-linear" className="size-3.5" />
                                                        <span>Request Info</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRejectModalApp(app);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs text-zinc-500 shrink-0">
                        <p>
                            Page {applications.current_page} – 1 of {applications.total} contacts – {applications.per_page} items
                        </p>

                        {applications.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                {applications.links.map((link, i) => (
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

                {/* ── Polar Slide-Over Dossier Inspector ──────────────────────── */}
                {activeDossier && (
                    <DossierDrawer
                        application={activeDossier}
                        onClose={() => setActiveDossier(null)}
                    />
                )}

                {/* Main Table Request Info Modal */}
                {requestModalApp && (
                    <RequestInfoModal
                        application={requestModalApp}
                        onClose={() => setRequestModalApp(null)}
                        onSuccess={() => setRequestModalApp(null)}
                    />
                )}

                {/* Main Table Reject Modal */}
                {rejectModalApp && (
                    <RejectModal
                        application={rejectModalApp}
                        onClose={() => setRejectModalApp(null)}
                        onSuccess={() => setRejectModalApp(null)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
