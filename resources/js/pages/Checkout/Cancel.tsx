import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutCancel() {
    return (
        <DiagnosticLayout glowColor="#3C53A8" hideWordmark>
            <Head title="Payment Cancelled — PARAGON Certification" />

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
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                >
                    {/* Main card */}
                    <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[1.75rem]">

                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                                <RotateCcw className="size-6 text-white/50" />
                            </div>
                        </div>

                        {/* Copy */}
                        <p
                            className="font-display mb-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                            Transaction Stopped
                        </p>
                        <h1 className="font-display mb-3 text-2xl font-semibold leading-tight text-white md:text-3xl">
                            No Charge Made
                        </h1>
                        <p className="mb-8 text-[15px] leading-relaxed text-white/50">
                            Your session is active and your results remain secured. You can return to pricing whenever you're ready.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/checkout"
                                className="group relative block w-full overflow-hidden rounded-xl px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:brightness-110"
                                style={{
                                    background: '#3C53A8',
                                    boxShadow: '0 0 28px rgba(60,83,168,0.3)',
                                }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Return to Pricing
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>

                            <Link
                                href="/diagnostic/result"
                                role="button"
                                aria-label="Back to my diagnostic results"
                                className="block w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                Back to My Results
                            </Link>
                        </div>
                    </div>

                    {/* Reassurance note */}
                    <motion.p
                        className="mt-5 text-center text-xs"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        Your diagnostic score and results remain saved for 30 days.
                    </motion.p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
