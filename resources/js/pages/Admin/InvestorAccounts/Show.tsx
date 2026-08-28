import { Icon } from '@iconify/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface KycSubmission {
    id: string;
    document_type: string;
    original_name: string;
    mime_type: string;
    status: KycStatus;
    created_at: string;
    review_notes: string | null;
    reviewed_at: string | null;
}

interface Investor {
    id: string;
    email: string;
    kyc_status: KycStatus;
    kyc_approved_at: string | null;
    created_at: string;
    profile: {
        full_name: string;
        investor_type: 'individual' | 'corporate';
        company_name: string | null;
        phone: string | null;
        address: string | null;
    };
    kyc_submissions: KycSubmission[];
}

interface PageProps {
    investor: Investor;
    canReviewKyc: boolean;
}

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
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function humanize(str: string | null): string {
    if (!str) return '—';
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── KYC Status Badge ─────────────────────────────────────────────────────────

function KycStatusBadge({ status }: { status: KycStatus }) {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Icon icon="solar:check-circle-linear" className="size-3.5 text-emerald-600" />
                    <span>KYC Verified</span>
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-3 py-1 text-xs font-bold text-amber-700">
                    <Icon icon="solar:clock-circle-linear" className="size-3.5 text-amber-600" />
                    <span>Pending Review</span>
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/70 px-3 py-1 text-xs font-bold text-rose-700">
                    <Icon icon="solar:close-circle-linear" className="size-3.5 text-rose-600" />
                    <span>Rejected</span>
                </span>
            );
        case 'not_submitted':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-500">
                    <span>Not Submitted</span>
                </span>
            );
    }
}

// ─── Main Review Dossier View ─────────────────────────────────────────────────

export default function InvestorAccountShow({ investor, canReviewKyc }: PageProps) {
    const form = useForm({ review_notes: '' });
    const [isRejecting, setIsRejecting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lightboxDoc, setLightboxDoc] = useState<KycSubmission | null>(null);

    const latestSubmission = investor.kyc_submissions?.[0] ?? null;

    function handleApprove(submissionId: string) {
        form.transform(() => ({ status: 'approved' }));
        form.patch(route('admin.investor-kyc.review', submissionId), {
            preserveScroll: true,
        });
    }

    function handleReject(submissionId: string) {
        if (!form.data.review_notes.trim()) return;
        form.transform((data) => ({ status: 'rejected', review_notes: data.review_notes }));
        form.patch(route('admin.investor-kyc.review', submissionId), {
            preserveScroll: true,
            onSuccess: () => setIsRejecting(false),
        });
    }

    function copyEmail() {
        navigator.clipboard.writeText(investor.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <AdminLayout>
            <Head title={`${investor.profile?.full_name ?? investor.email} — KYC Review`} />

            {/* ── Main Container  ───────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* ── Top Header Bar ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 lg:px-8 py-5 border-b border-zinc-100 shrink-0 bg-white">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link
                            href="/admin/investor-accounts"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 transition-colors shrink-0"
                            title="Back to Investors"
                        >
                            <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
                        </Link>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
                            {getInitials(investor.profile?.full_name)}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <h1 className="truncate text-lg font-bold tracking-tight text-zinc-950">
                                    {investor.profile?.full_name ?? 'Investor Account'}
                                </h1>
                                <KycStatusBadge status={investor.kyc_status} />
                            </div>
                            <p className="truncate text-xs text-zinc-500 mt-0.5">
                                {investor.email}
                                {investor.profile?.company_name && ` · ${investor.profile.company_name}`}
                                {` · ${humanize(investor.profile?.investor_type ?? 'individual')}`}
                            </p>
                        </div>
                    </div>

                    {/* Top Action Controls */}
                    {canReviewKyc && latestSubmission && latestSubmission.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleApprove(latestSubmission.id)}
                                disabled={form.processing}
                                className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all"
                            >
                                <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                <span>Approve KYC</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsRejecting(true)}
                                disabled={form.processing}
                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs transition-all"
                            >
                                <Icon icon="solar:close-circle-linear" className="size-3.5 text-rose-500" />
                                <span>Reject KYC</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Content Stream ─────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 space-y-6">
                    {/* Polar Top Metric Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Investor Type</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {humanize(investor.profile?.investor_type ?? 'individual')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Company / Firm</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950 truncate">
                                {investor.profile?.company_name ?? 'Individual'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">KYC Status</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {humanize(investor.kyc_status)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Account Created</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {formatDate(investor.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Properties List */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-2xs">
                        {/* Profile Details */}
                        <div>
                            <h2 className="text-xs font-semibold text-zinc-950 mb-3">Identity & Contact</h2>
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Full Legal Name</span>
                                    <span className="font-medium text-zinc-900">{investor.profile?.full_name ?? '—'}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Email Address</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900">{investor.email}</span>
                                        <button onClick={copyEmail} className="text-zinc-400 hover:text-zinc-800" title="Copy">
                                            <Icon icon={copied ? 'solar:check-circle-linear' : 'solar:copy-linear'} className="size-3.5" />
                                        </button>
                                        <a href={`mailto:${investor.email}`} className="text-zinc-400 hover:text-zinc-800 ml-0.5">
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

                                {investor.profile?.address && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Registered Address</span>
                                        <span className="font-medium text-zinc-900 text-right max-w-sm truncate">
                                            {investor.profile.address}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KYC Submissions with Visible Inline Document Embed */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h2 className="text-xs font-semibold text-zinc-950 mb-3">KYC Submissions & Documents</h2>

                            {investor.kyc_submissions && investor.kyc_submissions.length > 0 ? (
                                <div className="space-y-4">
                                    {investor.kyc_submissions.map((sub) => {
                                        const isPdf = sub.mime_type === 'application/pdf' || sub.original_name.endsWith('.pdf');
                                        return (
                                            <div
                                                key={sub.id}
                                                className="rounded-2xl border border-zinc-200/90 bg-[#FAFBFD] p-5 space-y-4 shadow-2xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
                                                            <Icon icon="solar:document-text-linear" className="size-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-semibold text-zinc-950">
                                                                {sub.original_name}
                                                            </p>
                                                            <p className="text-[11px] text-zinc-400">
                                                                Submitted {formatDate(sub.created_at)} · {humanize(sub.document_type)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <KycStatusBadge status={sub.status} />
                                                </div>

                                                {/* Visual Embedded Document */}
                                                <div className="relative overflow-hidden rounded-xl border border-zinc-200/90 bg-[#F6F8FA] p-3 shadow-2xs group">
                                                    {isPdf ? (
                                                        <iframe
                                                            src={`/admin/investor-kyc/${sub.id}/preview#toolbar=0`}
                                                            className="w-full h-80 border-0 rounded-lg bg-white shadow-xs"
                                                            title="PDF Preview"
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => setLightboxDoc(sub)}
                                                            className="cursor-pointer overflow-hidden p-2 flex items-center justify-center min-h-48 max-h-72"
                                                        >
                                                            <img
                                                                src={`/admin/investor-kyc/${sub.id}/preview`}
                                                                alt={sub.original_name}
                                                                className="w-full h-auto max-h-68 object-contain rounded-lg shadow-sm border border-zinc-200/60 bg-white transition-transform duration-200 group-hover:scale-[1.01]"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-xs p-1 rounded-lg border border-zinc-800 opacity-90 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => setLightboxDoc(sub)}
                                                            className="p-1 text-zinc-300 hover:text-white transition-colors"
                                                            title="Expand Preview"
                                                        >
                                                            <Icon icon="solar:maximize-square-linear" className="size-3.5" />
                                                        </button>
                                                        <a
                                                            href={`/admin/investor-kyc/${sub.id}/download`}
                                                            className="p-1 text-zinc-300 hover:text-white transition-colors"
                                                            title="Download File"
                                                        >
                                                            <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setLightboxDoc(sub)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 shadow-2xs transition-colors"
                                                    >
                                                        <Icon icon="solar:eye-linear" className="size-3.5 text-zinc-400" />
                                                        <span>Expand View</span>
                                                    </button>

                                                    <a
                                                        href={`/admin/investor-kyc/${sub.id}/download`}
                                                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 shadow-2xs transition-colors"
                                                    >
                                                        <Icon icon="solar:download-minimalistic-linear" className="size-3.5 text-zinc-400" />
                                                        <span>Download File</span>
                                                    </a>
                                                </div>

                                                {sub.review_notes && (
                                                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-800">
                                                        <span className="font-semibold text-rose-900 block mb-0.5">
                                                            Rejection Compliance Note:
                                                        </span>
                                                        <p className="leading-relaxed">{sub.review_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
                                    <p className="text-xs text-zinc-400 font-medium">No KYC submissions recorded yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Rejection Form Modal */}
                        {isRejecting && latestSubmission && (
                            <div className="pt-4 border-t border-zinc-100 animate-in fade-in duration-150">
                                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-3 text-xs">
                                    <span className="font-semibold text-rose-900 block">
                                        Reason for KYC Rejection
                                    </span>
                                    <textarea
                                        rows={3}
                                        value={form.data.review_notes}
                                        onChange={(e) => form.setData('review_notes', e.target.value)}
                                        placeholder="Explain why this document does not meet compliance requirements..."
                                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-rose-400 resize-none"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRejecting(false)}
                                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(latestSubmission.id)}
                                            disabled={form.processing || !form.data.review_notes.trim()}
                                            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs disabled:opacity-50"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox / Expanded Viewer Modal */}
            {lightboxDoc && (
                <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-200"
                        onClick={() => setLightboxDoc(null)}
                    />

                    <div className="relative z-10 w-full max-w-3xl rounded-[24px] bg-white border border-zinc-200/90 p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                    <Icon icon="solar:document-text-linear" className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-950">{lightboxDoc.original_name}</h3>
                                    <p className="text-[11px] text-zinc-400">
                                        {investor.profile?.full_name ?? investor.email} · {humanize(lightboxDoc.document_type)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/admin/investor-kyc/${lightboxDoc.id}/download`}
                                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
                                >
                                    <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                    <span>Download</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setLightboxDoc(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                                >
                                    <Icon icon="solar:close-circle-linear" className="size-5" />
                                </button>
                            </div>
                        </div>

                        <div className="relative rounded-2xl bg-[#F6F8FA] border border-zinc-200/80 p-4 flex items-center justify-center min-h-[380px] max-h-[65vh] overflow-auto">
                            {lightboxDoc.mime_type === 'application/pdf' || lightboxDoc.original_name.endsWith('.pdf') ? (
                                <iframe
                                    src={`/admin/investor-kyc/${lightboxDoc.id}/preview`}
                                    className="w-full h-[60vh] border-0 rounded-xl bg-white shadow-sm"
                                    title="PDF Document"
                                />
                            ) : (
                                <img
                                    src={`/admin/investor-kyc/${lightboxDoc.id}/preview`}
                                    alt={lightboxDoc.original_name}
                                    className="w-full max-w-2xl h-auto max-h-[58vh] object-contain rounded-xl shadow-md bg-white border border-zinc-200/60"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
