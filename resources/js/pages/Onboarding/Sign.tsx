import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, Loader2, Lock, Percent, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

interface PageProps {
    embed_url: string;
    signer_email: string;
    tier_label: string;
    document_id: string;
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function FadeUp({ delay = 0, className, children }: { delay?: number; className?: string; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const STEPS = [
    { n: '01', label: 'Confirmed your details', state: 'done' },
    { n: '02', label: 'Sign your agreement', state: 'active' },
    { n: '03', label: 'Access the PIN Network', state: 'pending' },
] as const;

const TRUST = [
    {
        icon: <ShieldCheck className="size-[14px] text-emerald-600" />,
        title: 'Why sign now?',
        body: 'Protects your trade secrets and confirms 100% credit toward the success fee.',
    },
    {
        icon: <Percent className="size-[14px] text-[#3A54A5]" />,
        title: 'The 2% Rule',
        body: 'A standard advisory warrant aligning our team as your external Series A department.',
    },
    {
        icon: <Lock className="size-[14px] text-zinc-400" />,
        title: 'Secure & Compliant',
        body: 'Encrypted via BoldSign — SOC 2 Type II and eIDAS certified.',
    },
] as const;

export default function OnboardingSign({ embed_url, signer_email, tier_label, document_id }: PageProps) {
    const [loaded, setLoaded] = useState(false);
    const [complete, setComplete] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        function onMessage(e: MessageEvent) {
            const d = e.data;
            if (!d) return;
            const action = typeof d === 'string' ? d : (d.action ?? d.event ?? '');
            if (action === 'onDocumentSigned' || action === 'documentSigned') {
                setComplete(true);
                setTimeout(() => router.visit('/onboarding/complete'), 1200);
            }
            if (action === 'onDocumentDeclined' || action === 'documentDeclined') {
                setDeclined(true);
            }
            if (d?.type === 'boldsign' && d?.action === 'error') setError(true);
        }
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => router.reload({ preserveUrl: true }), 25 * 60 * 1000);
        return () => clearTimeout(t);
    }, []);

    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Sign Your Agreement — PARAGON Certification" />

            <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
                {/* ── Declined overlay ── */}
                {declined && (
                    <motion.div
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/95 px-6 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FadeUp delay={0}>
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
                                <AlertTriangle className="size-8 text-amber-600" strokeWidth={1.5} />
                            </div>
                        </FadeUp>

                        <div className="text-center">
                            <FadeUp delay={0.1}>
                                <p className="mb-1 text-[10px] font-bold tracking-[0.22em] text-amber-600 uppercase">Document Declined</p>
                            </FadeUp>
                            <FadeUp delay={0.15}>
                                <h2 className="font-display text-[22px] font-extrabold text-zinc-950">You declined the agreement</h2>
                            </FadeUp>
                            <FadeUp delay={0.2}>
                                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                                    No problem — you can review your details and sign a fresh copy whenever you're ready.
                                </p>
                            </FadeUp>
                        </div>

                        <FadeUp delay={0.3}>
                            <button
                                onClick={() => router.visit(route('onboarding.sign'))}
                                className="group flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-[13px] font-bold tracking-[0.14em] text-zinc-700 uppercase transition-all hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5]"
                            >
                                Review &amp; Re-sign
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </FadeUp>
                    </motion.div>
                )}

                {/* ── Signed overlay ── */}
                {complete && (
                    <motion.div
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-white/95 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.45, ease }}
                            className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50"
                            style={{ boxShadow: '0 0 48px rgba(16,185,129,0.18)' }}
                        >
                            <Check className="size-8 text-emerald-650" strokeWidth={3} />
                        </motion.div>
                        <div className="text-center">
                            <p className="font-display text-lg font-bold text-zinc-950">Agreement Signed</p>
                            <p className="mt-1 text-[12px] text-zinc-500">Confirming your signature…</p>
                        </div>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════
                    MOBILE header (shown below md)
                    A compact bar: logo + step pill + email
                ════════════════════════════════════════ */}
                <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white/60 backdrop-blur-md px-4 py-3 lg:hidden">
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="block h-5 w-auto select-none" style={{ maxWidth: 120 }} />
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#3A54A5]/30 bg-[#3A54A5]/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] text-[#3A54A5] uppercase">
                            Step 2 of 3
                        </span>
                        <span className="hidden text-[11px] text-zinc-500 sm:inline">{tier_label}</span>
                    </div>
                </header>

                {/* ════════════════════════════════════════
                    BODY: sidebar (lg+) + iframe
                ════════════════════════════════════════ */}
                <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
                    {/* ── Sidebar — hidden on mobile, fixed width on lg+ ── */}
                    <div className="hidden w-full shrink-0 flex-col overflow-y-auto border-b border-zinc-200 bg-white/40 backdrop-blur-md px-6 py-8 lg:flex lg:w-[280px] xl:w-[300px] lg:border-r lg:border-b-0 lg:min-h-screen">
                        <FadeUp delay={0}>
                            {/* Logo */}
                            <img src="/pinpoint-logo.png" alt="Pinpoint" className="mb-9 block h-6 w-auto select-none" style={{ maxWidth: 140 }} />

                            {/* Step tracker */}
                            <div className="mb-7 flex flex-col gap-2">
                                {STEPS.map((step) => (
                                    <div key={step.n} className="flex items-center gap-2.5">
                                        <div
                                            className={cn(
                                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums transition-colors',
                                                step.state === 'done'
                                                    ? 'border-emerald-500/30 bg-emerald-50 text-emerald-650'
                                                    : step.state === 'active'
                                                      ? 'border-[#3A54A5]/30 bg-white shadow-xs text-[#3A54A5]'
                                                      : 'border-zinc-200 bg-zinc-50 text-zinc-400',
                                            )}
                                        >
                                            {step.n}
                                        </div>
                                        <span
                                            className={cn(
                                                'text-[12px] font-medium transition-colors',
                                                step.state === 'done'
                                                    ? 'text-zinc-400 line-through'
                                                    : step.state === 'active'
                                                      ? 'text-zinc-900 font-bold'
                                                      : 'text-zinc-400',
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 h-px bg-zinc-200" />
                        </FadeUp>

                        {/* Headline + sub */}
                        <FadeUp delay={0.1}>
                            <div className="mb-7">
                                <h1 className="font-display text-[18px] leading-snug font-extrabold tracking-tight text-zinc-950">
                                    Secure your position in the PIN&nbsp;Network.
                                </h1>
                                <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                                    Read and sign the Success Fee &amp; Confidentiality Agreement to begin your analyst-led audit.
                                </p>
                            </div>
                        </FadeUp>

                        {/* Trust items */}
                        <div className="flex flex-col gap-4">
                            {TRUST.map((tp, i) => (
                                <FadeUp key={tp.title} delay={0.2 + i * 0.05}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-xs">
                                            {tp.icon}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-zinc-950">{tp.title}</p>
                                            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{tp.body}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>

                        {/* Push pill to bottom */}
                        <div className="flex-1 min-h-[40px]" />

                        {/* Tier / email pill */}
                        <FadeUp delay={0.4}>
                            <div className="mt-8 rounded-xl border border-zinc-200 bg-white/60 p-3 shadow-xs">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center rounded-full border border-[#3A54A5]/30 bg-[#3A54A5]/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] text-[#3A54A5] uppercase">
                                        {tier_label}
                                    </span>
                                    <span className="min-w-0 truncate text-[11px] text-zinc-500">{signer_email}</span>
                                </div>
                                <p className="mt-1.5 font-mono text-[9px] text-zinc-400">ID: {document_id}</p>
                            </div>
                        </FadeUp>
                    </div>

                    {/* ── iframe panel — fills all remaining space ── */}
                    <motion.section
                        className="relative flex min-w-0 flex-1 flex-col"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45, ease, delay: 0.12 }}
                    >
                        {/* Desktop sub-header above iframe */}
                        <div className="hidden shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-2.5 lg:flex">
                            <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-550 uppercase">Pinpoint Investment Warrant</span>
                            <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.16em] text-zinc-400 uppercase">
                                <Lock className="size-2.5 text-zinc-400" />
                                <span>BoldSign · SOC 2</span>
                            </div>
                        </div>

                        {/* iframe — absolutely fills its container */}
                        <div className="relative min-h-[500px] lg:min-h-0 flex-1">
                            {/* Loading overlay */}
                            {!loaded && !error && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white">
                                    <div
                                        className="flex size-14 items-center justify-center rounded-full border border-[#3A54A5]/20"
                                        style={{
                                            background: 'radial-gradient(circle, rgba(58,84,165,0.05) 0%, transparent 70%)',
                                        }}
                                    >
                                        <Loader2 className="size-6 animate-spin text-[#3A54A5]" />
                                    </div>
                                    <p className="text-[12px] text-zinc-400">Loading your agreement…</p>
                                </div>
                            )}

                            {/* Error overlay */}
                            {error ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white">
                                    <div className="flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50">
                                        <XCircle className="size-7 text-red-500" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-bold text-zinc-950">Session expired</p>
                                        <p className="mt-1 text-[12px] text-zinc-400">The page was open too long.</p>
                                    </div>
                                    <button
                                        onClick={() => router.reload({ preserveUrl: true })}
                                        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-zinc-650 transition-all hover:bg-zinc-50"
                                    >
                                        <RefreshCw className="size-3.5 text-zinc-550" />
                                        Refresh Agreement
                                    </button>
                                </div>
                            ) : (
                                <iframe
                                    src={embed_url}
                                    title="Pinpoint Investment Warrant"
                                    className="absolute inset-0 bg-white border-0"
                                    width="100%"
                                    height="100%"
                                    allow="encrypted-media"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    onLoad={() => setLoaded(true)}
                                    style={{ border: 'none', display: 'block' }}
                                />
                            )}
                        </div>
                    </motion.section>
                </div>
            </div>
        </DiagnosticLayout>
    );
}
