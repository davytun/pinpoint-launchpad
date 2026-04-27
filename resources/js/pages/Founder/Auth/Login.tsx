import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

interface PageProps {
    flash?: { success?: string; error?: string; info?: string };
}

export default function FounderLogin({ flash }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.login.store'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
            <Head title="Sign In — Pinpoint Launchpad" />

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

                        {/* Badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                Founder Portal
                            </span>
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] font-semibold leading-tight tracking-tight text-white">
                            Welcome Back
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-white/40">
                            Sign in to your founder dashboard.
                        </p>

                        {/* Flash messages */}
                        {flash?.info && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center text-[13px] text-blue-300"
                            >
                                {flash.info}
                            </div>
                        )}
                        {flash?.error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-300"
                            >
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
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
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={[
                                        'w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                        errors.email
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                    ].join(' ')}
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={[
                                            'w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-11 text-[14px] text-white outline-none transition-all duration-200 placeholder:text-white/20',
                                            errors.password
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-white/[0.08] focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20',
                                        ].join(' ')}
                                        placeholder="Your password"
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
                                {errors.password && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-400">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me + Forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2.5">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-4 w-4 rounded border border-white/[0.15] bg-white/[0.04] transition-colors peer-checked:border-blue-500/60 peer-checked:bg-blue-600/80" />
                                        {data.remember && (
                                            <svg className="absolute inset-0 m-auto h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[12px] text-white/30">Remember me</span>
                                </label>
                                <Link
                                    href={route('founder.password.request')}
                                    className="text-[12px] text-white/30 transition-colors duration-200 hover:text-white"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                aria-label={processing ? 'Signing in, please wait' : 'Sign In'}
                                className="group relative mt-1 w-full overflow-hidden rounded-xl bg-blue-600 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ boxShadow: '0 0 28px rgba(37,99,235,0.35)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Signing In…
                                        </>
                                    ) : (
                                        'Sign In →'
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/[0.06]" />
                            <span className="text-[11px] text-white/20">OR</span>
                            <div className="h-px flex-1 bg-white/[0.06]" />
                        </div>

                        <p className="mt-5 text-center text-[12px] text-white/25">
                            New to Pinpoint? Complete the diagnostic to get started.{' '}
                            <Link
                                href={route('diagnostic.index')}
                                className="text-white/40 underline underline-offset-2 transition-colors duration-200 hover:text-white"
                            >
                                Take the Diagnostic →
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
