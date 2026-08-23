import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Check, Download, ExternalLink, FileLock2, Mail, MapPin, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    not_submitted: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100',
    pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    approved: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    rejected: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
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
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="h-4 w-4 text-[#3A54A5]" />
                <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</span>
            </div>
            <p className="text-sm font-medium text-zinc-900 break-words">{value}</p>
        </div>
    );
}

function KycDecisionControls({ submission }: { submission: KycSubmission }) {
    const form = useForm({ review_notes: '' });
    const [isRejecting, setIsRejecting] = useState(false);

    const approve = () => {
        form.transform(() => ({ status: 'approved' }));
        form.patch(route('admin.investor-kyc.review', submission.id), {
            preserveScroll: true,
        });
    };

    const reject = () => {
        form.transform((data) => ({ status: 'rejected', review_notes: data.review_notes }));
        form.patch(route('admin.investor-kyc.review', submission.id), {
            preserveScroll: true,
            onSuccess: () => setIsRejecting(false),
        });
    };

    if (isRejecting) {
        return (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                <div className="space-y-3">
                    <Label htmlFor={`review-notes-${submission.id}`} className="text-sm font-semibold text-rose-900">
                        Reason for rejection
                    </Label>
                    <Textarea
                        id={`review-notes-${submission.id}`}
                        value={form.data.review_notes}
                        onChange={(event) => form.setData('review_notes', event.target.value)}
                        placeholder="Please provide a reason why this document is being rejected (required)..."
                        className="min-h-24 resize-y border-rose-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-rose-500"
                    />
                    {form.errors.review_notes && <p className="text-xs font-medium text-rose-600">{form.errors.review_notes}</p>}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsRejecting(false);
                            form.clearErrors();
                        }}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={form.processing || !form.data.review_notes.trim()}
                        onClick={reject}
                    >
                        <X className="mr-1.5 h-4 w-4" /> Confirm Rejection
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-6">
            <Button
                type="button"
                className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                disabled={form.processing}
                onClick={approve}
            >
                <Check className="mr-2 h-4 w-4" /> Approve Document
            </Button>
            <Button
                type="button"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                disabled={form.processing}
                onClick={() => setIsRejecting(true)}
            >
                <X className="mr-2 h-4 w-4" /> Reject Document
            </Button>
        </div>
    );
}

export default function InvestorAccountShow({ investor, canReviewKyc }: { investor: Investor; canReviewKyc: boolean }) {
    const latestSubmission = investor.kyc_submissions[0];
    const isImage = latestSubmission && (latestSubmission.mime_type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(latestSubmission.original_name));

    return (
        <AdminLayout>
            <Head title={`${investor.profile.full_name} · Investor review`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route('admin.investor-accounts.index')}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to investor reviews
                    </Link>

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{investor.profile.full_name}</h1>
                                <Badge variant="secondary" className={`border-0 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusClasses[investor.kyc_status]}`}>
                                    {statusLabel[investor.kyc_status]}
                                </Badge>
                            </div>
                            <p className="mt-2 text-base text-zinc-500">
                                Account access is active. KYC determines protected deal access.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile (1/3) */}
                    <div className="space-y-8 lg:col-span-4">
                        <Card className="border-zinc-200/60 shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <UserRound className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Investor Profile</CardTitle>
                                    <CardDescription>Details supplied during onboarding</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-y-6">
                                <ProfileItem icon={UserRound} label="Full name" value={investor.profile.full_name} />
                                <ProfileItem icon={Building2} label="Investor type" value={investor.profile.investor_type} />
                                <ProfileItem icon={Building2} label="Company" value={investor.profile.company_name} />
                                <ProfileItem icon={Mail} label="Email" value={investor.email} />
                                <ProfileItem icon={Phone} label="Phone" value={investor.profile.phone} />
                                <ProfileItem icon={MapPin} label="Address" value={investor.profile.address} />
                            </CardContent>
                        </Card>

                        {/* Submission History */}
                        {investor.kyc_submissions.length > 1 && (
                            <Card className="border-zinc-200/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Submission History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y divide-zinc-100">
                                        {investor.kyc_submissions.slice(1).map((submission) => (
                                            <div key={submission.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{submission.original_name}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(submission.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <Badge variant="secondary" className={`border-0 font-semibold rounded-full ${statusClasses[submission.status]}`}>
                                                    {statusLabel[submission.status]}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: KYC Verification (2/3) */}
                    <div className="lg:col-span-8">
                        <Card className="border-zinc-200/60 shadow-sm">
                            <CardHeader className="mx-6 mb-6 flex flex-row items-center gap-4 space-y-0 border-b border-zinc-100 px-0 pt-6 pb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">KYC Verification</CardTitle>
                                    <CardDescription>Submission history and compliance outcome</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {latestSubmission ? (
                                    <div className="space-y-5">
                                        {/* File Header Details */}
                                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-xs">
                                                    <FileLock2 className="h-5 w-5 text-[#3A54A5]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-zinc-900">{latestSubmission.original_name}</p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        <span className="capitalize">{latestSubmission.document_type.replace('_', ' ')}</span>
                                                        <span className="mx-2 text-zinc-300">•</span>
                                                        Submitted {new Date(latestSubmission.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <Badge variant="secondary" className={`border-0 font-semibold rounded-full ${statusClasses[latestSubmission.status]}`}>
                                                    {statusLabel[latestSubmission.status]}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Document Action & Preview */}
                                        {canReviewKyc ? (
                                            <div>
                                                <div className="mb-2.5 flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-[#3A54A5] hover:bg-[#3A54A5]/10 hover:text-[#2D4182]" asChild>
                                                        <a href={route('admin.investor-kyc.preview', latestSubmission.id)} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open original
                                                        </a>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-[#3A54A5] hover:bg-[#3A54A5]/10 hover:text-[#2D4182]" asChild>
                                                        <a href={route('admin.investor-kyc.download', latestSubmission.id)}>
                                                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download copy
                                                        </a>
                                                    </Button>
                                                </div>

                                                {/* Proper Container for Images vs PDFs */}
                                                {isImage ? (
                                                    <div className="flex min-h-[350px] max-h-[540px] w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
                                                        <img
                                                            src={route('admin.investor-kyc.preview', latestSubmission.id)}
                                                            alt={`Secure preview of ${latestSubmission.original_name}`}
                                                            className="max-h-[500px] w-auto max-w-full rounded-lg object-contain shadow-xs"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-inner">
                                                        <iframe
                                                            title={`Secure preview of ${latestSubmission.original_name}`}
                                                            src={route('admin.investor-kyc.preview', latestSubmission.id)}
                                                            className="h-[540px] w-full bg-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                                <p className="text-center text-sm text-zinc-500">Only compliance reviewers can access this identity document.</p>
                                            </div>
                                        )}

                                        {canReviewKyc && latestSubmission.status === 'pending' && <KycDecisionControls submission={latestSubmission} />}

                                        {latestSubmission.review_notes && (
                                            <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4 text-rose-600" />
                                                    <p className="text-xs font-bold tracking-wider text-rose-800 uppercase">Reviewer Note</p>
                                                </div>
                                                <p className="text-sm leading-relaxed text-rose-900">{latestSubmission.review_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-12 text-center">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                                            <FileLock2 className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-900">No KYC document submitted</p>
                                        <p className="mt-1 max-w-sm text-sm text-zinc-500">
                                            The investor must submit their identity documents before compliance review can begin.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
