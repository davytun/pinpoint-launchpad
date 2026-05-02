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
    initial:    { opacity: 0, y: 16, filter: 'blur(4px)' },
    animate:    { opacity: 1, y: 0,  filter: 'blur(0px)' },
    transition: { duration: 0.5, ease, delay },
});

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
        <motion.div {...fadeUp(delay)} className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                <Icon className="size-3 shrink-0" />
                {label}
            </label>
            {children}
            {hint && !error && (
                <p className="ml-0.5 text-[11px] text-white/25">{hint}</p>
            )}
            {error && (
                <p className="ml-0.5 text-[11px] text-rose-400">{error}</p>
            )}
        </motion.div>
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

                {/* ── Left panel — context ── */}
                <motion.aside
                    {...fadeUp(0)}
                    className="flex w-full flex-col justify-between border-b border-white/[0.06] px-6 py-10 lg:w-[42%] lg:border-b-0 lg:border-r lg:px-14 lg:py-16"
                >
                    <div>
                        <PinpointLogo height={26} variant="dark" />

                        <div className="mt-14 hidden lg:block">
                            {/* Step track */}
                            <div className="mb-10 flex flex-col gap-3">
                                {[
                                    { n: '01', label: 'Confirm your details',   active: true  },
                                    { n: '02', label: 'Sign your agreement',    active: false },
                                    { n: '03', label: 'Access the PIN Network', active: false },
                                ].map((step) => (
                                    <div key={step.n} className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums',
                                                step.active
                                                    ? 'border-blue-500/60 bg-blue-500/15 text-blue-400'
                                                    : 'border-white/[0.08] bg-white/[0.03] text-white/20',
                                            )}
                                        >
                                            {step.n}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[13px] font-medium',
                                                step.active ? 'text-white/80' : 'text-white/25',
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5 border-t border-white/[0.06] pt-8">
                                <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white">
                                    One step before your audit begins.
                                </h1>
                                <p className="text-[14px] leading-relaxed text-white/45">
                                    Your name and entity will appear on the legally binding Pinpoint Investment
                                    Warrant. This takes under a minute.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tier pill — desktop only */}
                    <motion.div
                        {...fadeUp(0.25)}
                        className="mt-12 hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4 lg:block"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                                style={{
                                    color:       '#60A5FA',
                                    borderColor: 'rgba(37,99,235,0.3)',
                                    background:  'rgba(37,99,235,0.08)',
                                }}
                            >
                                {tier_label}
                            </span>
                            <span className="text-[12px] text-white/30">{email}</span>
                        </div>
                    </motion.div>
                </motion.aside>

                {/* ── Right panel — form ── */}
                <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:px-16 lg:py-0">
                    <motion.div
                        {...fadeUp(0.1)}
                        className="w-full max-w-[440px]"
                    >
                        {/* Mobile header */}
                        <div className="mb-8 lg:hidden">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                                Step 1 of 2
                            </p>
                            <h1 className="font-display text-2xl font-semibold text-white">
                                Confirm Your Details
                            </h1>
                        </div>

                        {/* Desktop heading */}
                        <div className="mb-8 hidden lg:block">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                                Step 1 of 2
                            </p>
                            <h2 className="font-display text-2xl font-semibold text-white">
                                Confirm Your Details
                            </h2>
                            <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                                These details appear on your signed warrant — enter them exactly as they should read legally.
                            </p>
                        </div>

                        {info && (
                            <motion.div
                                {...fadeUp(0.12)}
                                className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                            >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                                <p className="text-[13px] leading-relaxed text-amber-300">{info}</p>
                            </motion.div>
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
                                        'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none transition-all duration-200',
                                        errors.full_name
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                                            : 'border-white/[0.08] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10',
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
                                        'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none transition-all duration-200',
                                        errors.company_name
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                                            : 'border-white/[0.08] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10',
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
                                    className="w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-[14px] text-white/30 outline-none"
                                />
                            </Field>

                            <motion.div {...fadeUp(0.3)} className="pt-1">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-blue-600 px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.15em] text-white outline-none transition-all duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ boxShadow: '0 0 30px rgba(37,99,235,0.35)' }}
                                >
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
                            </motion.div>
                        </form>

                        <motion.div
                            {...fadeUp(0.35)}
                            className="mt-5 flex items-center justify-center gap-2"
                        >
                            <Lock className="size-3 shrink-0 text-white/20" />
                            <p className="text-[11px] text-white/25">
                                Your details are used only for the legal agreement and are never shared.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

            </div>
        </DiagnosticLayout>
    );
}
