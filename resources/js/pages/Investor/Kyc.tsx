import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, Clock3, FileLock2, Mail, MapPin, Phone, ShieldCheck, UploadCloud, User, XCircle } from 'lucide-react';

function ProfileItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3A54A5]/60" />
            <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900">{value}</p>
            </div>
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

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('investor.kyc.store'), { forceFormData: true });
    };

    return (
        <>
            <Head title="KYC Verification" />
            <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] text-zinc-900 selection:bg-[#3A54A5]/10">
                <div className="pointer-events-none fixed inset-0 opacity-40">
                    <SideRays
                        rayColor1="#3A54A5"
                        rayColor2="#BFDBFE"
                        origin="top-left"
                        speed={1.2}
                        intensity={0.7}
                        spread={2.5}
                        tilt={-5}
                        saturation={1.2}
                        blend={0.3}
                        falloff={2}
                        opacity={0.3}
                    />
                </div>

                <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
                    <PinpointLogo height={24} />
                    <div className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold text-zinc-600 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-md">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure Session
                    </div>
                </header>

                <main className="relative z-10 mx-auto max-w-6xl px-6 pt-4 pb-20">
                    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                        {/* Left Column: Context & Profile Card */}
                        <div className="flex flex-col justify-center lg:col-span-5">
                            <p className="text-xs font-extrabold tracking-[0.16em] text-[#3A54A5] uppercase">Step 2 of 2</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Verify your identity</h1>
                            <p className="mt-4 text-base leading-relaxed text-zinc-600">
                                To unlock protected investor access, our compliance team needs to verify the identity associated with your account.
                            </p>

                            {/* Beautiful Glassmorphic Profile Card */}
                            <div className="mt-10 overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-1 shadow-[0_8px_40px_rgba(33,56,120,0.06)] backdrop-blur-xl">
                                <div className="rounded-[22px] bg-linear-to-br from-white/80 to-white/40 p-7 shadow-sm ring-1 ring-black/5">
                                    <div className="flex items-center justify-between border-b border-zinc-200/60 pb-5">
                                        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Registered Profile</h2>
                                        <span className="rounded-md bg-[#3A54A5]/10 px-2 py-1 text-[10px] font-black tracking-wider text-[#3A54A5] uppercase">
                                            {isCorporate ? 'Corporate' : 'Individual'}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex flex-col gap-5">
                                        <ProfileItem icon={User} label="Full Name" value={investor.profile.full_name} />
                                        {isCorporate && <ProfileItem icon={Building2} label="Company Name" value={investor.profile.company_name} />}
                                        <ProfileItem icon={Mail} label="Email Address" value={investor.email} />
                                        <ProfileItem icon={Phone} label="Phone Number" value={investor.profile.phone} />
                                        <ProfileItem icon={MapPin} label="Address" value={investor.profile.address} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Upload Form */}
                        <div className="lg:col-span-7">
                            <div className="rounded-4xl border border-white/80 bg-white p-8 shadow-[0_20px_60px_rgba(33,56,120,0.08)] sm:p-12 lg:mt-6">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#3A54A5]/5 text-[#3A54A5] ring-1 ring-[#3A54A5]/10">
                                    <FileLock2 className="h-7 w-7" />
                                </div>
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                                        {isApproved ? 'Verification complete' : isPending ? 'Document under review' : `Upload ${documentLabel}`}
                                    </h2>
                                    <Badge
                                        className={
                                            isApproved
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : isRejected
                                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                  : isPending
                                                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                                                    : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                                        }
                                    >
                                        {investor.kyc_status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-sm text-zinc-500">
                                    {isApproved
                                        ? 'Your identity has been verified. Protected investor content is now available to you.'
                                        : isPending
                                          ? 'Our compliance team is reviewing your document. We will notify you when a decision is ready.'
                                          : `Please provide a clear, readable copy of your ${documentLabel.toLowerCase()}.`}
                                </p>

                                {isRejected && latestSubmission?.review_notes && (
                                    <Alert className="mt-6 border-rose-200 bg-rose-50 text-rose-950 [&>svg]:text-rose-600">
                                        <XCircle className="h-4 w-4" />
                                        <AlertTitle className="font-bold">Reviewer note</AlertTitle>
                                        <AlertDescription className="text-rose-800">{latestSubmission.review_notes}</AlertDescription>
                                    </Alert>
                                )}

                                {isApproved ? (
                                    <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                        <p className="text-sm leading-relaxed">
                                            You do not need to submit another document. Your access remains available while your account is active.
                                        </p>
                                    </div>
                                ) : isPending ? (
                                    <div className="mt-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
                                        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                        <p className="text-sm leading-relaxed">
                                            A document is already in review. To keep the decision clear and secure, new uploads are unavailable until
                                            the review is complete.
                                        </p>
                                    </div>
                                ) : (
                                    <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                                        <label
                                            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                                                form.data.document
                                                    ? 'border-[#3A54A5] bg-[#3A54A5]/2'
                                                    : 'border-zinc-200 bg-zinc-50 hover:border-[#3A54A5]/50 hover:bg-[#3A54A5]/2'
                                            }`}
                                        >
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="sr-only"
                                                onChange={(e) => form.setData('document', e.target.files?.[0] ?? null)}
                                            />
                                            <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-[#3A54A5]/20">
                                                <UploadCloud
                                                    className={`h-6 w-6 ${form.data.document ? 'text-[#3A54A5]' : 'text-zinc-400 group-hover:text-[#3A54A5]'}`}
                                                />
                                            </div>
                                            <span className="mt-5 block text-base font-bold text-zinc-900">
                                                {form.data.document ? form.data.document.name : `Select your ${documentLabel}`}
                                            </span>
                                            <span className="mt-2 block text-sm font-medium text-zinc-500">
                                                {form.data.document ? 'Click to change file' : 'PDF, JPG or PNG. Maximum 10 MB.'}
                                            </span>
                                        </label>

                                        {form.errors.document && <p className="text-sm font-semibold text-rose-600">{form.errors.document}</p>}

                                        <Button
                                            type="submit"
                                            disabled={!form.data.document || form.processing}
                                            className="h-14 w-full rounded-2xl bg-[#3A54A5] text-base font-bold shadow-lg shadow-[#3A54A5]/20 transition-all hover:bg-[#2D4182] hover:shadow-xl hover:shadow-[#3A54A5]/30 active:scale-[0.98]"
                                        >
                                            {form.processing
                                                ? 'Uploading…'
                                                : isRejected
                                                    ? 'Resubmit Document for Review'
                                                    : 'Submit Document for Review'}
                                        </Button>
                                    </form>
                                )}

                                {latestSubmission && (
                                    <div className="mt-8 flex items-center justify-between rounded-xl bg-zinc-50 px-5 py-4 ring-1 ring-zinc-200/50">
                                        <div>
                                            <p className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Latest Submission</p>
                                            <p className="mt-0.5 text-sm font-medium text-zinc-900">{latestSubmission.original_name}</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                                            {latestSubmission.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
