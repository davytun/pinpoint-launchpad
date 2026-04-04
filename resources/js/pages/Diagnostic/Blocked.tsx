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
                <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-between px-4 pt-8 pb-16">
                    <div className="mx-auto w-full max-w-lg">
                        {/* Compass icon — oscillating */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: [-5, 5, -5],
                            }}
                            transition={{
                                opacity: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                                scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                                rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
                            }}
                            className="mb-8 flex justify-center"
                        >
                            <Compass className="text-primary size-20" strokeWidth={1.25} />
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            className="text-foreground mb-5 text-center text-4xl leading-tight font-black"
                        >
                            The Best Founders Don't Stop.
                            <br />
                            <span className="text-primary">They Prepare.</span>
                        </motion.h1>

                        {/* Sub copy */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.18 }}
                            className="text-muted-foreground mb-8 text-center text-sm leading-relaxed"
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
                                scale: [1, 1.03, 1],
                            }}
                            transition={{
                                opacity: { duration: 0.45, delay: 0.24 },
                                y: { duration: 0.45, delay: 0.24 },
                                scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                            }}
                            className="mb-8 flex justify-center"
                        >
                            <Badge
                                className="rounded-full px-5 py-2 text-sm font-semibold"
                                style={{
                                    borderColor: 'rgba(37,99,235,0.45)',
                                    background: 'rgba(37,99,235,0.08)',
                                    color: 'rgba(147,197,253,0.90)',
                                    border: '1px solid rgba(37,99,235,0.45)',
                                }}
                            >
                                Return in{' '}
                                <strong className="text-foreground ml-1">
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
                                <span className="text-muted-foreground/50 text-xs">
                                    Last assessment: <span className="text-muted-foreground">{score_band_label}</span>
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
                                    <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
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
                        <Separator className="mb-5 opacity-20" />
                        <p className="text-muted-foreground/50 text-sm">Filtering for Quality. Solving for Success.</p>
                    </motion.footer>
                </div>
            </DiagnosticLayout>
        </>
    );
}
