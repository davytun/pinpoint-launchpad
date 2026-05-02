import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    FileText,
    MessageSquare,
    TrendingUp,
    Zap,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    User
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
    profile_is_live?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need'];
const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential', agility: 'Agility', risk: 'Risk',
    alignment: 'Alignment', governance: 'Governance', operations: 'Operations', need: 'Need',
};

// Adjusted colors to be slightly more muted for Fintech Pro, maintaining semantic meaning
const BAND_META: Record<string, { color: string; border: string; bg: string; textColor: string; badgeLabel: string; Icon: React.ElementType }> = {
    low:      { color: '#EF4444', border: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.1)',   textColor: '#FCA5A5', badgeLabel: 'High Risk Profile',     Icon: AlertCircle  },
    mid_low:  { color: '#F97316', border: 'rgba(249,115,22,0.3)',  bg: 'rgba(249,115,22,0.1)',  textColor: '#FDBA74', badgeLabel: 'Development Required',   Icon: AlertTriangle },
    mid_high: { color: '#4468BB', border: 'rgba(68,104,187,0.4)',  bg: 'rgba(68,104,187,0.15)', textColor: '#9AA9CB', badgeLabel: 'Investment Pipeline',    Icon: TrendingUp    },
    high:     { color: '#5CA336', border: 'rgba(92,163,54,0.4)',   bg: 'rgba(92,163,54,0.15)',  textColor: '#86efac', badgeLabel: 'Top Percentile',         Icon: Zap           },
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

// ─── Count-up ─────────────────────────────────────────────────────────────────

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }} // Subtle, fast easing
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
        { label: 'Certified',   done: auditStatus === 'complete',        active: false },
    ];

    return (
        <div className="flex w-full items-center justify-between mt-2 sm:mt-6 pb-8">
            {steps.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1 last:flex-none">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center relative">
                        <div
                            className={[
                                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border transition-colors duration-200 shrink-0 relative z-10',
                                step.done   ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                                step.active ? 'border-[#4468BB]/80 bg-[#4468BB]/10 text-[#6986C9]' :
                                              'border-[#232C43] bg-[#0C1427] text-[#576FA8]',
                            ].join(' ')}
                        >
                            {step.done ? <CheckCircle2 className="size-3.5" /> : i + 1}
                        </div>
                        
                        {/* Label */}
                        <span
                            className={[
                                'mt-3 absolute top-6 whitespace-nowrap text-[11px] font-medium tracking-wide transition-colors duration-200',
                                step.done   ? 'text-emerald-400' :
                                step.active ? 'text-[#9AA9CB]' :
                                              'text-[#455987]',
                            ].join(' ')}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {i < steps.length - 1 && (
                        <div className="flex-1 px-2">
                            <div
                                className={[
                                    'h-[1px] w-full transition-colors duration-300',
                                    step.done ? 'bg-emerald-500/40' : 'bg-[#232C43]',
                                ].join(' ')}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Card Components ───

function ProCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] shadow-sm ${className}`}>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderDashboard({
    founder, score, score_band, pillar_scores,
    score_band_message, tier, tier_features,
    audit_status, audit_status_config,
    payment, verification_url, profile_is_live,
}: PageProps) {
    const meta       = BAND_META[score_band ?? 'mid_high'] ?? BAND_META.mid_high;
    const tierLabel  = TIER_LABELS[tier ?? ''] ?? (tier ? (tier.charAt(0).toUpperCase() + tier.slice(1)) : 'Foundation');
    const statusCfg  = audit_status_config[audit_status] ?? audit_status_config['pending'];

    const [accountOpen, setAccountOpen] = useState(false);

    const hasPillarData = Object.values(pillar_scores).some((v) => (v ?? 0) > 0);
    const radarData = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value:   pillar_scores[k] ?? 0,
    }));

    return (
        <FounderLayout founder={founder}>
            <Head title="Dashboard — Pinpoint Launchpad" />

            <div className="mx-auto max-w-[64rem] space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* ── Section 1 — Welcome Header ── */}
                <FadeUp delay={0}>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#232C43] bg-[#101623] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#9AA9CB]">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                                {meta.badgeLabel}
                            </div>
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                {greeting(founder.full_name)}
                            </h1>
                            <p className="mt-1.5 text-[14px] text-[#788CBA]">
                                {founder.company_name ?? '—'} <span className="mx-2 opacity-50">•</span> {tierLabel} Audit
                            </p>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Section 2 — Audit Status ── */}
                <FadeUp delay={0.1}>
                    <ProCard className="p-6 sm:p-8">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="lg:w-1/2">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#788CBA]">
                                        Current Phase
                                    </span>
                                    <Badge
                                        className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#232C43] text-[#DCE2EF] border-none"
                                    >
                                        {statusCfg.label}
                                    </Badge>
                                </div>
                                
                                <p className="text-[15px] leading-relaxed text-[#9AA9CB] max-w-lg">
                                    {statusCfg.description}
                                </p>

                                {audit_status === 'needs_info' && (
                                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                        <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-medium text-amber-400">Action Required</p>
                                            <p className="mt-1 text-[13px] text-amber-400/80">Your analyst requested more details. Please check your Messages.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="lg:w-[45%] lg:pb-0 pb-4">
                                <ProgressStepper auditStatus={audit_status} />
                            </div>
                        </div>
                    </ProCard>
                </FadeUp>

                {/* ── Section 3 — PARAGON Score & Radar ── */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <FadeUp delay={0.15}>
                        <ProCard className="flex h-full flex-col items-center justify-center p-8 text-center relative">
                            <p className="mb-6 text-[12px] font-semibold uppercase tracking-wider text-[#788CBA]">
                                PARAGON Score
                            </p>
                            {score != null ? (
                                <>
                                    <div className="mb-5 flex items-baseline justify-center">
                                        <span
                                            className="font-display text-[5.5rem] font-bold leading-none tracking-tighter"
                                            style={{ color: meta.color }}
                                        >
                                            <CountUp target={score} duration={1500} />
                                        </span>
                                    </div>
                                    <Badge
                                        className="rounded-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                                        style={{ background: meta.bg, color: meta.textColor, border: `1px solid ${meta.border}` }}
                                    >
                                        <meta.Icon className="mr-2 inline size-3.5" aria-hidden="true" />
                                        {meta.badgeLabel}
                                    </Badge>
                                    {score_band_message && (
                                        <p className="mt-4 text-[13px] leading-relaxed text-[#788CBA]">
                                            {score_band_message}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 py-6">
                                    <Skeleton className="h-16 w-24 rounded-lg bg-[#232C43]" />
                                    <p className="text-[13px] text-[#576FA8]">Score pending audit completion</p>
                                </div>
                            )}
                        </ProCard>
                    </FadeUp>

                    <FadeUp delay={0.20}>
                        <ProCard className="h-full p-6 sm:p-8">
                            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#788CBA]">
                                Pillar Breakdown
                            </p>
                            {hasPillarData ? (
                                <div className="relative h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                            <PolarGrid stroke="#232C43" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#788CBA', fontSize: 11, fontWeight: 500 }}
                                            />
                                            <Radar
                                                dataKey="value"
                                                stroke={meta.color}
                                                fill={meta.color}
                                                fillOpacity={0.15}
                                                strokeWidth={2}
                                                dot={{ fill: meta.color, r: 3, strokeWidth: 0 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[220px] flex-col items-center justify-center gap-4">
                                    <Skeleton className="h-28 w-28 rounded-full bg-[#232C43]" />
                                    <p className="text-[13px] text-[#576FA8]">Pillar data unlocked post-audit</p>
                                </div>
                            )}
                        </ProCard>
                    </FadeUp>
                </div>

                {/* ── Section 4 — Audit Package ── */}
                <FadeUp delay={0.25}>
                    <ProCard className="p-6 sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#232C43] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1B294B] text-[#9AA9CB]">
                                    <FileText className="size-4.5" />
                                </div>
                                <h2 className="text-[16px] font-medium text-[#ECF0F9]">
                                    {tierLabel} Package Inclusions
                                </h2>
                            </div>
                            {payment && (
                                <span className="text-[14px] font-medium text-[#788CBA]">
                                    Paid: ${Number(payment.total_amount).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            {tier_features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4468BB]" />
                                    <span className="text-[14px] leading-relaxed text-[#BCC5DC]">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </ProCard>
                </FadeUp>

                {/* ── Section 5 — Quick Actions ── */}
                <FadeUp delay={0.30}>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Link
                            href={route('founder.documents.index')}
                            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] p-5 transition-colors hover:border-[#4468BB] hover:bg-[#1B294B]"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#0C1427] border border-[#232C43]">
                                <FileText className="size-4.5 text-[#9AA9CB] transition-colors group-hover:text-[#D8E0F3]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-medium text-[#ECF0F9]">Documents</h3>
                                <p className="mt-1 text-[13px] text-[#788CBA]">Manage and upload requested files.</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#4468BB] transition-colors group-hover:text-[#8FA4D6]">
                                View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </Link>

                        <Link
                            href={route('founder.messages.index')}
                            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] p-5 transition-colors hover:border-[#4468BB] hover:bg-[#1B294B]"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#0C1427] border border-[#232C43]">
                                <MessageSquare className="size-4.5 text-[#9AA9CB] transition-colors group-hover:text-[#D8E0F3]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-medium text-[#ECF0F9]">Messages</h3>
                                <p className="mt-1 text-[13px] text-[#788CBA]">Communicate directly with your analyst.</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#4468BB] transition-colors group-hover:text-[#8FA4D6]">
                                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </Link>

                        <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0C1427] border border-[#232C43]">
                                    <ExternalLink className="size-4.5 text-[#9AA9CB]" />
                                </div>
                                {profile_is_live && (
                                    <span className="rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                                        Live
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-[15px] font-medium text-[#ECF0F9]">Investor Page</h3>
                                <p className="mt-1 text-[13px] text-[#788CBA]">
                                    {profile_is_live ? 'Your page is publicly visible.' : 'Goes live post-audit.'}
                                </p>
                            </div>
                            {profile_is_live && verification_url ? (
                                <a
                                    href={verification_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group mt-5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-emerald-400 transition-colors hover:text-emerald-300"
                                >
                                    View Link <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </a>
                            ) : (
                                <div className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#455987]">
                                    Pending Audit
                                </div>
                            )}
                        </div>
                    </div>
                </FadeUp>
                {/* ── Section 6 — Account Details ── */}
                <FadeUp delay={0.35}>
                    <ProCard className="transition-colors">
                        <button
                            onClick={() => setAccountOpen((v) => !v)}
                            aria-expanded={accountOpen}
                            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#1B294B]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0C1427] border border-[#232C43]">
                                    <User className="size-4.5 text-[#9AA9CB]" />
                                </div>
                                <span className="text-[15px] font-medium text-[#ECF0F9]">Account Details</span>
                            </div>
                            {accountOpen
                                ? <ChevronUp   className="size-4.5 text-[#788CBA]" />
                                : <ChevronDown className="size-4.5 text-[#788CBA]" />}
                        </button>

                        <AnimatePresence>
                            {accountOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t border-[#232C43] bg-[#080B11] px-6 py-5">
                                        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                                            {[
                                                { label: 'Full Name',    value: founder.full_name },
                                                { label: 'Company',      value: founder.company_name },
                                                { label: 'Email',        value: founder.email },
                                                { label: 'Member Since', value: fmtDate(founder.created_at) },
                                                { label: 'Last Login',   value: fmtDateTime(founder.last_login_at) },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex flex-col">
                                                    <dt className="text-[12px] font-semibold uppercase tracking-wider text-[#576FA8]">{label}</dt>
                                                    <dd className="mt-1.5 text-[14px] text-[#BCC5DC]">{value ?? '—'}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ProCard>
                </FadeUp>

            </div>
        </FounderLayout>
    );
}
