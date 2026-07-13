import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

export default function EmailGate() {
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
                            <div className="dx-card overflow-hidden rounded-xl p-0 md:rounded-2xl">
                                {/* Top — blurred score + radar */}
                                <div className="flex flex-col items-center border-b border-zinc-100 px-8 pt-10 pb-8 text-center">
                                    {/* "PARAGON Score Ready" editorial status indicator */}
                                    <div className="mb-6 text-[10px] font-bold tracking-[0.22em] text-[#3A54A5] uppercase">PARAGON Score Ready</div>
 
                                    {/* Headline */}
                                    <h1 className="font-display mb-2 text-2xl font-bold tracking-tight text-zinc-900">Your results are waiting.</h1>
                                    <p className="mb-6 text-sm leading-relaxed text-zinc-500">
                                        Enter your email to unlock your full diagnostic and radar chart.
                                    </p>
 
                                    {/* Custom Premium Lock Visual (Blueprint Report) */}
                                    <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-5">
                                        {/* Grid background */}
                                        <div
                                            className="absolute inset-0 opacity-[0.05]"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle, #3A54A5 1px, transparent 1px)',
                                                backgroundSize: '16px 16px',
                                            }}
                                        />
 
                                        {/* Blueprint header */}
                                        <div className="mb-4 flex items-center justify-between border-b border-zinc-200/60 pb-3 text-left">
                                            <div>
                                                <span className="text-[9px] font-black tracking-[0.15em] text-zinc-400 uppercase">Report Type</span>
                                                <p className="font-display text-[11px] font-bold text-zinc-700">PARAGON VENTURE AUDIT</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black tracking-[0.15em] text-zinc-400 uppercase">ID</span>
                                                <p className="font-mono text-[11px] text-zinc-500">PL-9428-DX</p>
                                            </div>
                                        </div>
 
                                        {/* Report Mock Columns */}
                                        <div className="space-y-2.5 text-left opacity-20 select-none">
                                            <div className="flex items-center justify-between border-b border-zinc-200/40 pb-2">
                                                <span className="font-display text-xs font-semibold text-zinc-600">Potential & Scale</span>
                                                <span className="h-2 w-16 rounded-sm bg-zinc-200 blur-[2px]" />
                                            </div>
                                            <div className="flex items-center justify-between border-b border-zinc-200/40 pb-2">
                                                <span className="font-display text-xs font-semibold text-zinc-600">Agility & Execution</span>
                                                <span className="h-2 w-20 rounded-sm bg-zinc-200 blur-[2px]" />
                                            </div>
                                            <div className="flex items-center justify-between border-b border-zinc-200/40 pb-2">
                                                <span className="font-display text-xs font-semibold text-zinc-600">Risk Mitigation</span>
                                                <span className="h-2 w-12 rounded-sm bg-zinc-200 blur-[2px]" />
                                            </div>
                                            <div className="flex items-center justify-between border-b border-zinc-200/40 pb-2">
                                                <span className="font-display text-xs font-semibold text-zinc-600">Alignment & Governance</span>
                                                <span className="h-2 w-24 rounded-sm bg-zinc-200 blur-[2px]" />
                                            </div>
                                        </div>
 
                                        {/* Lock overlay */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[1px]">
                                            <div className="flex flex-col items-center gap-2.5">
                                                <div className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-xs">
                                                    <Lock className="size-4" strokeWidth={1.5} />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[10px] font-black tracking-[0.25em] text-zinc-800 uppercase">
                                                        Analysis Locked
                                                    </span>
                                                    <p className="mt-1 text-[9px] tracking-widest text-zinc-400 uppercase">
                                                        verification pending email
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                                {/* Bottom — email form */}
                                <div className="bg-zinc-50/50 border-t border-zinc-100 px-8 pt-7 pb-8">
                                    {flash?.error && (
                                        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                            {flash.error}
                                        </div>
                                    )}
                                    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="email" className="text-[9px] font-black tracking-[0.22em] text-zinc-500 uppercase">
                                                Email address
                                            </Label>
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                autoFocus
                                                placeholder="founder@startup.com"
                                                value={form.data.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                className="h-12 w-full rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition-all duration-200 outline-none placeholder:text-zinc-400 focus:border-[#3A54A5] focus:ring-2 focus:ring-[#3A54A5]/10"
                                            />
                                            {form.errors.email && <p className="text-xs text-rose-500">{form.errors.email}</p>}
                                        </div>
 
                                        <button
                                            type="submit"
                                            disabled={form.processing || !form.data.email.trim()}
                                            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-white/5 bg-[#3A54A5] px-5 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-none transition-all duration-200 hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
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
 
                                    <p className="mt-4 text-center text-[11px] text-zinc-500">No spam. No account required.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
