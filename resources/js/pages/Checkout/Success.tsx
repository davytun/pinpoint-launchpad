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
    tier_label: string;
    total_amount: number;
    email: string;
    currency_symbol?: string;
}

// ─── Animated SVG checkmark ───────────────────────────────────────────────────

const CIRCLE_LEN = 2 * Math.PI * 36; // 226.19…
const CHECK_LEN = 40; // approximate; getTotalLength overrides at runtime

function AnimatedCheck() {
    const circleRef = useRef<SVGCircleElement>(null);
    const checkRef = useRef<SVGPathElement>(null);

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
            checkRef.current.style.strokeDasharray = String(len);
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
            <circle cx="40" cy="40" r="36" fill="rgba(16,185,129,0.05)" />
            {/* Animated ring */}
            <circle
                ref={circleRef}
                cx="40"
                cy="40"
                r="36"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                style={{
                    strokeDasharray: CIRCLE_LEN,
                    strokeDashoffset: CIRCLE_LEN,
                }}
            />
            {/* Animated checkmark */}
            <path
                ref={checkRef}
                d="M24 40 L35 51 L56 30"
                stroke="#10B981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    strokeDasharray: CHECK_LEN,
                    strokeDashoffset: CHECK_LEN,
                }}
            />
        </svg>
    );
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease, delay }}>
            {children}
        </motion.div>
    );
}

// ─── Receipt row ──────────────────────────────────────────────────────────────

function Row({ label, children, isTotal = false }: { label: string; children: React.ReactNode; isTotal?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-[13px] text-zinc-500">{label}</span>
            <span
                className={cn(
                    'text-[13px]',
                    isTotal ? 'font-mono text-[14px] font-extrabold tracking-tight text-zinc-950' : 'font-medium text-zinc-800',
                )}
            >
                {children}
            </span>
        </div>
    );
}

// ─── Step item ────────────────────────────────────────────────────────────────

function Step({ n, label, sub, isLast = false }: { n: number; label: string; sub: string; isLast?: boolean }) {
    return (
        <div className="relative flex items-start gap-4 pb-5">
            {!isLast && <div className="absolute top-7 bottom-0 left-[0.6rem] w-[1.5px] bg-zinc-200" />}
            <div className="relative z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/5 text-[10px] font-bold text-[#3A54A5] tabular-nums shadow-xs">
                {n}
            </div>
            <div className="-mt-0.5">
                <p className="text-[13.5px] font-bold text-zinc-950 leading-tight">{label}</p>
                <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-zinc-500">{sub}</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutSuccess({ tier_label, total_amount, email, currency_symbol = '₦' }: PageProps) {
    return (
        <DiagnosticLayout glowColor="#10B981" hideWordmark>
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
                    <div className="relative overflow-hidden dx-card p-8 sm:p-10 rounded-[2rem] hover:shadow-md transition-all duration-300">
                        {/* Status Icon */}
                        <FadeUp delay={0.1}>
                            <div className="mb-6 flex justify-center">
                                <AnimatedCheck />
                            </div>
                        </FadeUp>

                        {/* Heading */}
                        <FadeUp delay={0.2}>
                            <div className="relative z-10 mb-8 text-center">
                                <p className="mb-2 text-[10px] font-extrabold tracking-[0.25em] text-[#10B981] uppercase">Payment Authorized</p>
                                <h1 className="font-display text-[26px] leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-[28px]">
                                    Commitment Secured
                                </h1>
                            </div>
                        </FadeUp>

                        {/* Receipt Invoice */}
                        <FadeUp delay={0.3}>
                            <div className="mb-7 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50">
                                <div className="border-b border-dashed border-zinc-200 bg-zinc-100/40 px-5 py-3">
                                    <p className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase">Invoice Details</p>
                                </div>
                                <div className="divide-y divide-dashed divide-zinc-200 px-5 py-1.5">
                                    <Row label="Tier">{tier_label} Audit</Row>
                                    <Row label="Amount" isTotal>
                                        {currency_symbol}
                                        {Number(total_amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                    </Row>
                                    <Row label="Status">
                                        <Badge className="border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.15em] text-[#10B981] uppercase shadow-none">
                                            Paid
                                        </Badge>
                                    </Row>
                                </div>
                            </div>
                        </FadeUp>

                        {/* Email notice */}
                        <FadeUp delay={0.4}>
                            <div className="mb-8 flex items-center gap-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-150/80">
                                    <MailCheck className="size-3.5 text-zinc-500" />
                                </div>
                                <p className="text-[13px] leading-tight text-zinc-650">
                                    Receipt delivered to <span className="font-semibold text-zinc-950">{email}</span>.
                                </p>
                            </div>
                        </FadeUp>

                        {/* Next steps Timeline */}
                        <FadeUp delay={0.5}>
                            <div className="mb-8">
                                <h2 className="mb-5 text-[11px] font-extrabold tracking-[0.15em] text-zinc-400 uppercase">Action Required</h2>
                                <div className="pl-1">
                                    <Step
                                        n={1}
                                        label="Sign Your Agreement"
                                        sub="A 2-minute digital signature to formally establish your success fee terms."
                                    />
                                    <Step n={2} label="Analyst Onboarding Call" sub="Scheduled within 48h to synchronize with your Lead Analyst." />
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
                                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#3A54A5] px-5 py-4 text-[13px] font-bold tracking-[0.18em] text-white uppercase shadow-none transition-all duration-300 outline-none hover:bg-[#2D4182] hover:shadow-[0_8px_25px_rgba(58,84,165,0.25)] hover:scale-[1.005] active:scale-[0.99]"
                            >
                                Proceed to Agreement
                                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </FadeUp>
                    </div>

                    {/* Info chip */}
                    <FadeUp delay={0.75}>
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 py-4">
                            <Info className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                            <p className="text-[12px] leading-relaxed text-zinc-550">
                                Protected transaction. If the program fails to commence within 10 business days, you are fully entitled to our
                                risk-free, zero-questions refund policy.
                            </p>
                        </div>
                    </FadeUp>
                </div>
            </div>
        </DiagnosticLayout>
    );
}
