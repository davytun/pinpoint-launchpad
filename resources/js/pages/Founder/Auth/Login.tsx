import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    flash?: { success?: string; error?: string; info?: string };
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fieldClass = (hasError?: string) =>
    cn(
        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 outline-none transition-colors placeholder:text-zinc-400',
        hasError
            ? 'border-red-400 focus:border-red-500'
            : 'border-zinc-200 focus:border-[#3A54A5]',
    );

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

    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Sign in — Pinpoint" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-12 sm:px-6">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
                    <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950">
                        Sign in
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                        Use the email and password from when you set up your founder account.
                    </p>

                    <p className="mt-4 text-[13px] text-zinc-500">
                        Staff accounts use{' '}
                        <a href="/admin/login" className="font-medium text-[#3A54A5] hover:text-[#2D4182]">
                            /admin/login
                        </a>
                        .
                    </p>

                    {flash?.info && (
                        <p role="status" className="mt-6 text-[13px] font-medium text-[#3A54A5]">
                            {flash.info}
                        </p>
                    )}
                    {flash?.error && (
                        <p role="alert" className="mt-6 text-[13px] font-medium text-red-600">
                            {flash.error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={fieldClass(errors.email)}
                                placeholder="you@company.com"
                                required
                            />
                            {errors.email && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                                <label htmlFor="password" className="block text-[13px] font-medium text-zinc-700">
                                    Password
                                </label>
                                <Link
                                    href={route('founder.password.request')}
                                    className="text-[13px] font-medium text-[#3A54A5] hover:text-[#2D4182]"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={cn(fieldClass(errors.password), 'pr-11')}
                                    placeholder="Your password"
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="size-4 rounded border-zinc-300 text-[#3A54A5] focus:ring-[#3A54A5]/30"
                            />
                            <span className="text-[13px] text-zinc-600">Stay signed in</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            aria-busy={processing}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-[13px] leading-relaxed text-zinc-500">
                        New here?{' '}
                        <Link href={route('diagnostic.index')} className="font-medium text-[#3A54A5] hover:text-[#2D4182]">
                            Start with the diagnostic
                        </Link>
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
