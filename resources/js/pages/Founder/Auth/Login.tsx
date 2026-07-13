import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { cn } from '@/lib/utils';

interface PageProps {
    flash?: { success?: string; error?: string; info?: string };
}

export default function FounderLogin({ flash }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.login.store'));
    }

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 antialiased">
            <Head title="Sign In — Pinpoint Launchpad" />

            {/* ── Background SideRays ── */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <SideRays
                    rayColor1="#3A54A5"
                    rayColor2="#93C5FD"
                    origin="top-left"
                    speed={1.8}
                    intensity={1.2}
                    spread={2}
                    tilt={0}
                    saturation={1.5}
                    blend={0.35}
                    falloff={2.3}
                    opacity={0.35}
                />
            </div>

            {/* Ambient top glow */}
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px] opacity-15"
                style={{
                    background: 'radial-gradient(circle at top, #3A54A5, transparent 70%)',
                }}
            />

            {/* ── Card ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease }}
                >
                    <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10">
                        {/* Logo */}
                        <div className="mb-8 flex justify-center">
                            <PinpointLogo height={24} />
                        </div>

                        {/* Badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-[#3A54A5] uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                                Founder Portal
                            </span>
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] leading-tight font-extrabold tracking-tight text-zinc-950">
                            Welcome Back
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-zinc-555 font-medium">Sign in to your founder dashboard.</p>

                        {/* Flash messages */}
                        {flash?.info && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-blue-500/20 bg-blue-50 px-4 py-3 text-center text-[13px] font-bold text-blue-700 shadow-xs animate-fade-in"
                            >
                                {flash.info}
                            </div>
                        )}
                        {flash?.error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[13px] font-bold text-red-700 shadow-xs animate-fade-in"
                            >
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={cn(
                                        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400 shadow-xs focus:ring-2 focus:ring-[#3A54A5]/10',
                                        errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                            : 'border-zinc-200 focus:border-[#3A54A5]/60',
                                    )}
                                    placeholder="you@example.com"
                                    required
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-600 font-semibold">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={cn(
                                            'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400 shadow-xs focus:ring-2 focus:ring-[#3A54A5]/10',
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                                : 'border-zinc-200 focus:border-[#3A54A5]/60',
                                        )}
                                        placeholder="Your password"
                                        required
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
                                {errors.password && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-600 font-semibold">
                                        {errors.password}
                                    </p>
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
                                        <div className="h-4 w-4 rounded border border-zinc-200 bg-white transition-colors peer-checked:border-[#3A54A5]/60 peer-checked:bg-[#3A54A5]" />
                                        {data.remember && (
                                            <svg className="absolute inset-0 m-auto h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                <path
                                                    d="M1.5 5l2.5 2.5 4.5-4.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[12px] text-zinc-550 font-bold">Remember me</span>
                                </label>
                                <Link
                                    href={route('founder.password.request')}
                                    className="text-[12px] text-zinc-555 transition-colors duration-200 hover:text-zinc-950 font-bold"
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
                                className="group relative mt-1 w-full overflow-hidden rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.18em] text-white uppercase transition-all duration-200 outline-none hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-[#3A54A5]/25 hover:shadow-lg"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Signing In…
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-[11px] text-zinc-400 font-bold">OR</span>
                            <div className="h-px flex-1 bg-zinc-200" />
                        </div>

                        <p className="mt-5 text-center text-[12px] text-zinc-550 font-semibold">
                            New to Pinpoint? Complete the diagnostic to get started.{' '}
                            <Link
                                href={route('diagnostic.index')}
                                className="group inline-flex items-center gap-1 text-[#3A54A5] underline underline-offset-2 transition-colors duration-200 hover:text-[#2D4182] font-bold"
                            >
                                Take the Diagnostic
                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
