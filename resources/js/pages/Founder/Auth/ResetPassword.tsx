import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { cn } from '@/lib/utils';

interface PageProps {
    token: string;
    email: string;
}

export default function FounderResetPassword({ token, email }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.password.update'));
    }

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 antialiased">
            <Head title="Set New Password — Pinpoint Launchpad" />

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

                        <h1 className="font-display mb-1.5 text-center text-[22px] leading-tight font-extrabold tracking-tight text-zinc-955">
                            Set New Password
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-zinc-555 font-medium">Choose a strong password for your account.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Hidden fields */}
                            <input type="hidden" name="token" value={data.token} />
                            <input type="hidden" name="email" value={data.email} />

                            {/* Email (display) */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-500 shadow-xs outline-none"
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-605 font-semibold">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        className={cn(
                                            'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400 shadow-xs focus:ring-2 focus:ring-[#3A54A5]/10',
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                                : 'border-zinc-200 focus:border-[#3A54A5]/60',
                                        )}
                                        placeholder="Minimum 8 characters"
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
                                {errors.password ? (
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-600 font-semibold">
                                        {errors.password}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-[11px] text-zinc-400 font-semibold">Minimum 8 characters</p>
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
                                            'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-zinc-950 transition-all duration-200 outline-none placeholder:text-zinc-400 shadow-xs focus:ring-2 focus:ring-[#3A54A5]/10',
                                            errors.password_confirmation
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                                : 'border-zinc-200 focus:border-[#3A54A5]/60',
                                        )}
                                        placeholder="Repeat your password"
                                        required
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
                                    <p role="alert" className="mt-1.5 text-[11px] text-red-600 font-semibold">
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
                                className="group relative w-full overflow-hidden rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.18em] text-white uppercase transition-all duration-200 outline-none hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-[#3A54A5]/25 hover:shadow-lg"
                            >
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
