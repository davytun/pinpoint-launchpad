import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Card, CardContent } from '@/components/ui/card';
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
                        <Card className="dx-card overflow-hidden rounded-xl p-0 md:rounded-2xl">

                            {/* Top — blurred score + radar */}
                            <CardContent className="flex flex-col items-center border-b border-white/[0.06] px-8 pb-8 pt-10 text-center">

                                {/* "PARAGON Score Ready" editorial status indicator */}
                                <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5ca336]">
                                    PARAGON Score Ready
                                </div>

                                {/* Headline */}
                                <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-[#D8E0F3]">
                                    Your results are waiting.
                                </h1>
                                <p className="mb-6 text-sm leading-relaxed text-white/50">
                                    Enter your email to unlock your full diagnostic and radar chart.
                                </p>

                                {/* Custom Premium Lock Visual (Blueprint Report) */}
                                <div className="relative mb-8 w-full border border-white/[0.06] bg-white/[0.01] rounded-xl p-5 overflow-hidden">
                                    {/* Grid background */}
                                    <div className="absolute inset-0 opacity-[0.02]" style={{
                                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                        backgroundSize: '16px 16px'
                                    }} />

                                    {/* Blueprint header */}
                                    <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3 text-left">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">Report Type</span>
                                            <p className="font-display text-[11px] font-bold text-white/60">PARAGON VENTURE AUDIT</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">ID</span>
                                            <p className="font-mono text-[11px] text-white/40">PL-9428-DX</p>
                                        </div>
                                    </div>

                                    {/* Report Mock Columns */}
                                    <div className="space-y-2.5 text-left opacity-20 select-none">
                                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                            <span className="font-display text-xs font-semibold text-white/70">Potential & Scale</span>
                                            <span className="h-2 w-16 bg-white/20 rounded-sm blur-[2px]" />
                                        </div>
                                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                            <span className="font-display text-xs font-semibold text-white/70">Agility & Execution</span>
                                            <span className="h-2 w-20 bg-white/20 rounded-sm blur-[2px]" />
                                        </div>
                                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                            <span className="font-display text-xs font-semibold text-white/70">Risk Mitigation</span>
                                            <span className="h-2 w-12 bg-white/20 rounded-sm blur-[2px]" />
                                        </div>
                                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                                            <span className="font-display text-xs font-semibold text-white/70">Alignment & Governance</span>
                                            <span className="h-2 w-24 bg-white/20 rounded-sm blur-[2px]" />
                                        </div>
                                    </div>

                                    {/* Lock overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a]/85 backdrop-blur-[1px]">
                                        <div className="flex flex-col items-center gap-2.5">
                                            <div className="flex size-9 items-center justify-center border border-white/10 bg-[#161c28] rounded-lg text-white">
                                                <Lock className="size-4" strokeWidth={1.5} />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D8E0F3]">
                                                    Analysis Locked
                                                </span>
                                                <p className="mt-1 text-[9px] text-[#91A7D8]/40 uppercase tracking-widest">
                                                    verification pending email
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Bottom — email form */}
                            <CardContent className="px-8 pb-8 pt-7 bg-black/20">
                                {flash?.error && (
                                     <div
                                         className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                                     >
                                         {flash.error}
                                     </div>
                                )}
                                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                                     <div className="flex flex-col gap-1.5">
                                         <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.22em] text-white/40">
                                             Email address
                                         </Label>
                                         <input
                                             id="email"
                                             type="email"
                                             autoComplete="email"
                                             autoFocus
                                             placeholder="founder@startup.com"
                                             value={form.data.email}
                                             onChange={e => form.setData('email', e.target.value)}
                                             className="h-12 w-full rounded-md border border-white/10 bg-[#0C121D] px-4 py-3 text-sm text-[#D8E0F3] placeholder:text-white/20 outline-none transition-all duration-200 focus:border-[#5ca336]/60 focus:ring-2 focus:ring-[#5ca336]/10"
                                         />
                                         {form.errors.email && (
                                             <p className="text-xs text-rose-400">{form.errors.email}</p>
                                         )}
                                     </div>

                                     <button
                                         type="submit"
                                         disabled={form.processing || !form.data.email.trim()}
                                         className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#5ca336] px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 disabled:cursor-not-allowed disabled:opacity-50 shadow-none"
                                     >
                                         <span className="relative z-10 flex items-center gap-2">
                                             {form.processing ? (
                                                 <>
                                                     <Loader2 className="size-4 animate-spin" />
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

                                <p className="mt-4 text-center text-[11px] text-[#91A7D8]/60">
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
