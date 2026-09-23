import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

import PrivacyConsent from '@/components/privacy-consent';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    email: string | null;
    token: string;
    full_name?: string | null;
    company_name?: string | null;
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fieldClass = (hasError?: string) =>
    cn(
        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 outline-none transition-colors placeholder:text-zinc-400',
        hasError
            ? 'border-red-400 focus:border-red-500'
            : 'border-zinc-200 focus:border-[#3A54A5]',
    );

export default function FounderSetup({ email, token, full_name, company_name }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token,
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
            <Head title="Create account — Pinpoint" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-12 sm:px-6">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
                    <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950">
                        Create your account
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                        Choose a password and you are in. We already have your details from the agreement.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <input type="hidden" name="token" value={data.token} />

                        <div>
                            <label htmlFor="full_name" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Full name
                            </label>
                            <input
                                id="full_name"
                                type="text"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                className={fieldClass(errors.full_name)}
                                placeholder="Jane Smith"
                                autoComplete="name"
                            />
                            {errors.full_name && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.full_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="company_name" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Company
                            </label>
                            <input
                                id="company_name"
                                type="text"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                className={fieldClass(errors.company_name)}
                                placeholder="Your venture"
                                autoComplete="organization"
                            />
                            {errors.company_name && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.company_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="setup_email" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Email
                            </label>
                            <input
                                id="setup_email"
                                type="email"
                                value={data.email}
                                readOnly
                                className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[14px] text-zinc-500 outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className={cn(fieldClass(errors.password), 'pr-11')}
                                    placeholder="At least 8 characters"
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
                            {errors.password ? (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.password}
                                </p>
                            ) : (
                                <p className="mt-1.5 text-[12px] text-zinc-500">At least 8 characters</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    className={cn(fieldClass(errors.password_confirmation), 'pr-11')}
                                    placeholder="Repeat password"
                                />
                                <button
                                    type="button"
                                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                                >
                                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        <PrivacyConsent variant="capture" className="pt-1" />

                        <button
                            type="submit"
                            disabled={processing}
                            aria-busy={processing}
                            className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
