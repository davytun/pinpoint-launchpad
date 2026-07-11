import { Head } from '@inertiajs/react';
import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface PaymentRow {
    id: number;
    customer_email: string;
    tier: string;
    total_amount: number;
    currency: string;
    paid_at: string | null;
    paystack_reference: string;
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
                    <h1 className="text-2xl font-bold text-[#D8E0F3]">Revenue</h1>
                    <p className="mt-1 text-sm text-[#C1CDE8]">Platform financial overview</p>
                </div>

                {/* Top KPIs */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-5">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">Total Revenue</p>
                        <p className="text-3xl font-bold text-[#D8E0F3]">{fmt(metrics.total_revenue)}</p>
                    </div>
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-5">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">This Month</p>
                        <p className="text-3xl font-bold text-[#D8E0F3]">{fmt(metrics.revenue_this_month)}</p>
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <TrendIcon className="size-3.5" />
                            {diffLabel}
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-5">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">Last Month</p>
                        <p className="text-3xl font-bold text-[#D8E0F3]">{fmt(metrics.revenue_last_month)}</p>
                    </div>
                </div>

                {/* Charts row */}
                <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2">
                    {/* 6-month trend */}
                    {monthly.length > 0 && (
                        <div className="min-w-0 rounded-xl border border-[#232C43] bg-[#101623] p-5">
                            <p className="mb-1 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">6-Month Trend</p>
                            <p className="mb-4 text-sm text-[#C1CDE8]">Revenue over the last 6 months</p>
                            <ChartContainer config={trendChartConfig} className="h-[160px] w-full">
                                <BarChart data={monthly} barCategoryGap="32%">
                                    <CartesianGrid vertical={false} stroke="#232C43" />
                                    <XAxis dataKey="month" tick={{ fill: '#C1CDE8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <ChartTooltip
                                        cursor={{ fill: '#1B294B' }}
                                        content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} hideLabel />}
                                    />
                                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                        {monthly.map((entry, i) => (
                                            <Cell key={i} fill={entry.revenue === maxRevenue ? '#10b981' : 'rgba(16,185,129,0.2)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}

                    {/* Revenue by tier */}
                    <div className="min-w-0 rounded-xl border border-[#232C43] bg-[#101623] p-5">
                        <p className="mb-1 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">Revenue by Tier</p>
                        <p className="mb-4 text-sm text-[#C1CDE8]">Breakdown across all pricing tiers</p>
                        <ChartContainer config={tierChartConfig} className="h-[160px] w-full">
                            <BarChart data={tierData} barCategoryGap="40%">
                                <CartesianGrid vertical={false} stroke="#232C43" />
                                <XAxis dataKey="tier" tick={{ fill: '#C1CDE8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <ChartTooltip
                                    cursor={{ fill: '#1B294B' }}
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
                                        style={{ fill: '#64748b', fontSize: 9 }}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>

                {/* Paystack reminder */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#3A54A5]/30 bg-[#1B294B] px-5 py-4">
                    <ExternalLink className="size-4 shrink-0 text-[#3A54A5]" />
                    <p className="text-sm text-[#C1CDE8]">
                        View full transaction history, refunds, and customer details on your{' '}
                        <span className="font-semibold text-[#3A54A5]">Paystack dashboard</span>.
                    </p>
                </div>

                {/* Recent payments table */}
                <div>
                    <h2 className="mb-3 text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase">Recent Payments</h2>
                    <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                        {metrics.recent_payments.length === 0 ? (
                            <div className="py-12 text-center text-sm text-[#91A7D8]">No payments yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-sm">
                                    <thead>
                                        <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                            {['Email', 'Tier', 'Amount', 'Reference', 'Date'].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.recent_payments.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="border-b border-[#232C43] transition-colors last:border-0 hover:bg-[#1B294B]/30"
                                            >
                                                <td className="max-w-[180px] truncate px-5 py-3.5 text-[#D8E0F3]">{p.customer_email}</td>
                                                <td className="px-5 py-3.5 text-[#C1CDE8] capitalize">{p.tier}</td>
                                                <td className="px-5 py-3.5 font-mono font-semibold text-emerald-400">
                                                    {fmt(p.total_amount, p.currency)}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-xs text-[#91A7D8]">{p.paystack_reference}</td>
                                                <td className="px-5 py-3.5 text-[#C1CDE8]">{p.paid_at ?? '—'}</td>
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
