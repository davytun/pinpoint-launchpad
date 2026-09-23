import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

interface PageProps {
    flash?: { success?: string; error?: string };
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function FounderForgotPassword({ flash }: PageProps) {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        email: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('founder.password.email'));
    }

    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Reset password — Pinpoint" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-12 sm:px-6">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
                    <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950">
                        Reset password
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                        Enter your email and we will send a reset link if an account exists.
                    </p>

                    {(wasSuccessful || flash?.success) && (
                        <p role="status" className="mt-6 text-[13px] font-medium text-emerald-700">
                            {flash?.success ?? 'If an account exists with that email, you will receive a reset link shortly.'}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-zinc-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-zinc-950 outline-none transition-colors placeholder:text-zinc-400',
                                    errors.email
                                        ? 'border-red-400 focus:border-red-500'
                                        : 'border-zinc-200 focus:border-[#3A54A5]',
                                )}
                                placeholder="you@company.com"
                                required
                            />
                            {errors.email && (
                                <p role="alert" className="mt-1.5 text-[12px] text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            aria-busy={processing}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-[13px] text-zinc-500">
                        <Link href={route('founder.login')} className="font-medium text-[#3A54A5] hover:text-[#2D4182]">
                            Back to sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
