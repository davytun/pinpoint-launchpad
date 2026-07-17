import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, CheckCircle2, Clock, DollarSign, List, MessageSquare, Users, Zap } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, XAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
    month: string;
    revenue: number;
}
interface AuditBreakdownItem {
    label: string;
    value: number;
    color: string;
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
    user_role: 'superadmin' | 'analyst' | 'support';
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
    icon: Icon,
    label,
    value,
    color,
    iconBg,
    pulse = false,
    href,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    iconBg: string;
    pulse?: boolean;
    href?: string;
}) {
    const inner = (
        <div
            className={cn(
                'group rounded-xl border border-white/80 bg-white/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md transition-all hover:border-zinc-300 hover:bg-white/50 sm:p-5',
                href && 'cursor-pointer',
            )}
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[10px] leading-tight font-bold tracking-widest text-zinc-500 uppercase">{label}</span>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className={`size-4 ${color}`} />
                </div>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-xl font-extrabold text-zinc-950 sm:text-2xl">{value}</span>
                {pulse && (
                    <span className="relative mb-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                )}
            </div>
        </div>
    );
    if (href) return <Link href={href}>{inner}</Link>;
    return inner;
}

// ─── Revenue sparkline ────────────────────────────────────────────────────────

const revenueChartConfig = {
    revenue: { label: 'Revenue', color: '#10b981' },
} satisfies ChartConfig;

function RevenueSparkline({ data, thisMonth }: { data: MonthlyRevenue[]; thisMonth: number }) {
    const max = Math.max(...data.map((d) => d.revenue), 1);
    return (
        <div className="min-w-0 rounded-xl border border-white/80 bg-white/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-5">
            <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Monthly Revenue</p>
                <DollarSign className="text-emerald-650 size-4 opacity-50" />
            </div>
            <p className="mb-4 text-2xl font-extrabold text-zinc-950">{fmtCurrency(thisMonth)}</p>
            <ChartContainer config={revenueChartConfig} className="h-[90px] w-full">
                <BarChart data={data} barCategoryGap="28%">
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmtCurrency(Number(v))} hideLabel />} />
                    <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.revenue === max ? '#10b981' : 'rgba(16,185,129,0.22)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
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
        <div className="min-w-0 rounded-xl border border-white/80 bg-white/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-5">
            <p className="mb-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Audit Pipeline</p>
            <div className="flex items-center gap-5">
                {/* Donut */}
                <ChartContainer config={chartConfig} className="h-[100px] w-[100px] shrink-0">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={46}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                    </PieChart>
                </ChartContainer>

                {/* Legend */}
                <div className="min-w-0 flex-1 space-y-1.5">
                    {data.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                                <span className="text-zinc-650 truncate text-xs font-semibold">{item.label}</span>
                            </div>
                            <span className="shrink-0 text-xs font-bold text-zinc-800 tabular-nums">{item.value}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-1.5">
                        <span className="text-xs font-semibold text-zinc-400">Total</span>
                        <span className="text-xs font-extrabold text-zinc-950 tabular-nums">{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Waitlist split ───────────────────────────────────────────────────────────

const waitlistChartConfig = {
    founders: { label: 'Founders', color: '#3B82F6' },
    investors: { label: 'Investors', color: '#8B5CF6' },
} satisfies ChartConfig;

function WaitlistSplit({ founders, investors }: { founders: number; investors: number }) {
    const total = founders + investors;
    const founderPct = total ? Math.round((founders / total) * 100) : 0;
    const investorPct = total ? 100 - founderPct : 0;

    const barData = [
        { name: 'Founders', founders, investors: 0 },
        { name: 'Investors', founders: 0, investors },
    ];

    return (
        <div className="min-w-0 rounded-xl border border-white/80 bg-white/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-5">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Waitlist</p>
                <span className="text-xs font-extrabold text-zinc-950">{total} total</span>
            </div>

            <ChartContainer config={waitlistChartConfig} className="h-[70px] w-full">
                <BarChart data={barData} layout="vertical" barCategoryGap="25%" margin={{ left: 0, right: 0 }}>
                    <XAxis type="number" hide />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="founders" radius={[0, 3, 3, 0]} fill="var(--color-founders)" />
                    <Bar dataKey="investors" radius={[0, 3, 3, 0]} fill="var(--color-investors)" />
                </BarChart>
            </ChartContainer>

            <div className="mt-3 flex gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-zinc-650 text-xs font-semibold">
                        Founders <span className="font-bold text-zinc-950">{founderPct}%</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span className="text-zinc-650 text-xs font-semibold">
                        Investors <span className="font-bold text-zinc-950">{investorPct}%</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const activityDotColor: Record<string, string> = {
    diagnostic: 'bg-purple-650',
    payment: 'bg-emerald-650',
    message: 'bg-[#3A54A5]',
};
const activityTypeLabel: Record<string, string> = {
    diagnostic: 'Diagnostic',
    payment: 'Payment',
    message: 'Message',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ metrics, recent_activity, user_role }: PageProps) {
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst = user_role === 'analyst';

    return (
        <AdminLayout>
            <Head title="Dashboard — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-zinc-955 text-xl font-extrabold sm:text-2xl">Operational Command</h1>
                    <p className="text-zinc-550 mt-1 text-sm">
                        {isSuperAdmin ? 'Full platform overview' : isAnalyst ? 'Your assigned engagements' : 'Support overview'}
                    </p>
                </div>

                {/* ── Superadmin ── */}
                {isSuperAdmin && (
                    <>
                        <div className="mb-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <MetricCard
                                icon={Users}
                                label="Total Founders"
                                value={metrics.total_founders ?? 0}
                                color="text-[#3A54A5]"
                                iconBg="bg-[#3A54A5]/10"
                                href="/admin/founders"
                            />
                            <MetricCard
                                icon={DollarSign}
                                label="Total Revenue"
                                value={fmtCurrency(metrics.total_revenue ?? 0)}
                                color="text-emerald-650"
                                iconBg="bg-emerald-50"
                            />
                            <MetricCard
                                icon={Activity}
                                label="Active Audits"
                                value={metrics.active_audits ?? 0}
                                color="text-amber-700"
                                iconBg="bg-amber-50"
                            />
                            <MetricCard
                                icon={Zap}
                                label="High Scorers >85"
                                value={metrics.high_scorers ?? 0}
                                color="text-purple-650"
                                iconBg="bg-purple-50"
                            />
                        </div>
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-6 lg:grid-cols-4">
                            <MetricCard icon={Clock} label="Pending" value={metrics.pending_audits ?? 0} color="text-zinc-500" iconBg="bg-zinc-100" />
                            <MetricCard
                                icon={AlertTriangle}
                                label="Needs Info"
                                value={metrics.needs_info_count ?? 0}
                                color="text-amber-700"
                                iconBg="bg-amber-50"
                                pulse={(metrics.needs_info_count ?? 0) > 0}
                                href="/admin/founders"
                            />
                            <MetricCard
                                icon={CheckCircle2}
                                label="Complete"
                                value={metrics.complete_audits ?? 0}
                                color="text-emerald-650"
                                iconBg="bg-emerald-50"
                            />
                            <MetricCard
                                icon={List}
                                label="Waitlist"
                                value={(metrics.waitlist_count?.founders ?? 0) + (metrics.waitlist_count?.investors ?? 0)}
                                color="text-[#3A54A5]"
                                iconBg="bg-[#3A54A5]/10"
                                href="/admin/waitlist"
                            />
                        </div>

                        {/* Charts */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 lg:grid-cols-3">
                            {(metrics.monthly_revenue?.length ?? 0) > 0 && (
                                <RevenueSparkline data={metrics.monthly_revenue!} thisMonth={metrics.revenue_this_month ?? 0} />
                            )}
                            {(metrics.audit_breakdown?.length ?? 0) > 0 && <AuditDonut data={metrics.audit_breakdown!} />}
                            {metrics.waitlist_count && (
                                <WaitlistSplit founders={metrics.waitlist_count.founders} investors={metrics.waitlist_count.investors} />
                            )}
                        </div>

                        {/* Revenue by tier */}
                        {metrics.revenue_by_tier && (
                            <div className="mb-6 lg:mb-8">
                                <h2 className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Revenue by Tier</h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                                    {(['foundation', 'growth', 'institutional'] as const).map((tier) => (
                                        <div
                                            key={tier}
                                            className="rounded-xl border border-white/80 bg-white/30 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-5"
                                        >
                                            <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 capitalize">{tier}</p>
                                            <p className="text-xl font-extrabold text-zinc-950">{fmtCurrency(metrics.revenue_by_tier![tier])}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── Analyst ── */}
                {isAnalyst && (
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-8 lg:grid-cols-4">
                        <MetricCard
                            icon={Users}
                            label="My Assigned"
                            value={metrics.my_assigned ?? 0}
                            color="text-[#3A54A5]"
                            iconBg="bg-[#3A54A5]/10"
                            href="/admin/founders"
                        />
                        <MetricCard
                            icon={Activity}
                            label="Active Audits"
                            value={metrics.active_audits ?? 0}
                            color="text-amber-700"
                            iconBg="bg-amber-50"
                        />
                        <MetricCard
                            icon={AlertTriangle}
                            label="Needs Info"
                            value={metrics.needs_info_count ?? 0}
                            color="text-amber-700"
                            iconBg="bg-amber-50"
                            pulse={(metrics.needs_info_count ?? 0) > 0}
                        />
                        <MetricCard
                            icon={MessageSquare}
                            label="Unread Messages"
                            value={metrics.my_open_messages ?? 0}
                            color="text-[#3A54A5]"
                            iconBg="bg-[#3A54A5]/10"
                            href="/admin/messages"
                        />
                    </div>
                )}

                {/* ── Support ── */}
                {user_role === 'support' && (
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mb-8">
                        <MetricCard
                            icon={MessageSquare}
                            label="Unread Messages"
                            value={metrics.my_open_messages ?? 0}
                            color="text-[#3A54A5]"
                            iconBg="bg-[#3A54A5]/10"
                            href="/admin/messages"
                        />
                    </div>
                )}

                {/* ── Recent Activity ── */}
                <div>
                    <h2 className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Recent Activity</h2>
                    {recent_activity.length === 0 ? (
                        <div className="rounded-xl border border-white/80 bg-white/30 p-10 text-center text-sm text-zinc-500 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            No recent activity.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200/80 overflow-hidden rounded-xl border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            {recent_activity.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#3A54A5]/5 sm:px-5 sm:py-4">
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityDotColor[item.type] ?? 'bg-zinc-400'}`} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2">
                                            <span className="text-zinc-450 text-[10px] font-bold tracking-wider uppercase">
                                                {activityTypeLabel[item.type]}
                                            </span>
                                            <p className="truncate text-sm font-semibold text-zinc-900">{item.description}</p>
                                        </div>
                                        {item.email && <p className="mt-0.5 truncate text-xs text-zinc-500">{item.email}</p>}
                                    </div>
                                    <span className="text-zinc-450 shrink-0 text-xs whitespace-nowrap">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
