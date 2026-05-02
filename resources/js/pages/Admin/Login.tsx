import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function AdminLogin({ status }: { status?: string }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen bg-[#080B11] text-[#ECF0F9] antialiased">
            <Head title="Admin Sign In — Pinpoint" />

            {/* Background layers */}
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(68,104,187,0.12) 0%, transparent 100%)' }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
                <motion.div
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease }}
                >
                    {/* Logo + heading */}
                    <div className="mb-8 text-center">
                        <img src="/pinpoint-logo.png" alt="Pinpoint" className="mx-auto mb-6 block h-6 w-auto select-none opacity-60" style={{ maxWidth: 130 }} />
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#576FA8]">Internal Access</p>
                        <h1 className="text-[22px] font-semibold tracking-tight text-[#ECF0F9]">Admin Sign In</h1>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-[13px] text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-[#788CBA]">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#576FA8]" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@pinpointlaunchpad.com"
                                    className="w-full rounded-xl border border-[#232C43] bg-[#1B294B]/30 py-2.5 pl-10 pr-4 text-[13px] text-[#ECF0F9] placeholder-[#576FA8] outline-none transition focus:border-[#4468BB]/50 focus:ring-2 focus:ring-[#4468BB]/10"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-[11px] text-rose-400">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-[#788CBA]">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#576FA8]" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-[#232C43] bg-[#1B294B]/30 py-2.5 pl-10 pr-10 text-[13px] text-[#ECF0F9] placeholder-[#576FA8] outline-none transition focus:border-[#4468BB]/50 focus:ring-2 focus:ring-[#4468BB]/10"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#576FA8] transition hover:text-[#788CBA]"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-[11px] text-rose-400">{errors.password}</p>}
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-[#232C43] bg-[#101623] accent-[#4468BB]"
                            />
                            <label htmlFor="remember" className="text-[12px] text-[#788CBA] select-none cursor-pointer">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4468BB] py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#3C53A8] disabled:opacity-60"
                            style={{ boxShadow: '0 0 28px rgba(68,104,187,0.25)' }}
                        >
                            {processing ? <LoaderCircle className="size-4 animate-spin" /> : null}
                            {processing ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[11px] text-[#576FA8]">
                        This portal is for Pinpoint internal staff only.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
