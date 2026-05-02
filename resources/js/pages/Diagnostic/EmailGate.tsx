import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    blurred_score: number;
}



// ─── Page ───────────────────────────────────────────────────────────────────────

export default function EmailGate({ blurred_score }: PageProps) {
    const { flash } = usePage<{ flash: { error?: string } }>().props;
    const form = useForm({ email: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('diagnostic.capture-email'));
    }

    return (
        <>
            <Head title="Unlock Your Score — PARAGON Diagnostic" />

            <DiagnosticLayout>
                <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <Card className="waitlist-panel overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] p-0 shadow-md md:rounded-[1.75rem]">

                            {/* Top — blurred score + radar */}
                            <CardContent className="flex flex-col items-center border-b border-[#232C43] px-8 pb-8 pt-10 text-center">

                                {/* "PARAGON Score Ready" badge with pulsing green dot */}
                                <div className="mb-5 flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                                        PARAGON Score Ready
                                    </span>
                                </div>

                                {/* Headline */}
                                <h1 className="mb-2 font-display text-2xl font-bold text-[#ECF0F9]">
                                    Your results are waiting.
                                </h1>
                                <p className="mb-6 text-sm leading-relaxed text-[#788CBA]">
                                    Enter your email to unlock your full diagnostic and radar chart.
                                </p>

                                {/* Blurred score with focus state */}
                                <div className="relative mb-8 flex select-none flex-col items-center">
                                    <span
                                        className="font-sans text-[6rem] font-black leading-none text-[#ECF0F9]"
                                        style={{ filter: 'blur(16px)', opacity: 0.5 }}
                                        aria-hidden="true"
                                    >
                                        {String(blurred_score).padStart(2, '0')}
                                    </span>
                                    {/* Reveal hint */}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                                        <Lock className="size-5 text-[#4468BB]" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4468BB]">
                                            Analysis Locked
                                        </span>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Bottom — email form */}
                            <CardContent className="px-8 pb-8 pt-7">
                                {flash?.error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                                    >
                                        {flash.error}
                                    </motion.div>
                                )}
                                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.18em] text-[#576FA8]">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            autoFocus
                                            placeholder="founder@startup.com"
                                            value={form.data.email}
                                            onChange={e => form.setData('email', e.target.value)}
                                            aria-invalid={!!form.errors.email}
                                            className="waitlist-input focus:border-[#4468BB]/50 focus:ring-[#4468BB]/15 h-12"
                                        />
                                        {form.errors.email && (
                                            <p className="text-xs text-destructive">{form.errors.email}</p>
                                        )}
                                    </div>

                                        <button
                                            type="submit"
                                            disabled={form.processing || !form.data.email.trim()}
                                            className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                                            style={{
                                                background: '#4468BB',
                                                boxShadow: '0 0 28px rgba(68,104,187,0.35)',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
                                        >                                      <span className="waitlist-shimmer absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {form.processing ? (
                                                <>
                                                    <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                                    Unlocking…
                                                </>
                                            ) : (
                                                <>
                                                    Unlock My Results
                                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <p className="mt-4 text-center text-[11px] text-[#576FA8]/60">
                                    No spam. No account required.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
