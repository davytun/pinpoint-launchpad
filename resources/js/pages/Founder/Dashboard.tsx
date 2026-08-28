import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    Lock,
    MessageSquare,
    TrendingUp,
    User,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

import DashboardTour from '@/components/dashboard-tour';
import { Badge } from '@/components/ui/badge';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PillarScores {
    potential?: number;
    agility?: number;
    risk?: number;
    alignment?: number;
    governance?: number;
    operations?: number;
    network?: number;
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

interface InvestorAccessRequest {
    id: string | number;
    investor_name: string;
    investor_type?: string;
    firm_name: string | null;
    message: string | null;
    type: 'more_details' | 'founder_call' | 'data_room_access';
    status: 'pending' | 'approved' | 'denied';
    founder_decision?: 'approved' | 'declined' | 'pending' | null;
    is_awaiting_founder?: boolean;
    stage: 'new_interest' | 'reviewing' | 'coordinating' | 'data_room' | 'introduction' | 'active_discussion' | 'declined';
    introduction_status: 'not_requested' | 'requested' | 'approved' | 'scheduled' | 'completed' | 'denied';
    data_room_granted: boolean;
    scheduled_at?: string | null;
    completed_at?: string | null;
    meeting_link?: string | null;
    latest_activity_at?: string | null;
    created_at: string;
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
    spotlight_featured?: boolean;
    access_requests: InvestorAccessRequest[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];
const PILLAR_LABELS: Record<string, string> = {
    potential: 'Potential',
    agility: 'Agility',
    risk: 'Risk',
    alignment: 'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network: 'Network',
};

const BAND_META: Record<string, { color: string; border: string; bg: string; textColor: string; badgeLabel: string; Icon: React.ElementType }> = {
    low: {
        color: '#EF4444',
        border: '#FECACA',
        bg: '#FEF2F2',
        textColor: '#B91C1C',
        badgeLabel: 'High Risk Profile',
        Icon: AlertCircle,
    },
    mid_low: {
        color: '#F97316',
        border: '#FED7AA',
        bg: '#FFF7ED',
        textColor: '#C2410C',
        badgeLabel: 'Development Required',
        Icon: AlertTriangle,
    },
    mid_high: {
        color: '#3A54A5',
        border: '#DCE2EF',
        bg: '#F4F7FB',
        textColor: '#3A54A5',
        badgeLabel: 'Investment Pipeline',
        Icon: TrendingUp,
    },
    high: {
        color: '#10B981',
        border: '#A7F3D0',
        bg: '#ECFDF5',
        textColor: '#047857',
        badgeLabel: 'Top Percentile',
        Icon: Zap,
    },
};

const TIER_LABELS: Record<string, string> = {
    foundation: 'Foundation',
    growth: 'Growth',
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

// ─── FadeUp ───────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}>
            {children}
        </motion.div>
    );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function ProgressStepper({ auditStatus }: { auditStatus: string }) {
    const steps = [
        { label: 'Application', done: true, active: false, desc: 'Application received and registered.' },
        { label: 'Diagnostics', done: true, active: false, desc: 'Diagnostic assessment completed.' },
        { label: 'Warrant & Signing', done: true, active: false, desc: 'Warrant agreement signed.' },
        {
            label: 'Analyst Audit',
            done: auditStatus === 'complete',
            active: ['pending', 'in_progress', 'needs_info', 'on_hold'].includes(auditStatus),
            desc: 'Analyst evaluation and background verification.',
        },
        { label: 'Certification Live', done: auditStatus === 'complete', active: false, desc: 'Verification profile published.' },
    ];

    return (
        <div>
            {/* Desktop Stepper: Horizontal (hidden on mobile, shown on md+) */}
            <div className="relative hidden w-full py-4 md:block">
                {/* Background line */}
                <div className="absolute top-8 right-[10%] left-[10%] h-0.5 bg-zinc-200" />

                {/* Progress line */}
                <div
                    className="absolute top-8 left-[10%] h-0.5 bg-emerald-500 transition-all duration-500"
                    style={{ width: auditStatus === 'complete' ? '80%' : '60%' }}
                />

                <div className="flex w-full items-start justify-between">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-1 flex-col items-center">
                            {/* Circle */}
                            {step.done ? (
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 shadow-emerald-500/20 ring-white">
                                    <CheckCircle2 className="size-4.5" />
                                </div>
                            ) : step.active ? (
                                <div className="relative z-10 flex h-8 w-8 shrink-0 animate-pulse items-center justify-center rounded-full border-2 border-[#3A54A5] bg-white text-[#3A54A5] shadow-md ring-4 shadow-[#3A54A5]/15 ring-white">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#3A54A5]" />
                                </div>
                            ) : (
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-400 ring-4 ring-white">
                                    <span className="text-[11px] font-extrabold">{idx + 1}</span>
                                </div>
                            )}

                            {/* Label */}
                            <span
                                className={cn(
                                    'mt-2.5 max-w-[110px] text-center text-[11.5px] leading-tight font-extrabold tracking-tight transition-colors',
                                    step.done ? 'text-emerald-700' : step.active ? 'text-[#3A54A5]' : 'text-zinc-400',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Stepper: Vertical (shown on mobile, hidden on md+) */}
            <div className="relative block space-y-5 pl-2 md:hidden">
                {/* Vertical connecting line */}
                <div className="absolute top-3 bottom-3 left-[21px] w-0.5 bg-zinc-200" />

                {steps.map((step, idx) => {
                    return (
                        <div key={idx} className="relative flex items-start gap-4">
                            {/* Circle wrapper */}
                            <div className="relative z-10 shrink-0">
                                {step.done ? (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-4 ring-white">
                                        <CheckCircle2 className="animate-fade-in size-4" />
                                    </div>
                                ) : step.active ? (
                                    <div className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full border-2 border-[#3A54A5] bg-white text-[#3A54A5] ring-4 ring-white">
                                        <span className="h-2 w-2 rounded-full bg-[#3A54A5]" />
                                    </div>
                                ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-400 ring-4 ring-white">
                                        <span className="text-[10px] font-extrabold">{idx + 1}</span>
                                    </div>
                                )}
                            </div>

                            {/* Step Description */}
                            <div className="pt-0.5">
                                <h4
                                    className={cn(
                                        'text-xs font-bold tracking-tight',
                                        step.done ? 'text-emerald-700' : step.active ? 'text-[#3A54A5]' : 'text-zinc-400',
                                    )}
                                >
                                    {step.label}
                                </h4>
                                {step.active && (
                                    <p className="animate-fade-in mt-0.5 text-[11px] leading-relaxed font-semibold text-zinc-500">{step.desc}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────

function ProCard({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
    return (
        <div
            id={id}
            className={cn(
                'overflow-hidden rounded-[2rem] border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md transition-all duration-300',
                className,
            )}
        >
            {children}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FounderDashboard({
    founder,
    score,
    score_band,
    pillar_scores,
    score_band_message,
    tier,
    tier_features,
    audit_status,
    audit_status_config,
    payment,
    spotlight_featured,
    access_requests = [],
}: PageProps) {
    const meta = BAND_META[score_band ?? 'mid_high'] ?? BAND_META.mid_high;
    const tierLabel = TIER_LABELS[tier ?? ''] ?? (tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Foundation');
    const statusCfg = audit_status_config[audit_status] ?? audit_status_config['pending'];

    const [accountOpen, setAccountOpen] = useState(false);
    const [startTourKey, setStartTourKey] = useState(0);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    function restartTour() {
        setStartTourKey((prev) => prev + 1);
    }

    const hasPillarData = Object.values(pillar_scores).some((v) => (v ?? 0) > 0);
    const radarData = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value: pillar_scores[k] ?? 0,
    }));

    function handleRequestStatus(id: number, status: 'approved' | 'denied') {
        setUpdatingStatusId(id);
        router.patch(
            route('founder.access-requests.status', id),
            { status },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatusId(null),
            },
        );
    }

    return (
        <FounderLayout founder={founder}>
            <Head title="Dashboard — Pinpoint Launchpad" />

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                {/* ── Section 1 — Welcome Header ── */}
                <FadeUp delay={0}>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#3A54A5] shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                                {meta.badgeLabel}
                            </div>
                            <h1 id="tour-welcome" className="font-display text-zinc-955 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                {greeting(founder.full_name)}
                            </h1>
                            <p className="text-zinc-555 mt-1.5 text-[14px] font-semibold">
                                {founder.company_name ?? '—'} <span className="mx-2 opacity-50">•</span> {tierLabel} Audit
                            </p>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Section 2 — Audit Status ── */}
                {audit_status !== 'complete' && (
                    <FadeUp delay={0.1}>
                        <ProCard id="tour-status" className="p-6 sm:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2 lg:max-w-2xl">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Audit Pipeline</p>
                                            <span
                                                className={cn(
                                                    'rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs',
                                                    audit_status === 'complete'
                                                        ? 'border-emerald-250 bg-emerald-50 text-emerald-600'
                                                        : audit_status === 'needs_info'
                                                          ? 'border-amber-250 bg-amber-50 text-amber-600'
                                                          : 'border-zinc-200 bg-zinc-50 text-zinc-500',
                                                )}
                                            >
                                                {statusCfg.label}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Status Overview</h2>
                                        <p className="text-zinc-555 text-[14px] leading-relaxed font-semibold">{statusCfg.description}</p>
                                    </div>
                                </div>

                                {audit_status === 'needs_info' && (
                                    <div className="animate-fade-in -mt-2">
                                        <div className="rounded-xl border border-amber-500/25 bg-amber-50 p-4 shadow-xs">
                                            <p className="text-[13px] leading-relaxed font-semibold text-amber-800">
                                                Please review the messages thread inside your portal dashboard. There are details and additional
                                                documents requested by your assigned auditor.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="my-1 h-px bg-zinc-200/80" />

                                <div id="tour-stepper" className="w-full">
                                    <ProgressStepper auditStatus={audit_status} />
                                </div>
                            </div>
                        </ProCard>
                    </FadeUp>
                )}

                {/* ── Section 3 — PARAGON Score & Radar ── */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <FadeUp delay={0.15}>
                        <ProCard
                            id="tour-score"
                            className="relative flex h-full min-w-0 flex-col items-center justify-center overflow-hidden p-8 text-center"
                        >
                            <p className="mb-6 text-[12px] font-bold tracking-wider text-zinc-500 uppercase">PARAGON Score</p>
                            {score != null ? (
                                <>
                                    <div className="mb-5 flex items-baseline justify-center">
                                        <span
                                            className="font-display text-[5.5rem] leading-none font-bold tracking-tighter"
                                            style={{ color: meta.color }}
                                        >
                                            <CountUp target={score} duration={1500} />
                                        </span>
                                    </div>
                                    <Badge
                                        className="rounded-sm px-3 py-1 text-[11px] font-bold tracking-wider uppercase"
                                        style={{ background: meta.bg, color: meta.textColor, border: `1px solid ${meta.border}` }}
                                    >
                                        <meta.Icon className="mr-2 inline size-3.5" aria-hidden="true" />
                                        {meta.badgeLabel}
                                    </Badge>
                                    {score_band_message && <p className="text-zinc-650 mt-4 text-[13px] leading-relaxed">{score_band_message}</p>}
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 py-6">
                                    <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-[#3A54A5]/5 text-[#3A54A5] shadow-xs ring-1 ring-[#3A54A5]/10">
                                        <Clock className="size-8 animate-pulse text-[#3A54A5]/70" />
                                    </div>
                                    <p className="text-[13px] font-bold text-zinc-500">Score pending audit completion</p>
                                </div>
                            )}
                        </ProCard>
                    </FadeUp>

                    <FadeUp delay={0.2}>
                        <ProCard id="tour-pillar" className="h-full min-w-0 overflow-hidden p-6 sm:p-8">
                            <p className="mb-4 text-[12px] font-bold tracking-wider text-zinc-500 uppercase">Pillar Breakdown</p>
                            {hasPillarData ? (
                                <div className="relative h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                            <PolarGrid stroke="#E2E8F0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} />
                                            <Radar
                                                dataKey="value"
                                                stroke={meta.color}
                                                fill={meta.color}
                                                fillOpacity={0.12}
                                                strokeWidth={2}
                                                dot={{ fill: meta.color, r: 3, strokeWidth: 0 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[220px] flex-col items-center justify-center gap-4">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 shadow-xs ring-1 ring-zinc-200/80">
                                        <Lock className="size-8 animate-pulse text-zinc-400/80" />
                                    </div>
                                    <p className="text-[13px] font-bold text-zinc-500">Pillar data unlocked post-audit</p>
                                </div>
                            )}
                        </ProCard>
                    </FadeUp>
                </div>

                {/* ── Section 4 — Audit Package ── */}
                <FadeUp delay={0.25}>
                    <ProCard className="p-6 sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <FileText className="size-4.5" />
                                </div>
                                <h2 className="text-[16px] font-bold text-zinc-800">{tierLabel} Package Inclusions</h2>
                            </div>
                            {payment && (
                                <span className="text-zinc-555 text-[14px] font-semibold">
                                    Paid: ${Number(payment.total_amount).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            {tier_features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#3A54A5]" />
                                    <span className="text-[14px] leading-relaxed text-zinc-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </ProCard>
                </FadeUp>

                {/* ── Section 5 — Quick Actions ── */}
                <FadeUp delay={0.3}>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Link
                            id="tour-documents"
                            href={route('founder.documents.index')}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/30 p-6 shadow-md backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#3A54A5]/40 hover:bg-white/50 hover:shadow-lg"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50 transition-colors group-hover:border-[#3A54A5]/30 group-hover:bg-white">
                                <FileText className="size-4.5 text-zinc-500 transition-colors group-hover:text-[#3A54A5]" />
                            </div>
                            <div>
                                <h3 className="text-zinc-955 text-[15px] font-bold">Documents</h3>
                                <p className="text-zinc-555 mt-1 text-[13px]">Manage and upload requested files.</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-[#3A54A5] uppercase transition-colors group-hover:text-[#2D4182]">
                                View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </Link>

                        <Link
                            id="tour-messages"
                            href={route('founder.messages.index')}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/30 p-6 shadow-md backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#3A54A5]/40 hover:bg-white/50 hover:shadow-lg"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50 transition-colors group-hover:border-[#3A54A5]/30 group-hover:bg-white">
                                <MessageSquare className="size-4.5 text-zinc-500 transition-colors group-hover:text-[#3A54A5]" />
                            </div>
                            <div>
                                <h3 className="text-zinc-955 text-[15px] font-bold">Messages</h3>
                                <p className="text-zinc-555 mt-1 text-[13px]">Communicate directly with your analyst.</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-[#3A54A5] uppercase transition-colors group-hover:text-[#2D4182]">
                                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </Link>

                        <Link href={route('founder.spotlight.edit')} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/30 p-6 shadow-md backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#3A54A5]/40 hover:bg-white/50 hover:shadow-lg">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50">
                                    <Zap className="size-4.5 text-zinc-500 transition-colors group-hover:text-[#3A54A5]" />
                                </div>
                                {spotlight_featured && (
                                    <span className="border-emerald-250 rounded-sm border bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                        Featured
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-zinc-955 text-[15px] font-bold">Spotlight Status</h3>
                                <p className="text-zinc-555 mt-1 text-[13px]">{spotlight_featured ? 'Your startup is featured for qualified investors.' : 'Prepare your profile for Pinpoint review.'}</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-[#3A54A5] uppercase">Open Spotlight <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></div>
                        </Link>
                    </div>
                </FadeUp>

                {/* ── Section 5.5 — Investor Engagement & Deal Pipeline ── */}
                <FadeUp delay={0.32}>
                    <ProCard className="p-6 sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <TrendingUp className="size-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-bold text-zinc-800">Investor Engagement Pipeline</h2>
                                    <p className="text-xs text-zinc-500">Pinpoint Investor Relations mediates all investor discovery, data room authorizations, and introductions.</p>
                                </div>
                            </div>
                            <span className="text-zinc-555 text-[13px] font-semibold">
                                {access_requests.length} investor engagement{access_requests.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {access_requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-zinc-450 text-sm font-medium">No investor engagements yet.</p>
                                <p className="mt-1 text-xs text-zinc-400">
                                    When KYC-approved investors discover your startup and Pinpoint coordinates information, a founder call, or data room access, requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200/80">
                                {access_requests.map((req) => {
                                    const stageColors: Record<string, string> = {
                                        new_interest: 'bg-amber-50 text-amber-700 border-amber-200',
                                        reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
                                        coordinating: 'bg-blue-50 text-blue-700 border-blue-200',
                                        data_room: 'bg-purple-50 text-purple-700 border-purple-200',
                                        introduction: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                                        active_discussion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        declined: 'bg-zinc-100 text-zinc-600 border-zinc-200',
                                    };

                                    const stageLabels: Record<string, string> = {
                                        new_interest: 'Pending Authorization',
                                        reviewing: 'Pinpoint Reviewing',
                                        coordinating: 'Pinpoint Coordinating',
                                        data_room: 'Data Room Active',
                                        introduction: req.scheduled_at ? 'Intro Scheduled' : 'Intro Coordination',
                                        active_discussion: 'Active Discussion',
                                        declined: 'Declined',
                                    };

                                    const isAwaitingFounder = req.is_awaiting_founder ?? (req.founder_decision === null || req.founder_decision === 'pending');

                                    return (
                                        <div key={req.id} className="py-4.5 first:pt-0 last:pb-0">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-bold text-zinc-900">{req.investor_name}</span>
                                                        {req.firm_name && (
                                                            <span className="text-zinc-650 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-bold">
                                                                {req.firm_name}
                                                            </span>
                                                        )}
                                                        {req.investor_type && (
                                                            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-medium text-zinc-600 capitalize">
                                                                {req.investor_type.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${stageColors[req.stage] ?? 'bg-zinc-100 text-zinc-700'}`}>
                                                            {stageLabels[req.stage] ?? req.stage}
                                                        </span>
                                                    </div>

                                                    <div className="text-zinc-555 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                                                        <span>Type: <strong className="text-zinc-800">{req.type.replaceAll('_', ' ')}</strong></span>
                                                        <span className="opacity-40">•</span>
                                                        <span>Request Date: {fmtDateTime(req.created_at)}</span>
                                                        {req.data_room_granted && (
                                                            <>
                                                                <span className="opacity-40">•</span>
                                                                <span className="inline-flex items-center gap-1 font-bold text-purple-700">
                                                                    <Lock className="size-3" /> Access Granted by Pinpoint
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Pinpoint Coordination Notice */}
                                                    {isAwaitingFounder && (
                                                        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed font-medium text-amber-900">
                                                            {req.type === 'data_room_access' ? (
                                                                <>
                                                                    <p className="font-bold text-amber-950">Authorization Required</p>
                                                                    <p className="mt-0.5">Pinpoint Investor Relations requests your authorization to provide this verified investor data room access.</p>
                                                                </>
                                                            ) : req.type === 'founder_call' ? (
                                                                <>
                                                                    <p className="font-bold text-amber-950">Introduction Request</p>
                                                                    <p className="mt-0.5">Pinpoint Investor Relations is coordinating an introductory call. Please confirm your willingness to meet.</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="font-bold text-amber-950">Information Request</p>
                                                                    <p className="mt-0.5">Pinpoint requests your confirmation to release verified information to this investor.</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {req.message && (
                                                        <div className="mt-2 max-w-2xl rounded-lg border-l-2 border-[#3A54A5] bg-zinc-50/80 p-3 text-xs leading-relaxed font-medium text-zinc-600 italic">
                                                            &ldquo;{req.message}&rdquo;
                                                        </div>
                                                    )}

                                                    {/* Scheduled Call Info Box */}
                                                    {req.scheduled_at && (
                                                        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                                                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                                                            <div>
                                                                <p className="font-bold">Introduction Call Scheduled by Pinpoint IR</p>
                                                                <p className="mt-0.5 text-emerald-800">
                                                                    Date & Time: {fmtDateTime(req.scheduled_at)}
                                                                </p>
                                                                {req.meeting_link && (
                                                                    <p className="mt-0.5 text-emerald-700">
                                                                        Details: <span className="font-mono">{req.meeting_link}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {req.completed_at && (
                                                        <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-emerald-700">
                                                            <CheckCircle2 className="size-3.5" />
                                                            <span>Introduction Completed on {fmtDate(req.completed_at)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2 sm:mt-1">
                                                    {isAwaitingFounder ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleRequestStatus(req.id, 'approved')}
                                                                disabled={updatingStatusId !== null}
                                                                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                                                            >
                                                                {req.type === 'data_room_access'
                                                                    ? 'Authorize Access'
                                                                    : req.type === 'founder_call'
                                                                    ? 'Confirm Interest'
                                                                    : 'Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestStatus(req.id, 'denied')}
                                                                disabled={updatingStatusId !== null}
                                                                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition"
                                                            >
                                                                Decline
                                                            </button>
                                                        </>
                                                    ) : req.founder_decision === 'approved' ? (
                                                        <span className="border-emerald-250 animate-fade-in inline-flex items-center gap-1 rounded-full border bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-xs">
                                                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                            {req.type === 'data_room_access'
                                                                ? (req.data_room_granted ? 'Access granted by Pinpoint' : 'Authorization provided to Pinpoint')
                                                                : req.type === 'founder_call'
                                                                ? (req.scheduled_at ? 'Call scheduled by Pinpoint' : 'Interest confirmed (Pinpoint coordinating)')
                                                                : 'Confirmed to Pinpoint'}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-500">
                                                            Declined to Pinpoint
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ProCard>
                </FadeUp>

                {/* ── Section 6 — Account Details ── */}
                <FadeUp delay={0.35}>
                    <ProCard className="transition-colors">
                        <button
                            onClick={() => setAccountOpen((v) => !v)}
                            aria-expanded={accountOpen}
                            className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#3A54A5]/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50">
                                    <User className="size-4.5 text-[#3A54A5]" />
                                </div>
                                <span className="text-zinc-955 text-[15px] font-semibold">Account Details</span>
                            </div>
                            {accountOpen ? <ChevronUp className="text-zinc-450 size-4.5" /> : <ChevronDown className="text-zinc-450 size-4.5" />}
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
                                    <div className="border-t border-zinc-200 bg-zinc-50/40 px-6 py-5">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {[
                                                { label: 'Full Name', value: founder.full_name },
                                                { label: 'Company', value: founder.company_name },
                                                { label: 'Email', value: founder.email },
                                                { label: 'Member Since', value: fmtDate(founder.created_at) },
                                                { label: 'Last Login', value: fmtDateTime(founder.last_login_at) },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition-all hover:border-zinc-300"
                                                >
                                                    <dt className="text-zinc-450 text-[10px] font-bold tracking-wider uppercase">{label}</dt>
                                                    <dd className="mt-1 font-sans text-[13.5px] font-medium text-zinc-800">{value ?? '—'}</dd>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5">
                                            <button
                                                type="button"
                                                onClick={restartTour}
                                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[12px] font-bold tracking-wider text-zinc-700 uppercase shadow-xs transition-all hover:bg-zinc-50"
                                            >
                                                Restart Guided Tour
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ProCard>
                </FadeUp>
            </div>
            <DashboardTour startTourKey={startTourKey} />
        </FounderLayout>
    );
}
