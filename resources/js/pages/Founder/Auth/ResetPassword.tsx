import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

interface PageProps {
    token: string;
    email: string;
}

export default function FounderResetPassword({ token, email }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password:              '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.password.update'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
            <Head title="Set New Password — Pinpoint Launchpad" />

            {/* ── Background ── */}
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-wireframe pointer-events-none absolute -left-[15%] top-[15%] z-0 aspect-square w-[110vw] max-w-[600px] opacity-30 mix-blend-overlay" />
            <div className="waitlist-wireframe waitlist-float-delay pointer-events-none absolute -right-[15%] top-[40%] z-0 aspect-square w-[90vw] max-w-[500px] opacity-20 mix-blend-overlay" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[400px]"
                style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
            />

            {/* ── Card ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-10">

                        {/* Logo */}
                        <div className="mb-8 flex justify-center">
                            <PinpointLogo height={24} variant="dark" />
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] font-semibold leading-tight tracking-tight text-white">
                            Set New Password
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-white/40">
                            Choose a strong password for your account.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Hidden fields */}
                            <input type="hidden" name="token" value={data.token} />
                            <input type="hidden" name="email" value={data.email} />

                            {/* Email (display) */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-[14px] text-white/40 opacity-60 outline-none"
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    New Password
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
                                aria-label={processing ? 'Resetting password, please wait' : 'Reset Password'}
                                className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ boxShadow: '0 0 28px rgba(37,99,235,0.35)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Resetting…
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
