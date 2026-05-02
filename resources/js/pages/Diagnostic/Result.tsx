import { Head } from '@inertiajs/react';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PillarScores {
    potential:  number;
    agility:    number;
    risk:       number;
    alignment:  number;
    governance: number;
    operations: number;
    network:    number;
}

interface PageProps {
    score:              number;
    score_band:         'low' | 'mid_low' | 'mid_high' | 'high';
    pillar_scores:      PillarScores;
    score_band_label:   string;
    score_band_message: string;
    next_action:        string;
    completed_at:       string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_KEYS: (keyof PillarScores)[] = [
    'potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network',
];
const PILLAR_LABELS: Record<keyof PillarScores, string> = {
    potential:  'Potential',
    agility:    'Agility',
    risk:       'Risk',
    alignment:  'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network:    'Network',
};

const BAND_META: Record<string, {
    color: string;
    border: string;
    bg: string;
    textColor: string;
    badgeLabel: string;
    Icon: React.ElementType;
}> = {
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
        color: '#3C53A8',
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

export default function DiagnosticResult({
    score,
    score_band,
    pillar_scores,
    score_band_message,
}: PageProps) {
    const meta    = BAND_META[score_band] ?? BAND_META.mid_high;
    const isReady = score_band === 'mid_high' || score_band === 'high';
    const [checklistClicked, setChecklistClicked] = useState(false);

    // Build Recharts data
    const radarData = PILLAR_KEYS.map(k => ({
        subject: PILLAR_LABELS[k],
        value:   pillar_scores[k],
    }));

    return (
        <>
            <Head title="Your PARAGON Results" />

            <DiagnosticLayout glowColor={meta.color}>
                <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-8">

                    {/* Heading */}
                    <FadeUp delay={0.05}>
                        <h1 className="mb-10 text-2xl font-bold text-[#ECF0F9] sm:text-3xl">
                            Your PARAGON Diagnostic Results
                        </h1>
                    </FadeUp>

                    {/* ── Section 1: Score Hero ── */}
                    <FadeUp delay={0.1}>
                        <Card className="waitlist-panel mb-8 overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] p-0 shadow-md md:rounded-[1.75rem]">
                            <CardContent className="flex flex-col items-center p-6 sm:p-10">
                                {/* Band badge */}
                                <Badge
                                    className="mb-5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                                    style={{ background: meta.bg, color: meta.textColor, border: `1px solid ${meta.border}` }}
                                >
                                    <meta.Icon className="mr-1.5 size-3" data-icon="inline-start" />
                                    {meta.badgeLabel}
                                </Badge>

                                {/* Static score */}
                                <div className="flex items-end gap-1 leading-none">
                                    <span
                                        className="font-display text-[6.5rem] font-black leading-none tracking-tighter sm:text-[8rem]"
                                        style={{
                                            color: meta.color,
                                            textShadow: `0 0 40px ${meta.color}66`,
                                        }}
                                    >
                                        {score}
                                    </span>
                                    <span className="mb-3 font-display text-2xl font-light text-[#576FA8] sm:mb-5">
                                        /100
                                    </span>
                                </div>

                                <p
                                    className="mt-3 text-sm font-semibold uppercase tracking-widest"
                                    style={{ color: meta.color, opacity: 0.75 }}
                                >
                                    {meta.badgeLabel}
                                </p>
                            </CardContent>
                        </Card>
                    </FadeUp>

                    {/* ── Section 2 + 3 + 4: Radar + Message + CTA grid ── */}
                    <div className="grid gap-6 md:grid-cols-2">

                        {/* Radar chart */}
                        <FadeUp delay={0.2}>
                            <Card className="waitlist-panel overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] shadow-md md:rounded-[1.75rem]">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-[#576FA8]">
                                        Pillar Radar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]" style={{ background: `radial-gradient(circle, ${meta.color}66, transparent 70%)` }} />
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                                            <PolarGrid stroke="#232C43" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#788CBA', fontSize: 11, fontWeight: 600 }}
                                            />
                                            <Radar
                                                dataKey="value"
                                                stroke={meta.color}
                                                fill={`${meta.color}25`}
                                                strokeWidth={2}
                                                dot={{ fill: meta.color, r: 3 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </FadeUp>

                        {/* Right column */}
                        <div className="flex flex-col gap-5">

                            {/* Section 3: Score band message */}
                            <FadeUp delay={0.25}>
                                <Card
                                    className="waitlist-panel overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] shadow-md md:rounded-[1.75rem]"
                                    style={{ borderLeft: `3px solid ${meta.border}` }}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle
                                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em]"
                                            style={{ color: meta.color, opacity: 0.85 }}
                                        >
                                            <meta.Icon className="size-4" />
                                            What This Means
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed text-[#788CBA]">
                                            {score_band_message}
                                        </p>
                                    </CardContent>
                                </Card>
                            </FadeUp>

                            {/* Section 4: CTA */}
                            <FadeUp delay={0.32}>
                                {isReady ? (
                                    <div>
                                        <a
                                            href="/checkout"
                                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200"
                                            style={{
                                                background: meta.color,
                                                boxShadow: `0 0 28px ${meta.color}66`,
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.filter = ''; }}
                                        >
                                            <span className="waitlist-shimmer absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
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
                                            className="w-full rounded-xl border border-[#232C43] bg-[#0C1427]/50 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#788CBA] transition-colors hover:bg-[#1B294B]/30 hover:text-[#ECF0F9]"
                                        >
                                            View Your Readiness Checklist
                                        </button>

                                        {checklistClicked && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center text-xs leading-relaxed text-amber-300/80"
                                            >
                                                Your Readiness Checklist was sent to the email you provided.
                                                Check your inbox (and spam folder) for a message from Pinpoint Launchpad.
                                            </motion.div>
                                        )}

                                        <p className="mt-1 text-center text-xs text-[#576FA8]">
                                            Address these gaps, then retake.
                                        </p>
                                    </div>
                                )}
                            </FadeUp>

                            {/* Pillar score breakdown */}
                            <FadeUp delay={0.38}>
                                <Card className="waitlist-panel overflow-hidden rounded-3xl border border-[#232C43] bg-[#101623] shadow-md md:rounded-[1.75rem]">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#576FA8]">
                                            Pillar Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        {PILLAR_KEYS.map((key, i) => (
                                            <div key={key}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-[#788CBA]">
                                                        {PILLAR_LABELS[key]}
                                                    </span>
                                                    <span className="text-xs text-[#576FA8]">
                                                        {pillar_scores[key]}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0C1427] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
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
                                                            background: `linear-gradient(90deg, #3C53A8 0%, #5CA336 100%)`,
                                                            boxShadow: '0 0 10px rgba(92,163,54,0.5)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </FadeUp>
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
