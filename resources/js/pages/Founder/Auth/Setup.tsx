import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

interface PageProps {
    email: string | null;
    token: string;
    full_name?: string | null;
    company_name?: string | null;
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
    const steps = [
        { label: 'Payment',  done: true },
        { label: 'Signing',  done: true },
        { label: 'Account',  done: current >= 2 },
    ];
    return (
        <div className="mb-8 flex items-center justify-center gap-3">
            {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={[
                                'h-2 w-2 rounded-full transition-all duration-300',
                                step.done
                                    ? i === current
                                        ? 'scale-125 bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)] ring-2 ring-blue-500/30'
                                        : 'bg-blue-500'
                                    : 'bg-white/[0.12]',
                            ].join(' ')}
                        />
                        <span
                            className={[
                                'text-[9px] font-bold uppercase tracking-[0.16em]',
                                step.done ? 'text-blue-400/80' : 'text-white/20',
                            ].join(' ')}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={[
                                'mb-4 h-px w-8',
                                step.done ? 'bg-blue-500/40' : 'bg-white/[0.08]',
                            ].join(' ')}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderSetup({ email, token, full_name, company_name }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token:                 token,
        email:                 email ?? '',
        full_name:             full_name ?? '',
        company_name:          company_name ?? '',
        password:              '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.setup.store'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
            <Head title="Set Up Account — Pinpoint Launchpad" />

            {/* ── Background ── */}
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-wireframe pointer-events-none absolute -left-[15%] top-[15%] z-0 aspect-square w-[110vw] max-w-[600px] opacity-30 mix-blend-overlay" />
            <div className="waitlist-wireframe waitlist-float-delay pointer-events-none absolute -right-[15%] top-[40%] z-0 aspect-square w-[90vw] max-w-[500px] opacity-20 mix-blend-overlay" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[400px]"
                style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
            />

            {/* ── Card ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div
                        className="overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-10"
                    >
                        {/* Logo */}
                        <div className="mb-7 flex justify-center">
                            <PinpointLogo height={24} variant="dark" />
                        </div>

                        <ProgressDots current={2} />

                        {/* Badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                Final Step
                            </span>
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] font-semibold leading-tight tracking-tight text-white">
                            Set Up Your Account
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-white/40">
                            Create your password to access your founder dashboard.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="hidden" name="token" value={data.token} />

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="full_name"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    className={[
                                        'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                        errors.full_name
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                    ].join(' ')}
                                    placeholder="Jane Smith"
                                />
                                {errors.full_name && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.full_name}</p>
                                )}
                            </div>

                            {/* Company Name */}
                            <div>
                                <label
                                    htmlFor="company_name"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Company / Venture Name
                                </label>
                                <input
                                    id="company_name"
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className={[
                                        'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                        errors.company_name
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                    ].join(' ')}
                                    placeholder="Acme Corp"
                                />
                                {errors.company_name && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.company_name}</p>
                                )}
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <label
                                    htmlFor="setup_email"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="setup_email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-[14px] text-white/40 opacity-60 outline-none"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        className={[
                                            'w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-11 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                            errors.password
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                        ].join(' ')}
                                        placeholder="Minimum 8 characters"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                                    >
                                        {showPassword
                                            ? <EyeOff className="size-4" aria-hidden="true" />
                                            : <Eye    className="size-4" aria-hidden="true" />}
                                    </button>
                                </div>
                                {errors.password ? (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.password}</p>
                                ) : (
                                    <p className="mt-1.5 text-[11px] text-white/20">Minimum 8 characters</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        className={[
                                            'w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-11 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                            errors.password_confirmation
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                        ].join(' ')}
                                        placeholder="Repeat your password"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                                    >
                                        {showConfirm
                                            ? <EyeOff className="size-4" aria-hidden="true" />
                                            : <Eye    className="size-4" aria-hidden="true" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                aria-label={processing ? 'Creating account, please wait' : 'Create My Account'}
                                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-blue-600 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ boxShadow: '0 0 28px rgba(37,99,235,0.35)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Creating Account…
                                        </>
                                    ) : (
                                        <>
                                            Create My Account
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Security note */}
                        <div className="mt-5 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="size-3.5 text-emerald-500/60" aria-hidden="true" />
                            <p className="text-[11px] text-white/20">
                                Secured with industry-standard encryption.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
