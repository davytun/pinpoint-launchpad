import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2, LockKeyhole, Mail, User } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    email: string;
    tier_label: string;
    info?: string | null;
}

function Field({
    label,
    hint,
    icon: Icon,
    error,
    children,
}: {
    label: string;
    hint?: string;
    icon: React.ElementType;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-zinc-600 uppercase">
                <Icon className="size-3.5 shrink-0 text-[#3A54A5]" aria-hidden="true" />
                {label}
            </label>
            {children}
            {hint && !error && <p className="text-xs leading-relaxed text-zinc-500">{hint}</p>}
            {error && <p className="text-xs leading-relaxed text-rose-600">{error}</p>}
        </div>
    );
}

export default function ConfirmDetails({ email, tier_label, info }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        company_name: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('onboarding.confirm-details'));
    }

    const fieldClassName = (hasError?: string) =>
        cn(
            'w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] text-zinc-900 shadow-[0_1px_2px_rgba(24,32,56,0.02)] outline-none transition duration-200 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-4 focus:ring-[#3A54A5]/10 disabled:cursor-not-allowed disabled:bg-zinc-50',
            hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-zinc-200',
        );

    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Prepare your PIA agreement | PARAGON Certification" />

            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                <header className="flex items-center justify-between">
                    <PinpointLogo height={28} />
                    <span className="hidden text-xs font-medium text-zinc-500 sm:block">PARAGON Investment Assessment</span>
                </header>

                <main className="flex flex-1 items-center py-12 lg:py-16">
                    <div className="w-full">
                        <div className="mb-8 max-w-2xl lg:mb-10">
                            <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">PIA agreement</p>
                            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-zinc-950 sm:text-4xl">
                                Confirm the details for your agreement.
                            </h1>
                            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-600">
                                Use the founder and company names exactly as they should appear in the PIA agreement.
                            </p>
                        </div>

                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
                            <section className="rounded-3xl border border-white/80 bg-[oklch(0.995_0.002_260)] p-6 shadow-[0_20px_60px_rgba(38,57,116,0.10)] sm:p-8">
                                <div className="mb-8 flex items-end justify-between gap-4 border-b border-zinc-200/80 pb-5">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">Your details</p>
                                        <p className="mt-1 text-sm text-zinc-500">This information will be used to prepare the document.</p>
                                    </div>
                                    <span className="shrink-0 text-xs font-semibold text-[#3A54A5]">Step 1 of 2</span>
                                </div>

                                {info && (
                                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
                                        <p className="text-sm leading-relaxed text-amber-900">{info}</p>
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    <Field label="Full name" hint="The founder who will sign the PIA agreement" icon={User} error={errors.full_name}>
                                        <input
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="e.g. John Adeyemi"
                                            disabled={processing}
                                            autoFocus
                                            className={fieldClassName(errors.full_name)}
                                        />
                                    </Field>

                                    <Field
                                        label="Company or venture name"
                                        hint="Use the company’s legal name, or its operating name if it is not yet incorporated"
                                        icon={Building2}
                                        error={errors.company_name}
                                    >
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="e.g. Acme Technologies Ltd."
                                            disabled={processing}
                                            className={fieldClassName(errors.company_name)}
                                        />
                                    </Field>

                                    <Field label="Email address" hint="We will use this address for the secure signing link" icon={Mail}>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100/80 px-4 py-3.5 text-[15px] text-zinc-600 outline-none"
                                        />
                                    </Field>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.12em] text-white uppercase shadow-[0_10px_22px_rgba(58,84,165,0.20)] transition duration-200 hover:bg-[#2e4388] hover:shadow-[0_14px_28px_rgba(58,84,165,0.26)] focus-visible:ring-4 focus-visible:ring-[#3A54A5]/25 focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {processing ? 'Preparing your agreement…' : 'Continue to agreement'}
                                            {!processing && <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />}
                                        </button>
                                        <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-zinc-500">
                                            <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                                            Your information is used only to prepare your agreement.
                                        </p>
                                    </div>
                                </form>
                            </section>

                            <aside className="border-y border-[#3A54A5]/15 py-6 lg:mt-1 lg:border-y-0 lg:border-t lg:pt-7">
                                <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Assessment requested</p>
                                <p className="mt-3 text-lg font-bold leading-snug text-zinc-950">{tier_label}</p>

                                <ol className="mt-8 space-y-6">
                                    <li className="flex gap-3.5">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3A54A5] text-[11px] font-bold text-white">1</span>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Confirm your details</p>
                                            <p className="mt-1 text-sm leading-relaxed text-zinc-600">We prepare the agreement using the information on this page.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3.5">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#3A54A5]/25 bg-white text-[11px] font-bold text-[#3A54A5]">2</span>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Review and sign</p>
                                            <p className="mt-1 text-sm leading-relaxed text-zinc-600">Check the agreement, then sign to activate your Founder workspace.</p>
                                        </div>
                                    </li>
                                </ol>

                                <div className="mt-8 border-t border-[#3A54A5]/15 pt-5">
                                    <p className="text-sm leading-relaxed text-zinc-600">
                                        Need to correct your assessment details? Contact Pinpoint before signing.
                                    </p>
                                    <a
                                        href="mailto:support@pinpointlaunchpad.com"
                                        className="mt-2 inline-flex text-sm font-bold text-[#3A54A5] underline decoration-[#3A54A5]/30 underline-offset-4 transition hover:decoration-[#3A54A5] focus-visible:ring-2 focus-visible:ring-[#3A54A5]/25 focus-visible:outline-none"
                                    >
                                        Contact Pinpoint
                                    </a>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>
            </div>
        </DiagnosticLayout>
    );
}
