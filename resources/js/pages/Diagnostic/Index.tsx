import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronLeft, Clock, Coins, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

const spineLetters = [
    { letter: 'P', label: 'Potential', range: [0, 2] },
    { letter: 'A', label: 'Agility', range: [3, 5] },
    { letter: 'R', label: 'Risk', range: [6, 9] },
    { letter: 'A', label: 'Alignment', range: [10, 13] },
    { letter: 'G', label: 'Governance', range: [14, 16] },
    { letter: 'O', label: 'Operations', range: [17, 19] },
    { letter: 'N', label: 'Network', range: [20, 24] },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface QuestionOption {
    letter: string;
    text: string;
    points: number;
    flag: string | null;
}

interface Question {
    id: number;
    pillar: string;
    question_text: string;
    sub_text: string | null;
    options: QuestionOption[];
    strand: string | null;
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

// ─── Custom Select Dropdown ───────────────────────────────────────────────────

interface CustomSelectProps {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    error?: string;
    placeholder?: string;
}

function CustomSelect({ label, options, value, onChange, error, placeholder = 'Select...' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-left text-sm font-semibold text-zinc-800 shadow-2xs transition-all duration-200 hover:bg-white focus:border-[#3A54A5] focus:outline-none',
                    error && 'border-red-500 focus:border-red-500',
                    !value && 'text-zinc-400',
                )}
            >
                <span>{value || placeholder}</span>
                <ChevronDown className={cn('size-4 text-zinc-400 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md focus:outline-none"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-semibold transition-all duration-150',
                                    value === option ? 'bg-[#3A54A5] text-white' : 'hover:bg-zinc-150 text-zinc-700',
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DiagnosticIndex({ questions, total_questions }: PageProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [direction, setDirection] = useState<1 | -1>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [started, setStarted] = useState(false);
    const [basicsSubmitted, setBasicsSubmitted] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [country, setCountry] = useState('');
    const [sector, setSector] = useState('');
    const [growthStage, setGrowthStage] = useState('');
    const [describeYou, setDescribeYou] = useState('');
    const [lookingToRaise, setLookingToRaise] = useState('');
    function handleBasicsSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isValid) {
            setBasicsSubmitted(true);
        }
    }

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

    if (!started) {
        return (
            <>
                <Head title="PARAGON Diagnostic - Intro" />
                <DiagnosticLayout hideWordmark>
                    <div className="relative mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="mb-8 flex items-center gap-3">
                                <PinpointLogo height={26} variant="dark" />
                            </div>

                            <div className="dx-card overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md sm:p-10 md:rounded-[1.75rem]">
                                <h1 className="font-display text-2xl leading-tight font-black tracking-tight text-zinc-950 sm:text-3xl">
                                    Find out why investors would pass before they do.
                                </h1>
                                <p className="mt-4 text-sm leading-relaxed font-medium text-zinc-600">
                                    Twenty-five questions. An indicative score across the seven dimensions investors actually diligence. And a
                                    straight answer on the two things standing between you and a cheque.
                                </p>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {/* Time */}
                                    <div className="rounded-xl border border-zinc-200/50 bg-white/50 p-4 shadow-2xs transition-all duration-300 hover:border-[#3A54A5]/20 hover:bg-white">
                                        <div className="flex items-center gap-2 text-[#3A54A5]">
                                            <Clock className="size-4 shrink-0" />
                                            <span className="text-xs font-bold tracking-wider uppercase">Time</span>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed font-semibold text-zinc-500">
                                            About six minutes. Answer from what you know today, don't go looking things up.
                                        </p>
                                    </div>

                                    {/* Cost */}
                                    <div className="rounded-xl border border-zinc-200/50 bg-white/50 p-4 shadow-2xs transition-all duration-300 hover:border-[#3A54A5]/20 hover:bg-white">
                                        <div className="flex items-center gap-2 text-[#3A54A5]">
                                            <Coins className="size-4 shrink-0" />
                                            <span className="text-xs font-bold tracking-wider uppercase">Cost</span>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed font-semibold text-zinc-500">
                                            Free. No card, no call, no obligation.
                                        </p>
                                    </div>

                                    {/* Privacy */}
                                    <div className="rounded-xl border border-zinc-200/50 bg-white/50 p-4 shadow-2xs transition-all duration-300 hover:border-[#3A54A5]/20 hover:bg-white">
                                        <div className="flex items-center gap-2 text-[#3A54A5]">
                                            <ShieldAlert className="size-4 shrink-0" />
                                            <span className="text-xs font-bold tracking-wider uppercase">Privacy</span>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed font-semibold text-zinc-500">
                                            Nothing is shown to any investor. This is a mirror, not a listing.
                                        </p>
                                    </div>

                                    {/* Honesty */}
                                    <div className="rounded-xl border border-zinc-200/50 bg-white/50 p-4 shadow-2xs transition-all duration-300 hover:border-[#3A54A5]/20 hover:bg-white">
                                        <div className="flex items-center gap-2 text-[#3A54A5]">
                                            <Sparkles className="size-4 shrink-0" />
                                            <span className="text-xs font-bold tracking-wider uppercase">Honesty</span>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed font-semibold text-zinc-500">
                                            The score is only worth what your answers are worth. Nobody is marking you.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStarted(true)}
                                    className="group mt-8 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3A54A5] text-sm font-bold text-white shadow-[0_8px_20px_rgba(58,84,165,0.2)] transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.99]"
                                >
                                    Begin Self-Scan
                                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </DiagnosticLayout>
            </>
        );
    }

    const isValid = companyName.trim() !== '' && country !== '' && sector !== '' && growthStage !== '' && describeYou !== '' && lookingToRaise !== '';

    if (started && !basicsSubmitted) {
        return (
            <>
                <Head title="PARAGON Diagnostic - Basics" />
                <DiagnosticLayout hideWordmark>
                    <div className="relative mx-auto max-w-2xl px-4 pt-10 pb-20 sm:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="mb-8 flex items-center gap-3">
                                <PinpointLogo height={26} variant="dark" />
                            </div>

                            <form
                                onSubmit={handleBasicsSubmit}
                                className="dx-card overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md sm:p-10 md:rounded-[1.75rem]"
                            >
                                <span className="font-display text-[10px] font-black tracking-widest text-[#3A54A5] uppercase">First Stage</span>
                                <h1 className="font-display mt-1.5 text-2xl leading-tight font-black tracking-tight text-zinc-950 sm:text-3xl">
                                    First, the basics
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed font-semibold text-zinc-500">
                                    So the questions and the scoring match your stage.
                                </p>

                                <div className="mt-8 space-y-5">
                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="company-name" className="block text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                            Company name
                                        </label>
                                        <input
                                            type="text"
                                            id="company-name"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Acme Technologies Ltd"
                                            className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-800 placeholder-zinc-400 shadow-2xs transition-all duration-200 focus:border-[#3A54A5] focus:bg-white focus:ring-1 focus:ring-[#3A54A5] focus:outline-none"
                                        />
                                    </div>

                                    {/* Country of Operation */}
                                    <CustomSelect
                                        label="Country of operation"
                                        value={country}
                                        onChange={setCountry}
                                        options={[
                                            'Nigeria',
                                            'Ghana',
                                            'Kenya',
                                            'South Africa',
                                            'Egypt',
                                            'Rwanda',
                                            "Côte d'Ivoire",
                                            'Senegal',
                                            'Other — Africa',
                                            'Outside Africa',
                                        ]}
                                    />

                                    {/* Sector */}
                                    <CustomSelect
                                        label="Sector"
                                        value={sector}
                                        onChange={setSector}
                                        options={[
                                            'Fintech/Payments',
                                            'Blockchain/Digital assets',
                                            'Healthtech',
                                            'Agritech',
                                            'Edtech',
                                            'Logistics/Mobility',
                                            'Commerce/Retail',
                                            'Energy/Climate',
                                            'Enterprise software/AI',
                                            'Media/Creative',
                                            'Manufacturing',
                                            'Services',
                                            'Other',
                                        ]}
                                    />

                                    {/* Stage */}
                                    <CustomSelect
                                        label="Stage"
                                        value={growthStage}
                                        onChange={setGrowthStage}
                                        options={['concept (MVP, little/no revenue)', 'seed (trading, <$500k/yr)', 'growth (scaling, >$500k/yr)']}
                                    />

                                    {/* Type */}
                                    <CustomSelect label="Type" value={describeYou} onChange={setDescribeYou} options={['startup (equity)']} />

                                    {/* Raise target */}
                                    <CustomSelect
                                        label="What you're looking to raise"
                                        value={lookingToRaise}
                                        options={['Under $100k', '$100k–$500k', '$500k–$2m', '$2m–$10m', 'Over $10m', 'Not sure yet']}
                                        onChange={setLookingToRaise}
                                    />
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStarted(false)}
                                        className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white/60 px-6 text-sm font-bold text-zinc-600 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.99]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isValid}
                                        className={cn(
                                            'group flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-[0_8px_20px_rgba(58,84,165,0.2)] transition-all duration-200 focus:outline-none',
                                            isValid
                                                ? 'bg-[#3A54A5] hover:bg-[#2D4182] active:scale-[0.99]'
                                                : 'cursor-not-allowed bg-zinc-400 opacity-60 shadow-none',
                                        )}
                                    >
                                        Start the scan
                                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </DiagnosticLayout>
            </>
        );
    }

    const isLast = currentIndex === total_questions - 1;
    const progressPct = (currentIndex / total_questions) * 100;
    const pillarColor = PILLAR_COLORS[question.pillar] ?? '#64748B';

    function selectAnswer(value: string) {
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
                    {
                        answers: newAnswers,
                        company_name: companyName,
                        country: country,
                        sector: sector,
                        growth_stage: growthStage,
                        describe_you: describeYou,
                        looking_to_raise: lookingToRaise,
                    },
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
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/95 backdrop-blur-md"
                        >
                            <div
                                className="flex size-20 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: 'rgba(58, 84, 165, 0.25)',
                                    background: 'radial-gradient(circle, rgba(58, 84, 165, 0.1) 0%, transparent 70%)',
                                }}
                            >
                                <Loader2 className="size-9 animate-spin text-[#3A54A5]" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-zinc-900">Analysing your venture profile…</p>
                                <p className="mt-1.5 text-sm text-zinc-500">This takes just a moment.</p>
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

                        {/* PARAGON Cosmetic Spine */}
                        <div className="mt-3 flex items-center justify-between gap-1 rounded-xl border border-zinc-200/50 bg-white/40 p-2.5 shadow-2xs backdrop-blur-xs">
                            {spineLetters.map((item, idx) => {
                                const isCompleted = currentIndex > item.range[1];
                                const isActive = currentIndex >= item.range[0] && currentIndex <= item.range[1];
                                return (
                                    <div key={idx} className="flex flex-1 flex-col items-center">
                                        <div
                                            className={cn(
                                                'flex size-7 items-center justify-center rounded-lg border text-xs font-black transition-all duration-300',
                                                isCompleted && 'border-[#3A54A5] bg-[#3A54A5] text-white',
                                                isActive &&
                                                    'animate-pulse border-[#3A54A5]/50 bg-[#3A54A5]/10 text-[#3A54A5] shadow-sm shadow-[#3A54A5]/10',
                                                !isCompleted && !isActive && 'border-zinc-200 bg-transparent text-zinc-400',
                                            )}
                                        >
                                            {item.letter}
                                        </div>
                                        <span className="mt-1 hidden text-[8px] font-bold tracking-wider text-zinc-400 uppercase sm:block">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Question card ── */}
                    <div className="relative" style={{ minHeight: 280 }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div key={question.id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <div className="dx-card overflow-hidden rounded-[1.25rem] md:rounded-[1.75rem]">
                                    <div className="p-6 sm:p-10">
                                        {/* Question text */}
                                        <p className="font-display text-xl leading-snug font-bold tracking-tight text-zinc-950 sm:text-2xl">
                                            {question.question_text}
                                        </p>

                                        {/* Sub text */}
                                        {question.sub_text && (
                                            <p className="mt-3 text-sm leading-relaxed text-zinc-500 italic">{question.sub_text}</p>
                                        )}

                                        {/* ── Answer buttons ── */}
                                        <div className="mt-8 space-y-3">
                                            {(question.options || []).map((opt) => (
                                                <button
                                                    key={opt.letter}
                                                    type="button"
                                                    onClick={() => selectAnswer(opt.letter)}
                                                    className={cn(
                                                        'group relative flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300 ease-out focus:outline-none',
                                                        answers[question.id] === opt.letter
                                                            ? 'scale-[1.005] border-[#3A54A5] bg-[#3A54A5] text-white shadow-[0_8px_20px_rgba(58,84,165,0.25)]'
                                                            : 'border-zinc-200 bg-white/50 text-zinc-700 shadow-xs backdrop-blur-xs hover:-translate-y-0.5 hover:border-[#3A54A5]/30 hover:bg-white hover:text-[#3A54A5] hover:shadow-[0_8px_20px_rgba(58,84,165,0.04)]',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex size-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black',
                                                            answers[question.id] === opt.letter
                                                                ? 'border-white/30 bg-white/20 text-white'
                                                                : 'border-zinc-200 bg-zinc-50/50 text-zinc-400 group-hover:border-[#3A54A5]/20 group-hover:bg-[#3A54A5]/5 group-hover:text-[#3A54A5]',
                                                        )}
                                                    >
                                                        {opt.letter}
                                                    </div>
                                                    <span className="text-sm leading-relaxed font-semibold">{opt.text}</span>
                                                </button>
                                            ))}
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
                                className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/60 px-4 py-2 text-xs font-bold tracking-widest text-zinc-600 uppercase shadow-xs transition-all duration-300 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] disabled:pointer-events-none disabled:opacity-30"
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
