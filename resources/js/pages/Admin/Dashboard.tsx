import { Head, Link, router } from '@inertiajs/react';
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

function FounderDeskHome({
    metrics,
    pending_pia_requests,
    recent_activity,
    isAnalyst,
}: {
    metrics: Metrics;
    pending_pia_requests: PendingPiaRequest[];
    recent_activity: ActivityItem[];
    isAnalyst: boolean;
    isSuperAdmin: boolean;
}) {
    const stats = isAnalyst
        ? [
              {
                  label: 'My assigned',
                  value: metrics.my_assigned ?? 0,
                  href: '/admin/founder/founders',
                  icon: 'solar:users-group-rounded-linear',
              },
              {
                  label: 'Active audits',
                  value: metrics.active_audits ?? 0,
                  href: '/admin/founder/founders?status=in_progress',
                  icon: 'solar:play-circle-linear',
              },
              {
                  label: 'Needs info',
                  value: metrics.needs_info_count ?? 0,
                  href: '/admin/founder/founders?status=needs_info',
                  icon: 'solar:danger-circle-linear',
                  pulse: (metrics.needs_info_count ?? 0) > 0,
              },
              {
                  label: 'Unread messages',
                  value: metrics.my_open_messages ?? 0,
                  href: '/admin/founder/messages',
                  icon: 'solar:inbox-linear',
                  pulse: (metrics.my_open_messages ?? 0) > 0,
              },
          ]
        : [
              {
                  label: 'Total founders',
                  value: metrics.total_founders ?? 0,
                  href: '/admin/founder/founders',
                  icon: 'solar:users-group-rounded-linear',
              },
              {
                  label: 'Active audits',
                  value: metrics.active_audits ?? 0,
                  href: '/admin/founder/founders?status=in_progress',
                  icon: 'solar:play-circle-linear',
              },
              {
                  label: 'Needs info',
                  value: metrics.needs_info_count ?? 0,
                  href: '/admin/founder/founders?status=needs_info',
                  icon: 'solar:danger-circle-linear',
                  pulse: (metrics.needs_info_count ?? 0) > 0,
              },
              {
                  label: 'Unread messages',
                  value: metrics.my_open_messages ?? 0,
                  href: '/admin/founder/messages',
                  icon: 'solar:inbox-linear',
                  pulse: (metrics.my_open_messages ?? 0) > 0,
              },
          ];

    const waitingCount = pending_pia_requests.length;

    return (
        <div>
            {/* Dashboard header */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Overview</h1>
                    <p className="mt-1.5 text-[14px] font-medium text-zinc-500">
                        {isAnalyst ? 'Your assigned engagements' : 'Founder desk overview'}
                    </p>
                </div>
                {waitingCount > 0 && (
                    <Link
                        href="/admin/founder/pia-requests?status=pending"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/6 px-3.5 py-2 text-[12px] font-semibold text-[#3A54A5] transition-colors hover:bg-[#3A54A5]/10"
                    >
                        <SolarIcon name="solar:card-send-linear" className="size-3.5" />
                        {waitingCount} waiting to pay
                    </Link>
                )}
            </div>

            {/* KPI row */}
            <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">{stat.label}</span>
                            <div className="flex items-center gap-2">
                                {stat.pulse && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3A54A5] opacity-50" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3A54A5]" />
                                    </span>
                                )}
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 transition-colors group-hover:bg-[#3A54A5]/8 group-hover:text-[#3A54A5]">
                                    <SolarIcon name={stat.icon} className="size-4" />
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-zinc-950 tabular-nums">
                            {stat.value}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Main widgets */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                {/* Waiting to pay — primary widget */}
                <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm xl:col-span-3">
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3A54A5]/8 text-[#3A54A5]">
                                <SolarIcon name="solar:card-send-linear" className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-[14px] font-semibold text-zinc-950">Waiting to pay</h2>
                                <p className="text-[12px] text-zinc-500">PIA requests from checkout</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/founder/pia-requests"
                            className="text-[12px] font-semibold text-[#3A54A5] hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {pending_pia_requests.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <SolarIcon name="solar:card-linear" className="mx-auto size-8 text-zinc-300" />
                            <p className="mt-3 text-[13px] font-medium text-zinc-500">No open payment requests</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-100">
                            {pending_pia_requests.map((request) => (
                                <li key={request.id}>
                                    <Link
                                        href={`/admin/founder/pia-requests?status=${request.status}`}
                                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50/80"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-semibold text-zinc-950">{request.company}</p>
                                            <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                                                {request.name} · {request.email}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-zinc-700">
                                                {request.selected_tier ?? 'No tier'}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-[10px] font-bold tracking-wide uppercase',
                                                    request.status === 'contacted' ? 'text-[#3A54A5]' : 'text-amber-600',
                                                )}
                                            >
                                                {request.status}
                                                {request.created_at ? ` · ${request.created_at}` : ''}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Recent activity */}
                <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm xl:col-span-2">
                    <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
                            <SolarIcon name="solar:history-linear" className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-950">Recent activity</h2>
                            <p className="text-[12px] text-zinc-500">Latest desk events</p>
                        </div>
                    </div>

                    {recent_activity.length === 0 ? (
                        <div className="px-5 py-12 text-center text-[13px] text-zinc-500">No recent activity yet.</div>
                    ) : (
                        <ul className="divide-y divide-zinc-100">
                            {recent_activity.slice(0, 6).map((item, i) => (
                                <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
                                        <SolarIcon
                                            name={activityIcon[item.type] ?? 'solar:record-linear'}
                                            className="size-3.5"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] leading-snug font-medium text-zinc-900">{item.description}</p>
                                        {item.email && (
                                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{item.email}</p>
                                        )}
                                    </div>
                                    <span className="shrink-0 text-[11px] text-zinc-400">{item.time}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
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
    const deskLabel =
        desk === 'investors'
            ? 'Investor desk overview'
            : isSuperAdmin
              ? 'Full platform overview'
              : 'Admin overview';

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
                <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-xs">
                    <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
                        <FounderDeskHome
                            metrics={metrics}
                            pending_pia_requests={pending_pia_requests}
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

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-xs">
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:py-10">
                    <div className="mb-10 flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Overview</h1>
                            <p className="mt-2 text-[15px] font-medium text-zinc-500">{deskLabel}</p>
                        </div>
                        {isSuperAdmin && desk === 'platform' && (
                            <div className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200/80 bg-white p-1 shadow-2xs">
                                {(
                                    [
                                        { key: 'all', label: 'All Time' },
                                        { key: '7d', label: '7 Days' },
                                        { key: '30d', label: '30 Days' },
                                        { key: 'ytd', label: 'YTD' },
                                        { key: '12m', label: '12 Months' },
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
                                                'shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all duration-150',
                                                isSelected
                                                    ? 'bg-zinc-100/80 font-semibold text-zinc-950 shadow-xs'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                                            )}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {isSuperAdmin && system_alerts.length > 0 && <SystemAlertsWidget alerts={system_alerts} />}

                    {handoffSteps.length > 0 && (
                        <div className="mb-10">
                            <div className="mb-4">
                                <h2 className="text-[13px] font-semibold tracking-wider text-zinc-900 uppercase">Dealflow handoff</h2>
                                <p className="mt-1 text-[12px] font-medium text-zinc-500">
                                    Founder audit → Spotlight publish → investor interests
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
                                {handoffSteps.map((step, index) => {
                                    const inner = (
                                        <div
                                            className={cn(
                                                'flex h-full flex-col justify-between bg-white p-4 sm:p-5',
                                                step.available && 'transition-colors hover:bg-zinc-50',
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
                        </div>
                    )}

                    {needs_attention.length > 0 && (
                        <div className="mb-10">
                            <p className="mb-4 text-[11px] font-medium tracking-[0.14em] text-zinc-500 uppercase">Action required</p>
                            <div className="divide-y divide-zinc-100 border border-zinc-200/80">
                                {needs_attention.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.action_url}
                                        className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-zinc-50"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <SolarIcon name={item.icon} className="text-zinc-400" />
                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-semibold text-zinc-950">{item.title}</p>
                                                <p className="truncate text-[12px] text-zinc-500">{item.description}</p>
                                            </div>
                                        </div>
                                        <span className="text-[20px] font-semibold tabular-nums text-zinc-950">{item.count}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {showInvestorMetrics && (isSuperAdmin || isCompliance || isInvestorRelations) && (
                        <div className="mb-10">
                            {desk === 'platform' && (
                                <p className="mb-4 text-[11px] font-medium tracking-[0.14em] text-zinc-500 uppercase">Investor desk</p>
                            )}
                            <div className="mb-2 grid grid-cols-2 gap-x-6 lg:grid-cols-4">
                                <MetricCard
                                    label="Active Investors"
                                    value={metrics.active_investors ?? 0}
                                    icon="solar:users-group-rounded-linear"
                                    href="/admin/investors/accounts"
                                />
                                <MetricCard
                                    label="Pending KYC"
                                    value={metrics.pending_kyc ?? 0}
                                    icon="solar:shield-warning-linear"
                                    pulse={(metrics.pending_kyc ?? 0) > 0}
                                    href="/admin/investors/accounts?kyc_status=pending"
                                />
                                <MetricCard
                                    label="Approved KYC"
                                    value={metrics.approved_kyc ?? 0}
                                    icon="solar:shield-check-linear"
                                    href="/admin/investors/accounts?kyc_status=approved"
                                />
                                <MetricCard
                                    label="Pending Dealflow"
                                    value={metrics.pending_interests ?? 0}
                                    icon="solar:folder-with-files-linear"
                                    href="/admin/investors/dealflow/interests?status=pending"
                                />
                            </div>
                            {(isSuperAdmin || isInvestorRelations) && (
                                <div className="grid grid-cols-2 gap-x-6 lg:grid-cols-4">
                                    <MetricCard
                                        label="Scheduled Calls"
                                        value={metrics.scheduled_founder_calls ?? 0}
                                        icon="solar:phone-calling-linear"
                                        href="/admin/investors/dealflow/interests?call_status=scheduled"
                                    />
                                    <MetricCard
                                        label="Rejected KYC"
                                        value={metrics.rejected_kyc ?? 0}
                                        icon="solar:close-circle-linear"
                                        href="/admin/investors/accounts?kyc_status=rejected"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {showPlatformFinance && (
                        <>
                            <div className="mb-6 grid grid-cols-2 gap-x-6 lg:grid-cols-4">
                                <MetricCard
                                    label="Revenue collected"
                                    value={fmtCurrency(metrics.revenue_by_currency?.NGN ?? 0, 'NGN')}
                                    subValue={`USD: ${fmtCurrency(metrics.revenue_by_currency?.USD ?? 0, 'USD')}`}
                                    icon="solar:wallet-money-linear"
                                    href="/admin/revenue"
                                />
                            </div>

                            <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="flex flex-col gap-6 lg:col-span-2">
                                    {(metrics.monthly_revenue?.length ?? 0) > 0 && (
                                        <RevenueAreaChart data={metrics.monthly_revenue!} thisMonth={metrics.revenue_this_month ?? 0} />
                                    )}
                                </div>
                                <div className="flex flex-col gap-6">
                                    {(metrics.audit_breakdown?.length ?? 0) > 0 && <AuditDonut data={metrics.audit_breakdown!} />}
                                    {metrics.revenue_by_tier && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-4 border-b border-zinc-100 pb-4">
                                                <span className="text-[15px] font-semibold text-zinc-900">Revenue by Tier</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {(['foundation', 'growth', 'institutional'] as const).map((tier) => (
                                                    <div key={tier} className="relative w-full border border-zinc-200/80 bg-white p-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[13px] font-medium text-zinc-500 capitalize">{tier}</p>
                                                            <SolarIcon name="solar:card-linear" className="text-zinc-300" />
                                                        </div>
                                                        <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
                                                            {fmtCurrency(metrics.revenue_by_tier![tier])}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {metrics.funnel && <FunnelChart data={metrics.funnel} />}
                                </div>
                            </div>
                        </>
                    )}

                    {(desk === 'investors' || desk === 'platform') && (
                        <div className="min-w-0">
                            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-4">
                                <span className="text-[15px] font-semibold text-zinc-900">Recent Activity</span>
                            </div>

                            {recent_activity.length === 0 ? (
                                <div className="border border-zinc-200/80 bg-white p-10 text-center text-sm font-medium text-zinc-500">
                                    No recent activity for this desk yet.
                                </div>
                            ) : (
                                <div className="overflow-hidden border border-zinc-200/80 bg-white">
                                    {recent_activity.slice(0, 8).map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 border-b border-zinc-100 p-4 transition-colors last:border-0 hover:bg-zinc-50/50 sm:p-5"
                                        >
                                            <SolarIcon
                                                name={activityIcon[item.type] ?? 'solar:record-linear'}
                                                className="mt-0.5 size-[15px] text-zinc-400"
                                            />
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
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
