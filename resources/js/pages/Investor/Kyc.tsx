import { PinpointLogo } from '@/components/pinpoint-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock3, Lock, UploadCloud, XCircle } from 'lucide-react';

function ProfileRow({ label, value }: { label: string; value: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="shrink-0 text-[12.5px] text-zinc-500">{label}</dt>
            <dd className="min-w-0 truncate text-right text-[13.5px] font-medium text-zinc-900">{value}</dd>
        </div>
    );
}

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

type KycSubmission = {
    original_name: string;
    status: KycStatus;
    review_notes: string | null;
};

export default function Kyc({
    investor,
}: {
    investor: {
        email: string;
        kyc_status: KycStatus;
        profile: { investor_type: string; full_name: string; company_name: string | null; phone: string | null; address: string | null };
        kyc_submissions: KycSubmission[];
    };
}) {
    const form = useForm<{ document: File | null }>({ document: null });
    const documentLabel = investor.profile.investor_type === 'corporate' ? 'Company Certificate' : 'Valid ID Card';
    const isCorporate = investor.profile.investor_type === 'corporate';
    const latestSubmission = investor.kyc_submissions[0];
    const isPending = investor.kyc_status === 'pending';
    const isApproved = investor.kyc_status === 'approved';
    const isRejected = investor.kyc_status === 'rejected';

    const statusMeta = isApproved
        ? { label: 'Verified', dot: 'bg-emerald-500', text: 'text-emerald-700', ring: 'border-emerald-200 bg-emerald-50' }
        : isPending
          ? { label: 'In review', dot: 'bg-amber-500', text: 'text-amber-700', ring: 'border-amber-200 bg-amber-50' }
          : isRejected
            ? { label: 'Needs attention', dot: 'bg-rose-500', text: 'text-rose-700', ring: 'border-rose-200 bg-rose-50' }
            : { label: 'Awaiting upload', dot: 'bg-zinc-400', text: 'text-zinc-600', ring: 'border-zinc-200 bg-zinc-50' };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('investor.kyc.store'), { forceFormData: true });
    };

    return (
        <>
            <Head title="Verify your identity — Pinpoint" />
            <div className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-[#3A54A5]/10">
                <header className="border-b border-zinc-200/80 bg-white">
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                        <PinpointLogo height={24} />
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
                            <Lock className="size-3.5 text-[#3A54A5]" />
                            Secure verification
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-6 py-12">
                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
                        {/* Left: context + registered profile */}
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#3A54A5] uppercase">Step 2 of 2</p>
                            <h1 className="font-display mt-3 text-[2rem] leading-[1.12] font-bold tracking-tight text-zinc-950">
                                Verify your identity
                            </h1>
                            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-500">
                                Our compliance team confirms the identity behind your account before unlocking interest, diligence, and data rooms.
                            </p>

                            <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                    <h2 className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Registered profile</h2>
                                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                                        {isCorporate ? 'Corporate' : 'Individual'}
                                    </span>
                                </div>
                                <dl className="mt-1 divide-y divide-zinc-100">
                                    <ProfileRow label="Full name" value={investor.profile.full_name} />
                                    {isCorporate && <ProfileRow label="Company" value={investor.profile.company_name} />}
                                    <ProfileRow label="Email" value={investor.email} />
                                    <ProfileRow label="Phone" value={investor.profile.phone} />
                                    <ProfileRow label="Address" value={investor.profile.address} />
                                </dl>
                            </div>
                        </div>

                        {/* Right: upload / status */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="font-display text-[20px] leading-tight font-bold tracking-tight text-zinc-950">
                                        {isApproved ? 'Verification complete' : isPending ? 'Document under review' : `Upload ${documentLabel}`}
                                    </h2>
                                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-500">
                                        {isApproved
                                            ? 'Your identity is verified. Protected investor content is now available.'
                                            : isPending
                                              ? 'Our compliance team is reviewing your document. We will notify you when a decision is ready.'
                                              : `Provide a clear, readable copy of your ${documentLabel.toLowerCase()}.`}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium',
                                        statusMeta.ring,
                                        statusMeta.text,
                                    )}
                                >
                                    <span className={cn('size-1.5 rounded-full', statusMeta.dot)} />
                                    {statusMeta.label}
                                </span>
                            </div>

                            {isRejected && latestSubmission?.review_notes && (
                                <Alert className="mt-6 border-rose-200 bg-rose-50 text-rose-950 [&>svg]:text-rose-600">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">Reviewer note</AlertTitle>
                                    <AlertDescription className="text-rose-800">{latestSubmission.review_notes}</AlertDescription>
                                </Alert>
                            )}

                            {isApproved ? (
                                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    <p className="text-[13px] leading-relaxed">
                                        No further action needed. Your access stays available while the account is active.
                                    </p>
                                </div>
                            ) : isPending ? (
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                                        <Clock3 className="mt-0.5 size-4 shrink-0 text-amber-600" />
                                        <p className="text-[13px] leading-relaxed">
                                            A document is already in review. New uploads reopen once this review is complete.
                                        </p>
                                    </div>
                                    <a
                                        href={route('investor.spotlight.index')}
                                        className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                                    >
                                        Browse Spotlight while you wait
                                    </a>
                                </div>
                            ) : (
                                <form className="mt-6 flex flex-col gap-5" onSubmit={submit}>
                                    <label
                                        className={cn(
                                            'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors',
                                            form.data.document
                                                ? 'border-[#3A54A5] bg-[#3A54A5]/5'
                                                : 'border-zinc-300 bg-zinc-50 hover:border-[#3A54A5]/50 hover:bg-[#3A54A5]/5',
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="sr-only"
                                            onChange={(e) => form.setData('document', e.target.files?.[0] ?? null)}
                                        />
                                        <UploadCloud className={cn('size-6', form.data.document ? 'text-[#3A54A5]' : 'text-zinc-400')} />
                                        <span className="mt-4 block text-[14px] font-semibold text-zinc-900">
                                            {form.data.document ? form.data.document.name : `Select your ${documentLabel}`}
                                        </span>
                                        <span className="mt-1 block text-[13px] text-zinc-500">
                                            {form.data.document ? 'Click to change file' : 'PDF, JPG or PNG. Max 10 MB.'}
                                        </span>
                                    </label>

                                    {form.errors.document && <p className="text-[13px] font-semibold text-rose-600">{form.errors.document}</p>}

                                    <button
                                        type="submit"
                                        disabled={!form.data.document || form.processing}
                                        className={cn(
                                            'h-11 w-full rounded-xl text-sm font-semibold transition-colors',
                                            form.data.document && !form.processing
                                                ? 'bg-zinc-950 text-white shadow-2xs hover:bg-zinc-800'
                                                : 'cursor-not-allowed bg-zinc-200 text-zinc-400',
                                        )}
                                    >
                                        {form.processing ? 'Uploading…' : isRejected ? 'Resubmit for review' : 'Submit for review'}
                                    </button>
                                </form>
                            )}

                            {latestSubmission && (
                                <div className="mt-6 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Latest submission</p>
                                        <p className="mt-0.5 truncate text-[13px] font-medium text-zinc-900">{latestSubmission.original_name}</p>
                                    </div>
                                    <span className="shrink-0 text-[12px] font-medium text-zinc-500">
                                        {latestSubmission.status.replace('_', ' ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
