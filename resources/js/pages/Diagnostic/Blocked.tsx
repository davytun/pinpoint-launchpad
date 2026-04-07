import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle2, Compass } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    days_remaining: number;
    score_band: string | null;
    score_band_label: string | null;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DiagnosticBlocked({ days_remaining, score_band_label }: PageProps) {
    const checklist = [
        'Review the PARAGON pillars where you scored lowest.',
        'Work through the Founder Readiness Checklist sent to your email.',
        'Return when you can answer YES to at least 2 more questions.',
    ];

    return (
        <>
            <Head title="Checkpoint — Pinpoint Diagnostic" />

            <DiagnosticLayout>
                <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 py-12">
                    <div className="waitlist-panel mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111]/80 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-12 md:rounded-[1.75rem]">
                        {/* Compass icon — oscillating */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: 0,
                            }}
                            transition={{
                                opacity: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                                scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                            }}
                            className="mb-8 flex justify-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 max-w-[80px] blur-[30px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.3), transparent 70%)' }} />
                                <Compass className="size-20 relative z-10" color="#3C53A8" strokeWidth={1.25} />
                            </div>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            className="mb-6 font-display text-center text-4xl font-bold leading-tight tracking-tight text-white"
                        >
                            The Best Founders Don't Stop.
                            <br />
                            <span className="bg-gradient-to-r from-[#93C5FD] to-[#3C53A8] bg-clip-text text-transparent">They Prepare.</span>
                        </motion.h1>

                        {/* Sub copy */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.18 }}
                            className="mb-8 text-center text-base leading-relaxed text-white/50"
                        >
                            Having most recently completed this assessment without reaching the threshold, you are ineligible to retake it
                            immediately. This isn't a dead end — it's a checkpoint. The founders who return stronger are the ones who make it.
                        </motion.p>

                        {/* Days remaining pill */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            transition={{
                                opacity: { duration: 0.45, delay: 0.24 },
                                y: { duration: 0.45, delay: 0.24 },
                            }}
                            className="mb-8 flex justify-center w-full"
                        >
                            <Badge
                                className="inline-flex items-center justify-center rounded-full px-6 py-3 font-bold uppercase tracking-[0.1em]"
                                style={{
                                    border: '1px solid rgba(60,83,168,0.5)',
                                    background: 'rgba(60,83,168,0.1)',
                                    color: '#93C5FD',
                                    boxShadow: '0 0 20px rgba(60,83,168,0.2)',
                                }}
                            >
                                Return in{' '}
                                <strong className="ml-1.5 font-display text-lg font-black text-white">
                                    {days_remaining} {days_remaining === 1 ? 'day' : 'days'}
                                </strong>
                            </Badge>
                        </motion.div>

                        {/* Last band note */}
                        {score_band_label && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.28 }}
                                className="mb-8 flex justify-center"
                            >
                                <span className="text-xs uppercase tracking-[0.1em] text-white/30">
                                    Last assessment: <span className="font-bold text-white/70">{score_band_label}</span>
                                </span>
                            </motion.div>
                        )}

                        {/* Checklist */}
                        <motion.ul
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: {},
                                show: { transition: { staggerChildren: 0.12, delayChildren: 0.32 } },
                            }}
                            className="mb-10 flex flex-col gap-4"
                        >
                            {checklist.map((item, i) => (
                                <motion.li
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, x: -14 },
                                        show: {
                                            opacity: 1,
                                            x: 0,
                                            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                                        },
                                    }}
                                    className="flex items-start gap-3.5"
                                >
                                    <CheckCircle2 color="#3C53A8" className="mt-0.5 size-5 shrink-0" />
                                    <p className="text-sm leading-relaxed text-white/60">{item}</p>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>

                    {/* ── Footer ── */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                        className="relative mt-8 w-full max-w-lg text-center"
                    >
                        <Separator className="mb-5 border-white/10" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Filtering for Quality. Solving for Success.</p>
                    </motion.footer>
                </div>
            </DiagnosticLayout>
        </>
    );
}
