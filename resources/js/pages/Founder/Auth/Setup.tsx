import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    email: string | null;
    token: string;
    full_name?: string | null;
    company_name?: string | null;
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
    const steps = [
        { label: 'Payment', done: true },
        { label: 'Signing', done: true },
        { label: 'Account', done: current >= 2 },
    ];
    return (
        <div className="mb-8 flex items-center justify-center gap-3">
            {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={cn(
                                'h-2 w-2 rounded-full transition-all duration-300',
                                step.done
                                    ? i === current
                                        ? 'scale-125 bg-[#3A54A5] shadow-[0_0_8px_rgba(58,84,165,0.4)] ring-2 ring-[#3A54A5]/20'
                                        : 'bg-[#3A54A5]'
                                    : 'bg-zinc-200',
                            )}
                        />
                        <span
                            className={cn(
                                'text-[9px] font-bold tracking-[0.16em] uppercase',
                                step.done ? 'text-[#3A54A5]' : 'text-zinc-400',
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={cn('mb-4 h-px w-8', step.done ? 'bg-[#3A54A5]/30' : 'bg-zinc-200')} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderSetup({ email, token, full_name, company_name }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email ?? '',
        full_name: full_name ?? '',
        company_name: company_name ?? '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.setup.store'));
    }

    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Set Up Account — Pinpoint Launchpad" />

            {/* ── Card ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10">
                        {/* Logo */}
                        <div className="mb-7 flex justify-center">
                            <PinpointLogo height={24} />
                        </div>

                        <ProgressDots current={2} />

                        {/* Badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#3A54A5]/20 bg-[#3A54A5]/5 px-4 py-1.5 text-[10px] font-bold tracking-widest text-[#3A54A5] uppercase backdrop-blur-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                                Final Step
                            </span>
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] leading-tight font-extrabold tracking-tight text-zinc-950">
                            Set Up Your Account
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-zinc-550">
                            Create your password to access your founder dashboard.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="hidden" name="token" value={data.token} />

                            {/* Full Name */}
                            <div>
                                <label htmlFor="full_name" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Full Name
                                </label>
                                <input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    className={cn(
                                        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400',
                                        errors.full_name
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                            : 'border-zinc-200/80 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10',
                                    )}
                                    placeholder="Jane Smith"
                                />
                                {errors.full_name && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-500">
                                        {errors.full_name}
                                    </p>
                                )}
                            </div>

                            {/* Company Name */}
                            <div>
                                <label
                                    htmlFor="company_name"
                                    className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase"
                                >
                                    Company / Venture Name
                                </label>
                                <input
                                    id="company_name"
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className={cn(
                                        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400',
                                        errors.company_name
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                            : 'border-zinc-200/80 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10',
                                    )}
                                    placeholder="Acme Corp"
                                />
                                {errors.company_name && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-500">
                                        {errors.company_name}
                                    </p>
                                )}
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <label htmlFor="setup_email" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Email Address
                                </label>
                                <input
                                    id="setup_email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[14px] text-zinc-500 outline-none"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        className={cn(
                                            'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400',
                                            errors.password
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                                : 'border-zinc-200/80 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10',
                                        )}
                                        placeholder="Minimum 8 characters"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-650"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="size-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                {errors.password ? (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-500">
                                        {errors.password}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-[11px] text-zinc-400">Minimum 8 characters</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase"
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
                                        className={cn(
                                            'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400',
                                            errors.password_confirmation
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                                                : 'border-zinc-200/80 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10',
                                        )}
                                        placeholder="Repeat your password"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-650"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="size-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="size-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-500">
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
                                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.18em] text-white uppercase transition-all duration-200 outline-none hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ boxShadow: '0 4px 14px rgba(58,84,165,0.25)' }}
                            >
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
                            <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
                            <p className="text-[11px] text-zinc-400">Secured with industry-standard encryption.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
