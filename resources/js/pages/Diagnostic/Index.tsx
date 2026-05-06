import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
    id: number;
    pillar: string;
    question_text: string;
    sub_text: string | null;
    points: number;
    order: number;
}

interface PageProps {
    questions: Question[];
    total_questions: number;
}

// ─── Pillar metadata ───────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, string> = {
    potential: '#2563EB',
    agility: '#7C3AED',
    risk: '#DC2626',
    alignment: '#D97706',
    governance: '#059669',
    operations: '#0891B2',
    network: '#BE185D',
};

const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential',
    agility: 'Agility',
    risk: 'Risk',
    alignment: 'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network: 'Network',
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DiagnosticIndex({ questions, total_questions }: PageProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Single ref-based gate: prevents ANY interaction during transitions or submit.
    // Using a ref (not state) so the guard takes effect synchronously on the same
    // event tick — no 380ms window where a second tap can sneak through.
    const lockedRef = useRef(false);

    // Trap the browser back button — prevent navigating away mid-quiz
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const question = questions[currentIndex];

    // Guard: no questions seeded yet — show a placeholder instead of crashing
    if (! question) {
        return (
            <DiagnosticLayout>
                <div className="flex min-h-screen items-center justify-center px-4">
                    <p className="text-center text-sm text-white/50">
                        No diagnostic questions are available yet. Please check back shortly.
                    </p>
                </div>
            </DiagnosticLayout>
        );
    }

    const isLast = currentIndex === total_questions - 1;
    const progressPct = (currentIndex / total_questions) * 100;
    const pillarColor = PILLAR_COLORS[question.pillar] ?? '#64748B';

    function selectAnswer(value: boolean) {
        // Hard gate — synchronous, no async race
        if (lockedRef.current || isSubmitting) return;
        lockedRef.current = true;

        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (isLast) {
            // Show submitting overlay immediately on last answer
            setIsSubmitting(true);
            // Small delay so the selected-state button flash is visible (200ms)
            setTimeout(() => {
                router.post(
                    route('diagnostic.submit'),
                    // Explicitly cast each value to boolean so JSON.stringify
                    // sends true/false, never "true"/"false" strings
                    { answers: Object.fromEntries(Object.entries(newAnswers).map(([k, v]) => [k, Boolean(v)])) },
                    {
                        onError: () => {
                            setIsSubmitting(false);
                            lockedRef.current = false;
                        },
                    },
                );
            }, 200);
        } else {
            // Advance to next question after answer flash
            setDirection(1);
            setTimeout(() => {
                setCurrentIndex((i) => i + 1);
                lockedRef.current = false;
            }, 350);
        }
    }

    function goBack() {
        if (currentIndex === 0 || lockedRef.current || isSubmitting) return;
        lockedRef.current = true;
        setDirection(-1);
        setTimeout(() => {
            setCurrentIndex((i) => i - 1);
            lockedRef.current = false;
        }, 350);
    }

    const slideVariants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40, filter: 'blur(12px)' }),
        center: {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        },
        exit: (dir: number) => ({
            opacity: 0,
            x: dir > 0 ? -40 : 40,
            filter: 'blur(12px)',
            transition: { duration: 0.35, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
        }),
    };

    return (
        <>
            <Head title="PARAGON Diagnostic" />

            <DiagnosticLayout hideWordmark>
                {/* Full-screen submitting overlay — shown immediately on last answer */}
                <AnimatePresence>
                    {isSubmitting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-background/95 fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 backdrop-blur-md"
                        >
                            <div
                                className="flex size-20 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: 'rgba(37,99,235,0.35)',
                                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
                                }}
                            >
                                <Loader2 className="text-primary size-9 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-foreground text-base font-semibold">Analysing your venture profile…</p>
                                <p className="text-muted-foreground mt-1.5 text-sm">This takes just a moment.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <PinpointLogo height={26} variant="dark" />
                    </div>

                    <div className="mb-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold tracking-widest text-white/50 uppercase">
                                Question {currentIndex + 1}
                                <span className="opacity-40"> / {total_questions}</span>
                            </span>
                            <Badge
                                className="rounded-full text-[10px] font-black tracking-[0.2em] uppercase"
                                style={{
                                    color: pillarColor,
                                    background: `${pillarColor}18`,
                                    border: `1px solid ${pillarColor}50`,
                                    boxShadow: `0 0 16px ${pillarColor}20`,
                                }}
                            >
                                {PILLAR_LABELS[question.pillar] ?? question.pillar}
                            </Badge>
                        </div>
                        {/* Custom Glowing Progress */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: `${((currentIndex === 0 ? 0 : currentIndex - 1) / total_questions) * 100}%` }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                    background: `linear-gradient(90deg, #3C53A8 0%, #5CA336 100%)`,
                                    boxShadow: '0 0 10px rgba(92,163,54,0.5)',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Question card ── */}
                    <div className="relative" style={{ minHeight: 280 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div key={question.id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <Card className="overflow-hidden rounded-[1.25rem] border border-[#232C43] bg-[#101623] shadow-md md:rounded-[1.75rem]">
                                    <CardContent className="p-6 sm:p-10">
                                        {/* Question text */}
                                        <p className="font-display text-xl leading-snug font-bold tracking-tight text-[#ECF0F9] sm:text-2xl">
                                            {question.question_text}
                                        </p>

                                        {/* Sub text */}
                                        {question.sub_text && (
                                            <p className="mt-3 text-sm leading-relaxed text-[#788CBA] italic">{question.sub_text}</p>
                                        )}

                                        {/* ── Answer buttons ── */}
                                        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(true)}
                                                className={cn(
                                                    'group relative flex items-center justify-center overflow-hidden rounded-xl border py-4 transition-all duration-300 ease-out focus:outline-none sm:py-5',
                                                    answers[question.id] === true
                                                        ? 'scale-[1.02] border-[#5CA336]/50 bg-[#5CA336]/15 text-[#86efac] shadow-[0_0_30px_rgba(92,163,54,0.2)] ring-1 ring-[#5CA336]/30'
                                                        : 'border-[#232C43] bg-[#080B11] text-[#788CBA] hover:border-[#5CA336]/40 hover:bg-[#5CA336]/5 hover:text-[#ECF0F9]',
                                                )}
                                            >
                                                {answers[question.id] === true && (
                                                    <span className="waitlist-shimmer absolute inset-0 opacity-100 mix-blend-overlay" />
                                                )}
                                                <span className="relative z-10 text-sm font-bold tracking-[0.1em] uppercase">Yes</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(false)}
                                                className={cn(
                                                    'group relative flex items-center justify-center overflow-hidden rounded-xl border py-4 transition-all duration-300 ease-out focus:outline-none sm:py-5',
                                                    answers[question.id] === false
                                                        ? 'scale-[1.02] border-[#4468BB]/50 bg-[#4468BB]/15 text-[#9AA9CB] shadow-[0_0_20px_rgba(68,104,187,0.2)] ring-1 ring-[#4468BB]/30'
                                                        : 'border-[#232C43] bg-[#080B11] text-[#788CBA] hover:border-[#4468BB]/40 hover:bg-[#4468BB]/10 hover:text-[#ECF0F9]',
                                                )}
                                            >
                                                {answers[question.id] === false && (
                                                    <span className="waitlist-shimmer absolute inset-0 opacity-100 mix-blend-overlay" />
                                                )}
                                                <span className="relative z-10 text-sm font-bold tracking-[0.1em] uppercase">No</span>
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Back + dot strip ── */}
                    {!isSubmitting && (
                        <div className="mt-6 flex items-center justify-between px-2">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={currentIndex === 0}
                                className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-[#232C43] px-4 py-2 text-xs font-bold tracking-widest text-[#788CBA] uppercase transition-colors hover:text-[#ECF0F9] hover:bg-[#1B294B]/30 disabled:pointer-events-none disabled:opacity-30"
                            >
                                <span className="transition-transform group-hover:-translate-x-1"><ChevronLeft /></span> Back
                            </button>

                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold tabular-nums" style={{ color: '#5CA336' }}>
                                    {currentIndex + 1}
                                </span>
                                <span className="text-xs text-[#576FA8]">/</span>
                                <span className="text-xs text-[#788CBA] tabular-nums">{total_questions}</span>
                            </div>

                            <div className="w-16 shrink-0" />

                        </div>
                    )}
                </div>
            </DiagnosticLayout>
        </>
    );
}
