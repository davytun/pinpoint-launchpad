import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Check, Download, Eye, FileLock2, Mail, MapPin, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

type KycSubmission = {
    id: number;
    document_type: string;
    original_name: string;
    mime_type: string;
    status: KycStatus;
    created_at: string;
    review_notes: string | null;
    reviewed_at: string | null;
};

type Investor = {
    id: number;
    email: string;
    kyc_status: KycStatus;
    kyc_approved_at: string | null;
    profile: {
        full_name: string;
        investor_type: 'individual' | 'corporate';
        company_name: string | null;
        phone: string | null;
        address: string | null;
    };
    kyc_submissions: KycSubmission[];
};

const statusClasses: Record<KycStatus, string> = {
    not_submitted: 'border-zinc-200 bg-zinc-50 text-zinc-600',
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

const statusLabel: Record<KycStatus, string> = {
    not_submitted: 'Not submitted',
    pending: 'Pending review',
    approved: 'KYC approved',
    rejected: 'KYC rejected',
};

function ProfileItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3A54A5]" />
            <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
            </div>
        </div>
    );
}

function KycDecisionControls({ submission }: { submission: KycSubmission }) {
    const form = useForm({ review_notes: '' });
    const review = (status: 'approved' | 'rejected') =>
        form.patch(route('admin.investor-kyc.review', submission.id), {
            data: { status, review_notes: form.data.review_notes },
            preserveScroll: true,
        });

    return (
        <div className="mt-5 border-t border-zinc-200 pt-5">
            <label className="text-xs font-bold tracking-wider text-zinc-600 uppercase" htmlFor={`review-notes-${submission.id}`}>
                Compliance note
            </label>
            <textarea
                id={`review-notes-${submission.id}`}
                value={form.data.review_notes}
                onChange={(event) => form.setData('review_notes', event.target.value)}
                placeholder="Required when rejecting this submission"
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#3A54A5] focus:ring-2 focus:ring-[#3A54A5]/15 focus:outline-none"
            />
            {form.errors.review_notes && <p className="mt-2 text-sm font-medium text-rose-700">{form.errors.review_notes}</p>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                    size="sm"
                    className="rounded-xl bg-[#3A54A5] hover:bg-[#2D4182]"
                    disabled={form.processing}
                    onClick={() => review('approved')}
                >
                    <Check data-icon="inline-start" /> Approve KYC
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={form.processing || !form.data.review_notes.trim()}
                    onClick={() => review('rejected')}
                >
                    <X data-icon="inline-start" /> Reject KYC
                </Button>
            </div>
        </div>
    );
}

export default function InvestorAccountShow({ investor, canReviewKyc }: { investor: Investor; canReviewKyc: boolean }) {
    const latestSubmission = investor.kyc_submissions[0];
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    return (
        <AdminLayout>
            <Head title={`${investor.profile.full_name} · Investor review`} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Link
                    href={route('admin.investor-accounts.index')}
                    className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#2D4182]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to investor reviews
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Investor review</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{investor.profile.full_name}</h1>
                        <p className="mt-2 text-sm text-zinc-600">Account access is active. KYC determines protected deal access.</p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses[investor.kyc_status]}`}>
                        {statusLabel[investor.kyc_status]}
                    </span>
                </div>

                <div className="mt-7 grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                                <UserRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-zinc-950">Investor profile</h2>
                                <p className="text-sm text-zinc-500">Details supplied during onboarding.</p>
                            </div>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <ProfileItem icon={UserRound} label="Full name" value={investor.profile.full_name} />
                            <ProfileItem icon={Building2} label="Investor type" value={investor.profile.investor_type} />
                            <ProfileItem icon={Building2} label="Company" value={investor.profile.company_name} />
                            <ProfileItem icon={Mail} label="Email" value={investor.email} />
                            <ProfileItem icon={Phone} label="Phone" value={investor.profile.phone} />
                            <ProfileItem icon={MapPin} label="Address" value={investor.profile.address} />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-zinc-950">KYC verification</h2>
                                <p className="text-sm text-zinc-500">Submission history and compliance outcome.</p>
                            </div>
                        </div>

                        {latestSubmission ? (
                            <div className="mt-7">
                                <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <FileLock2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3A54A5]" />
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{latestSubmission.original_name}</p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {latestSubmission.document_type.replace('_', ' ')} · Submitted{' '}
                                                {new Date(latestSubmission.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[latestSubmission.status]}`}
                                    >
                                        {statusLabel[latestSubmission.status]}
                                    </span>
                                </div>

                                {canReviewKyc ? (
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setIsPreviewOpen((open) => !open)}>
                                            <Eye data-icon="inline-start" /> {isPreviewOpen ? 'Hide secure preview' : 'View secure document'}
                                        </Button>
                                        <a
                                            href={route('admin.investor-kyc.download', latestSubmission.id)}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-[#3A54A5] transition-colors hover:bg-[#3A54A5]/8 hover:text-[#2D4182]"
                                        >
                                            <Download className="h-4 w-4" /> Download copy
                                        </a>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-zinc-500">Only compliance reviewers can access this identity document.</p>
                                )}

                                {canReviewKyc && isPreviewOpen && (
                                    <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                                        <iframe
                                            title={`Secure preview of ${latestSubmission.original_name}`}
                                            src={route('admin.investor-kyc.preview', latestSubmission.id)}
                                            className="h-[620px] w-full bg-white"
                                        />
                                    </div>
                                )}

                                {canReviewKyc && latestSubmission.status === 'pending' && <KycDecisionControls submission={latestSubmission} />}

                                {latestSubmission.review_notes && (
                                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                                        <p className="text-xs font-bold tracking-wider text-rose-700 uppercase">Reviewer note</p>
                                        <p className="mt-1 text-sm leading-relaxed text-rose-900">{latestSubmission.review_notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-7 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                                <FileLock2 className="mx-auto h-5 w-5 text-zinc-400" />
                                <p className="mt-3 text-sm font-semibold text-zinc-700">No KYC document submitted</p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    The investor must submit their document before compliance review can begin.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {investor.kyc_submissions.length > 1 && (
                    <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                        <h2 className="font-bold text-zinc-950">Submission history</h2>
                        <div className="mt-5 divide-y divide-zinc-100">
                            {investor.kyc_submissions.slice(1).map((submission) => (
                                <div key={submission.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                                    <div>
                                        <p className="font-medium text-zinc-900">{submission.original_name}</p>
                                        <p className="mt-1 text-xs text-zinc-500">{new Date(submission.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[submission.status]}`}>
                                        {statusLabel[submission.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
}
