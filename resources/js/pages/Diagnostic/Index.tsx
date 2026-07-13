import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
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

    const lockedRef = useRef(false);
    const question = questions[currentIndex];

    if (!question) {
        return (
            <DiagnosticLayout>
                <div className="flex min-h-screen items-center justify-center px-4">
                    <p className="text-center text-sm text-white/50">No diagnostic questions are available yet. Please check back shortly.</p>
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
                            className="bg-white/95 fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 backdrop-blur-md"
                        >
                            <div
                                className="flex size-20 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: 'rgba(58, 84, 165, 0.25)',
                                    background: 'radial-gradient(circle, rgba(58, 84, 165, 0.1) 0%, transparent 70%)',
                                }}
                            >
                                <Loader2 className="text-[#3A54A5] size-9 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-zinc-900 text-base font-semibold">Analysing your venture profile…</p>
                                <p className="text-zinc-500 mt-1.5 text-sm">This takes just a moment.</p>
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
                            <span className="font-display text-sm font-bold tracking-widest text-zinc-500 uppercase">
                                Question {currentIndex + 1}
                                <span className="opacity-40"> / {total_questions}</span>
                            </span>
                            <Badge
                                className="rounded-sm text-[10px] font-black tracking-[0.2em] uppercase"
                                style={{
                                    color: pillarColor,
                                    background: `${pillarColor}12`,
                                    border: `1px solid ${pillarColor}30`,
                                }}
                            >
                                {PILLAR_LABELS[question.pillar] ?? question.pillar}
                            </Badge>
                        </div>
                        {/* Flat Editorial Progress */}
                        <div className="h-[3px] w-full overflow-hidden bg-zinc-200">
                            <motion.div
                                className="h-full"
                                initial={{ width: `${((currentIndex === 0 ? 0 : currentIndex - 1) / total_questions) * 100}%` }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                    backgroundColor: '#3A54A5',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Question card ── */}
                    <div className="relative" style={{ minHeight: 280 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div key={question.id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <div className="dx-card overflow-hidden rounded-[1.25rem] md:rounded-[1.75rem]">
                                    <div className="p-6 sm:p-10">
                                        {/* Question text */}
                                        <p className="font-display text-xl leading-snug font-bold tracking-tight text-zinc-900 sm:text-2xl">
                                            {question.question_text}
                                        </p>

                                        {/* Sub text */}
                                        {question.sub_text && (
                                            <p className="mt-3 text-sm leading-relaxed text-zinc-500 italic">{question.sub_text}</p>
                                        )}

                                        {/* ── Answer buttons ── */}
                                        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(true)}
                                                className={cn(
                                                    'group relative flex items-center justify-center overflow-hidden rounded-xl border py-4 transition-all duration-300 ease-out focus:outline-none sm:py-5',
                                                    answers[question.id] === true
                                                        ? 'scale-[1.01] border-[#3A54A5] bg-[#3A54A5] font-bold text-white shadow-[0_8px_20px_rgba(58,84,165,0.25)]'
                                                        : 'border-zinc-200 bg-white/50 text-zinc-700 backdrop-blur-xs shadow-xs hover:-translate-y-0.5 hover:border-[#3A54A5]/30 hover:bg-white hover:text-[#3A54A5] hover:shadow-[0_8px_20px_rgba(58,84,165,0.04)]',
                                                )}
                                            >
                                                <span className="relative z-10 text-sm font-bold tracking-[0.15em] uppercase">Yes</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => selectAnswer(false)}
                                                className={cn(
                                                    'group relative flex items-center justify-center overflow-hidden rounded-xl border py-4 transition-all duration-300 ease-out focus:outline-none sm:py-5',
                                                    answers[question.id] === false
                                                        ? 'scale-[1.01] border-[#3A54A5] bg-[#3A54A5] font-bold text-white shadow-[0_8px_20px_rgba(58,84,165,0.25)]'
                                                        : 'border-zinc-200 bg-white/50 text-zinc-700 backdrop-blur-xs shadow-xs hover:-translate-y-0.5 hover:border-[#3A54A5]/30 hover:bg-white hover:text-[#3A54A5] hover:shadow-[0_8px_20px_rgba(58,84,165,0.04)]',
                                                )}
                                            >
                                                <span className="relative z-10 text-sm font-bold tracking-[0.15em] uppercase">No</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/60 px-4 py-2 text-xs font-bold tracking-widest text-zinc-600 uppercase transition-all duration-300 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] disabled:pointer-events-none disabled:opacity-30 shadow-xs"
                            >
                                <span className="transition-transform group-hover:-translate-x-1">
                                    <ChevronLeft />
                                </span>{' '}
                                Back
                            </button>

                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold tabular-nums" style={{ color: '#3A54A5' }}>
                                    {currentIndex + 1}
                                </span>
                                <span className="text-xs text-zinc-400">/</span>
                                <span className="text-xs text-zinc-500 tabular-nums">{total_questions}</span>
                            </div>

                            <div className="w-16 shrink-0" />
                        </div>
                    )}
                </div>
            </DiagnosticLayout>
        </>
    );
}
