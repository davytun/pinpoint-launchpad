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

            {/* ── Outer Card Container  ────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-zinc-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Revenue</h1>
                        </div>
                        <p className="mt-0.5 text-[12px] font-normal text-zinc-500">Platform financial overview</p>
                    </div>
                </div>

                {/* ── Inline Metric Ribbon (Mercury Style) ─────────────────────── */}
                <div className="grid shrink-0 grid-cols-1 divide-y divide-zinc-100 border-b border-zinc-100 bg-[#FAFBFD] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Total Revenue</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{fmt(metrics.total_revenue)}</span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">This Month</span>
                        <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{fmt(metrics.revenue_this_month)}</span>
                            <span className={cn('flex items-center gap-1 text-[11px] font-medium', isUp ? 'text-emerald-600' : 'text-rose-600')}>
                                <TrendIcon className="size-3" />
                                {diffLabel}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Last Month</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{fmt(metrics.revenue_last_month)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Main Scrollable Content ─────────────────────────────────── */}
                <div className="min-h-0 flex-1 overflow-auto bg-[#F9F9FB] p-6">
                    {/* Paystack reminder */}
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/5 px-5 py-3 shadow-xs">
                        <ExternalLink className="size-4 shrink-0 text-[#3A54A5]" />
                        <p className="text-[12px] font-medium text-zinc-600">
                            View full transaction history, refunds, and customer details on your{' '}
                            <a
                                href="https://dashboard.paystack.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#3A54A5] transition-colors hover:underline"
                            >
                                Paystack dashboard
                            </a>
                            .
                        </p>
                    </div>

                    {/* Charts row */}
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* 6-month trend */}
                        {monthly.length > 0 && (
                            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs">
                                <h2 className="text-[13px] font-bold text-zinc-900">6-Month Trend</h2>
                                <p className="mt-0.5 mb-5 text-[11px] font-medium text-zinc-500">Revenue over the last 6 months</p>
                                <ChartContainer config={trendChartConfig} className="h-40 w-full">
                                    <BarChart data={monthly} barCategoryGap="32%">
                                        <CartesianGrid vertical={false} stroke="#F4F4F5" />
                                        <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <ChartTooltip
                                            cursor={{ fill: 'rgba(244, 244, 245, 0.5)' }}
                                            content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} hideLabel />}
                                        />
                                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                            {monthly.map((entry, i) => (
                                                <Cell key={i} fill={entry.revenue === maxRevenue ? '#18181B' : '#E4E4E7'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        )}

                        {/* Revenue by tier */}
                        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs">
                            <h2 className="text-[13px] font-bold text-zinc-900">Revenue by Tier</h2>
                            <p className="mt-0.5 mb-5 text-[11px] font-medium text-zinc-500">Breakdown across all pricing tiers</p>
                            <ChartContainer config={tierChartConfig} className="h-40 w-full">
                                <BarChart data={tierData} barCategoryGap="40%">
                                    <CartesianGrid vertical={false} stroke="#F4F4F5" />
                                    <XAxis dataKey="tier" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <ChartTooltip
                                        cursor={{ fill: 'rgba(244, 244, 245, 0.5)' }}
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
                                            style={{ fill: '#52525B', fontSize: 9, fontWeight: 600 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>

                    {/* Recent payments table */}
                    <div>
                        <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                            <div className="border-b border-zinc-100 px-5 py-3.5">
                                <h2 className="text-[13px] font-bold text-zinc-900">Recent Payments</h2>
                            </div>
                            {metrics.recent_payments.length === 0 ? (
                                <div className="py-12 text-center text-sm font-semibold text-zinc-500">No payments yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-zinc-100 bg-zinc-50/50">
                                            <tr>
                                                {['Email', 'Tier', 'Amount', 'Reference', 'Date'].map((h) => (
                                                    <th key={h} className="px-5 py-3 text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {metrics.recent_payments.map((p) => (
                                                <tr key={p.id} className="group transition-colors duration-150 hover:bg-[#F9F9FB]">
                                                    <td className="max-w-45 truncate px-5 py-3.5 font-semibold text-zinc-950">{p.customer_email}</td>
                                                    <td className="px-5 py-3.5 font-medium text-zinc-600 capitalize">{p.tier}</td>
                                                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                                                        {fmt(p.total_amount, p.currency)}
                                                    </td>
                                                    <td className="px-5 py-3.5 font-mono text-[11px] font-medium text-zinc-400">
                                                        {p.paystack_reference}
                                                    </td>
                                                    <td className="px-5 py-3.5 font-medium text-zinc-600">{p.paid_at ?? '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
