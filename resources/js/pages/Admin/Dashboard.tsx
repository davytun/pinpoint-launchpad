import { Head, Link, router } from '@inertiajs/react';

import { Activity, AlertTriangle, DollarSign, MessageSquare, Users, TrendingUp, CreditCard, AlertCircle, AlertOctagon, Filter } from 'lucide-react';
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
    total_revenue?: number;
    revenue_this_month?: number;
    revenue_by_tier?: { foundation: number; growth: number; institutional: number };
    waitlist_count?: { founders: number; investors: number };
    monthly_revenue?: MonthlyRevenue[];
    audit_breakdown?: AuditBreakdownItem[];
    funnel?: FunnelMetrics;
}

interface ActivityItem {
    type: 'diagnostic' | 'payment' | 'message';
    description: string;
    time: string;
    email: string | null;
}

interface PageProps {
    metrics: Metrics;
    recent_activity: ActivityItem[];
    needs_attention?: NeedsAttentionItem[];
    system_alerts?: SystemAlert[];
    user_role: 'superadmin' | 'analyst' | 'support';
    date_range?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
    label,
    value,
    subValue,
    pulse = false,
    href,
    icon: IconComponent,
    variant = 'gray',
}: {
    label: string;
    value: string | number;
    subValue?: React.ReactNode;
    pulse?: boolean;
    href?: string;
    icon?: React.ElementType;
    variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'gray';
}) {
    const defaultColors = { bg: 'bg-[#f4f4f5]', text: 'text-zinc-600' };
    const colors = colorMap[variant] || defaultColors;

    const inner = (
        <div
            className={cn(
                'group relative flex h-full flex-col justify-between p-4 sm:p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
                <div className="flex items-center gap-2">
                    {pulse && (
                        <span className="relative flex h-2 w-2 mr-1">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                        </span>
                    )}
                    {IconComponent && (
                        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", colors.bg, colors.text)}>
                            <IconComponent className="size-3.5" />
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="text-[26px] font-bold tracking-tight text-zinc-900 leading-none">{value}</span>
                    {subValue && <span className="mt-1 text-[11px] font-medium text-zinc-500">{subValue}</span>}
                </div>
            </div>
        </div>
    );
    if (href) return <Link href={href} className="block h-full">{inner}</Link>;
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
        <div className="min-w-0 rounded-[20px] border border-zinc-200/60 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] flex flex-col h-[380px]">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-500">Monthly Revenue</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    <TrendingUp className="size-3.5" />
                </div>
            </div>
            <p className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{fmtCurrency(thisMonth)}</p>
            <div className="flex-1 min-h-40">
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
        <div className="min-w-0 rounded-[20px] border border-zinc-200/60 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-500">Audit Pipeline</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100/80 text-zinc-400">
                    <Activity className="size-3.5" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-6 xl:flex-row xl:items-start">
                <div className="h-32 w-32 shrink-0 relative">
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-bold text-zinc-900 leading-none">{total}</span>
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

                <div className="min-w-0 flex-1 w-full space-y-2.5 xl:mt-2">
                    {data.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                                <span className="text-zinc-600 truncate text-[13px] font-medium">{item.label}</span>
                            </div>
                            <span className="shrink-0 text-[13px] font-bold text-zinc-900 tabular-nums">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Waitlist split ───────────────────────────────────────────────────────────

function WaitlistBars({ founders, investors }: { founders: number; investors: number }) {
    const total = founders + investors;
    const founderPct = total ? Math.round((founders / total) * 100) : 0;
    const investorPct = total ? 100 - founderPct : 0;

    return (
        <div className="min-w-0 rounded-[20px] border border-zinc-200/60 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-500">Waitlist Composition</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100/80 text-zinc-400">
                    <Users className="size-3.5" />
                </div>
            </div>
            
            <div className="mb-2 flex items-end justify-between">
                <span className="text-3xl font-bold text-zinc-900 tracking-tight">{total}</span>
                <span className="text-xs font-medium text-zinc-400 mb-1">Total pending</span>
            </div>

            <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="bg-zinc-900 transition-all duration-500" style={{ width: `${founderPct}%` }} />
                <div className="bg-zinc-400 transition-all duration-500" style={{ width: `${investorPct}%` }} />
            </div>

            <div className="mt-4 flex gap-5">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-900" />
                    <span className="text-zinc-500 text-xs font-medium">
                        Founders <span className="font-semibold text-zinc-900 ml-1">{founderPct}%</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    <span className="text-zinc-500 text-xs font-medium">
                        Investors <span className="font-semibold text-zinc-900 ml-1">{investorPct}%</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function FunnelChart({ data }: { data: FunnelMetrics }) {
    const max = data.signed_up || 1; // prevent divide by zero
    
    const steps = [
        { label: 'Signed Up', value: data.signed_up },
        { label: 'Diagnostic', value: data.completed_diagnostic },
        { label: 'Documents', value: data.uploaded_documents },
        { label: 'Audit Complete', value: data.audit_complete },
    ];

    return (
        <div className="min-w-0 rounded-[20px] border border-zinc-200/60 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-zinc-500">Onboarding Funnel</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100/80 text-zinc-400">
                    <Filter className="size-3.5" />
                </div>
            </div>
            
            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const percentage = Math.round((step.value / max) * 100);
                    // Calculate drop-off from previous step
                    const prevValue = idx === 0 ? step.value : steps[idx - 1].value;
                    const dropoff = idx === 0 ? 0 : (prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0);
                    
                    return (
                        <div key={step.label} className="relative">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[13px] font-semibold text-zinc-900">{step.label}</span>
                                <div className="flex items-center gap-2">
                                    {idx > 0 && dropoff > 0 && (
                                        <span className="text-[11px] font-medium text-red-500">-{dropoff}% drop</span>
                                    )}
                                    <span className="text-[13px] font-bold text-zinc-900 tabular-nums">{step.value}</span>
                                </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: `rgba(24, 24, 27, ${1 - (idx * 0.15)})`
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
        <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
                <h2 className="text-[13px] font-bold text-zinc-900 tracking-wider uppercase">System Alerts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {alerts.map((alert) => (
                    <Link 
                        key={alert.id} 
                        href={alert.action_url} 
                        className={cn(
                            "group relative flex flex-col justify-between p-4 sm:p-5 border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                            alert.type === 'error' ? "bg-red-50/30 border-red-100" : "bg-amber-50/30 border-amber-100"
                        )}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <h3 className={cn(
                                "text-[11px] font-bold uppercase tracking-wider line-clamp-1",
                                alert.type === 'error' ? "text-red-700" : "text-amber-700"
                            )}>{alert.title}</h3>
                            <div className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                alert.type === 'error' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                            )}>
                                {alert.type === 'error' ? <AlertOctagon className="size-3.5" /> : <AlertCircle className="size-3.5" />}
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className={cn(
                                "text-[13px] font-medium leading-relaxed",
                                alert.type === 'error' ? "text-red-900" : "text-amber-900"
                            )}>{alert.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const activityDotColor: Record<string, string> = {
    diagnostic: 'bg-zinc-600',
    payment: 'bg-zinc-900',
    message: 'bg-zinc-400',
};
const activityTypeLabel: Record<string, string> = {
    diagnostic: 'Diagnostic',
    payment: 'Payment',
    message: 'Message',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string }> = {
    amber: { bg: 'bg-amber-100/50', text: 'text-amber-600' },
    blue: { bg: 'bg-blue-100/50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-100/50', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-100/50', text: 'text-purple-600' },
    gray: { bg: 'bg-zinc-100/80', text: 'text-zinc-600' },
};

export default function AdminDashboard({ metrics, recent_activity, needs_attention = [], system_alerts = [], user_role, date_range = 'all' }: PageProps) {
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst = user_role === 'analyst';

    return (
        <AdminLayout>
            <Head title="Dashboard — Admin" />

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-xs">
                <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:py-10 no-scrollbar">
                    <div className="mb-10 flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Overview</h1>
                            <p className="mt-2 text-[15px] font-medium text-zinc-500">
                                {isSuperAdmin ? 'Full platform overview' : isAnalyst ? 'Your assigned engagements' : 'Support overview'}
                            </p>
                        </div>
                        {isSuperAdmin && (
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
                                            onClick={() => router.get('/admin', { date_range: key }, { preserveState: true, preserveScroll: true })}
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

                    {/* ── System Alerts ───────────────────────────────────────────────────────── */}
                    {isSuperAdmin && system_alerts.length > 0 && (
                        <SystemAlertsWidget alerts={system_alerts} />
                    )}

                    {/* ── Needs Attention Workflow ───────────────────────────────────────── */}
                    {needs_attention.length > 0 && (
                        <div className="mb-10">
                            <div className="mb-4 flex items-center gap-2">
                                <h2 className="text-[13px] font-bold text-zinc-900 tracking-wider uppercase">Action Required</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {needs_attention.map((item) => {
                                    const colors = colorMap[item.color] || colorMap.amber;
                                    return (
                                        <Link 
                                            key={item.id} 
                                            href={item.action_url} 
                                            className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-1">{item.title}</h3>
                                                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", colors.bg, colors.text)}>
                                                    <Icon icon={item.icon} className="size-3.5" />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[26px] font-bold tracking-tight text-zinc-900 leading-none">{item.count}</span>
                                                    <span className="text-[11px] font-medium text-zinc-500 mt-1">Pending</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Superadmin ── */}
                    {isSuperAdmin && (
                        <>
                            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <MetricCard
                                    label={date_range === 'all' ? 'Total Founders' : 'New Founders'}
                                    value={metrics.total_founders ?? 0}
                                    icon={Users}
                                    href="/admin/founders"
                                    variant="blue"
                                />
                                <MetricCard
                                    label="Total Revenue"
                                    value={fmtCurrency(metrics.total_revenue ?? 0)}
                                    icon={DollarSign}
                                    href="/admin/revenue"
                                    variant="emerald"
                                />
                                <MetricCard
                                    label="Active Audits"
                                    value={metrics.active_audits ?? 0}
                                    icon={Activity}
                                    href="/admin/founders?status=in_progress"
                                    variant="amber"
                                />
                                <MetricCard
                                    label="Needs Info"
                                    value={metrics.needs_info_count ?? 0}
                                    icon={AlertTriangle}
                                    pulse={(metrics.needs_info_count ?? 0) > 0}
                                    href="/admin/founders?status=needs_info"
                                    variant="purple"
                                />
                            </div>

                            {/* Charts & Activity (Masonry-style Columns) */}
                            <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Left Column: Charts and Activity */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    {(metrics.monthly_revenue?.length ?? 0) > 0 && (
                                        <RevenueAreaChart data={metrics.monthly_revenue!} thisMonth={metrics.revenue_this_month ?? 0} />
                                    )}

                                    <div className="min-w-0">
                                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-4">
                                            <span className="text-[15px] font-semibold text-zinc-900">Recent Activity</span>
                                        </div>
                                        
                                        {recent_activity.length === 0 ? (
                                            <div className="rounded-[20px] border border-zinc-200/60 bg-white p-10 text-center text-sm font-medium text-zinc-500 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
                                                No recent activity.
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-[20px] border border-zinc-200/60 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
                                                {[...recent_activity].reverse().slice(0, 6).map((item, i) => (
                                                    <div key={i} className="flex items-start gap-4 p-4 sm:p-5 transition-colors hover:bg-zinc-50/50 border-b border-zinc-100 last:border-0">
                                                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full shadow-xs ${activityDotColor[item.type] ?? 'bg-zinc-400'}`} />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-x-2">
                                                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                                                    {activityTypeLabel[item.type]}
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
                                </div>

                                {/* Right Column: Widgets */}
                                <div className="flex flex-col gap-6">
                                    {(metrics.audit_breakdown?.length ?? 0) > 0 && <AuditDonut data={metrics.audit_breakdown!} />}

                                    {/* Revenue by tier */}
                                    {metrics.revenue_by_tier && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-4 border-b border-zinc-100 pb-4">
                                                <span className="text-[15px] font-semibold text-zinc-900">Revenue by Tier</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {(['foundation', 'growth', 'institutional'] as const).map((tier) => (
                                                    <div
                                                        key={tier}
                                                        className="relative h-20 w-full overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200/50 p-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[13px] font-semibold text-zinc-500 capitalize">{tier}</p>
                                                            <CreditCard className="size-3.5 text-zinc-300" />
                                                        </div>
                                                        <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900">{fmtCurrency(metrics.revenue_by_tier![tier])}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Funnel Metrics */}
                                    {metrics.funnel && (
                                        <FunnelChart data={metrics.funnel} />
                                    )}
                                    
                                    {/* Waitlist Split */}
                                    {metrics.waitlist_count && (
                                        <WaitlistBars founders={metrics.waitlist_count.founders} investors={metrics.waitlist_count.investors} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {/* ── Analyst ── */}
                    {isAnalyst && (
                        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <MetricCard
                                label="My Assigned"
                                value={metrics.my_assigned ?? 0}
                                icon={Users}
                                href="/admin/founders"
                                variant="blue"
                            />
                            <MetricCard
                                label="Active Audits"
                                value={metrics.active_audits ?? 0}
                                icon={Activity}
                                href="/admin/founders?status=in_progress"
                                variant="emerald"
                            />
                            <MetricCard
                                label="Needs Info"
                                value={metrics.needs_info_count ?? 0}
                                icon={AlertTriangle}
                                pulse={(metrics.needs_info_count ?? 0) > 0}
                                href="/admin/founders?status=needs_info"
                                variant="amber"
                            />
                            <MetricCard
                                label="Unread Messages"
                                value={metrics.my_open_messages ?? 0}
                                icon={MessageSquare}
                                href="/admin/messages"
                                variant="purple"
                            />
                        </div>
                    )}

                    {/* ── Support ── */}
                    {user_role === 'support' && (
                        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <MetricCard
                                label="Unread Messages"
                                value={metrics.my_open_messages ?? 0}
                                icon={MessageSquare}
                                href="/admin/messages"
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
