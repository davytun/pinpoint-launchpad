import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { cn } from '@/lib/utils';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 antialiased">
            <Head title="Forgot password — Pinpoint" />

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

                        <h1 className="font-display mb-1.5 text-center text-[22px] leading-tight font-extrabold tracking-tight text-zinc-950">
                            Forgot password
                        </h1>
                        <p className="text-zinc-555 mb-8 text-center text-[13px] leading-relaxed font-medium">
                            Enter your email to receive a password reset link
                        </p>

                        {status && (
                            <div className="animate-fade-in mb-5 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-center text-[13px] font-bold text-emerald-700 shadow-xs">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={cn(
                                        'text-zinc-955 w-full rounded-xl border bg-white px-4 py-3 text-[14px] shadow-xs transition-all duration-200 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[#3A54A5]/10',
                                        errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                                            : 'border-zinc-200 focus:border-[#3A54A5]/60',
                                    )}
                                    placeholder="email@example.com"
                                    autoFocus
                                    required
                                />
                                {errors.email && (
                                    <p role="alert" className="mt-1.5 text-[11px] font-semibold text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.18em] text-white uppercase shadow-md shadow-[#3A54A5]/25 transition-all duration-200 outline-none hover:bg-[#2D4182] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Sending Link…
                                        </>
                                    ) : (
                                        'Email password reset link'
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="text-zinc-555 mt-7 text-center text-sm font-semibold">
                            <span>Or, return to </span>
                            <Link
                                href={route('login')}
                                className="font-bold text-[#3A54A5] underline underline-offset-2 transition-colors hover:text-[#2D4182]"
                            >
                                log in
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
