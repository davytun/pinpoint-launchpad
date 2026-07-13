import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, ArrowRight, TrendingUp, Zap } from 'lucide-react';
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
        color: '#2F4587',
        border: 'rgba(60,83,168,0.6)',
        bg: 'rgba(60,83,168,0.12)',
        textColor: '#93C5FD',
        badgeLabel: 'Investment Pipeline',
        Icon: TrendingUp,
    },
    high: {
        color: '#5CA336',
        border: 'rgba(92,163,54,0.6)',
        bg: 'rgba(92,163,54,0.12)',
        textColor: '#86efac',
        badgeLabel: 'Top Percentile',
        Icon: Zap,
    },
};

// ─── Fade-in-up wrapper ────────────────────────────────────────────────────────

function FadeUp({ delay, children }: { delay: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
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
                    <FadeUp delay={0.05}>
                        <h1 className="font-display mb-10 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">Your PARAGON Diagnostic Results</h1>
                    </FadeUp>

                    {/* ── Section 1: Score Hero ── */}
                    <FadeUp delay={0.1}>
                        <div className="dx-card mb-8 overflow-hidden rounded-xl p-0 md:rounded-2xl">
                            <div className="flex flex-col items-center p-6 sm:p-10">
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

                                {/* Static score */}
                                <div className="flex items-end gap-1 leading-none">
                                    <span
                                        className="font-display text-[6.5rem] leading-none font-black tracking-tighter sm:text-[8rem]"
                                        style={{
                                            color: meta.color,
                                        }}
                                    >
                                        {score}
                                    </span>
                                    <span className="font-display mb-3 text-2xl font-light text-zinc-400 sm:mb-5">/100</span>
                                </div>

                                <p className="mt-3 text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase">
                                    Overall Diligence Score
                                </p>
                            </div>
                        </div>
                    </FadeUp>

                    {/* ── Section 2 + 3 + 4: Radar + Message + CTA grid ── */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Radar chart */}
                        <FadeUp delay={0.2}>
                            <div className="dx-card overflow-hidden rounded-xl md:rounded-2xl">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Pillar Radar</h3>
                                </div>
                                <div className="p-6 pt-0 relative">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                                            <PolarGrid stroke="rgba(0, 0, 0, 0.08)" />
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

                        {/* Right column */}
                        <div className="flex flex-col gap-5">
                            {/* Section 3: Score band message */}
                            <FadeUp delay={0.25}>
                                <div className="dx-card overflow-hidden rounded-xl md:rounded-2xl">
                                    <div className="flex flex-col space-y-1.5 p-6 pb-2">
                                        <h3
                                            className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase"
                                            style={{ color: meta.color, opacity: 0.85 }}
                                        >
                                            <meta.Icon className="size-4" />
                                            What This Means
                                        </h3>
                                    </div>
                                    <div className="p-6 pt-0">
                                        <p className="text-sm leading-relaxed text-zinc-600">{score_band_message}</p>
                                    </div>
                                </div>
                            </FadeUp>

                            {/* Section 4: CTA */}
                            <FadeUp delay={0.32}>
                                {isReady ? (
                                    <div>
                                        <a
                                            href="/checkout"
                                            className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-white/5 bg-[#3A54A5] px-5 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-none transition-all duration-300 outline-none hover:bg-[#2D4182] hover:shadow-[0_8px_25px_rgba(58,84,165,0.25)] hover:scale-[1.005] active:scale-[0.99]"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                Proceed to Application
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => setChecklistClicked(true)}
                                            className="w-full rounded-md border border-zinc-200 bg-white px-5 py-4 text-xs font-bold tracking-[0.2em] text-zinc-700 uppercase transition-all duration-200 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] focus:outline-none"
                                        >
                                            View Your Readiness Checklist
                                        </button>

                                        {checklistClicked && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-center text-xs leading-relaxed text-amber-800"
                                            >
                                                Your Readiness Checklist was sent to the email you provided. Check your inbox (and spam folder) for a
                                                message from Pinpoint Launchpad.
                                            </motion.div>
                                        )}

                                        <p className="mt-1 text-center text-xs text-zinc-500">Address these gaps, then retake.</p>
                                    </div>
                                )}
                            </FadeUp>

                            {/* Pillar score breakdown */}
                            <FadeUp delay={0.38}>
                                <div className="dx-card overflow-hidden rounded-xl md:rounded-2xl">
                                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                                            Pillar Breakdown
                                        </h3>
                                    </div>
                                    <div className="p-6 pt-0 flex flex-col gap-4">
                                        {PILLAR_KEYS.map((key, i) => (
                                            <div key={key} className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-zinc-700">{PILLAR_LABELS[key]}</span>
                                                    <span className="text-xs font-medium text-zinc-500">{pillar_scores[key]}%</span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#3A54A5]/10">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pillar_scores[key]}%` }}
                                                        transition={{
                                                            duration: 0.7,
                                                            delay: 0.4 + i * 0.06,
                                                            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                                                        }}
                                                        style={{
                                                            backgroundColor: '#3A54A5',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
