import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface InvestorProfile {
    full_name: string;
    company_name: string | null;
    investor_type: 'individual' | 'corporate';
    phone: string | null;
    address: string | null;
}

interface KycSubmission {
    id: string;
    original_name: string;
    document_type: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    status: 'pending' | 'approved' | 'rejected';
    review_notes: string | null;
    reviewed_at: string | null;
    created_at: string;
}

interface InvestorAccount {
    id: string;
    email: string;
    account_status: 'active' | 'suspended';
    kyc_status: KycStatus;
    kyc_approved_at: string | null;
    created_at: string;
    profile: InvestorProfile | null;
    latest_kyc_submission: KycSubmission | null;
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
    not_submitted: number;
    rejected: number;
}

interface PageProps {
    investors: Paginated<InvestorAccount>;
    activeKycStatus: 'all' | KycStatus;
    activeType: 'all' | 'individual' | 'corporate';
    search: string;
    totals: Totals;
}

// ─── Preset Compliance Rejection Reasons ──────────────────────────────────────

const REJECTION_PRESETS = [
    {
        id: 'expired',
        label: 'Document has expired or is outdated',
        template: 'The submitted document cannot be verified because it has expired. Please re-submit a valid, unexpired government-issued copy.',
    },
    {
        id: 'blurry',
        label: 'Image / scan is blurry, cropped, or unreadable',
        template: 'The uploaded file is unclear, low resolution, or cropped. Please upload a clear, full-page high-resolution copy.',
    },
    {
        id: 'name_mismatch',
        label: 'Name does not match investor legal profile',
        template:
            'The name on the identity document does not match the legal registration details provided. Please submit matching documentation or update your profile.',
    },
    {
        id: 'ownership',
        label: 'Missing beneficial ownership or corporate resolution',
        template: 'For corporate/fund accounts, a valid certificate of incumbency or resolution confirming authorized signatories is required.',
    },
    {
        id: 'unsupported',
        label: 'Unsupported document type or issuing authority',
        template:
            'The submitted document type is not accepted for institutional compliance verification. Please provide an international passport or national identity card.',
    },
    {
        id: 'other',
        label: 'Other / Custom Compliance Reason',
        template: '',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    const status =
        overrides.kyc_status !== undefined ? overrides.kyc_status : current.activeKycStatus !== 'all' ? current.activeKycStatus : undefined;
    const type = overrides.type !== undefined ? overrides.type : current.activeType !== 'all' ? current.activeType : undefined;
    const srch = overrides.search !== undefined ? overrides.search : current.search;
    if (status) p.kyc_status = status;
    if (type) p.type = type;
    if (srch) p.search = srch;
    return p;
}

// ─── KYC Status Badge (Resend Capsule) ────────────────────────────────────────

function KycStatusBadge({ status }: { status: KycStatus }) {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    KYC Verified
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Pending Review
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    Rejected
                </span>
            );
        case 'not_submitted':
        default:
            return (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Not Submitted
                </span>
            );
    }
}

// ─── Reject KYC Compliance Note Modal────────────────────

function RejectKycModal({
    investor,
    onClose,
    onSuccess,
}: {
    investor: InvestorAccount;
    onClose: () => void;
    onSuccess: (updated: InvestorAccount) => void;
}) {
    const docName = investor.latest_kyc_submission?.original_name ?? 'ID document';
    const [selectedId, setSelectedId] = useState('expired');
    const [notes, setNotes] = useState(
        `The submitted document (${docName}) cannot be verified because it has expired. Please re-submit a valid, unexpired government-issued copy.`,
    );
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleSelectPreset(preset: (typeof REJECTION_PRESETS)[0]) {
        setSelectedId(preset.id);
        if (preset.id === 'other') {
            setNotes('');
            setTimeout(() => textareaRef.current?.focus(), 50);
        } else {
            setNotes(`The submitted document (${docName}) cannot be verified: ${preset.template}`);
        }
    }

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!investor.latest_kyc_submission) return;
        if (!notes.trim()) {
            setErrorMsg('Please provide a specific compliance rejection note.');
            textareaRef.current?.focus();
            return;
        }

        setSubmitting(true);
        setErrorMsg(null);

        router.patch(
            `/admin/investor-kyc/${investor.latest_kyc_submission.id}`,
            {
                status: 'rejected',
                review_notes: notes.trim(),
            },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    onSuccess({
                        ...investor,
                        kyc_status: 'rejected',
                        latest_kyc_submission: {
                            ...investor.latest_kyc_submission!,
                            status: 'rejected',
                            review_notes: notes.trim(),
                        },
                    });
                },
                onError: (err) => {
                    setSubmitting(false);
                    setErrorMsg(Object.values(err)[0] ?? 'Failed to submit rejection.');
                },
                preserveScroll: true,
            },
        );
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notes, handleSubmit, onClose]);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} />

            <div className="animate-in fade-in-0 zoom-in-95 relative z-10 w-full max-w-lg space-y-5 rounded-[22px] border border-zinc-200/90 bg-white p-6 shadow-2xl duration-150">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold tracking-tight text-zinc-950">Reject KYC Submission</h3>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            {investor.profile?.full_name ?? investor.email} · <span className="font-medium text-zinc-700">{docName}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <Icon icon="solar:close-circle-linear" className="size-4" />
                    </button>
                </div>

                {errorMsg && <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700">{errorMsg}</div>}

                {/* Reason Selection Cards */}
                <div className="space-y-2">
                    <span className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Compliance Failure Reason</span>

                    <div className="space-y-1.5">
                        {REJECTION_PRESETS.map((preset) => {
                            const isSelected = selectedId === preset.id;
                            return (
                                <div
                                    key={preset.id}
                                    onClick={() => handleSelectPreset(preset)}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs transition-all select-none',
                                        isSelected
                                            ? 'border-zinc-950 bg-[#FAFBFD] font-medium text-zinc-950 shadow-2xs'
                                            : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50/50',
                                    )}
                                >
                                    <span className="pr-2 leading-snug">{preset.label}</span>
                                    <div
                                        className={cn(
                                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            isSelected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white',
                                        )}
                                    >
                                        {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Compliance Note */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                            Compliance Note (Sent to Investor)
                        </span>
                        <span className="text-[10.5px] font-medium text-zinc-400">Required</span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                            selectedId === 'other'
                                ? 'Type specific compliance reason and instructions for the investor...'
                                : 'Detailed compliance notes...'
                        }
                        className="w-full resize-none rounded-xl border border-zinc-200/90 bg-[#FAFBFD] p-3 text-xs leading-relaxed text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <span>Cancel</span>
                        <kbd className="py-0.2 rounded bg-zinc-100 px-1 font-mono text-[10px] text-zinc-500">Esc</kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={submitting || !notes.trim()}
                        className="flex items-center gap-2 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 disabled:opacity-50"
                    >
                        {submitting ? (
                            <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                        ) : (
                            <Icon icon="solar:close-circle-linear" className="size-3.5" />
                        )}
                        <span>Confirm Rejection</span>
                        <kbd className="py-0.2 rounded bg-rose-700 px-1 font-mono text-[10px] text-rose-200">⌘↵</kbd>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── KYC Slide-Over Inspector Drawer (With Inline Visible Document) ────────────

function KycDrawer({
    investor,
    onClose,
    onOpenRejectModal,
    onUpdateInvestor,
}: {
    investor: InvestorAccount;
    onClose: () => void;
    onOpenRejectModal: () => void;
    onUpdateInvestor?: (updated: InvestorAccount) => void;
}) {
    const [updating, setUpdating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const submission = investor.latest_kyc_submission;
    const isPdf = submission?.mime_type === 'application/pdf' || submission?.original_name.endsWith('.pdf');

    function approveKyc() {
        if (!submission) return;
        setUpdating(true);
        router.patch(
            `/admin/investor-kyc/${submission.id}`,
            { status: 'approved' },
            {
                onSuccess: () => {
                    onUpdateInvestor?.({
                        ...investor,
                        kyc_status: 'approved',
                        account_status: 'active',
                        latest_kyc_submission: {
                            ...submission,
                            status: 'approved',
                        },
                    });
                },
                onFinish: () => setUpdating(false),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        navigator.clipboard.writeText(investor.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} />

                <div className="animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-xl flex-col justify-between overflow-hidden border-l border-zinc-200/80 bg-white shadow-2xl duration-200">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6 py-4.5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-700">
                                {getInitials(investor.profile?.full_name)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate text-sm font-bold text-zinc-950">{investor.profile?.full_name ?? investor.email}</h3>
                                    <KycStatusBadge status={investor.kyc_status} />
                                </div>
                                <p className="truncate text-[11.5px] text-zinc-500">
                                    {investor.profile?.company_name ?? humanize(investor.profile?.investor_type ?? 'Investor')}
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

                    {/* Quick Decision Bar */}
                    {submission && investor.kyc_status === 'pending' && (
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 bg-[#FAFBFD] px-6 py-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={approveKyc}
                                    disabled={updating}
                                    className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800"
                                >
                                    {updating ? (
                                        <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                    ) : (
                                        <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                    )}
                                    <span>Approve KYC</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onOpenRejectModal}
                                    disabled={updating}
                                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-3.5 text-rose-500" />
                                    <span>Reject KYC</span>
                                </button>
                            </div>

                            <span className="text-[11px] font-medium text-zinc-400">Compliance Review</span>
                        </div>
                    )}

                    {/* Content Stream */}
                    <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                        {/* Section 1: INLINE VISIBLE KYC DOCUMENT (Prominent Preview) */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-zinc-950">KYC Verification Document</h4>
                                {submission && <span className="text-[11px] font-medium text-zinc-400">{humanize(submission.document_type)}</span>}
                            </div>

                            {submission ? (
                                <div className="space-y-3.5 rounded-2xl border border-zinc-200/90 bg-[#FAFBFD] p-4 shadow-2xs">
                                    {/* Document Title Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-700">
                                                <Icon icon="solar:document-text-linear" className="size-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-zinc-950">{submission.original_name}</p>
                                                <p className="text-[11px] text-zinc-400">Uploaded {formatDate(submission.created_at)}</p>
                                            </div>
                                        </div>

                                        <KycStatusBadge status={submission.status as KycStatus} />
                                    </div>

                                    {/* VISIBLE DOCUMENT EMBED */}
                                    <div className="group relative overflow-hidden rounded-xl border border-zinc-200/90 bg-[#F6F8FA] p-3 shadow-2xs">
                                        {isPdf ? (
                                            <iframe
                                                src={`/admin/investor-kyc/${submission.id}/preview#toolbar=0`}
                                                className="h-72 w-full rounded-lg border-0 bg-white shadow-xs"
                                                title="PDF Preview"
                                            />
                                        ) : (
                                            <div
                                                onClick={() => setLightboxOpen(true)}
                                                className="flex max-h-68 min-h-48 cursor-pointer items-center justify-center overflow-hidden p-1"
                                            >
                                                <img
                                                    src={`/admin/investor-kyc/${submission.id}/preview`}
                                                    alt={submission.original_name}
                                                    className="h-auto max-h-64 w-full rounded-lg border border-zinc-200/60 bg-white object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.01]"
                                                />
                                            </div>
                                        )}

                                        {/* Hover Overlay Toolbar */}
                                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 p-1 opacity-90 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => setLightboxOpen(true)}
                                                className="p-1 text-zinc-300 transition-colors hover:text-white"
                                                title="Expand Preview"
                                            >
                                                <Icon icon="solar:maximize-square-linear" className="size-3.5" />
                                            </button>
                                            <a
                                                href={`/admin/investor-kyc/${submission.id}/download`}
                                                className="p-1 text-zinc-300 transition-colors hover:text-white"
                                                title="Download Original"
                                            >
                                                <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center justify-between pt-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setLightboxOpen(true)}
                                                className="flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                                            >
                                                <Icon icon="solar:eye-linear" className="size-3.5 text-zinc-400" />
                                                <span>Expand View</span>
                                            </button>

                                            <a
                                                href={`/admin/investor-kyc/${submission.id}/download`}
                                                className="flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                                            >
                                                <Icon icon="solar:download-minimalistic-linear" className="size-3.5 text-zinc-400" />
                                                <span>Download File</span>
                                            </a>
                                        </div>

                                        <span className="text-[11px] text-zinc-400">Encrypted AES-256</span>
                                    </div>

                                    {/* Review Notes Callout */}
                                    {submission.review_notes && (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-800">
                                            <span className="mb-0.5 block font-semibold text-rose-900">Rejection Compliance Note:</span>
                                            <p className="leading-relaxed">{submission.review_notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
                                    <Icon icon="solar:shield-warning-linear" className="mx-auto mb-2 size-6 text-zinc-400" />
                                    <p className="text-xs font-semibold text-zinc-600">No KYC Document Submitted</p>
                                    <p className="mt-0.5 text-[11.5px] text-zinc-400">
                                        Investor has not yet uploaded proof of identity or incorporation.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Profile & Identity Properties */}
                        <div className="border-t border-zinc-100 pt-4">
                            <h4 className="mb-3 text-xs font-semibold text-zinc-950">Investor Profile Details</h4>
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Full Legal Name</span>
                                    <span className="font-medium text-zinc-900">{investor.profile?.full_name ?? '—'}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Email Address</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900">{investor.email}</span>
                                        <button onClick={copyEmail} className="text-zinc-400 hover:text-zinc-800" title="Copy Email">
                                            <Icon icon={copied ? 'solar:check-circle-linear' : 'solar:copy-linear'} className="size-3.5" />
                                        </button>
                                        <a href={`mailto:${investor.email}`} className="ml-0.5 text-zinc-400 hover:text-zinc-800" title="Send Email">
                                            <Icon icon="solar:letter-linear" className="size-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {investor.profile?.phone && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Phone Number</span>
                                        <span className="font-medium text-zinc-900">{investor.profile.phone}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Entity / Firm</span>
                                    <span className="font-medium text-zinc-900">{investor.profile?.company_name ?? 'Individual Investor'}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Investor Classification</span>
                                    <span className="font-medium text-zinc-900">{humanize(investor.profile?.investor_type ?? 'individual')}</span>
                                </div>

                                {investor.profile?.address && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Registered Address</span>
                                        <span className="max-w-xs truncate text-right font-medium text-zinc-900">{investor.profile.address}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Account Registered</span>
                                    <span className="font-medium text-zinc-900">{formatDate(investor.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox / Expanded Viewer Modal (Crisp High-End Design) */}
            {lightboxOpen && submission && (
                <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-200"
                        onClick={() => setLightboxOpen(false)}
                    />

                    <div className="animate-in zoom-in-95 relative z-10 flex w-full max-w-3xl flex-col space-y-4 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-2xl duration-150">
                        {/* Lightbox Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                    <Icon icon="solar:document-text-linear" className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-950">{submission.original_name}</h3>
                                    <p className="text-[11px] text-zinc-400">
                                        {investor.profile?.full_name ?? investor.email} · {humanize(submission.document_type)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/admin/investor-kyc/${submission.id}/download`}
                                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                >
                                    <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                    <span>Download</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setLightboxOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Lightbox Canvas */}
                        <div className="relative flex max-h-[65vh] min-h-95 items-center justify-center overflow-auto rounded-2xl border border-zinc-200/80 bg-[#F6F8FA] p-4">
                            {isPdf ? (
                                <iframe
                                    src={`/admin/investor-kyc/${submission.id}/preview`}
                                    className="h-[60vh] w-full rounded-xl border-0 bg-white shadow-sm"
                                    title="PDF Document"
                                />
                            ) : (
                                <img
                                    src={`/admin/investor-kyc/${submission.id}/preview`}
                                    alt={submission.original_name}
                                    className="h-auto max-h-[58vh] w-full max-w-2xl rounded-xl border border-zinc-200/60 bg-white object-contain shadow-md"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Investor Reviews Workspace ──────────────────────────────────────────

export default function InvestorAccountsIndex({ investors, activeKycStatus, activeType, search: initialSearch, totals }: PageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [activeDrawerInvestor, setActiveDrawerInvestor] = useState<InvestorAccount | null>(null);
    const [rejectingInvestor, setRejectingInvestor] = useState<InvestorAccount | null>(null);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Synchronize activeDrawerInvestor with latest Inertia page props
    useEffect(() => {
        if (activeDrawerInvestor) {
            const updated = investors.data.find((inv) => inv.id === activeDrawerInvestor.id);
            if (updated) {
                setActiveDrawerInvestor(updated);
            }
        }
    }, [investors, activeDrawerInvestor]);

    const applyFilters = useCallback(
        (overrides: Record<string, string | undefined>) => {
            const query = buildParams(overrides, { activeKycStatus, activeType, search });
            router.get('/admin/investor-accounts', query, { replace: true, preserveState: true });
        },
        [activeKycStatus, activeType, search],
    );

    useEffect(() => {
        if (search === initialSearch) return;
        const t = setTimeout(() => {
            applyFilters({ search });
        }, 350);
        return () => clearTimeout(t);
    }, [search, applyFilters, initialSearch]);

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

    const typeLabels: Record<string, string> = {
        all: 'All investor types',
        individual: 'Individual Investors',
        corporate: 'Corporate / Funds',
    };

    return (
        <AdminLayout>
            <Head title="Investor Reviews — Admin" />

            {/* ── Main Container ─────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-xs lg:p-8">
                {/* ── Header Bar ─────────────────────────────────────────────── */}
                <div className="mb-6 flex shrink-0 items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Investor Reviews</h1>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/investors')}
                            className="flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:users-group-rounded-linear" className="size-3.5 text-zinc-500" />
                            <span>Admission Pipeline</span>
                        </button>
                    </div>
                </div>

                {/* ── Navigation Tabs (Resend Style) ──────────────────────────── */}
                <div className="mb-6 flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
                    {(
                        [
                            { key: 'all', label: 'All Investors' },
                            { key: 'pending', label: 'KYC Pending' },
                            { key: 'approved', label: 'Verified Approved' },
                            { key: 'not_submitted', label: 'Not Submitted' },
                            { key: 'rejected', label: 'Rejected' },
                        ] as const
                    ).map(({ key, label }) => {
                        const isSelected = activeKycStatus === key;
                        const count =
                            key === 'all'
                                ? totals?.all
                                : key === 'pending'
                                  ? totals?.pending
                                  : key === 'approved'
                                    ? totals?.approved
                                    : key === 'not_submitted'
                                      ? totals?.not_submitted
                                      : totals?.rejected;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => applyFilters({ kyc_status: key === 'all' ? '' : key })}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
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

                {/* ── Minimalist Monochrome Metric Strip ────────── */}
                <div className="mb-8 grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Total Investors</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals?.all ?? 0}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">KYC Pending</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals?.pending ?? 0}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Verified Active</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals?.approved ?? 0}</span>
                    </div>

                    <div className="rounded-3xl bg-[#F9FAFB] p-5 transition-colors sm:p-6">
                        <span className="mb-4 block text-[13px] font-medium text-zinc-500">Rejected</span>
                        <span className="block text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{totals?.rejected ?? 0}</span>
                    </div>
                </div>

                {/* ── Search & Filter Toolbar ─────────────────────────────────── */}
                <div className="mb-3 flex shrink-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-96">
                        <Icon
                            icon="solar:minimalistic-magnifer-linear"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by investor name, firm, or email..."
                            className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pr-8 pl-10 text-xs text-zinc-900 shadow-2xs transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative" ref={typeDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 text-xs font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
                            >
                                <span>{typeLabels[activeType] ?? 'All types'}</span>
                                <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-zinc-400" />
                            </button>

                            {isTypeDropdownOpen && (
                                <div className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl duration-150">
                                    {(['all', 'individual', 'corporate'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => {
                                                applyFilters({ type: t === 'all' ? '' : t });
                                                setIsTypeDropdownOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors',
                                                activeType === t ? 'bg-zinc-100 font-semibold text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50',
                                            )}
                                        >
                                            <span>{typeLabels[t]}</span>
                                            {activeType === t && <Icon icon="solar:check-read-linear" className="size-3.5 text-zinc-900" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Data Table ────────────────────────────────── */}
                <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-between overflow-y-auto">
                    <div>
                        {/* Clean Minimalist Header */}
                        <div className="mb-1 flex items-center gap-4 border-b border-zinc-100 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase select-none">
                            <div className="w-[32%] min-w-0">Investor / Contact</div>
                            <div className="w-[26%] min-w-0">Entity & Type</div>
                            <div className="w-[20%] min-w-0">KYC Document</div>
                            <div className="w-[12%] min-w-0">Status</div>
                            <div className="w-[10%] min-w-0 text-right">Registered</div>
                            <div className="w-6 shrink-0" />
                        </div>

                        {/* Rows */}
                        {investors.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-xs text-zinc-400">No investors found matching this filter.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {investors.data.map((inv) => (
                                    <div
                                        key={inv.id}
                                        onClick={() => setActiveDrawerInvestor(inv)}
                                        className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 text-xs transition-colors duration-150 hover:bg-zinc-50/80"
                                    >
                                        {/* Contact & Avatar */}
                                        <div className="flex w-[32%] min-w-0 items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10.5px] font-bold text-zinc-700">
                                                {getInitials(inv.profile?.full_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[13px] font-semibold text-zinc-900 group-hover:underline">
                                                    {inv.profile?.full_name ?? 'Unnamed Investor'}
                                                </span>
                                                <span className="ml-1.5 truncate font-normal text-zinc-400">{inv.email}</span>
                                            </div>
                                        </div>

                                        {/* Entity & Type */}
                                        <div className="w-[26%] min-w-0">
                                            <span className="block truncate text-[13px] font-medium text-zinc-800">
                                                {inv.profile?.company_name ?? 'Individual Investor'}
                                            </span>
                                            <span className="block truncate text-[11.5px] font-normal text-zinc-400">
                                                {humanize(inv.profile?.investor_type ?? 'individual')}
                                            </span>
                                        </div>

                                        {/* KYC Document */}
                                        <div className="w-[20%] min-w-0">
                                            {inv.latest_kyc_submission ? (
                                                <div className="flex items-center gap-1.5 text-zinc-700">
                                                    <Icon icon="solar:document-text-linear" className="size-3.5 shrink-0 text-zinc-400" />
                                                    <span className="truncate font-medium">{inv.latest_kyc_submission.original_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 italic">No document</span>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="w-[12%] min-w-0">
                                            <KycStatusBadge status={inv.kyc_status} />
                                        </div>

                                        {/* Registered Date */}
                                        <div className="w-[10%] min-w-0 text-right text-zinc-400">{formatDate(inv.created_at)}</div>

                                        {/* Actions Menu */}
                                        <div className="relative flex w-6 shrink-0 justify-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === inv.id ? null : appMenu(inv.id));
                                                }}
                                                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                            >
                                                <Icon icon="solar:menu-dots-bold" className="size-3.5" />
                                            </button>

                                            {openMenuId === inv.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-40 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl duration-100"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDrawerInvestor(inv);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                                                    >
                                                        <Icon icon="solar:document-text-linear" className="size-3.5 text-zinc-500" />
                                                        <span>Inspect KYC</span>
                                                    </button>

                                                    {inv.latest_kyc_submission && inv.kyc_status === 'pending' && (
                                                        <>
                                                            <div className="my-1 border-t border-zinc-100" />

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.patch(
                                                                        `/admin/investor-kyc/${inv.latest_kyc_submission!.id}`,
                                                                        { status: 'approved' },
                                                                        { preserveScroll: true },
                                                                    );
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                                                <span>Approve KYC</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRejectingInvestor(inv);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                                                <span>Reject KYC</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {inv.latest_kyc_submission && (
                                                        <>
                                                            <div className="my-1 border-t border-zinc-100" />

                                                            <a
                                                                href={`/admin/investor-kyc/${inv.latest_kyc_submission.id}/preview`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                                                            >
                                                                <Icon icon="solar:eye-linear" className="size-3.5 text-zinc-400" />
                                                                <span>Preview File</span>
                                                            </a>

                                                            <a
                                                                href={`/admin/investor-kyc/${inv.latest_kyc_submission.id}/download`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
                                                            >
                                                                <Icon icon="solar:download-minimalistic-linear" className="size-3.5 text-zinc-400" />
                                                                <span>Download</span>
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex shrink-0 items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                        <p>
                            Page {investors.current_page} – 1 of {investors.total} investors – {investors.per_page} items
                        </p>

                        {investors.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                {investors.links.map((link, i) => (
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

                {/* ── Slide-Over KYC Drawer ───────────────────────────────────── */}
                {activeDrawerInvestor && (
                    <KycDrawer
                        investor={activeDrawerInvestor}
                        onClose={() => setActiveDrawerInvestor(null)}
                        onUpdateInvestor={(updated) => setActiveDrawerInvestor(updated)}
                        onOpenRejectModal={() => {
                            setRejectingInvestor(activeDrawerInvestor);
                        }}
                    />
                )}

                {/* ── Reject KYC Modal ────────────────────────────────────────── */}
                {rejectingInvestor && (
                    <RejectKycModal
                        investor={rejectingInvestor}
                        onClose={() => setRejectingInvestor(null)}
                        onSuccess={(updated) => {
                            setRejectingInvestor(null);
                            setActiveDrawerInvestor(updated);
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );

    function appMenu(id: string) {
        return openMenuId === id ? null : id;
    }
}
