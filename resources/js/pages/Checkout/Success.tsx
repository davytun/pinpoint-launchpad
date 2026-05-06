import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Info, MailCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

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

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay }}
        >
            {children}
        </motion.div>
    );
}

// ─── Receipt row ──────────────────────────────────────────────────────────────

function Row({ label, children, isTotal = false }: { label: string; children: React.ReactNode; isTotal?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-[13px] text-[#576FA8]">{label}</span>
            <span className={cn(
                'text-[13px]',
                isTotal ? 'font-mono text-[14px] font-bold tracking-tight text-[#ECF0F9]' : 'font-medium text-[#ECF0F9]/90'
            )}>
                {children}
            </span>
        </div>
    );
}

// ─── Step item ────────────────────────────────────────────────────────────────

function Step({ n, label, sub, isLast = false }: { n: number; label: string; sub: string; isLast?: boolean }) {
    return (
        <div className="relative flex items-start gap-4 pb-5">
            {!isLast && (
                <div className="absolute left-[0.6rem] top-7 bottom-0 w-[1.5px] bg-[#232C43]" />
            )}
            <div
                className="relative z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#4468BB]/50 bg-[#4468BB]/10 text-[10px] font-bold text-[#6986C9] tabular-nums"
            >
                {n}
            </div>
            <div className="-mt-0.5">
                <p className="text-[13.5px] font-semibold text-[#ECF0F9]">{label}</p>
                <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-[#788CBA]">{sub}</p>
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
                <FadeUp delay={0}>
                    <div className="mb-8 flex items-center gap-3">
                        <PinpointLogo height={26} variant="dark" />
                    </div>
                </FadeUp>

                <div className="w-full max-w-[440px]">
                    {/* Main card */}
                    <div className="relative overflow-hidden rounded-[2rem] border border-[#232C43] bg-[#101623] p-8 shadow-2xl sm:p-10">

                        {/* Status Icon */}
                        <FadeUp delay={0.1}>
                            <div className="mb-6 flex justify-center">
                                <AnimatedCheck />
                            </div>
                        </FadeUp>

                        {/* Heading */}
                        <FadeUp delay={0.2}>
                            <div className="relative z-10 mb-8 text-center">
                                <p
                                    className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6EBE44]"
                                >
                                    Payment Authorized
                                </p>
                                <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-[#ECF0F9] sm:text-[28px]">
                                    Commitment Secured
                                </h1>
                            </div>
                        </FadeUp>

                        {/* Receipt Invoice */}
                        <FadeUp delay={0.3}>
                            <div className="mb-7 overflow-hidden rounded-2xl border border-[#232C43] bg-[#0C1427]/50">
                                <div className="border-b border-dashed border-[#232C43] bg-[#1B294B]/10 px-5 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#576FA8]">Invoice Details</p>
                                </div>
                                <div className="divide-y divide-dashed divide-[#232C43] px-5 py-1.5">
                                    <Row label="Tier">{tier_label} Audit</Row>
                                    <Row label="Amount" isTotal>{Number(total_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Row>
                                    <Row label="Status">
                                        <Badge
                                            className="border border-[#6EBE44]/30 bg-[#6EBE44]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6EBE44]"
                                        >
                                            Paid
                                        </Badge>
                                    </Row>
                                </div>
                            </div>
                        </FadeUp>

                        {/* Email notice */}
                        <FadeUp delay={0.4}>
                            <div className="mb-8 flex items-center gap-3.5 rounded-xl border border-[#232C43] bg-[#1B294B]/10 p-4">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1B294B]/20">
                                    <MailCheck className="size-3.5 text-[#576FA8]" />
                                </div>
                                <p className="text-[13px] leading-tight text-[#788CBA]">
                                    Receipt delivered to <span className="font-semibold text-[#ECF0F9]/80">{email}</span>.
                                </p>
                            </div>
                        </FadeUp>

                        {/* Next steps Timeline */}
                        <FadeUp delay={0.5}>
                            <div className="mb-8">
                                <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#576FA8]">Action Required</h2>
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
                            </div>
                        </FadeUp>

                        {/* CTA */}
                        <FadeUp delay={0.6}>
                            <Link
                                href={route('onboarding.sign')}
                                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#4468BB] px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-[#3b5ba5]"
                                style={{ boxShadow: '0 0 28px rgba(68,104,187,0.3)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                Proceed to Agreement
                                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </FadeUp>

                    </div>

                    {/* Info chip */}
                    <FadeUp delay={0.75}>
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#232C43] bg-[#101623]/50 px-5 py-4">
                            <Info className="mt-0.5 size-4 shrink-0 text-[#576FA8]/40" />
                            <p className="text-[12px] leading-relaxed text-[#576FA8]/60">
                                Protected transaction. If the program fails to commence within 10 business days, you are fully entitled to our risk-free, zero-questions refund policy.
                            </p>
                        </div>
                    </FadeUp>
                </div>
            </div>
        </DiagnosticLayout>
    );
}
