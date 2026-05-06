import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';

interface PageProps {
    flash?: { success?: string; error?: string };
}

export default function FounderForgotPassword({ flash }: PageProps) {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        email: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.password.email'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
            <Head title="Reset Password — Pinpoint Launchpad" />

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
                    <div className="overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-10">

                        {/* Logo */}
                        <div className="mb-8 flex justify-center">
                            <PinpointLogo height={24} variant="dark" />
                        </div>

                        <h1 className="font-display mb-1.5 text-center text-[22px] font-semibold leading-tight tracking-tight text-white">
                            Reset Password
                        </h1>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-white/40">
                            Enter your email and we'll send you a reset link.
                        </p>

                        {/* Success state */}
                        {(wasSuccessful || flash?.success) && (
                            <div
                                role="status"
                                className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-[13px] leading-relaxed text-emerald-300"
                            >
                                {flash?.success ?? 'If an account exists with that email, you will receive a reset link shortly.'}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
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

                            <button
                                type="submit"
                                disabled={processing}
                                aria-busy={processing}
                                aria-label={processing ? 'Sending reset link, please wait' : 'Send Reset Link'}
                                className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ boxShadow: '0 0 28px rgba(37,99,235,0.35)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                            Sending…
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <Link
                                href={route('founder.login')}
                                className="text-[12px] text-white/30 transition-colors duration-200 hover:text-white"
                            >
                                ← Back to Sign In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
