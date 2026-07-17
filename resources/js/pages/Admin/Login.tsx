import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';

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
        post(route('admin.login.store'), { onFinish: () => reset('password') });
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 antialiased">
            <Head title="Admin Sign In — Pinpoint" />

            {/* Background SideRays */}
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

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
                <motion.div
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease }}
                >
                    <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10">
                        {/* Logo + heading */}
                        <div className="mb-8 text-center">
                            <div className="mb-6 flex justify-center">
                                <PinpointLogo height={24} />
                            </div>
                            <p className="mb-1 text-[10px] font-bold tracking-[0.22em] text-[#3A54A5] uppercase">Internal Access</p>
                            <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-950">Admin Sign In</h1>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-[13px] font-bold text-emerald-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-[12px] font-bold text-zinc-500">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@pinpointlaunchpad.com"
                                        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-4 pl-10 text-[13px] text-zinc-950 placeholder-zinc-400 shadow-xs transition outline-none focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10"
                                    />
                                </div>
                                {errors.email && <p className="text-red-650 mt-1.5 text-[11px]">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-[12px] font-bold text-zinc-500">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-10 pl-10 text-[13px] text-zinc-950 placeholder-zinc-400 shadow-xs transition outline-none focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="hover:text-zinc-650 absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-400 transition"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-650 mt-1.5 text-[11px]">{errors.password}</p>}
                            </div>

                            {/* Remember */}
                            <div className="flex items-center gap-2.5">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-zinc-200 bg-white accent-[#3A54A5]"
                                />
                                <label htmlFor="remember" className="cursor-pointer text-[12px] font-semibold text-zinc-500 select-none">
                                    Keep me signed in
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-3 text-[13px] font-bold tracking-[0.14em] text-white uppercase shadow-md shadow-[#3A54A5]/20 transition hover:bg-[#2D4182] hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
                            >
                                {processing ? <LoaderCircle className="size-4 animate-spin" /> : null}
                                {processing ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-[11px] font-medium text-zinc-400">This portal is for Pinpoint internal staff only.</p>
                </motion.div>
            </div>
        </div>
    );
}
