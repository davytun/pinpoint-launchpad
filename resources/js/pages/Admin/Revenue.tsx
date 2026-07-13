import { Head } from '@inertiajs/react';
import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRow {
    id: number;
    customer_email: string;
    tier: string;
    total_amount: number;
    currency: string;
    paid_at: string | null;
    paystack_reference: string;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface Metrics {
    total_revenue: number;
    revenue_this_month: number;
    revenue_last_month: number;
    revenue_by_tier: { foundation: number; growth: number; institutional: number };
    monthly_revenue: MonthlyRevenue[];
    recent_payments: PaymentRow[];
}

interface PageProps {
    metrics: Metrics;
    user_role: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number, currency = 'USD'): string {
    const locale = currency.toUpperCase() === 'NGN' ? 'en-NG' : 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Chart configs ────────────────────────────────────────────────────────────

const trendChartConfig = {
    revenue: { label: 'Revenue', color: '#10b981' },
} satisfies ChartConfig;

const tierChartConfig = {
    foundation: { label: 'Foundation', color: '#3b82f6' },
    growth: { label: 'Growth', color: '#10b981' },
    institutional: { label: 'Institutional', color: '#8b5cf6' },
} satisfies ChartConfig;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRevenue({ metrics }: PageProps) {
    const diff = metrics.revenue_this_month - metrics.revenue_last_month;
    const isUp = diff >= 0;
    const TrendIcon = isUp ? TrendingUp : TrendingDown;
    const diffLabel = isUp ? `+${fmt(diff)} vs last month` : `${fmt(Math.abs(diff))} below last month`;

    const monthly = metrics.monthly_revenue ?? [];
    const maxRevenue = Math.max(...monthly.map((d) => d.revenue), 1);

    const tierData = [
        { tier: 'Foundation', value: metrics.revenue_by_tier.foundation, fill: tierChartConfig.foundation.color },
        { tier: 'Growth', value: metrics.revenue_by_tier.growth, fill: tierChartConfig.growth.color },
        { tier: 'Institutional', value: metrics.revenue_by_tier.institutional, fill: tierChartConfig.institutional.color },
    ];

    return (
        <AdminLayout>
            <Head title="Revenue — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl font-extrabold text-zinc-950">Revenue</h1>
                    <p className="mt-1 text-sm text-zinc-555">Platform financial overview</p>
                </div>

                {/* Top KPIs */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Total Revenue</p>
                        <p className="text-3xl font-extrabold text-zinc-955">{fmt(metrics.total_revenue)}</p>
                    </div>
                    <div className="rounded-xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">This Month</p>
                        <p className="text-3xl font-extrabold text-zinc-955">{fmt(metrics.revenue_this_month)}</p>
                        <div className={cn('mt-2 flex items-center gap-1.5 text-xs font-semibold', isUp ? 'text-emerald-650' : 'text-rose-650')}>
                            <TrendIcon className="size-3.5" />
                            {diffLabel}
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Last Month</p>
                        <p className="text-3xl font-extrabold text-zinc-955">{fmt(metrics.revenue_last_month)}</p>
                    </div>
                </div>

                {/* Charts row */}
                <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2">
                    {/* 6-month trend */}
                    {monthly.length > 0 && (
                        <div className="min-w-0 rounded-2xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                            <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">6-Month Trend</p>
                            <p className="mb-4 text-sm text-zinc-555">Revenue over the last 6 months</p>
                            <ChartContainer config={trendChartConfig} className="h-[160px] w-full">
                                <BarChart data={monthly} barCategoryGap="32%">
                                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <ChartTooltip
                                        cursor={{ fill: 'rgba(58,84,165,0.05)' }}
                                        content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} hideLabel />}
                                    />
                                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                        {monthly.map((entry, i) => (
                                            <Cell key={i} fill={entry.revenue === maxRevenue ? '#10b981' : 'rgba(16,185,129,0.22)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}

                    {/* Revenue by tier */}
                    <div className="min-w-0 rounded-2xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Revenue by Tier</p>
                        <p className="mb-4 text-sm text-zinc-555">Breakdown across all pricing tiers</p>
                        <ChartContainer config={tierChartConfig} className="h-[160px] w-full">
                            <BarChart data={tierData} barCategoryGap="40%">
                                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="tier" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <ChartTooltip
                                    cursor={{ fill: 'rgba(58,84,165,0.05)' }}
                                    content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} hideLabel />}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {tierData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        formatter={(v: number) => fmt(v)}
                                        style={{ fill: '#4b5563', fontSize: 9 }}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>

                {/* Paystack reminder */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-5 py-4 shadow-xs">
                    <ExternalLink className="size-4 shrink-0 text-[#3A54A5]" />
                    <p className="text-sm text-zinc-700 font-semibold">
                        View full transaction history, refunds, and customer details on your{' '}
                        <span className="font-bold text-[#3A54A5]">Paystack dashboard</span>.
                    </p>
                </div>

                {/* Recent payments table */}
                <div>
                    <h2 className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Recent Payments</h2>
                    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
                        {metrics.recent_payments.length === 0 ? (
                            <div className="py-12 text-center text-sm text-zinc-500 font-semibold">No payments yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            {['Email', 'Tier', 'Amount', 'Reference', 'Date'].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {metrics.recent_payments.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="group transition-colors hover:bg-zinc-50/40"
                                            >
                                                <td className="max-w-[180px] truncate px-5 py-3.5 text-zinc-900 font-semibold">{p.customer_email}</td>
                                                <td className="px-5 py-3.5 text-zinc-655 font-medium capitalize">{p.tier}</td>
                                                <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-650">
                                                    {fmt(p.total_amount, p.currency)}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 font-medium">{p.paystack_reference}</td>
                                                <td className="px-5 py-3.5 text-zinc-655 font-medium">{p.paid_at ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
