import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, ArrowRight, CheckCircle, Lock, Loader2, Percent,
    RefreshCw, ShieldCheck, XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface PageProps {
    embed_url:    string;
    signer_email: string;
    tier_label:   string;
    document_id:  string;
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
    { n: '01', label: 'Confirmed your details', state: 'done'    },
    { n: '02', label: 'Sign your agreement',    state: 'active'  },
    { n: '03', label: 'Access the PIN Network', state: 'pending' },
] as const;

const TRUST = [
    {
        icon:  <ShieldCheck className="size-[14px] text-emerald-400" />,
        title: 'Why sign now?',
        body:  'Protects your trade secrets and confirms 100% credit toward the success fee.',
    },
    {
        icon:  <Percent className="size-[14px] text-blue-400" />,
        title: 'The 2% Rule',
        body:  'A standard advisory warrant aligning our team as your external Series A department.',
    },
    {
        icon:  <Lock className="size-[14px] text-white/35" />,
        title: 'Secure & Compliant',
        body:  'Encrypted via BoldSign — SOC 2 Type II and eIDAS certified.',
    },
] as const;

export default function OnboardingSign({
    embed_url, signer_email, tier_label, document_id,
}: PageProps) {
    const [loaded,   setLoaded]   = useState(false);
    const [complete, setComplete] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [error,    setError]    = useState(false);

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
        // Root: full-viewport, no scroll, dark base
        <div className="fixed inset-0 flex flex-col bg-[#050505] text-white antialiased">
            <Head title="Sign Your Agreement — PARAGON Certification" />

            {/* Ambient background decorations */}
            <div className="waitlist-shell pointer-events-none absolute inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none absolute inset-0 z-0" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.16) 0%, transparent 100%)' }}
            />

            {/* ── Declined overlay ── */}
            {declined && (
                <motion.div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#080B11]/97 px-6 backdrop-blur-xl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <FadeUp delay={0}>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
                            <AlertTriangle className="size-8 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </FadeUp>

                    <div className="text-center">
                        <FadeUp delay={0.1}>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/70">
                                Document Declined
                            </p>
                        </FadeUp>
                        <FadeUp delay={0.15}>
                            <h2 className="font-display text-[22px] font-semibold text-[#ECF0F9]">
                                You declined the agreement
                            </h2>
                        </FadeUp>
                        <FadeUp delay={0.2}>
                            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[#788CBA]">
                                No problem — you can review your details and sign a fresh copy whenever you're ready.
                            </p>
                        </FadeUp>
                    </div>

                    <FadeUp delay={0.3}>
                        <button
                            onClick={() => router.visit(route('onboarding.sign'))}
                            className="group flex items-center gap-2 rounded-xl bg-[#1B294B]/40 border border-[#232C43] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#ECF0F9] transition-all hover:bg-[#1B294B] hover:border-[#4468BB]/50"
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
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#050505]/95 backdrop-blur-xl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1,   opacity: 1 }}
                        transition={{ duration: 0.45, ease }}
                        className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10"
                        style={{ boxShadow: '0 0 48px rgba(16,185,129,0.18)' }}
                    >
                        <CheckCircle className="size-8 text-emerald-400" strokeWidth={1.5} />
                    </motion.div>
                    <div className="text-center">
                        <p className="font-display text-lg font-semibold text-[#ECF0F9]">Agreement Signed</p>
                        <p className="mt-1 text-[12px] text-[#788CBA]">Confirming your signature…</p>
                    </div>
                </motion.div>
            )}

            {/* ════════════════════════════════════════
                MOBILE header (shown below md)
                A compact bar: logo + step pill + email
            ════════════════════════════════════════ */}
            <header
                className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#232C43] bg-[#080B11] px-4 py-3 md:hidden"
            >
                <img
                    src="/pinpoint-logo.png"
                    alt="Pinpoint"
                    className="block h-5 w-auto select-none"
                    style={{ maxWidth: 120 }}
                />
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center rounded-full border border-[#4468BB]/30 bg-[#4468BB]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#60A5FA]"
                    >
                        Step 2 of 3
                    </span>
                    <span className="text-[11px] text-[#576FA8] hidden sm:inline">{tier_label}</span>
                </div>
            </header>

            {/* ════════════════════════════════════════
                BODY: sidebar (md+) + iframe
            ════════════════════════════════════════ */}
            <div className="relative z-10 flex min-h-0 flex-1">

                {/* ── Sidebar — hidden on mobile, fixed width on md+ ── */}
                <div
                    className="hidden h-full w-[280px] shrink-0 flex-col overflow-y-auto border-r border-[#232C43] bg-[#080B11] px-6 py-8 md:flex xl:w-[300px]"
                >
                    <FadeUp delay={0}>
                        {/* Logo — explicit max-width prevents stretching */}
                        <img
                            src="/pinpoint-logo.png"
                            alt="Pinpoint"
                            className="mb-9 block h-6 w-auto select-none"
                            style={{ maxWidth: 140 }}
                        />

                        {/* Step tracker */}
                        <div className="mb-7 flex flex-col gap-2">
                            {STEPS.map((step) => (
                                <div key={step.n} className="flex items-center gap-2.5">
                                    <div className={cn(
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums transition-colors',
                                        step.state === 'done' ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400' :
                                        step.state === 'active' ? 'border-[#4468BB]/50 bg-[#4468BB]/10 text-[#6986C9]' :
                                        'border-[#232C43] bg-[#0C1427] text-[#576FA8]'
                                    )}>
                                        {step.n}
                                    </div>
                                    <span className={cn(
                                        'text-[12px] font-medium transition-colors',
                                        step.state === 'done'   ? 'text-[#576FA8]/40 line-through' :
                                        step.state === 'active' ? 'text-[#ECF0F9]' : 'text-[#455987]',
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6 h-px bg-[#232C43]" />
                    </FadeUp>

                    {/* Headline + sub */}
                    <FadeUp delay={0.1}>
                        <div className="mb-7">
                            <h1 className="font-display text-[18px] font-semibold leading-snug tracking-tight text-white">
                                Secure your position in the PIN&nbsp;Network.
                            </h1>
                            <p className="mt-2 text-[12px] leading-relaxed text-[#788CBA]">
                                Read and sign the Success Fee &amp; Confidentiality Agreement to begin your
                                analyst-led audit.
                            </p>
                        </div>
                    </FadeUp>

                    {/* Trust items */}
                    <div className="flex flex-col gap-4">
                        {TRUST.map((tp, i) => (
                            <FadeUp key={tp.title} delay={0.2 + i * 0.05}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#232C43] bg-[#0C1427]">
                                        {tp.icon}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[#ECF0F9]">{tp.title}</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#576FA8]">{tp.body}</p>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>

                    {/* Push pill to bottom */}
                    <div className="flex-1" />

                    {/* Tier / email pill */}
                    <FadeUp delay={0.4}>
                        <div className="mt-8 rounded-xl border border-[#232C43] bg-[#101623] p-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                    className="inline-flex items-center rounded-full border border-[#4468BB]/30 bg-[#4468BB]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#60A5FA]"
                                >
                                    {tier_label}
                                </span>
                                <span className="min-w-0 truncate text-[11px] text-[#576FA8]">{signer_email}</span>
                            </div>
                            <p className="mt-1.5 font-mono text-[9px] text-[#576FA8]/40">ID: {document_id}</p>
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
                    <div className="hidden shrink-0 items-center justify-between border-b border-[#232C43] bg-[#080B11] px-5 py-2.5 md:flex">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#576FA8]">
                            Pinpoint Investment Warrant
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#576FA8]/60">
                            <Lock className="size-2.5" />
                            <span>BoldSign · SOC 2</span>
                        </div>
                    </div>

                    {/* iframe — absolutely fills its container */}
                    <div className="relative min-h-0 flex-1">

                        {/* Loading overlay */}
                        {!loaded && !error && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#080808]">
                                <div
                                    className="flex size-14 items-center justify-center rounded-full border"
                                    style={{
                                        borderColor: 'rgba(37,99,235,0.28)',
                                        background:  'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
                                    }}
                                >
                                    <Loader2 className="size-6 animate-spin text-blue-500" />
                                </div>
                                <p className="text-[12px] text-white/30">Loading your agreement…</p>
                            </div>
                        )}

                        {/* Error overlay */}
                        {error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#080808]">
                                <div className="flex size-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/8">
                                    <XCircle className="size-7 text-red-400" strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[15px] font-semibold text-white">Session expired</p>
                                    <p className="mt-1 text-[12px] text-white/35">The page was open too long.</p>
                                </div>
                                <button
                                    onClick={() => router.reload({ preserveUrl: true })}
                                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Refresh Agreement
                                </button>
                            </div>
                        ) : (
                            <iframe
                                src={embed_url}
                                title="Pinpoint Investment Warrant"
                                className="absolute inset-0 bg-white"
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
    );
}
