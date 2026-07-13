import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, ArrowRight, TrendingUp, Zap, Activity, ShieldCheck, Target, Scale, Cpu, Network } from 'lucide-react';
import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PillarScores {
    potential: number;
    agility: number;
    risk: number;
    alignment: number;
    governance: number;
    operations: number;
    network: number;
}

interface PageProps {
    score: number;
    score_band: 'low' | 'mid_low' | 'mid_high' | 'high';
    pillar_scores: PillarScores;
    score_band_label: string;
    score_band_message: string;
    next_action: string;
    completed_at: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_KEYS: (keyof PillarScores)[] = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];
const PILLAR_LABELS: Record<keyof PillarScores, string> = {
    potential: 'Potential',
    agility: 'Agility',
    risk: 'Risk',
    alignment: 'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network: 'Network',
};

const PILLAR_ICONS: Record<keyof PillarScores, React.ElementType> = {
    potential: Zap,
    agility: Activity,
    risk: ShieldCheck,
    alignment: Target,
    governance: Scale,
    operations: Cpu,
    network: Network,
};

const BAND_META: Record<
    string,
    {
        color: string;
        border: string;
        bg: string;
        textColor: string;
        badgeLabel: string;
        Icon: React.ElementType;
    }
> = {
    low: {
        color: '#EF4444',
        border: 'rgba(239,68,68,0.5)',
        bg: 'rgba(239,68,68,0.08)',
        textColor: '#FCA5A5',
        badgeLabel: 'High Risk Profile',
        Icon: AlertCircle,
    },
    mid_low: {
        color: '#F97316',
        border: 'rgba(249,115,22,0.5)',
        bg: 'rgba(249,115,22,0.08)',
        textColor: '#FDBA74',
        badgeLabel: 'Development Required',
        Icon: AlertTriangle,
    },
    mid_high: {
        color: '#3A54A5',
        border: 'rgba(58,84,165,0.6)',
        bg: 'rgba(58,84,165,0.12)',
        textColor: '#93C5FD',
        badgeLabel: 'Investment Pipeline',
        Icon: TrendingUp,
    },
    high: {
        color: '#10B981', // Premium emerald green
        border: 'rgba(16,185,129,0.6)',
        bg: 'rgba(16,185,129,0.12)',
        textColor: '#86efac',
        badgeLabel: 'Top Percentile',
        Icon: Zap,
    },
};

// ─── Fade-in-up wrapper ────────────────────────────────────────────────────────

function FadeUp({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DiagnosticResult({ score, score_band, pillar_scores, score_band_message }: PageProps) {
    const meta = BAND_META[score_band] ?? BAND_META.mid_high;
    const isReady = score_band === 'mid_high' || score_band === 'high';
    const [checklistClicked, setChecklistClicked] = useState(false);

    // Build Recharts data
    const radarData = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value: pillar_scores[k],
    }));

    return (
        <>
            <Head title="Your PARAGON Results" />

            <DiagnosticLayout glowColor={meta.color}>
                <div className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-8">
                    {/* Heading */}
                    <FadeUp delay={0.05} className="mb-10">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                            Your PARAGON Diagnostic Results
                        </h1>
                    </FadeUp>

                    {/* ── Top Hero Section: Score Ring + Analysis Message ── */}
                    <div className="grid gap-6 md:grid-cols-12 mb-8">
                        {/* Score Hero (Left 5 cols) */}
                        <FadeUp delay={0.1} className="md:col-span-5">
                            <div className="dx-card flex flex-col items-center justify-center p-8 h-full rounded-2xl">
                                {/* Band badge */}
                                <div
                                    className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-extrabold tracking-[0.2em] uppercase shadow-xs backdrop-blur-xs"
                                    style={{
                                        color: meta.color,
                                        borderColor: `${meta.color}25`,
                                        backgroundColor: `${meta.color}08`,
                                    }}
                                >
                                    <meta.Icon className="size-3" strokeWidth={2.5} />
                                    {meta.badgeLabel}
                                </div>

                                {/* Circular Score Gauge */}
                                <div className="relative flex items-center justify-center size-44 mb-6">
                                    <svg className="size-full rotate-[-90deg]">
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="76"
                                            className="fill-none"
                                            stroke="rgba(58, 84, 165, 0.05)"
                                            strokeWidth="8"
                                        />
                                        <motion.circle
                                            cx="88"
                                            cy="88"
                                            r="76"
                                            className="fill-none"
                                            stroke={meta.color}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 76}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 76 - (score / 100) * (2 * Math.PI * 76) }}
                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="font-display text-5xl font-black tracking-tight" style={{ color: meta.color }}>
                                            {score}
                                        </span>
                                        <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase mt-0.5">/100</span>
                                    </div>
                                </div>

                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase">
                                    Overall Diligence Score
                                </p>
                            </div>
                        </FadeUp>

                        {/* Analysis & CTA (Right 7 cols) */}
                        <FadeUp delay={0.15} className="md:col-span-7">
                            <div className="dx-card flex flex-col justify-center p-8 h-full rounded-2xl">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}10`, color: meta.color }}>
                                            <meta.Icon className="size-4" />
                                        </div>
                                        <h3 className="font-display text-base font-bold text-zinc-950 uppercase tracking-wider">
                                            What This Means
                                        </h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-zinc-650">{score_band_message}</p>
                                </div>
                            </div>
                        </FadeUp>
                    </div>

                    {/* ── Section: Full-width CTA Banner ── */}
                    <FadeUp delay={0.18} className="mb-8">
                        <div className="dx-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left space-y-1">
                                <h4 className="font-display text-base font-bold text-zinc-950">
                                    {isReady ? "Ready to join the accelerator?" : "Action items identified"}
                                </h4>
                                <p className="text-xs text-zinc-500">
                                    {isReady 
                                        ? "Your diagnostic score meets our benchmark. Proceed to complete your official application." 
                                        : "Address the gaps in your checklist to become eligible for the PIA program."}
                                </p>
                            </div>
                            
                            <div className="w-full md:w-auto shrink-0 min-w-[240px]">
                                {isReady ? (
                                    <a
                                        href="/checkout"
                                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#3A54A5] px-6 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-none transition-all duration-300 outline-none hover:bg-[#2D4182] hover:shadow-[0_8px_25px_rgba(58,84,165,0.25)] hover:scale-[1.005] active:scale-[0.99]"
                                    >
                                        Proceed to Application
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </a>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => setChecklistClicked(true)}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-4 text-xs font-bold tracking-[0.2em] text-zinc-700 uppercase transition-all duration-300 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] focus:outline-none hover:shadow-xs active:scale-[0.99]"
                                        >
                                            View Readiness Checklist
                                        </button>

                                        {checklistClicked && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-center text-xs leading-relaxed text-amber-800"
                                            >
                                                Sent to your email. Check inbox & spam folders.
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeUp>

                    {/* ── Bottom Section: Radar Chart + Pillar Breakdown Grid ── */}
                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Radar Chart Card (Left 5 cols) */}
                        <FadeUp delay={0.2} className="md:col-span-5">
                            <div className="dx-card flex flex-col justify-between p-6 h-full rounded-2xl">
                                <div className="mb-4">
                                    <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">Pillar Radar footprint</h3>
                                </div>
                                <div className="relative flex items-center justify-center flex-1">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                                            <PolarGrid stroke="rgba(58, 84, 165, 0.08)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} />
                                            <Radar
                                                dataKey="value"
                                                stroke={meta.color}
                                                fill={`${meta.color}25`}
                                                strokeWidth={2}
                                                dot={{ fill: meta.color, r: 3 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </FadeUp>

                        {/* Diligence Pillar Grid (Right 7 cols) */}
                        <FadeUp delay={0.25} className="md:col-span-7">
                            <div className="dx-card p-6 h-full rounded-2xl">
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
                                        Forensic Pillar Breakdown
                                    </h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {PILLAR_KEYS.map((key, i) => {
                                        const IconComponent = PILLAR_ICONS[key];
                                        const miniRadius = 16;
                                        const miniCircumference = 2 * Math.PI * miniRadius;
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200/60 bg-white/45 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-xs ${
                                                    i === PILLAR_KEYS.length - 1 ? 'sm:col-span-2' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3A54A5]/10 bg-white/90 text-[#3A54A5] shadow-xs">
                                                        <IconComponent className="size-4.5" strokeWidth={2} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-display text-xs font-bold text-zinc-950 leading-tight truncate">
                                                            {PILLAR_LABELS[key]}
                                                        </h4>
                                                        <p className="text-[9px] font-extrabold tracking-wider text-zinc-400 uppercase mt-0.5">
                                                            {pillar_scores[key] === 100 ? 'Verified' : pillar_scores[key] >= 80 ? 'Excellent' : pillar_scores[key] >= 50 ? 'Stable' : 'Review'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative flex items-center justify-center size-10 shrink-0">
                                                    <svg className="size-full rotate-[-90deg]">
                                                        <circle
                                                            cx="20"
                                                            cy="20"
                                                            r={miniRadius}
                                                            className="fill-none"
                                                            stroke="rgba(58, 84, 165, 0.05)"
                                                            strokeWidth="3.5"
                                                        />
                                                        <motion.circle
                                                            cx="20"
                                                            cy="20"
                                                            r={miniRadius}
                                                            className="fill-none"
                                                            stroke="#3A54A5"
                                                            strokeWidth="3.5"
                                                            strokeLinecap="round"
                                                            strokeDasharray={miniCircumference}
                                                            initial={{ strokeDashoffset: miniCircumference }}
                                                            animate={{ strokeDashoffset: miniCircumference - (pillar_scores[key] / 100) * miniCircumference }}
                                                            transition={{ duration: 1.0, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                                                        />
                                                    </svg>
                                                    <div className="absolute text-[8px] font-black text-zinc-700">
                                                        {pillar_scores[key]}%
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
