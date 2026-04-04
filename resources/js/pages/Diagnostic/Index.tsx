import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    potential:  '#2563EB',
    agility:    '#7C3AED',
    risk:       '#DC2626',
    alignment:  '#D97706',
    governance: '#059669',
    operations: '#0891B2',
    need:       '#BE185D',
};

const PILLAR_LABELS: Record<string, string> = {
    potential:  'Potential',
    agility:    'Agility',
    risk:       'Risk',
    alignment:  'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    need:       'Need',
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

    const question = questions[currentIndex];
    const isLast = currentIndex === total_questions - 1;
    const progressPct = ((currentIndex) / total_questions) * 100;
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
                    { answers: Object.fromEntries(
                        Object.entries(newAnswers).map(([k, v]) => [k, Boolean(v)])
                    )},
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
                setCurrentIndex(i => i + 1);
                lockedRef.current = false;
            }, 350);
        }
    }

    function goBack() {
        if (currentIndex === 0 || lockedRef.current || isSubmitting) return;
        lockedRef.current = true;
        setDirection(-1);
        setTimeout(() => {
            setCurrentIndex(i => i - 1);
            lockedRef.current = false;
        }, 350);
    }

    const slideVariants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
        center: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        },
        exit: (dir: number) => ({
            opacity: 0,
            x: dir > 0 ? -50 : 50,
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
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
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-md"
                        >
                            <div
                                className="flex size-20 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: 'rgba(37,99,235,0.35)',
                                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
                                }}
                            >
                                <Loader2 className="size-9 animate-spin text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-foreground">
                                    Analysing your venture profile…
                                </p>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    This takes just a moment.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-8">

                    {/* ── Wordmark ── */}
                    <div className="mb-8 flex items-center gap-3">
                        <PinpointLogo height={26} variant="dark" />
                        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                            Diagnostic
                        </Badge>
                    </div>

                    {/* ── Progress ── */}
                    <div className="mb-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Question {currentIndex + 1}
                                <span className="opacity-40"> / {total_questions}</span>
                            </span>
                            <Badge
                                className="rounded-full text-[10px] font-bold uppercase tracking-widest"
                                style={{
                                    color: pillarColor,
                                    background: `${pillarColor}18`,
                                    border: `1px solid ${pillarColor}35`,
                                }}
                            >
                                {PILLAR_LABELS[question.pillar] ?? question.pillar}
                            </Badge>
                        </div>
                        <Progress value={progressPct} className="h-1.5" />
                    </div>

                    {/* ── Question card ── */}
                    <div className="relative" style={{ minHeight: 280 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={question.id}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                                    <CardContent className="p-6 sm:p-8">
                                        {/* Question text */}
                                        <p className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
                                            {question.question_text}
                                        </p>

                                        {/* Sub text */}
                                        {question.sub_text && (
                                            <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">
                                                {question.sub_text}
                                            </p>
                                        )}

                                        {/* ── Answer buttons ── */}
                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(true)}
                                                className={cn(
                                                    'flex items-center justify-center rounded-xl border py-5 text-base font-semibold transition-all duration-150 focus:outline-none',
                                                    answers[question.id] === true
                                                        ? 'scale-[1.02] border-primary bg-primary/20 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-foreground',
                                                )}
                                            >
                                                Yes
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(false)}
                                                className={cn(
                                                    'flex items-center justify-center rounded-xl border py-5 text-base font-semibold transition-all duration-150 focus:outline-none',
                                                    answers[question.id] === false
                                                        ? 'scale-[1.02] border-slate-500 bg-slate-700/50 text-slate-200'
                                                        : 'border-border bg-transparent text-muted-foreground hover:border-slate-500/60 hover:bg-slate-700/30 hover:text-foreground',
                                                )}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Back + dot strip ── */}
                    {!isSubmitting && (
                        <div className="mt-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
                            >
                                ← Back
                            </button>

                            <div className="flex items-center gap-1.5">
                                {questions.map((q, i) => (
                                    <div
                                        key={q.id}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            width: i === currentIndex ? 18 : 6,
                                            height: 6,
                                            background:
                                                i === currentIndex
                                                    ? '#2563EB'
                                                    : answers[q.id] !== undefined
                                                    ? 'rgba(37,99,235,0.45)'
                                                    : 'rgba(255,255,255,0.12)',
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="w-12" />
                        </div>
                    )}
                </div>
            </DiagnosticLayout>
        </>
    );
}
