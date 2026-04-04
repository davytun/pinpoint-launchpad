import { Head } from '@inertiajs/react';
import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    need:       number;
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
    'potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need',
];
const PILLAR_LABELS: Record<keyof PillarScores, string> = {
    potential:  'Potential',
    agility:    'Agility',
    risk:       'Risk',
    alignment:  'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    need:       'Need',
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
        color: '#DC2626',
        border: 'rgba(220,38,38,0.5)',
        bg: 'rgba(220,38,38,0.08)',
        textColor: '#FCA5A5',
        badgeLabel: 'Build Phase',
        Icon: AlertCircle,
    },
    mid_low: {
        color: '#EA580C',
        border: 'rgba(234,88,12,0.5)',
        bg: 'rgba(234,88,12,0.08)',
        textColor: '#FDBA74',
        badgeLabel: 'Developing',
        Icon: AlertTriangle,
    },
    mid_high: {
        color: '#2563EB',
        border: 'rgba(37,99,235,0.5)',
        bg: 'rgba(37,99,235,0.08)',
        textColor: '#93C5FD',
        badgeLabel: 'Investment Ready',
        Icon: TrendingUp,
    },
    high: {
        color: '#059669',
        border: 'rgba(5,150,105,0.5)',
        bg: 'rgba(5,150,105,0.08)',
        textColor: '#6EE7B7',
        badgeLabel: 'High Velocity',
        Icon: Zap,
    },
};

// ─── Animated score count-up ───────────────────────────────────────────────────

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    const startTs = useRef<number>(0);

    useEffect(() => {
        startTs.current = performance.now();
        function tick(now: number) {
            const elapsed = now - startTs.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return <>{value}</>;
}

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
    const meta   = BAND_META[score_band] ?? BAND_META.mid_high;
    const isReady = score_band === 'mid_high' || score_band === 'high';

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
                        <h1 className="mb-10 text-2xl font-bold text-foreground sm:text-3xl">
                            Your PARAGON Diagnostic Results
                        </h1>
                    </FadeUp>

                    {/* ── Section 1: Score Hero ── */}
                    <FadeUp delay={0.1}>
                        <Card className="mb-8 border-border/50 bg-card/60 text-center">
                            <CardContent className="flex flex-col items-center py-10">
                                {/* Band badge */}
                                <Badge
                                    className="mb-5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                                    style={{ background: meta.bg, color: meta.textColor, border: `1px solid ${meta.border}` }}
                                >
                                    <meta.Icon className="mr-1.5 size-3" data-icon="inline-start" />
                                    {meta.badgeLabel}
                                </Badge>

                                {/* Animated score */}
                                <div className="flex items-end gap-1 leading-none">
                                    <span
                                        className="font-sans text-[6rem] font-black leading-none sm:text-[7.5rem]"
                                        style={{ color: meta.color }}
                                    >
                                        <CountUp target={score} duration={1500} />
                                    </span>
                                    <span className="mb-3 text-2xl font-light text-muted-foreground sm:mb-4">
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
                            <Card className="border-border/50 bg-card/40">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                                        Pillar Radar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                            <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: 'rgba(255,255,255,0.50)', fontSize: 11, fontWeight: 600 }}
                                            />
                                            <Radar
                                                dataKey="value"
                                                stroke="#2563EB"
                                                fill="rgba(37,99,235,0.15)"
                                                strokeWidth={2}
                                                dot={{ fill: '#2563EB', r: 3 }}
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
                                    className="border-border/50 bg-card/40"
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
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {score_band_message}
                                        </p>
                                    </CardContent>
                                </Card>
                            </FadeUp>

                            {/* Section 4: CTA */}
                            <FadeUp delay={0.32}>
                                {isReady ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.015, 1] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Button
                                            size="lg"
                                            className="w-full font-bold uppercase tracking-[0.18em]"
                                            style={{
                                                background: '#2563EB',
                                                boxShadow: '0 0 28px rgba(37,99,235,0.35)',
                                            }}
                                            asChild
                                        >
                                            <a href="/checkout">Proceed to Application →</a>
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full font-bold uppercase tracking-[0.18em] text-muted-foreground"
                                    >
                                        View Your Readiness Checklist
                                    </Button>
                                )}
                                {!isReady && (
                                    <p className="mt-2 text-center text-xs text-muted-foreground/60">
                                        Address these gaps, then retake.
                                    </p>
                                )}
                            </FadeUp>

                            {/* Pillar score breakdown */}
                            <FadeUp delay={0.38}>
                                <Card className="border-border/50 bg-card/40">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                            Pillar Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        {PILLAR_KEYS.map((key, i) => (
                                            <div key={key}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        {PILLAR_LABELS[key]}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground/50">
                                                        {pillar_scores[key]}%
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                                    <motion.div
                                                        className="h-full rounded-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pillar_scores[key]}%` }}
                                                        transition={{
                                                            duration: 0.7,
                                                            delay: 0.4 + i * 0.06,
                                                            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
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
