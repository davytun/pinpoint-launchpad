import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Info, MailCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    tier_label:   string;
    total_amount: number;
    email:        string;
}

// ─── Animated SVG checkmark ───────────────────────────────────────────────────

const CIRCLE_LEN = 2 * Math.PI * 36; // 226.19…
const CHECK_LEN  = 40;               // approximate; getTotalLength overrides at runtime

function AnimatedCheck() {
    const circleRef = useRef<SVGCircleElement>(null);
    const checkRef  = useRef<SVGPathElement>(null);

    useEffect(() => {
        // Circle: start hidden, animate to full
        if (circleRef.current) {
            circleRef.current.style.transition = 'stroke-dashoffset 0.65s cubic-bezier(0.16,1,0.3,1)';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (circleRef.current) circleRef.current.style.strokeDashoffset = '0';
                });
            });
        }
        // Check: start hidden, animate after circle finishes
        if (checkRef.current) {
            const len = checkRef.current.getTotalLength?.() ?? CHECK_LEN;
            checkRef.current.style.strokeDasharray  = String(len);
            checkRef.current.style.strokeDashoffset = String(len);
            checkRef.current.style.transition = 'stroke-dashoffset 0.45s cubic-bezier(0.16,1,0.3,1) 0.55s';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (checkRef.current) checkRef.current.style.strokeDashoffset = '0';
                });
            });
        }
    }, []);

    return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" className="mx-auto">
            {/* Soft background fill */}
            <circle cx="40" cy="40" r="36" fill="rgba(110,190,68,0.05)" />
            {/* Animated ring — initially hidden via inline style */}
            <circle
                ref={circleRef}
                cx="40" cy="40" r="36"
                stroke="#6EBE44"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                style={{
                    strokeDasharray:  CIRCLE_LEN,
                    strokeDashoffset: CIRCLE_LEN,
                }}
            />
            {/* Animated checkmark — initially hidden via inline style */}
            <path
                ref={checkRef}
                d="M24 40 L35 51 L56 30"
                stroke="#6EBE44"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    strokeDasharray:  CHECK_LEN,
                    strokeDashoffset: CHECK_LEN,
                }}
            />
        </svg>
    );
}

// ─── Receipt row ──────────────────────────────────────────────────────────────

function Row({ label, children, isTotal = false }: { label: string; children: React.ReactNode; isTotal?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3.5">
            <span className="text-[13px] text-white/40">{label}</span>
            <span className={`text-[13px] ${isTotal ? 'font-mono text-[14px] font-semibold tracking-tight text-white' : 'font-medium text-white/90'}`}>{children}</span>
        </div>
    );
}

// ─── Step item ────────────────────────────────────────────────────────────────

function Step({ n, label, sub, isLast = false }: { n: number; label: string; sub: string; isLast?: boolean }) {
    return (
        <div className="relative flex items-start gap-4 pb-5">
            {!isLast && (
                <div className="absolute left-[0.6rem] top-7 bottom-0 w-[2px] bg-gradient-to-b from-white/10 to-transparent" />
            )}
            <span
                className="relative z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#111] text-[10px] font-bold text-[#6EBE44] shadow-[0_0_12px_rgba(110,190,68,0.15)] ring-2 ring-white/[0.08]"
            >
                {n}
            </span>
            <div className="-mt-0.5">
                <p className="text-[14px] font-medium text-white shadow-sm">{label}</p>
                <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed text-white/40">{sub}</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutSuccess({ tier_label, total_amount, email }: PageProps) {
    return (
        <DiagnosticLayout glowColor="#6EBE44" hideWordmark>
            <Head title="Payment Confirmed — PARAGON Certification" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">

                {/* Wordmark */}
                <motion.div
                    className="mb-8 flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <PinpointLogo height={26} variant="dark" />
                </motion.div>

                <motion.div
                    className="w-full max-w-[460px]"
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                >
                    {/* Main card */}
                    <div className="waitlist-panel relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-10">

                        {/* Status Icon */}
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-5 flex justify-center">
                            <AnimatedCheck />
                        </motion.div>

                        {/* Heading */}
                        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mb-8 text-center">
                            <p
                                className="font-display mb-2 text-[10px] font-bold uppercase tracking-[0.25em]"
                                style={{ color: '#6EBE44' }}
                            >
                                Payment Authorized
                            </p>
                            <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[28px]">
                                Commitment Secured
                            </h1>
                        </motion.div>

                        {/* Receipt Invoice */}
                        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                <div className="border-b border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Invoice Details</p>
                                </div>
                                <div className="divide-y divide-dashed divide-white/[0.06] px-5 py-2">
                                    <Row label="Tier">{tier_label} Audit</Row>
                                    <Row label="Amount" isTotal>{Number(total_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Row>
                                    <Row label="Status">
                                        <Badge
                                            className="border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                                            style={{
                                                background: 'rgba(110,190,68,0.06)',
                                                borderColor: 'rgba(110,190,68,0.25)',
                                                color: '#6EBE44',
                                            }}
                                        >
                                            Paid
                                        </Badge>
                                    </Row>
                                </div>
                            </div>
                        </motion.div>

                        {/* Email notice */}
                        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="mb-8 flex items-center gap-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04]">
                                    <MailCheck className="size-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                                </div>
                                <p className="text-[13px] leading-tight text-white/50">
                                    Receipt delivered to <span className="font-semibold text-white/80">{email}</span>.
                                </p>
                            </div>
                        </motion.div>

                        {/* Next steps Timeline */}
                        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
                            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">Action Required</h2>
                            <div className="pl-1">
                                <Step
                                    n={1}
                                    label="Sign Your Agreement"
                                    sub="A 2-minute digital signature to formally establish your success fee terms."
                                />
                                <Step
                                    n={2}
                                    label="Analyst Onboarding Call"
                                    sub="Scheduled within 48h to synchronize with your Lead Analyst."
                                />
                                <Step
                                    n={3}
                                    label="Audit Execution"
                                    sub="Full PARAGON gap-analysis report delivered within 5–7 business days."
                                    isLast
                                />
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                            <Link
                                href={route('onboarding.sign')}
                                className="group relative block w-full overflow-hidden rounded-xl px-5 py-[18px] text-center text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-300 hover:[background:rgba(110,190,68,0.1)] hover:[border-color:#6EBE44]"
                                style={{
                                    background: '#1A1A1A',
                                    border: '1px solid rgba(110,190,68,0.4)',
                                    boxShadow: '0 0 30px rgba(110,190,68,0.15), inset 0 2px 0 rgba(255,255,255,0.05)',
                                }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-40" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Proceed to Agreement
                                    <ArrowRight className="h-4 w-4 text-[#6EBE44]" />
                                </span>
                            </Link>
                        </motion.div>

                    </div>

                    {/* Info chip */}
                    <motion.div
                        className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-5 py-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <Info className="mt-0.5 size-4 shrink-0 text-white/20" />
                        <p className="text-[12px] leading-relaxed text-white/30">
                            Protected transaction. If the program fails to commence within 10 business days, you are fully entitled to our risk-free, zero-questions refund policy.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
