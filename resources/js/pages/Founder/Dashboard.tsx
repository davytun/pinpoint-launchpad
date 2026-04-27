import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileText,
    MessageSquare,
    Package,
    Star,
    TrendingUp,
    User,
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
import { Skeleton } from '@/components/ui/skeleton';
import FounderLayout from '@/layouts/founder-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PillarScores {
    potential?: number;
    agility?: number;
    risk?: number;
    alignment?: number;
    governance?: number;
    operations?: number;
    need?: number;
    [key: string]: number | undefined;
}

interface Founder {
    id: number;
    email: string;
    full_name?: string | null;
    company_name?: string | null;
    avatar?: string | null;
    created_at?: string | null;
    last_login_at?: string | null;
}

interface PageProps {
    founder: Founder;
    score?: number | null;
    score_band?: string | null;
    pillar_scores: PillarScores;
    score_band_message?: string;
    tier?: string | null;
    tier_features: string[];
    audit_status: string;
    audit_status_config: Record<string, { label: string; color: string; description: string }>;
    payment?: { tier: string; total_amount: number; paid_at?: string | null } | null;
    signature?: { status: string; signed_at?: string | null } | null;
    verification_url?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need'];
const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential', agility: 'Agility', risk: 'Risk',
    alignment: 'Alignment', governance: 'Governance', operations: 'Operations', need: 'Need',
};

const BAND_META: Record<string, { color: string; border: string; bg: string; textColor: string; badgeLabel: string; Icon: React.ElementType }> = {
    low:      { color: '#EF4444', border: 'rgba(239,68,68,0.5)',   bg: 'rgba(239,68,68,0.08)',   textColor: '#FCA5A5', badgeLabel: 'High Risk Profile',     Icon: AlertCircle  },
    mid_low:  { color: '#F97316', border: 'rgba(249,115,22,0.5)',  bg: 'rgba(249,115,22,0.08)',  textColor: '#FDBA74', badgeLabel: 'Development Required',   Icon: AlertTriangle },
    mid_high: { color: '#3C53A8', border: 'rgba(60,83,168,0.6)',   bg: 'rgba(60,83,168,0.12)',   textColor: '#93C5FD', badgeLabel: 'Investment Pipeline',    Icon: TrendingUp    },
    high:     { color: '#5CA336', border: 'rgba(92,163,54,0.6)',   bg: 'rgba(92,163,54,0.12)',   textColor: '#86efac', badgeLabel: 'Top Percentile',         Icon: Zap           },
};

const TIER_LABELS: Record<string, string> = {
    foundation:    'Foundation',
    growth:        'Growth',
    institutional: 'Institutional',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(name?: string | null): string {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const first = name?.split(' ')[0] ?? 'Founder';
    return `Good ${time}, ${first}.`;
}

function fmtDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function fmtDateTime(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

// ─── Count-up (exact from Diagnostic/Result.tsx) ──────────────────────────────

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
    const [value, setValue] = useState(0);
    const raf = useRef<number>(0);
    const startTs = useRef<number>(0);

    useEffect(() => {
        startTs.current = performance.now();
        function tick(now: number) {
            const elapsed  = now - startTs.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return <>{value}</>;
}

// ─── FadeUp ───────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
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

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function ProgressStepper({ auditStatus }: { auditStatus: string }) {
    const steps = [
        { label: 'Application', done: true,                              active: false },
        { label: 'Payment',     done: true,                              active: false },
        { label: 'Agreement',   done: true,                              active: false },
        { label: 'Audit',       done: auditStatus === 'complete',        active: auditStatus !== 'complete' },
        { label: 'Certified',   done: auditStatus === 'complete',        active: false, locked: auditStatus !== 'complete' },
    ];

    return (
        <div className="flex items-center gap-1">
            {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={[
                                'flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all',
                                step.done   ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400' :
                                step.active ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.3)]' :
                                              'border-white/[0.07] bg-white/[0.02] text-white/20',
                            ].join(' ')}
                        >
                            {step.done ? <CheckCircle2 className="size-3" /> : i + 1}
                        </div>
                        <span
                            className={[
                                'text-[9px] font-bold uppercase tracking-[0.12em]',
                                step.done   ? 'text-emerald-400/70' :
                                step.active ? 'text-blue-400/80' :
                                              'text-white/20',
                            ].join(' ')}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={[
                                'mb-4 h-px w-4 sm:w-6',
                                step.done ? 'bg-emerald-500/30' : 'bg-white/[0.06]',
                            ].join(' ')}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderDashboard({
    founder, score, score_band, pillar_scores,
    score_band_message, tier, tier_features,
    audit_status, audit_status_config,
    payment,
}: PageProps) {
    const [accountOpen, setAccountOpen] = useState(false);

    const meta       = BAND_META[score_band ?? 'mid_high'] ?? BAND_META.mid_high;
    const tierLabel  = TIER_LABELS[tier ?? ''] ?? (tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : 'Foundation');
    const statusCfg  = audit_status_config[audit_status] ?? audit_status_config['pending'];

    const hasPillarData = Object.values(pillar_scores).some((v) => (v ?? 0) > 0);
    const radarData = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value:   pillar_scores[k] ?? 0,
    }));

    // Audit status border accent
    const statusBorderColor =
        audit_status === 'in_progress' ? 'rgba(37,99,235,0.3)' :
        audit_status === 'needs_info'  ? 'rgba(245,158,11,0.3)' :
        audit_status === 'complete'    ? 'rgba(16,185,129,0.3)' :
        'rgba(255,255,255,0.06)';

    return (
        <FounderLayout founder={founder}>
            <Head title="Dashboard — Pinpoint Launchpad" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Section 1 — Welcome Header ── */}
                <FadeUp delay={0}>
                    <div className="mb-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                            {meta.badgeLabel}
                        </span>
                        <h1 className="font-display mt-4 text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
                            {greeting(founder.full_name)}
                        </h1>
                        <p className="mt-1.5 text-[14px] text-white/40">
                            {founder.company_name ?? '—'} — {tierLabel} Audit
                        </p>
                    </div>
                </FadeUp>

                {/* ── Section 2 — Audit Status ── */}
                <FadeUp delay={0.08}>
                    <div
                        className="waitlist-panel mb-6 overflow-hidden rounded-3xl border bg-[#0A0A0A] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        style={{ borderColor: statusBorderColor }}
                    >
                        <div className="p-6 sm:p-8">
                            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                Audit Status
                            </p>
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                {/* Left */}
                                <div className="flex-1">
                                    <Badge
                                        className="mb-3 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        {statusCfg.label}
                                    </Badge>
                                    <p className="text-[13px] leading-relaxed text-white/40">
                                        {statusCfg.description}
                                    </p>

                                    {audit_status === 'needs_info' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4"
                                        >
                                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
                                            <div>
                                                <p className="text-[13px] font-semibold text-amber-300">
                                                    Your analyst needs additional information.
                                                </p>
                                                <p className="mt-0.5 text-[12px] text-amber-400/60">
                                                    Please check your Messages tab.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {audit_status === 'complete' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                            <div>
                                                <p className="text-[13px] font-semibold text-emerald-300">
                                                    Your PARAGON Certification is complete.
                                                </p>
                                                <p className="mt-0.5 text-[12px] text-emerald-400/60">
                                                    Your investor verification page is now live.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Right — stepper */}
                                <div className="sm:shrink-0">
                                    <ProgressStepper auditStatus={audit_status} />
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Section 3 — PARAGON Score + Radar ── */}
                <FadeUp delay={0.16}>
                    <div className="mb-6 grid gap-5 sm:grid-cols-2">

                        {/* Score */}
                        <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
                            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                Your PARAGON Score
                            </p>
                            {score != null ? (
                                <>
                                    <div className="flex items-end gap-1 leading-none">
                                        <span
                                            className="font-display text-[6rem] font-black leading-none tracking-tighter sm:text-[7rem]"
                                            style={{ color: meta.color, textShadow: `0 0 40px ${meta.color}66` }}
                                        >
                                            <CountUp target={score} duration={1500} />
                                        </span>
                                        <span className="mb-3 font-display text-2xl font-light text-white/25 sm:mb-5">
                                            /100
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Badge
                                            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
                                            style={{ background: meta.bg, color: meta.textColor, border: `1px solid ${meta.border}` }}
                                        >
                                            <meta.Icon className="mr-1.5 inline size-3" aria-hidden="true" />
                                            {meta.badgeLabel}
                                        </Badge>
                                    </div>
                                    {score_band_message && (
                                        <p className="mt-3 text-[12px] leading-relaxed text-white/30">{score_band_message}</p>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3" aria-label="Score pending">
                                    <Skeleton className="h-20 w-28 rounded-xl bg-white/[0.04]" />
                                    <Skeleton className="h-4 w-32 rounded bg-white/[0.04]" />
                                    <p className="text-[11px] text-white/20">Score pending audit assignment</p>
                                </div>
                            )}
                        </div>

                        {/* Radar */}
                        <figure className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
                            <figcaption className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                Pillar Radar
                            </figcaption>
                            {hasPillarData ? (
                                <div className="relative">
                                    <div
                                        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
                                        style={{ background: `radial-gradient(circle, ${meta.color}66, transparent 70%)` }}
                                    />
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                                            <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: 'rgba(255,255,255,0.50)', fontSize: 11, fontWeight: 600 }}
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
                                </div>
                            ) : (
                                <div className="flex h-[280px] flex-col items-center justify-center gap-4" aria-label="Pillar scores pending">
                                    <div className="space-y-2 w-full px-4">
                                        <Skeleton className="mx-auto h-28 w-28 rounded-full bg-white/[0.04]" />
                                        <Skeleton className="mx-auto h-3 w-3/4 rounded bg-white/[0.04]" />
                                        <Skeleton className="mx-auto h-3 w-1/2 rounded bg-white/[0.04]" />
                                    </div>
                                    <p className="text-[11px] text-white/20">Pillar data pending audit assignment</p>
                                </div>
                            )}
                        </figure>
                    </div>
                </FadeUp>

                {/* ── Section 4 — Audit Package ── */}
                <FadeUp delay={0.24}>
                    <div className="waitlist-panel mb-6 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-blue-500/10">
                                    <Package className="size-4 text-blue-400" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                        Audit Package
                                    </p>
                                    <h2 className="font-display text-[15px] font-semibold text-white">
                                        {tierLabel} — What's Included
                                    </h2>
                                </div>
                            </div>
                            {payment && (
                                <span className="text-[13px] font-semibold text-white/50">
                                    ${Number(payment.total_amount).toLocaleString()} USD
                                </span>
                            )}
                        </div>

                        <ul className="space-y-3">
                            {tier_features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500/70" aria-hidden="true" />
                                    <span className="text-[13px] leading-relaxed text-white/70">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {tier === 'institutional' && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
                                <Star className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
                                <p className="text-[12px] leading-relaxed text-amber-300/80">
                                    $1,500 credited against your 2% equity warrant upon successful raise.
                                </p>
                            </div>
                        )}
                    </div>
                </FadeUp>

                {/* ── Section 5 — Quick Actions ── */}
                <FadeUp delay={0.32}>
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">

                        {/* Documents */}
                        <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] opacity-50">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-blue-500/10">
                                <FileText className="size-4 text-blue-400" aria-hidden="true" />
                            </div>
                            <h3 className="mb-1 text-[14px] font-semibold text-white">Upload Documents</h3>
                            <p className="mb-4 text-[12px] leading-relaxed text-white/30">
                                Share financials, cap table, and supporting documents with your analyst.
                            </p>
                            <button
                                disabled
                                className="cursor-not-allowed rounded-xl border border-white/[0.06] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white/20"
                            >
                                Go to Documents
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] opacity-50">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-blue-500/10">
                                <MessageSquare className="size-4 text-blue-400" aria-hidden="true" />
                            </div>
                            <h3 className="mb-1 text-[14px] font-semibold text-white">Message Analyst</h3>
                            <p className="mb-4 text-[12px] leading-relaxed text-white/30">
                                Ask questions or send updates directly to your assigned analyst.
                            </p>
                            <button
                                disabled
                                className="cursor-not-allowed rounded-xl border border-white/[0.06] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white/20"
                            >
                                Go to Messages
                            </button>
                        </div>

                        {/* Investor Page */}
                        <div className="waitlist-panel group overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-blue-500/10">
                                <ExternalLink className="size-4 text-blue-400" aria-hidden="true" />
                            </div>
                            <h3 className="mb-1 text-[14px] font-semibold text-white">Your Investor Page</h3>
                            <p className="mb-4 text-[12px] leading-relaxed text-white/30">
                                Your public verification page goes live once your audit is complete.
                            </p>
                            <a
                                href="/verify/sample-unicorn"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.1] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white/60 transition-all duration-200 hover:border-white/20 hover:text-white"
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-40" />
                                <span className="relative z-10">Preview Sample →</span>
                            </a>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Section 6 — Account Details ── */}
                <FadeUp delay={0.40}>
                    <div className="waitlist-panel overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <button
                            onClick={() => setAccountOpen((v) => !v)}
                            aria-expanded={accountOpen}
                            aria-controls="account-details-panel"
                            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200 hover:bg-white/[0.02]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                                    <User className="size-3.5 text-white/40" aria-hidden="true" />
                                </div>
                                <span className="text-[13px] font-semibold text-white/70">Account Details</span>
                            </div>
                            {accountOpen
                                ? <ChevronUp   className="size-4 text-white/20" aria-hidden="true" />
                                : <ChevronDown className="size-4 text-white/20" aria-hidden="true" />}
                        </button>

                        <AnimatePresence>
                            {accountOpen && (
                                <motion.div
                                    id="account-details-panel"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t border-white/[0.05] px-6 py-2">
                                        <dl>
                                            {[
                                                { label: 'Full Name',    value: founder.full_name,                 editable: true  },
                                                { label: 'Company',      value: founder.company_name,              editable: true  },
                                                { label: 'Email',        value: founder.email,                     editable: false },
                                                { label: 'Member Since', value: fmtDate(founder.created_at),       editable: false },
                                                { label: 'Last Login',   value: fmtDateTime(founder.last_login_at), editable: false },
                                            ].map(({ label, value, editable }, i, arr) => (
                                                <div
                                                    key={label}
                                                    className={[
                                                        'flex items-center justify-between py-3.5',
                                                        i < arr.length - 1 ? 'border-b border-white/[0.04]' : '',
                                                    ].join(' ')}
                                                >
                                                    <div>
                                                        <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">{label}</dt>
                                                        <dd className="mt-0.5 text-[13px] text-white/60">{value ?? '—'}</dd>
                                                    </div>
                                                    {editable && (
                                                        <button
                                                            disabled
                                                            title="Editing coming soon"
                                                            className="cursor-not-allowed text-[11px] text-white/15"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </FadeUp>

            </div>
        </FounderLayout>
    );
}
