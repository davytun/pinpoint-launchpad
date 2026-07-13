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
    ExternalLink,
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
    id: number;
    investor_name: string;
    investor_email: string;
    firm_name: string | null;
    linkedin_url: string | null;
    message: string | null;
    status: 'pending' | 'approved' | 'rejected';
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
    verification_url?: string | null;
    profile_is_live?: boolean;
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}
        >
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
            <div className="relative hidden md:block w-full py-4">
                {/* Background line */}
                <div className="absolute left-[10%] right-[10%] top-8 h-0.5 bg-zinc-200" />
                
                {/* Progress line */}
                <div
                    className="absolute left-[10%] top-8 h-0.5 bg-emerald-500 transition-all duration-500"
                    style={{ width: auditStatus === 'complete' ? '80%' : '60%' }}
                />

                <div className="flex items-start justify-between w-full">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-1 flex-col items-center">
                            {/* Circle */}
                            {step.done ? (
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-4 ring-white">
                                    <CheckCircle2 className="size-4.5" />
                                </div>
                            ) : step.active ? (
                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#3A54A5] bg-white text-[#3A54A5] shadow-md shadow-[#3A54A5]/15 ring-4 ring-white animate-pulse">
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
                                    'mt-2.5 text-center text-[11.5px] font-extrabold tracking-tight max-w-[110px] transition-colors leading-tight',
                                    step.done
                                        ? 'text-emerald-700'
                                        : step.active
                                          ? 'text-[#3A54A5]'
                                          : 'text-zinc-400',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Stepper: Vertical (shown on mobile, hidden on md+) */}
            <div className="relative block md:hidden space-y-5 pl-2">
                {/* Vertical connecting line */}
                <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-zinc-200" />
                
                {steps.map((step, idx) => {
                    return (
                        <div key={idx} className="relative flex items-start gap-4">
                            {/* Circle wrapper */}
                            <div className="relative z-10 shrink-0">
                                {step.done ? (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-4 ring-white">
                                        <CheckCircle2 className="size-4 animate-fade-in" />
                                    </div>
                                ) : step.active ? (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3A54A5] bg-white text-[#3A54A5] ring-4 ring-white animate-pulse">
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
                                        step.done
                                            ? 'text-emerald-700'
                                            : step.active
                                              ? 'text-[#3A54A5]'
                                              : 'text-zinc-400',
                                    )}
                                >
                                    {step.label}
                                </h4>
                                {step.active && (
                                    <p className="mt-0.5 text-[11px] text-zinc-500 font-semibold leading-relaxed animate-fade-in">
                                        {step.desc}
                                    </p>
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
                'overflow-hidden rounded-[2rem] border border-white/80 bg-white/30 backdrop-blur-md transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.025)]',
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
    verification_url,
    profile_is_live,
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

    function handleRequestStatus(id: number, status: 'approved' | 'rejected') {
        setUpdatingStatusId(id);
        router.patch(route('founder.access-requests.status', id), { status }, {
            preserveScroll: true,
            onFinish: () => setUpdatingStatusId(null),
        });
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
                            <h1 id="tour-welcome" className="font-display text-3xl font-extrabold tracking-tight text-zinc-955 sm:text-4xl">
                                {greeting(founder.full_name)}
                            </h1>
                            <p className="mt-1.5 text-[14px] text-zinc-555 font-semibold">
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
                                                    'rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs',
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
                                        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Status Overview</h2>
                                        <p className="text-[14px] leading-relaxed text-zinc-555 font-semibold">{statusCfg.description}</p>
                                    </div>
                                </div>

                                {audit_status === 'needs_info' && (
                                    <div className="-mt-2 animate-fade-in">
                                        <div className="rounded-xl border border-amber-500/25 bg-amber-50 p-4 shadow-xs">
                                            <p className="text-[13px] font-semibold text-amber-800 leading-relaxed">
                                                Please review the messages thread inside your portal dashboard. There are details and additional documents requested by your assigned auditor.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-zinc-200/80 my-1" />

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
                        <ProCard id="tour-score" className="relative flex h-full flex-col items-center justify-center p-8 text-center min-w-0 overflow-hidden">
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
                                    {score_band_message && <p className="mt-4 text-[13px] leading-relaxed text-zinc-650">{score_band_message}</p>}
                                </>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 py-6">
                                    <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-[#3A54A5]/5 text-[#3A54A5] ring-1 ring-[#3A54A5]/10 shadow-xs">
                                        <Clock className="size-8 animate-pulse text-[#3A54A5]/70" />
                                    </div>
                                    <p className="text-[13px] text-zinc-500 font-bold">Score pending audit completion</p>
                                </div>
                            )}
                        </ProCard>
                    </FadeUp>

                    <FadeUp delay={0.2}>
                        <ProCard id="tour-pillar" className="h-full p-6 sm:p-8 min-w-0 overflow-hidden">
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
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200/80 shadow-xs">
                                        <Lock className="size-8 text-zinc-400/80 animate-pulse" />
                                    </div>
                                    <p className="text-[13px] text-zinc-500 font-bold">Pillar data unlocked post-audit</p>
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
                                <span className="text-[14px] font-semibold text-zinc-555">Paid: ${Number(payment.total_amount).toLocaleString()}</span>
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
                                <h3 className="text-[15px] font-bold text-zinc-955">Documents</h3>
                                <p className="mt-1 text-[13px] text-zinc-555">Manage and upload requested files.</p>
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
                                <h3 className="text-[15px] font-bold text-zinc-955">Messages</h3>
                                <p className="mt-1 text-[13px] text-zinc-555">Communicate directly with your analyst.</p>
                            </div>
                            <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-[#3A54A5] uppercase transition-colors group-hover:text-[#2D4182]">
                                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </Link>

                        <div
                            className={cn(
                                'flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/30 p-6 shadow-md backdrop-blur-md transition-all duration-300 ease-out',
                                profile_is_live
                                    ? 'hover:-translate-y-1 hover:border-[#3A54A5]/40 hover:bg-white/50 hover:shadow-lg'
                                    : '',
                            )}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50">
                                    <ExternalLink className="size-4.5 text-zinc-500" />
                                </div>
                                {profile_is_live && (
                                    <span className="rounded-sm border border-emerald-250 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                        Live
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-zinc-955">Investor Page</h3>
                                <p className="mt-1 text-[13px] text-zinc-555">
                                    {profile_is_live ? 'Your page is publicly visible.' : 'Goes live post-audit.'}
                                </p>
                            </div>
                            {profile_is_live && verification_url ? (
                                <a
                                    href={verification_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-emerald-600 uppercase transition-colors hover:text-emerald-500"
                                >
                                    View Link <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </a>
                            ) : (
                                <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-zinc-400 uppercase">
                                    Pending Audit
                                </div>
                            )}
                        </div>
                    </div>
                </FadeUp>

                {/* ── Section 5.5 — Investor Access Requests ── */}
                <FadeUp delay={0.32}>
                    <ProCard className="p-6 sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3A54A5]/10 text-[#3A54A5]">
                                    <Lock className="size-4.5" />
                                </div>
                                <h2 className="text-[16px] font-bold text-zinc-800">Investor Access Requests</h2>
                            </div>
                            <span className="text-[13px] font-semibold text-zinc-555">
                                {access_requests.length} total request{access_requests.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {access_requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-sm text-zinc-450 font-medium">No data room access requests yet.</p>
                                <p className="mt-1 text-xs text-zinc-400">
                                    When venture investors view your profile page and request full access to your diligence assets, their requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200/80">
                                {access_requests.map((req) => (
                                    <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-zinc-900 text-sm">{req.investor_name}</span>
                                                    {req.firm_name && (
                                                        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-bold text-zinc-650">
                                                            {req.firm_name}
                                                        </span>
                                                    )}
                                                    {req.linkedin_url && (
                                                        <a
                                                            href={req.linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-md border border-[#3A54A5]/25 bg-[#3A54A5]/5 px-2 py-0.5 text-[10.5px] font-bold text-[#3A54A5] hover:bg-[#3A54A5]/10"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-xs text-zinc-555 font-semibold">
                                                    Email:{' '}
                                                    <a href={`mailto:${req.investor_email}`} className="text-[#3A54A5] hover:underline font-bold">
                                                        {req.investor_email}
                                                    </a>
                                                    <span className="mx-2 opacity-50">•</span>
                                                    Requested: {fmtDateTime(req.created_at)}
                                                </div>

                                                {req.message && (
                                                    <div className="mt-2.5 border-l-2 border-zinc-200 pl-3.5 italic text-zinc-500 text-xs leading-relaxed max-w-2xl font-semibold">
                                                        {req.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 sm:mt-1">
                                                {req.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRequestStatus(req.id, 'approved')}
                                                            disabled={updatingStatusId !== null}
                                                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestStatus(req.id, 'rejected')}
                                                            disabled={updatingStatusId !== null}
                                                            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : req.status === 'approved' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-250 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-xs animate-fade-in">
                                                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                        Approved &amp; Emailed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-500">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                <span className="text-[15px] font-semibold text-zinc-955">Account Details</span>
                            </div>
                            {accountOpen ? <ChevronUp className="size-4.5 text-zinc-450" /> : <ChevronDown className="size-4.5 text-zinc-450" />}
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
                                                    <dt className="text-[10px] font-bold tracking-wider text-zinc-450 uppercase">{label}</dt>
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
