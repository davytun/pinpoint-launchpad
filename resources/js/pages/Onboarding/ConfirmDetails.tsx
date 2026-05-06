import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Building2, Lock, Loader2, Mail, User } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    email:      string;
    tier_label: string;
    info?:      string | null;
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 12 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease, delay },
});

function FadeUp({ delay = 0, className, children }: { delay?: number; className?: string; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function Field({
    label,
    hint,
    icon: Icon,
    error,
    children,
    delay,
}: {
    label:    string;
    hint?:    string;
    icon:     React.ElementType;
    error?:   string;
    children: React.ReactNode;
    delay:    number;
}) {
    return (
        <FadeUp delay={delay}>
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#576FA8]">
                    <Icon className="size-3 shrink-0" />
                    {label}
                </label>
            {children}
                {hint && !error && (
                    <p className="ml-0.5 text-[11px] text-[#576FA8]/60">{hint}</p>
                )}
                {error && (
                    <p className="ml-0.5 text-[11px] text-rose-400">{error}</p>
                )}
            </div>
        </FadeUp>
    );
}

export default function ConfirmDetails({ email, tier_label, info }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        full_name:    '',
        company_name: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('onboarding.confirm-details'));
    }

    return (
        <DiagnosticLayout glowColor="#2563EB" hideWordmark>
            <Head title="Confirm Your Details — PARAGON Certification" />

            <div className="flex min-h-screen flex-col lg:flex-row">

                {/* ── Sidebar — hidden on mobile, fixed width on md+ ── */}
                <div
                    className="flex w-full flex-col justify-between border-b border-[#232C43] bg-[#080B11] px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:w-[42%] lg:border-b-0 lg:border-r lg:px-14 lg:py-16"
                >
                    <FadeUp delay={0} className="flex flex-1 flex-col">
                        <div>
                            <PinpointLogo height={26} variant="dark" />

                            <div className="mt-14 hidden lg:block">
                                {/* Step tracker */}
                                <div className="mb-10 flex flex-col gap-3">
                                    {[
                                        { n: '01', label: 'Confirm your details',   state: 'active' },
                                        { n: '02', label: 'Sign your agreement',    state: 'pending' },
                                        { n: '03', label: 'Access the PIN Network', state: 'pending' },
                                    ].map((step) => (
                                        <div key={step.n} className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums transition-colors',
                                                    step.state === 'active' ? 'border-[#4468BB]/50 bg-[#4468BB]/10 text-[#6986C9]' : 'border-[#232C43] bg-[#0C1427] text-[#576FA8]'
                                                )}
                                            >
                                                {step.n}
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-[13px] font-medium transition-colors',
                                                    step.state === 'active' ? 'text-[#ECF0F9]' : 'text-[#455987]'
                                                )}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-5 border-t border-[#232C43] pt-8">
                                    <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white">
                                        One step before your audit begins.
                                    </h1>
                                    <p className="text-[14px] leading-relaxed text-[#788CBA]">
                                        Your name and entity will appear on the legally binding Pinpoint Investment
                                        Warrant. This takes under a minute.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeUp>

                    {/* Tier pill — desktop only */}
                    <FadeUp delay={0.25}>
                        <div className="mt-12 hidden rounded-xl border border-[#232C43] bg-[#101623] px-5 py-4 lg:block">
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-flex items-center rounded-full border border-[#4468BB]/30 bg-[#4468BB]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#60A5FA]"
                                >
                                    {tier_label}
                                </span>
                                <span className="text-[12px] text-[#576FA8]">{email}</span>
                            </div>
                        </div>
                    </FadeUp>
                </div>

                {/* ── Right panel — form ── */}
                <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:px-16 lg:py-0">
                    <motion.div
                        {...fadeUp(0.1)}
                        className="w-full max-w-[440px]"
                    >
                        {/* Mobile header */}
                        <div className="mb-8 lg:hidden">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#576FA8]">
                                Step 1 of 2
                            </p>
                            <h1 className="font-display text-2xl font-semibold text-[#ECF0F9]">
                                Confirm Your Details
                            </h1>
                        </div>

                        {/* Desktop heading */}
                        <div className="mb-8 hidden lg:block">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#576FA8]">
                                Step 1 of 2
                            </p>
                            <h2 className="font-display text-2xl font-semibold text-[#ECF0F9]">
                                Confirm Your Details
                            </h2>
                            <p className="mt-2 text-[13px] leading-relaxed text-[#788CBA]">
                                These details appear on your signed warrant — enter them exactly as they should read legally.
                            </p>
                        </div>

                        {info && (
                            <FadeUp delay={0.12}>
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                                    <p className="text-[13px] leading-relaxed text-amber-400/90">{info}</p>
                                </div>
                            </FadeUp>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <Field
                                label="Full Name"
                                hint="As it should appear on the legal document"
                                icon={User}
                                error={errors.full_name}
                                delay={0.15}
                            >
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={e => setData('full_name', e.target.value)}
                                    placeholder="e.g. John Adeyemi"
                                    disabled={processing}
                                    autoFocus
                                    className={cn(
                                        'w-full rounded-xl border bg-[#1B294B]/20 px-4 py-3 text-[14px] text-[#ECF0F9] placeholder:text-[#576FA8]/40 outline-none transition-all duration-200',
                                        errors.full_name
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                                            : 'border-[#232C43] focus:border-[#4468BB]/60 focus:ring-2 focus:ring-[#4468BB]/10',
                                    )}
                                />
                            </Field>

                            <Field
                                label="Company / Venture Name"
                                hint="The legal entity signing this agreement"
                                icon={Building2}
                                error={errors.company_name}
                                delay={0.2}
                            >
                                <input
                                    type="text"
                                    value={data.company_name}
                                    onChange={e => setData('company_name', e.target.value)}
                                    placeholder="e.g. Acme Technologies Ltd."
                                    disabled={processing}
                                    className={cn(
                                        'w-full rounded-xl border bg-[#1B294B]/20 px-4 py-3 text-[14px] text-[#ECF0F9] placeholder:text-[#576FA8]/40 outline-none transition-all duration-200',
                                        errors.company_name
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                                            : 'border-[#232C43] focus:border-[#4468BB]/60 focus:ring-2 focus:ring-[#4468BB]/10',
                                    )}
                                />
                            </Field>

                            <Field
                                label="Email Address"
                                icon={Mail}
                                delay={0.25}
                            >
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-[#232C43] bg-[#0C1427] px-4 py-3 text-[14px] text-[#576FA8] outline-none"
                                />
                            </Field>

                            <FadeUp delay={0.3}>
                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#4468BB] px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.15em] text-white outline-none transition-all duration-200 hover:bg-[#3b5ba5] disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{ boxShadow: '0 0 30px rgba(68,104,187,0.3)' }}
                                    >
                                        <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                        {processing ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Generating your document…
                                            </>
                                        ) : (
                                            <>
                                                Prepare My Agreement
                                                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </FadeUp>
                        </form>

                        <FadeUp delay={0.35}>
                            <div className="mt-5 flex items-center justify-center gap-2">
                                <Lock className="size-3 shrink-0 text-[#576FA8]/40" />
                                <p className="text-[11px] text-[#576FA8]/60">
                                    Your details are used only for the legal agreement and are never shared.
                                </p>
                            </div>
                        </FadeUp>
                    </motion.div>
                </div>

            </div>
        </DiagnosticLayout>
    );
}
