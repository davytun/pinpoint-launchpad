import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import DashboardTour from '@/components/dashboard-tour';
import ParagonRadarChart from '@/components/ParagonRadarChart';
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

interface InvestorInterest {
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
    payment?: { tier: string; total_amount: number; currency?: string; paid_at?: string | null } | null;
    signature?: { status: string; signed_at?: string | null } | null;
    spotlight_ready?: boolean;
    spotlight_featured?: boolean;
    has_diagnostic?: boolean;
    investor_interests: InvestorInterest[];
    pending_diligence_count?: number;
}

function engagementLabel(type: InvestorInterest['type']) {
    return {
        data_room_access: 'Data Room Access',
        founder_call: 'Founder Call',
        more_details: 'Information Request',
    }[type];
}

function engagementStatus(interest: InvestorInterest) {
    if (interest.data_room_granted) return 'Data room granted';
    if (interest.founder_decision === 'approved') return 'Approved, Pinpoint coordinating';
    if (interest.founder_decision === 'declined' || interest.status === 'denied') return 'Declined';
    return 'Awaiting your decision';
}

function bandBadge(scoreBand?: string | null) {
    switch (scoreBand) {
        case 'high':
            return { label: 'High Velocity Candidate', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
        case 'mid_high':
            return { label: 'Investment Ready Candidate', className: 'border-blue-200 bg-blue-50 text-blue-700' };
        case 'mid_low':
            return { label: 'Foundations Missing', className: 'border-amber-200 bg-amber-50 text-amber-800' };
        case 'low':
            return { label: 'Build Phase', className: 'border-rose-200 bg-rose-50 text-rose-700' };
        default:
            return null;
    }
}

function formatPaidAmount(amount?: number | null, currency?: string | null) {
    if (amount == null) return null;
    const code = (currency ?? 'NGN').toUpperCase();
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: code,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${code} ${amount.toLocaleString()}`;
    }
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
    const text = label ?? status.replace('_', ' ');
    switch (status) {
        case 'complete':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>{text}</span>
                </span>
            );
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>{text}</span>
                </span>
            );
        case 'needs_info':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{text}</span>
                </span>
            );
        case 'on_hold':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>{text}</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <span>{text}</span>
                </span>
            );
    }
}

const PILLAR_TILES: { key: keyof PillarScores; label: string }[] = [
    { key: 'potential', label: 'Potential' },
    { key: 'agility', label: 'Agility' },
    { key: 'governance', label: 'Governance' },
    { key: 'operations', label: 'Operations' },
];

export default function FounderDashboard({
    founder,
    score,
    score_band,
    pillar_scores = {},
    score_band_message,
    tier,
    tier_features = [],
    audit_status = 'pending',
    audit_status_config = {},
    payment,
    signature,
    spotlight_ready = false,
    spotlight_featured = false,
    has_diagnostic = false,
    investor_interests = [],
    pending_diligence_count = 0,
}: PageProps) {
    const { flash } = usePage<{ flash?: { info?: string; success?: string; error?: string } }>().props;
    const founderName = founder.full_name ?? founder.email;
    const companyName = founder.company_name ?? 'Startup';
    const statusMeta = audit_status_config[audit_status];
    const band = bandBadge(score_band);
    const paidLabel = formatPaidAmount(payment?.total_amount, payment?.currency);
    const displayTier = tier ?? payment?.tier ?? null;

    const AUDIT_STEPS = [
        { label: 'Application', completed: true },
        { label: 'Diagnostics', completed: has_diagnostic || score != null },
        { label: 'NDA & Legal', completed: signature?.status === 'signed' },
        {
            label: 'Analyst Audit',
            completed: audit_status === 'complete',
            current: audit_status === 'in_progress' || audit_status === 'needs_info' || audit_status === 'on_hold',
        },
        {
            label: 'Spotlight',
            completed: spotlight_featured,
            current: spotlight_ready && !spotlight_featured,
            locked: !spotlight_ready,
        },
    ];

    return (
        <FounderLayout founder={founder}>
            <Head title="Founder Workspace — Dashboard" />
            <DashboardTour />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="mb-6 flex shrink-0 flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {displayTier && (
                                <span className="inline-flex items-center rounded-full border border-zinc-200/80 bg-[#FAFBFD] px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                                    <span className="capitalize">{displayTier} Audit Track</span>
                                </span>
                            )}
                            <StatusBadge status={audit_status} label={statusMeta?.label} />
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">{companyName}</h1>
                        <p className="mt-1 text-xs text-zinc-400">
                            Founder: <span className="font-semibold text-zinc-700">{founderName}</span> · {founder.email}
                        </p>
                        {statusMeta?.description && (
                            <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-500">{statusMeta.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('founder.messages.index')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                            <span>Messages</span>
                        </Link>
                        <Link
                            href={route('founder.documents.index')}
                            className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800"
                        >
                            <Icon icon="solar:document-text-linear" className="size-3.5 text-zinc-400" />
                            <span>Manage Documents</span>
                        </Link>
                    </div>
                </div>

                <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                    {flash?.info && (
                        <div
                            role="status"
                            className="rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/8 px-4 py-3 text-sm font-medium text-[#2D4182]"
                        >
                            {flash.info}
                        </div>
                    )}
                    {flash?.success && (
                        <div
                            role="status"
                            className="rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                        >
                            {flash.success}
                        </div>
                    )}

                    {audit_status === 'needs_info' && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Icon icon="solar:danger-triangle-linear" className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-950">Your analyst needs more information</p>
                                    <p className="mt-0.5 text-xs text-amber-800">
                                        Check Messages for the request, then upload anything missing in Documents.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('founder.messages.index')}
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-800"
                            >
                                Open Messages
                            </Link>
                        </div>
                    )}

                    <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                            <span className="text-xs font-bold tracking-wider text-zinc-950 uppercase">PARAGON Audit Progression</span>
                            <span className="text-[11px] font-semibold text-zinc-500 capitalize">
                                {statusMeta?.label ?? audit_status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                            {AUDIT_STEPS.map((step) => (
                                <div
                                    key={step.label}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl p-2 text-xs transition-all',
                                        step.completed
                                            ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-800'
                                            : step.current
                                              ? 'border border-blue-200/80 bg-blue-50 text-blue-800'
                                              : step.locked
                                                ? 'border border-zinc-200/60 bg-zinc-50 text-zinc-400'
                                                : 'border border-zinc-200/60 bg-white text-zinc-400',
                                    )}
                                >
                                    <Icon
                                        icon={
                                            step.completed
                                                ? 'solar:check-circle-bold'
                                                : step.current
                                                  ? 'solar:refresh-circle-bold'
                                                  : step.locked
                                                    ? 'solar:lock-linear'
                                                    : 'solar:circle-linear'
                                        }
                                        className={cn('size-4 shrink-0', step.current && !step.completed && 'animate-spin')}
                                    />
                                    <span className="truncate font-semibold">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-5">
                            <div>
                                <span className="block text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                    PARAGON Diagnostic Score
                                </span>
                                {score != null ? (
                                    <>
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="font-mono text-5xl font-bold tracking-tight text-zinc-950">{score}</span>
                                            <span className="font-mono text-sm text-zinc-400">/ 100</span>
                                        </div>

                                        {band && (
                                            <div
                                                className={cn(
                                                    'mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                                    band.className,
                                                )}
                                            >
                                                <span>{band.label}</span>
                                            </div>
                                        )}

                                        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                                            {PILLAR_TILES.map(({ key, label }) => (
                                                <div key={key} className="rounded-xl border border-zinc-100 bg-[#FAFBFD] p-2.5">
                                                    <span className="text-[11px] text-zinc-400">{label}</span>
                                                    <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950">
                                                        {pillar_scores[key] != null ? `${Math.round(pillar_scores[key]!)}%` : '—'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-[#FAFBFD] p-4">
                                        <p className="text-sm font-semibold text-zinc-800">No Self-Scan linked yet</p>
                                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                                            Your diagnostic score will appear here once your account is linked to a completed Self-Scan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-zinc-100 pt-4">
                                <p className="text-xs leading-relaxed text-zinc-500">
                                    {score_band_message ||
                                        (score != null
                                            ? 'Your Self-Scan band summary will guide what to strengthen before investor conversations.'
                                            : 'Complete or link a Self-Scan to see readiness guidance here.')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-7">
                            <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div>
                                    <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">7-Pillar PARAGON Radar</h3>
                                    <p className="text-[11px] text-zinc-400">
                                        {score != null
                                            ? 'Your Self-Scan results across the seven PARAGON pillars.'
                                            : 'Radar populates from your linked Self-Scan.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-h-[300px] flex-1 items-center justify-center">
                                {score != null ? (
                                    <ParagonRadarChart scores={pillar_scores} />
                                ) : (
                                    <div className="px-6 text-center">
                                        <Icon icon="solar:chart-2-linear" className="mx-auto mb-2 size-8 text-zinc-300" />
                                        <p className="text-xs font-semibold text-zinc-600">No radar data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:box-minimalistic-linear" className="size-4 text-zinc-500" />
                                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                    {displayTier ? `${displayTier} Package Deliverables` : 'Package Deliverables'}
                                </h3>
                            </div>
                            {paidLabel && <span className="font-mono text-xs font-semibold text-zinc-900">Paid: {paidLabel}</span>}
                        </div>

                        {tier_features.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {tier_features.map((item) => (
                                    <div key={item} className="flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                        <Icon icon="solar:check-circle-bold" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                        <span className="font-medium text-zinc-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500">
                                Deliverables for your assessment tier will appear here once your payment package is confirmed.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link
                            href={route('founder.documents.index')}
                            className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs transition-all hover:border-zinc-400"
                        >
                            <div className="space-y-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                                    <Icon icon="solar:document-text-linear" className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-zinc-950">Documents Vault</h4>
                                <p className="text-xs text-zinc-500">Upload evidence for your analyst: financials, legal, pitch materials.</p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-zinc-950 group-hover:underline">
                                <span>Manage Files</span>
                                <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                            </div>
                        </Link>

                        <Link
                            href={route('founder.messages.index')}
                            className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs transition-all hover:border-zinc-400"
                        >
                            <div className="space-y-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                                    <Icon icon="solar:chat-round-dots-linear" className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-zinc-950">Analyst Messages</h4>
                                <p className="text-xs text-zinc-500">Private thread with Pinpoint — not a direct investor chat.</p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-zinc-950 group-hover:underline">
                                <span>Open Messages</span>
                                <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                            </div>
                        </Link>

                        {spotlight_ready ? (
                            <Link
                                href={route('founder.spotlight.edit')}
                                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs transition-all hover:border-zinc-400"
                            >
                                <div className="space-y-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                                        <Icon icon="solar:crown-linear" className="size-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-950">Spotlight Profile</h4>
                                    <p className="text-xs text-zinc-500">
                                        {spotlight_featured
                                            ? 'Your profile is live for approved investors. Keep copy and pitch deck current.'
                                            : 'Audit complete — prepare your one-liner and summary for Investor Relations to publish.'}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-zinc-950 group-hover:underline">
                                    <span>{spotlight_featured ? 'Manage Profile' : 'Prepare Profile'}</span>
                                    <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex flex-col justify-between rounded-2xl border border-dashed border-zinc-200 bg-[#FAFBFD] p-5">
                                <div className="space-y-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                                        <Icon icon="solar:lock-linear" className="size-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-950">Spotlight Profile</h4>
                                    <p className="text-xs text-zinc-500">
                                        Unlocks when your PARAGON audit is marked complete. Focus on documents and analyst messages until then.
                                    </p>
                                </div>
                                <p className="mt-4 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">Locked until audit complete</p>
                            </div>
                        )}
                    </div>

                    {pending_diligence_count > 0 && (
                        <Link
                            href={route('founder.diligence.index')}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200/80 bg-blue-50 px-5 py-4 transition hover:border-blue-300"
                        >
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:document-medicine-linear" className="size-5 text-blue-700" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-950">
                                        {pending_diligence_count} diligence{' '}
                                        {pending_diligence_count === 1 ? 'request' : 'requests'} waiting for your response
                                    </p>
                                    <p className="text-xs text-blue-800">Pinpoint will release your answer to the investor after review.</p>
                                </div>
                            </div>
                            <Icon icon="solar:arrow-right-linear" className="size-4 shrink-0 text-blue-700" />
                        </Link>
                    )}

                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div>
                                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">Investor Engagement Pipeline</h3>
                                <p className="text-[11px] text-zinc-400">
                                    Pinpoint-mediated requests. Your approval is consent for Pinpoint to coordinate — not a direct intro.
                                </p>
                            </div>
                            <span className="font-mono text-xs font-semibold text-zinc-900">{investor_interests.length} Engagements</span>
                        </div>

                        {investor_interests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Icon icon="solar:users-group-two-rounded-linear" className="mb-2 size-8 text-zinc-300" />
                                <p className="text-xs font-semibold text-zinc-700">No investor engagements yet.</p>
                                <p className="mt-0.5 max-w-sm text-xs text-zinc-400">
                                    After audit completion and Spotlight publication, introduction and data-room requests from approved investors
                                    appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {investor_interests.map((interest) => (
                                    <details key={interest.id} className="group py-1">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-xs [&::-webkit-details-marker]:hidden">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-950">{interest.investor_name}</p>
                                                <p className="mt-0.5 text-[11px] text-zinc-400">
                                                    {interest.firm_name ?? 'Accredited Investor'} · {engagementStatus(interest)}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="hidden rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 sm:inline">
                                                    {engagementLabel(interest.type)}
                                                </span>
                                                <Icon
                                                    icon="solar:alt-arrow-down-linear"
                                                    className="size-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                                                />
                                            </div>
                                        </summary>

                                        <div className="border-t border-zinc-100 py-4">
                                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase">
                                                        {engagementLabel(interest.type)}
                                                    </p>
                                                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                                                        {interest.message || 'No additional note was provided with this request.'}
                                                    </p>
                                                </div>
                                                {interest.is_awaiting_founder && (
                                                    <div className="flex gap-2 sm:justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route('founder.interests.authorize', interest.id),
                                                                    { status: 'denied' },
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-950 hover:text-zinc-950"
                                                        >
                                                            Decline
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route('founder.interests.authorize', interest.id),
                                                                    { status: 'approved' },
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                                                        >
                                                            <Icon icon="solar:check-circle-linear" className="size-4" />
                                                            {interest.type === 'data_room_access' ? 'Authorize access' : 'Approve request'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {interest.is_awaiting_founder && interest.type === 'data_room_access' && (
                                                <p className="mt-3 text-[11px] leading-5 text-zinc-400">
                                                    Pinpoint Investor Relations will activate secure access after your authorization.
                                                </p>
                                            )}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FounderLayout>
    );
}
