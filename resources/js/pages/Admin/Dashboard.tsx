import { Head, Link, router } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NeedsAttentionItem {
    id: string;
    title: string;
    description: string;
    count: number;
    action_url: string;
    icon: string;
    color: string;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}
interface AuditBreakdownItem {
    label: string;
    value: number;
    color: string;
    status?: string;
}

interface EngagementTrendPoint {
    month: string;
    started: number;
    finished: number;
}

interface FunnelMetrics {
    signed_up: number;
    completed_diagnostic: number;
    uploaded_documents: number;
    audit_complete: number;
}

interface SystemAlert {
    id: string;
    title: string;
    description: string;
    action_url: string;
    type: 'error' | 'warning';
}

interface Metrics {
    my_open_messages?: number;
    total_founders?: number;
    active_audits?: number;
    pending_audits?: number;
    complete_audits?: number;
    high_scorers?: number;
    needs_info_count?: number;
    my_assigned?: number;
    pending_kyc?: number;
    approved_kyc?: number;
    rejected_kyc?: number;
    active_investors?: number;
    pending_interests?: number;
    scheduled_founder_calls?: number;
    total_revenue?: number;
    revenue_by_currency?: { NGN: number; USD: number };
    revenue_this_month?: number;
    revenue_by_tier?: { foundation: number; growth: number; institutional: number };
    monthly_revenue?: MonthlyRevenue[];
    audit_breakdown?: AuditBreakdownItem[];
    funnel?: FunnelMetrics;
    pending_pia_count?: number;
    engagement_trend?: EngagementTrendPoint[];
}

interface ActivityItem {
    type: 'diagnostic' | 'payment' | 'message' | 'kyc' | 'interest';
    description: string;
    time: string;
    email: string | null;
}

interface PendingPiaRequest {
    id: number;
    name: string;
    email: string;
    company: string;
    selected_tier: string | null;
    status: string;
    created_at: string | null;
}

interface PageProps {
    metrics: Metrics;
    recent_activity: ActivityItem[];
    needs_attention?: NeedsAttentionItem[];
    system_alerts?: SystemAlert[];
    dealflow_handoff?: {
        audit_complete: number;
        ready_to_publish: number;
        published: number;
        pending_interests: number;
    } | null;
    pending_pia_requests?: PendingPiaRequest[];
    user_role: 'superadmin' | 'analyst' | 'support' | 'compliance' | 'investor_relations';
    date_range?: string;
    desk?: 'platform' | 'founder' | 'investors';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(amount: number, currency = 'USD') {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function SolarIcon({ name, className }: { name: string; className?: string }) {
    return <Icon icon={name} className={cn('size-4 shrink-0', className)} />;
}

function MetricCard({
    label,
    value,
    subValue,
    pulse = false,
    href,
    icon,
}: {
    label: string;
    value: string | number;
    subValue?: React.ReactNode;
    pulse?: boolean;
    href?: string;
    icon: string;
}) {
    const inner = (
        <div className="group relative flex h-full flex-col justify-between border-b border-zinc-200 py-4 pr-4 transition-colors hover:border-[#3A54A5]/40">
            <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</span>
                <div className="flex items-center gap-2">
                    {pulse && Number(String(value).replace(/\D/g, '') || 0) > 0 && (
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3A54A5] opacity-50" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                        </span>
                    )}
                    <SolarIcon name={icon} className="size-[15px] text-zinc-400 group-hover:text-[#3A54A5]" />
                </div>
            </div>
            <div className="mt-3">
                <span className="text-[24px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">{value}</span>
                {subValue && <span className="mt-1 block text-[11px] font-medium text-zinc-500">{subValue}</span>}
            </div>
        </div>
    );
    if (href)
        return (
            <Link href={href} className="block h-full">
                {inner}
            </Link>
        );
    return inner;
}

// ─── Revenue sparkline ────────────────────────────────────────────────────────

const revenueChartConfig = {
    revenue: {
        label: 'Revenue',
        color: '#18181B',
    },
} satisfies ChartConfig;

function RevenueAreaChart({ data, thisMonth }: { data: MonthlyRevenue[]; thisMonth: number }) {
    return (
        <div className="flex h-[380px] min-w-0 flex-col border border-zinc-200/80 bg-white p-5 sm:p-6">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-medium text-zinc-500">Monthly Revenue</p>
                <SolarIcon name="solar:graph-up-linear" className="text-zinc-400" />
            </div>
            <p className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{fmtCurrency(thisMonth)}</p>
            <div className="min-h-40 flex-1">
                <ChartContainer config={revenueChartConfig} className="h-full w-full">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18181B" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#18181B" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fill: '#A1A1AA', fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmtCurrency(Number(v))} hideLabel />} />
                        <Area type="monotone" dataKey="revenue" stroke="#18181B" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    );
}

// ─── Audit donut ──────────────────────────────────────────────────────────────

function buildAuditConfig(data: AuditBreakdownItem[]): ChartConfig {
    return Object.fromEntries(data.map((d) => [d.label.toLowerCase().replace(' ', '_'), { label: d.label, color: d.color }]));
}

function AuditDonut({ data }: { data: AuditBreakdownItem[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const chartConfig = buildAuditConfig(data);

    return (
        <div className="min-w-0 border border-zinc-200/80 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-medium text-zinc-500">Audit Pipeline</p>
                <SolarIcon name="solar:pie-chart-2-linear" className="text-zinc-400" />
            </div>
            <div className="flex flex-col items-center gap-6 xl:flex-row xl:items-start">
                <div className="relative h-32 w-32 shrink-0">
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl leading-none font-semibold text-zinc-900">{total}</span>
                    </div>
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={44}
                                outerRadius={56}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                        </PieChart>
                    </ChartContainer>
                </div>

                <div className="w-full min-w-0 flex-1 space-y-2.5 xl:mt-2">
                    {data.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                                <span className="truncate text-[13px] font-medium text-zinc-600">{item.label}</span>
                            </div>
                            <span className="shrink-0 text-[13px] font-semibold text-zinc-900 tabular-nums">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function FunnelChart({ data }: { data: FunnelMetrics }) {
    const max = data.signed_up || 1;

    const steps = [
        { label: 'Signed Up', value: data.signed_up },
        { label: 'Diagnostic', value: data.completed_diagnostic },
        { label: 'Documents', value: data.uploaded_documents },
        { label: 'Audit Complete', value: data.audit_complete },
    ];

    return (
        <div className="min-w-0 border border-zinc-200/80 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-medium text-zinc-500">Onboarding Funnel</p>
                <SolarIcon name="solar:filter-linear" className="text-zinc-400" />
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const percentage = Math.round((step.value / max) * 100);
                    const prevValue = idx === 0 ? step.value : steps[idx - 1].value;
                    const dropoff = idx === 0 ? 0 : prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;

                    return (
                        <div key={step.label} className="relative">
                            <div className="mb-1.5 flex items-end justify-between">
                                <span className="text-[13px] font-semibold text-zinc-900">{step.label}</span>
                                <div className="flex items-center gap-2">
                                    {idx > 0 && dropoff > 0 && <span className="text-[11px] font-medium text-red-500">-{dropoff}% drop</span>}
                                    <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">{step.value}</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden bg-zinc-100">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: `rgba(58, 84, 165, ${1 - idx * 0.18})`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── System Alerts ────────────────────────────────────────────────────────────

function SystemAlertsWidget({ alerts }: { alerts?: SystemAlert[] }) {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-10 space-y-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-500 uppercase">System alerts</p>
            <div className="divide-y divide-zinc-100 border border-zinc-200/80">
                {alerts.map((alert) => (
                    <Link
                        key={alert.id}
                        href={alert.action_url}
                        className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50"
                    >
                        <SolarIcon
                            name={alert.type === 'error' ? 'solar:danger-triangle-linear' : 'solar:info-circle-linear'}
                            className={alert.type === 'error' ? 'mt-0.5 text-red-600' : 'mt-0.5 text-amber-600'}
                        />
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-950">{alert.title}</p>
                            <p className="mt-0.5 text-[12px] text-zinc-600">{alert.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const activityIcon: Record<string, string> = {
    diagnostic: 'solar:clipboard-check-linear',
    payment: 'solar:card-send-linear',
    message: 'solar:letter-linear',
    kyc: 'solar:shield-check-linear',
    interest: 'solar:handshake-linear',
};
const activityTypeLabel: Record<string, string> = {
    diagnostic: 'Diagnostic',
    payment: 'Payment',
    message: 'Message',
    kyc: 'KYC',
    interest: 'Dealflow',
};

function DeskCard({ children, className }: { children: ReactNode; className?: string }) {
    // Ref 2 — Mondays card shell
    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]',
                className,
            )}
        >
            {children}
        </div>
    );
}

function StatusPill({
    children,
    tone = 'zinc',
}: {
    children: ReactNode;
    tone?: 'zinc' | 'amber' | 'blue' | 'emerald';
}) {
    // Ref 2 pills + Ref 4 quiet badge language
    const tones = {
        zinc: 'bg-zinc-100 text-zinc-700',
        amber: 'bg-amber-50 text-amber-700',
        blue: 'bg-[#3A54A5]/10 text-[#3A54A5]',
        emerald: 'bg-emerald-50 text-emerald-700',
    };
    return (
        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', tones[tone])}>
            {children}
        </span>
    );
}

function greetingForNow(date = new Date()) {
    const h = date.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatDeskDate(date = new Date()) {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

const engagementChartConfig = {
    finished: {
        label: 'Finished',
        color: '#3A54A5',
    },
    started: {
        label: 'Started',
        color: '#94A3B8',
    },
} satisfies ChartConfig;

function EngagementAreaChart({ data }: { data: EngagementTrendPoint[] }) {
    const finishedThisSpan = data.reduce((sum, row) => sum + row.finished, 0);

    return (
        <div className="min-w-0">
            <div className="mb-1 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">Finished this period</p>
                    <p className="mt-1 text-[28px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                        {finishedThisSpan}
                    </p>
                </div>
                <div className="flex items-center gap-3 pb-1 text-[11px] font-medium text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#3A54A5]" />
                        Finished
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Started
                    </span>
                </div>
            </div>
            <ChartContainer config={engagementChartConfig} className="h-[200px] w-full">
                <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="engFinished" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3A54A5" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#3A54A5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="engStarted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" opacity={0.55} />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                formatter={(value, name) => (
                                    <span className="font-medium tabular-nums">
                                        {Number(value)} {String(name) === 'finished' ? 'finished' : 'started'}
                                    </span>
                                )}
                            />
                        }
                    />
                    <Area
                        type="monotone"
                        dataKey="started"
                        stroke="#94A3B8"
                        strokeWidth={2}
                        fill="url(#engStarted)"
                        fillOpacity={1}
                    />
                    <Area
                        type="monotone"
                        dataKey="finished"
                        stroke="#3A54A5"
                        strokeWidth={2.25}
                        fill="url(#engFinished)"
                        fillOpacity={1}
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}

function FounderDeskHome({
    metrics,
    needs_attention,
    recent_activity,
    isAnalyst,
    isSuperAdmin,
}: {
    metrics: Metrics;
    needs_attention: NeedsAttentionItem[];
    recent_activity: ActivityItem[];
    isAnalyst: boolean;
    isSuperAdmin: boolean;
}) {
    const showFinance = isSuperAdmin && (metrics.revenue_by_currency != null || metrics.revenue_this_month != null);
    const breakdown = metrics.audit_breakdown ?? [];
    const trend = metrics.engagement_trend ?? [];
    const finishedNow = metrics.complete_audits ?? breakdown.find((b) => b.status === 'complete')?.value ?? 0;

    const attentionCopy: Record<string, { title: string; description: string }> = {
        pending_pia: {
            title: 'Payments waiting to confirm',
            description: 'Open the payment requests list and finish the next step.',
        },
        open_assessments: {
            title: 'Assessment applications',
            description: 'Review them and reply with scope and fee.',
        },
        unread_messages: {
            title: 'Unread messages',
            description: 'Founders are waiting for a reply.',
        },
        pending_audits: {
            title: 'Ready to start',
            description: 'New founders who have not been started yet.',
        },
    };

    const attentionIcon: Record<string, string> = {
        pending_pia: 'solar:card-send-linear',
        open_assessments: 'solar:clipboard-check-linear',
        unread_messages: 'solar:letter-unread-linear',
        pending_audits: 'solar:document-add-linear',
    };

    const stats = isAnalyst
        ? [
              {
                  label: 'Assigned to you',
                  value: metrics.my_assigned ?? 0,
                  href: '/admin/founder/founders',
                  icon: 'solar:users-group-rounded-linear',
              },
              {
                  label: 'In progress',
                  value: metrics.active_audits ?? 0,
                  href: '/admin/founder/founders?status=in_progress',
                  icon: 'solar:play-circle-linear',
              },
              {
                  label: 'Waiting on founder',
                  value: metrics.needs_info_count ?? 0,
                  href: '/admin/founder/founders?status=needs_info',
                  icon: 'solar:danger-circle-linear',
                  pulse: (metrics.needs_info_count ?? 0) > 0,
              },
              {
                  label: 'New messages',
                  value: metrics.my_open_messages ?? 0,
                  href: '/admin/founder/messages',
                  icon: 'solar:inbox-linear',
                  pulse: (metrics.my_open_messages ?? 0) > 0,
              },
          ]
        : [
              {
                  label: 'Founders',
                  value: metrics.total_founders ?? 0,
                  href: '/admin/founder/founders',
                  icon: 'solar:users-group-rounded-linear',
              },
              {
                  label: 'In progress',
                  value: metrics.active_audits ?? 0,
                  href: '/admin/founder/founders?status=in_progress',
                  icon: 'solar:play-circle-linear',
              },
              {
                  label: 'Waiting on founder',
                  value: metrics.needs_info_count ?? 0,
                  href: '/admin/founder/founders?status=needs_info',
                  icon: 'solar:danger-circle-linear',
                  pulse: (metrics.needs_info_count ?? 0) > 0,
              },
              {
                  label: 'New messages',
                  value: metrics.my_open_messages ?? 0,
                  href: '/admin/founder/messages',
                  icon: 'solar:inbox-linear',
                  pulse: (metrics.my_open_messages ?? 0) > 0,
              },
          ];

    const today = new Date();

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[12px] font-medium text-zinc-500">{formatDeskDate(today)}</p>
                    <h1 className="mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight text-zinc-950 sm:text-[2rem]">
                        {greetingForNow(today)}
                    </h1>
                    <p className="mt-1 text-[14px] font-medium text-zinc-500">
                        {isAnalyst
                            ? 'A quick look at the founders on your list'
                            : 'A quick look across the founder desk'}
                    </p>
                </div>
                <Link
                    href="/admin/founder/founders"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A54A5] px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2D4182]"
                >
                    <SolarIcon name="solar:users-group-rounded-linear" className="size-3.5 text-white" />
                    View founders
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href} className="block">
                        <DeskCard className="h-full transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.12)]">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                                        {stat.label}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {stat.pulse && (
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3A54A5] opacity-50" />
                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                                            </span>
                                        )}
                                        <div className="flex size-8 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-500">
                                            <SolarIcon name={stat.icon} className="size-3.5" />
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[28px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">
                                    {stat.value}
                                </p>
                            </div>
                        </DeskCard>
                    </Link>
                ))}
            </div>

            {showFinance && (
                <DeskCard>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                        <div>
                            <h2 className="text-[15px] font-semibold text-zinc-950">Money collected</h2>
                            <p className="mt-0.5 text-[12px] text-zinc-500">What founders have paid so far</p>
                        </div>
                        <Link
                            href="/admin/revenue"
                            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200/80"
                        >
                            See payments
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                        <div>
                            <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">This month</p>
                            <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                {fmtCurrency(metrics.revenue_this_month ?? 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">In naira</p>
                            <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                {fmtCurrency(metrics.revenue_by_currency?.NGN ?? 0, 'NGN')}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">In dollars</p>
                            <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                {fmtCurrency(metrics.revenue_by_currency?.USD ?? 0, 'USD')}
                            </p>
                        </div>
                    </div>
                    {metrics.revenue_by_tier && (
                        <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-5 py-4">
                            {(['foundation', 'growth', 'institutional'] as const).map((tier) => (
                                <StatusPill key={tier} tone="zinc">
                                    {tier}: {fmtCurrency(metrics.revenue_by_tier![tier])}
                                </StatusPill>
                            ))}
                        </div>
                    )}
                </DeskCard>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 xl:gap-5">
                <DeskCard className="xl:col-span-3">
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                        <div>
                            <h2 className="text-[15px] font-semibold text-zinc-950">Where founders stand</h2>
                            <p className="mt-0.5 text-[12px] text-zinc-500">
                                {isAnalyst
                                    ? 'How work is moving for the people on your list'
                                    : 'Started vs finished over the last six months'}
                            </p>
                        </div>
                        <Link
                            href="/admin/founder/founders"
                            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200/80"
                        >
                            See all
                        </Link>
                    </div>

                    <div className="space-y-5 p-5">
                        {trend.length > 0 ? (
                            <EngagementAreaChart data={trend} />
                        ) : (
                            <div className="rounded-xl bg-[#F8F9FC] px-4 py-10 text-center text-[13px] text-zinc-500">
                                Chart data will show here once founders start moving through.
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                            <p className="text-[12px] font-medium text-zinc-500">
                                {finishedNow} finished right now · tap a status to open that list
                            </p>
                        </div>

                        {breakdown.length > 0 && (
                            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {breakdown.map((item) => {
                                    const status = item.status ?? 'pending';
                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={`/admin/founder/founders?status=${status}`}
                                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F8F9FC]"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-[13px] font-medium text-zinc-700">{item.label}</span>
                                                </div>
                                                <span className="text-[14px] font-semibold text-zinc-950 tabular-nums">
                                                    {item.value}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </DeskCard>

                <div className="flex flex-col gap-4 xl:col-span-2">
                    <DeskCard>
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <h2 className="text-[15px] font-semibold text-zinc-950">Things to handle</h2>
                            <p className="mt-0.5 text-[12px] text-zinc-500">These need you next</p>
                        </div>
                        {needs_attention.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F6FA] text-zinc-400">
                                    <SolarIcon name="solar:check-circle-linear" className="size-5" />
                                </div>
                                <p className="mt-3 text-[13px] font-medium text-zinc-500">You are all caught up</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-zinc-100">
                                {needs_attention.map((item) => {
                                    const copy = attentionCopy[item.id];
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={item.action_url}
                                                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8F9FC]"
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F6FA] text-zinc-500">
                                                    <SolarIcon
                                                        name={attentionIcon[item.id] ?? 'solar:bell-linear'}
                                                        className="size-3.5"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[13px] font-semibold text-zinc-950">
                                                        {copy?.title ?? item.title}
                                                    </p>
                                                    <p className="truncate text-[11px] text-zinc-500">
                                                        {copy?.description ?? item.description}
                                                    </p>
                                                </div>
                                                <StatusPill
                                                    tone={
                                                        item.color === 'amber'
                                                            ? 'amber'
                                                            : item.color === 'blue'
                                                              ? 'blue'
                                                              : 'zinc'
                                                    }
                                                >
                                                    {item.count}
                                                </StatusPill>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </DeskCard>

                    <DeskCard className="flex-1">
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <h2 className="text-[15px] font-semibold text-zinc-950">What&apos;s been happening</h2>
                            <p className="mt-0.5 text-[12px] text-zinc-500">Recent updates on your founders</p>
                        </div>

                        {recent_activity.length === 0 ? (
                            <div className="px-5 py-10 text-center text-[13px] text-zinc-500">Nothing new yet.</div>
                        ) : (
                            <ul className="divide-y divide-zinc-100">
                                {recent_activity.slice(0, 5).map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F6FA] text-zinc-500">
                                            <SolarIcon
                                                name={activityIcon[item.type] ?? 'solar:record-linear'}
                                                className="size-3.5"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] leading-snug font-medium text-zinc-900">
                                                {item.description}
                                            </p>
                                            {item.email && (
                                                <p className="mt-1 truncate text-[11px] text-zinc-500">{item.email}</p>
                                            )}
                                        </div>
                                        <span className="shrink-0 pt-0.5 text-[11px] font-medium text-zinc-400">
                                            {item.time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DeskCard>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({
    metrics,
    recent_activity,
    needs_attention = [],
    system_alerts = [],
    dealflow_handoff = null,
    pending_pia_requests = [],
    user_role,
    date_range = 'all',
    desk = 'platform',
}: PageProps) {
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst = user_role === 'analyst';
    const isCompliance = user_role === 'compliance';
    const isInvestorRelations = user_role === 'investor_relations';
    const showInvestorMetrics = desk === 'investors' || desk === 'platform';
    const showPlatformFinance = desk === 'platform' && isSuperAdmin;
    const canOpenSpotlightDesk = isSuperAdmin || isInvestorRelations;
    const deskHome =
        desk === 'founder' ? '/admin/founder' : desk === 'investors' ? '/admin/investors' : '/admin';

    const handoffSteps = dealflow_handoff
        ? [
              {
                  key: 'audit_complete',
                  label: 'Audit complete',
                  hint: 'PARAGON finished',
                  count: dealflow_handoff.audit_complete,
                  href: '/admin/founder/founders?status=complete',
                  available: isSuperAdmin,
              },
              {
                  key: 'ready_to_publish',
                  label: 'Ready to publish',
                  hint: 'Profile + deck ready',
                  count: dealflow_handoff.ready_to_publish,
                  href: '/admin/investors/spotlight?status=ready',
                  available: canOpenSpotlightDesk,
              },
              {
                  key: 'published',
                  label: 'Published',
                  hint: 'Live on Spotlight',
                  count: dealflow_handoff.published,
                  href: '/admin/investors/spotlight?status=published',
                  available: canOpenSpotlightDesk,
              },
              {
                  key: 'pending_interests',
                  label: 'Pending interests',
                  hint: 'Awaiting IR decision',
                  count: dealflow_handoff.pending_interests,
                  href: '/admin/investors/dealflow/interests?status=pending',
                  available: canOpenSpotlightDesk || isSuperAdmin,
              },
          ]
        : [];

    if (desk === 'founder') {
        return (
            <AdminLayout>
                <Head title="Founder desk — Admin" />
                {/* Ref 1 soft blue-gray canvas */}
                <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-[#F4F6FA] shadow-xs">
                    <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
                        <FounderDeskHome
                            metrics={metrics}
                            needs_attention={needs_attention}
                            recent_activity={recent_activity}
                            isAnalyst={isAnalyst}
                            isSuperAdmin={isSuperAdmin}
                        />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Dashboard — Admin" />

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-[#F4F6FA] shadow-xs">
                <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-[12px] font-medium text-zinc-500">{formatDeskDate(new Date())}</p>
                            <h1 className="mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight text-zinc-950 sm:text-[2rem]">
                                {greetingForNow()}
                            </h1>
                            <p className="mt-1 text-[14px] font-medium text-zinc-500">
                                {desk === 'investors'
                                    ? 'A quick look at the investor desk'
                                    : 'A quick look across the platform'}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {isSuperAdmin && desk === 'platform' && (
                                <div className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200/70 bg-white p-1 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]">
                                    {(
                                        [
                                            { key: 'all', label: 'All' },
                                            { key: '7d', label: '7d' },
                                            { key: '30d', label: '30d' },
                                            { key: 'ytd', label: 'YTD' },
                                            { key: '12m', label: '12m' },
                                        ] as const
                                    ).map(({ key, label }) => {
                                        const isSelected = date_range === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() =>
                                                    router.get(deskHome, { date_range: key }, { preserveState: true, preserveScroll: true })
                                                }
                                                className={cn(
                                                    'shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150',
                                                    isSelected
                                                        ? 'bg-[#F4F6FA] font-semibold text-zinc-950'
                                                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                                                )}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {desk === 'investors' ? (
                                <Link
                                    href="/admin/investors/accounts"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A54A5] px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2D4182]"
                                >
                                    <SolarIcon name="solar:users-group-rounded-linear" className="size-3.5 text-white" />
                                    View investors
                                </Link>
                            ) : (
                                <Link
                                    href="/admin/founder/founders"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A54A5] px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2D4182]"
                                >
                                    <SolarIcon name="solar:users-group-rounded-linear" className="size-3.5 text-white" />
                                    View founders
                                </Link>
                            )}
                        </div>
                    </div>

                    {desk === 'platform' && isSuperAdmin && (
                        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                            {[
                                {
                                    label: 'Founders',
                                    value: metrics.total_founders ?? 0,
                                    href: '/admin/founder/founders',
                                    icon: 'solar:users-group-rounded-linear',
                                },
                                {
                                    label: 'In progress',
                                    value: metrics.active_audits ?? 0,
                                    href: '/admin/founder/founders?status=in_progress',
                                    icon: 'solar:play-circle-linear',
                                },
                                {
                                    label: 'Pending KYC',
                                    value: metrics.pending_kyc ?? 0,
                                    href: '/admin/investors/accounts?kyc_status=pending',
                                    icon: 'solar:shield-warning-linear',
                                    pulse: (metrics.pending_kyc ?? 0) > 0,
                                },
                                {
                                    label: 'New messages',
                                    value: metrics.my_open_messages ?? 0,
                                    href: '/admin/founder/messages',
                                    icon: 'solar:inbox-linear',
                                    pulse: (metrics.my_open_messages ?? 0) > 0,
                                },
                            ].map((stat) => (
                                <Link key={stat.label} href={stat.href} className="block">
                                    <DeskCard className="h-full transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.12)]">
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                                                    {stat.label}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {stat.pulse && (
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3A54A5] opacity-50" />
                                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                                                        </span>
                                                    )}
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-500">
                                                        <SolarIcon name={stat.icon} className="size-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-[28px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                {stat.value}
                                            </p>
                                        </div>
                                    </DeskCard>
                                </Link>
                            ))}
                        </div>
                    )}

                    {desk === 'investors' && (isSuperAdmin || isCompliance || isInvestorRelations) && (
                        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                            {[
                                {
                                    label: 'Active investors',
                                    value: metrics.active_investors ?? 0,
                                    href: '/admin/investors/accounts',
                                    icon: 'solar:users-group-rounded-linear',
                                },
                                {
                                    label: 'Pending KYC',
                                    value: metrics.pending_kyc ?? 0,
                                    href: '/admin/investors/accounts?kyc_status=pending',
                                    icon: 'solar:shield-warning-linear',
                                    pulse: (metrics.pending_kyc ?? 0) > 0,
                                },
                                {
                                    label: 'Approved KYC',
                                    value: metrics.approved_kyc ?? 0,
                                    href: '/admin/investors/accounts?kyc_status=approved',
                                    icon: 'solar:shield-check-linear',
                                },
                                {
                                    label: 'Pending dealflow',
                                    value: metrics.pending_interests ?? 0,
                                    href: '/admin/investors/dealflow/interests?status=pending',
                                    icon: 'solar:folder-with-files-linear',
                                    pulse: (metrics.pending_interests ?? 0) > 0,
                                },
                            ].map((stat) => (
                                <Link key={stat.label} href={stat.href} className="block">
                                    <DeskCard className="h-full transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.12)]">
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                                                    {stat.label}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {stat.pulse && (
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3A54A5] opacity-50" />
                                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3A54A5]" />
                                                        </span>
                                                    )}
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-500">
                                                        <SolarIcon name={stat.icon} className="size-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-[28px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                {stat.value}
                                            </p>
                                        </div>
                                    </DeskCard>
                                </Link>
                            ))}
                        </div>
                    )}

                    {isSuperAdmin && system_alerts.length > 0 && <SystemAlertsWidget alerts={system_alerts} />}

                    {handoffSteps.length > 0 && (
                        <DeskCard className="mb-6">
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <h2 className="text-[15px] font-semibold text-zinc-950">Dealflow handoff</h2>
                                <p className="mt-0.5 text-[12px] text-zinc-500">
                                    Founder audit → Spotlight → investor interests
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-px bg-zinc-100 sm:grid-cols-2 xl:grid-cols-4">
                                {handoffSteps.map((step, index) => {
                                    const inner = (
                                        <div
                                            className={cn(
                                                'flex h-full flex-col justify-between bg-white p-4 sm:p-5',
                                                step.available && 'transition-colors hover:bg-[#F8F9FC]',
                                                !step.available && 'opacity-70',
                                            )}
                                        >
                                            <div>
                                                <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400 uppercase">
                                                    Step {index + 1}
                                                </p>
                                                <h3 className="mt-1 text-[13px] font-semibold text-zinc-950">{step.label}</h3>
                                                <p className="mt-0.5 text-[11px] text-zinc-500">{step.hint}</p>
                                            </div>
                                            <p className="mt-4 text-[26px] leading-none font-semibold tracking-tight text-zinc-900 tabular-nums">
                                                {step.count}
                                            </p>
                                        </div>
                                    );

                                    if (step.available) {
                                        return (
                                            <Link key={step.key} href={step.href} className="block h-full">
                                                {inner}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div key={step.key} className="h-full">
                                            {inner}
                                        </div>
                                    );
                                })}
                            </div>
                        </DeskCard>
                    )}

                    {needs_attention.length > 0 && (
                        <DeskCard className="mb-6">
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <h2 className="text-[15px] font-semibold text-zinc-950">Things to handle</h2>
                                <p className="mt-0.5 text-[12px] text-zinc-500">These need you next</p>
                            </div>
                            <ul className="divide-y divide-zinc-100">
                                {needs_attention.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.action_url}
                                            className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F9FC]"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-500">
                                                    <SolarIcon name={item.icon} className="size-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold text-zinc-950">{item.title}</p>
                                                    <p className="truncate text-[12px] text-zinc-500">{item.description}</p>
                                                </div>
                                            </div>
                                            <span className="text-[20px] font-semibold tabular-nums text-zinc-950">{item.count}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </DeskCard>
                    )}

                    {showInvestorMetrics && desk === 'platform' && (isSuperAdmin || isCompliance || isInvestorRelations) && (
                        <div className="mb-6">
                            <p className="mb-3 text-[13px] font-medium text-zinc-500">Investor desk</p>
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                                {[
                                    {
                                        label: 'Active investors',
                                        value: metrics.active_investors ?? 0,
                                        href: '/admin/investors/accounts',
                                        icon: 'solar:users-group-rounded-linear',
                                    },
                                    {
                                        label: 'Approved KYC',
                                        value: metrics.approved_kyc ?? 0,
                                        href: '/admin/investors/accounts?kyc_status=approved',
                                        icon: 'solar:shield-check-linear',
                                    },
                                    {
                                        label: 'Pending dealflow',
                                        value: metrics.pending_interests ?? 0,
                                        href: '/admin/investors/dealflow/interests?status=pending',
                                        icon: 'solar:folder-with-files-linear',
                                    },
                                    {
                                        label: 'Scheduled calls',
                                        value: metrics.scheduled_founder_calls ?? 0,
                                        href: '/admin/investors/dealflow/interests?call_status=scheduled',
                                        icon: 'solar:phone-calling-linear',
                                    },
                                ].map((stat) => (
                                    <Link key={stat.label} href={stat.href} className="block">
                                        <DeskCard className="h-full transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.12)]">
                                            <div className="p-4 sm:p-5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                                                        {stat.label}
                                                    </span>
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-500">
                                                        <SolarIcon name={stat.icon} className="size-3.5" />
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-[28px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                    {stat.value}
                                                </p>
                                            </div>
                                        </DeskCard>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {showPlatformFinance && (
                        <>
                            <DeskCard className="mb-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                                    <div>
                                        <h2 className="text-[15px] font-semibold text-zinc-950">Money collected</h2>
                                        <p className="mt-0.5 text-[12px] text-zinc-500">What founders have paid so far</p>
                                    </div>
                                    <Link
                                        href="/admin/revenue"
                                        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200/80"
                                    >
                                        See payments
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">This month</p>
                                        <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                            {fmtCurrency(metrics.revenue_this_month ?? 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">In naira</p>
                                        <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                            {fmtCurrency(metrics.revenue_by_currency?.NGN ?? 0, 'NGN')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">In dollars</p>
                                        <p className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                            {fmtCurrency(metrics.revenue_by_currency?.USD ?? 0, 'USD')}
                                        </p>
                                    </div>
                                </div>
                            </DeskCard>

                            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="flex flex-col gap-4 lg:col-span-2">
                                    {(metrics.monthly_revenue?.length ?? 0) > 0 && (
                                        <DeskCard className="p-5 sm:p-6">
                                            <RevenueAreaChart data={metrics.monthly_revenue!} thisMonth={metrics.revenue_this_month ?? 0} />
                                        </DeskCard>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    {(metrics.audit_breakdown?.length ?? 0) > 0 && (
                                        <DeskCard className="p-5 sm:p-6">
                                            <AuditDonut data={metrics.audit_breakdown!} />
                                        </DeskCard>
                                    )}
                                    {metrics.revenue_by_tier && (
                                        <DeskCard>
                                            <div className="border-b border-zinc-100 px-5 py-4">
                                                <h2 className="text-[15px] font-semibold text-zinc-950">Revenue by tier</h2>
                                            </div>
                                            <div className="space-y-0 divide-y divide-zinc-100 p-2">
                                                {(['foundation', 'growth', 'institutional'] as const).map((tier) => (
                                                    <div key={tier} className="flex items-center justify-between px-3 py-3">
                                                        <p className="text-[13px] font-medium text-zinc-500 capitalize">{tier}</p>
                                                        <p className="text-[15px] font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                            {fmtCurrency(metrics.revenue_by_tier![tier])}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </DeskCard>
                                    )}
                                    {metrics.funnel && (
                                        <DeskCard className="overflow-hidden">
                                            <FunnelChart data={metrics.funnel} />
                                        </DeskCard>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {(desk === 'investors' || desk === 'platform') && (
                        <DeskCard>
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <h2 className="text-[15px] font-semibold text-zinc-950">Recent activity</h2>
                            </div>

                            {recent_activity.length === 0 ? (
                                <div className="px-5 py-10 text-center text-[13px] font-medium text-zinc-500">
                                    No recent activity for this desk yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {recent_activity.slice(0, 8).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8F9FC]">
                                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F4F6FA] text-zinc-400">
                                                <SolarIcon
                                                    name={activityIcon[item.type] ?? 'solar:record-linear'}
                                                    className="size-3.5"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2">
                                                    <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                                                        {activityTypeLabel[item.type] ?? item.type}
                                                    </span>
                                                    <p className="truncate text-[13.5px] font-semibold text-zinc-900">{item.description}</p>
                                                </div>
                                                {item.email && <p className="mt-1 truncate text-xs font-medium text-zinc-500">{item.email}</p>}
                                            </div>
                                            <span className="shrink-0 text-[11px] font-medium text-zinc-400">{item.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DeskCard>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
