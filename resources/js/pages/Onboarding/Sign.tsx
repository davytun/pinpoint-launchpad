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
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#050505]/97 px-6 backdrop-blur-xl"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1,   opacity: 1 }}
                        transition={{ duration: 0.45, ease }}
                        className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10"
                        style={{ boxShadow: '0 0 48px rgba(245,158,11,0.15)' }}
                    >
                        <AlertTriangle className="size-8 text-amber-400" strokeWidth={1.5} />
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        transition={{ duration: 0.4, ease, delay: 0.15 }}
                    >
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/70">
                            Document Declined
                        </p>
                        <h2 className="font-display text-[22px] font-semibold text-white">
                            You declined the agreement
                        </h2>
                        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/40">
                            No problem — you can review your details and sign a fresh copy whenever you're ready.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        transition={{ duration: 0.4, ease, delay: 0.25 }}
                        onClick={() => router.visit(route('onboarding.sign'))}
                        className="group flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.1] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white/80 transition-all hover:bg-white/[0.1] hover:text-white"
                    >
                        Review &amp; Re-sign
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
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
                        <p className="font-display text-lg font-semibold text-white">Agreement Signed</p>
                        <p className="mt-1 text-[12px] text-white/40">Confirming your signature…</p>
                    </div>
                </motion.div>
            )}

            {/* ════════════════════════════════════════
                MOBILE header (shown below md)
                A compact bar: logo + step pill + email
            ════════════════════════════════════════ */}
            <motion.header
                className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3 md:hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
            >
                <img
                    src="/pinpoint-logo.png"
                    alt="Pinpoint"
                    className="block h-5 w-auto select-none"
                    style={{ maxWidth: 120 }}
                />
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
                        style={{
                            color:       '#60A5FA',
                            borderColor: 'rgba(37,99,235,0.3)',
                            background:  'rgba(37,99,235,0.08)',
                        }}
                    >
                        Step 2 of 3
                    </span>
                    <span className="text-[11px] text-white/30 hidden sm:inline">{tier_label}</span>
                </div>
            </motion.header>

            {/* ════════════════════════════════════════
                BODY: sidebar (md+) + iframe
            ════════════════════════════════════════ */}
            <div className="relative z-10 flex min-h-0 flex-1">

                {/* ── Sidebar — hidden on mobile, fixed width on md+ ── */}
                <motion.aside
                    className="hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.07] px-6 py-8 md:flex xl:w-[300px]"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease }}
                >
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
                                <span className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums',
                                    step.state === 'done'
                                        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400'
                                        : step.state === 'active'
                                            ? 'border-blue-500/50 bg-blue-600/10 text-blue-400'
                                            : 'border-white/[0.07] bg-white/[0.02] text-white/20',
                                )}>
                                    {step.n}
                                </span>
                                <span className={cn(
                                    'text-[12px] font-medium',
                                    step.state === 'done'   ? 'text-white/30 line-through decoration-white/15' :
                                    step.state === 'active' ? 'text-white/80' : 'text-white/22',
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6 h-px bg-white/[0.06]" />

                    {/* Headline + sub */}
                    <div className="mb-7">
                        <h1 className="font-display text-[18px] font-semibold leading-snug tracking-tight text-white">
                            Secure your position in the PIN&nbsp;Network.
                        </h1>
                        <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                            Read and sign the Success Fee &amp; Confidentiality Agreement to begin your
                            analyst-led audit.
                        </p>
                    </div>

                    {/* Trust items */}
                    <div className="flex flex-col gap-4">
                        {TRUST.map((tp) => (
                            <div key={tp.title} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                                    {tp.icon}
                                </div>
                                <div>
                                    <p className="text-[12px] font-semibold text-white/80">{tp.title}</p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/35">{tp.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Push pill to bottom */}
                    <div className="flex-1" />

                    {/* Tier / email pill */}
                    <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span
                                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]"
                                style={{
                                    color:       '#60A5FA',
                                    borderColor: 'rgba(37,99,235,0.3)',
                                    background:  'rgba(37,99,235,0.08)',
                                }}
                            >
                                {tier_label}
                            </span>
                            <span className="min-w-0 truncate text-[11px] text-white/30">{signer_email}</span>
                        </div>
                        <p className="mt-1.5 font-mono text-[9px] text-white/15">ID: {document_id}</p>
                    </div>
                </motion.aside>

                {/* ── iframe panel — fills all remaining space ── */}
                <motion.section
                    className="relative flex min-w-0 flex-1 flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.45, ease, delay: 0.12 }}
                >
                    {/* Desktop sub-header above iframe */}
                    <div className="hidden shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-2.5 md:flex">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/22">
                            Pinpoint Investment Warrant
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/18">
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
