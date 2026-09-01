import { Icon } from '@iconify/react';
import { Head, Link } from '@inertiajs/react';

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
    payment?: { tier: string; total_amount: number; paid_at?: string | null } | null;
    signature?: { status: string; signed_at?: string | null } | null;
    spotlight_featured?: boolean;
    investor_interests: InvestorInterest[];
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'complete':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>Audit Complete</span>
                </span>
            );
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>In Progress</span>
                </span>
            );
        case 'needs_info':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Needs Info</span>
                </span>
            );
        case 'on_hold':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>On Hold</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <span>Pending Review</span>
                </span>
            );
    }
}

export default function FounderDashboard({
    founder,
    score,
    pillar_scores = {},
    score_band_message,
    tier = 'growth',
    audit_status = 'pending',
    payment,
    signature,
    investor_interests = [],
}: PageProps) {
    const founderName = founder.full_name ?? founder.email;
    const companyName = founder.company_name ?? 'Startup';
    const finalScore = score ?? 89;

    const AUDIT_STEPS = [
        { label: 'Application', completed: true },
        { label: 'Diagnostics', completed: true },
        { label: 'NDA & Legal', completed: signature?.status === 'signed' },
        { label: 'Analyst Audit', completed: audit_status === 'complete', current: audit_status === 'in_progress' || audit_status === 'needs_info' },
        { label: 'Spotlight Syndicate', completed: audit_status === 'complete' },
    ];

    return (
        <FounderLayout founder={founder}>
            <Head title="Founder Workspace — Dashboard" />
            <DashboardTour />

            {/* ── Main Canvas ── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* ── Top Header Strip ── */}
                <div className="mb-6 flex shrink-0 flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-zinc-200/80 bg-[#FAFBFD] px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                                <span className="capitalize">{tier} Audit Track</span>
                            </span>
                            <StatusBadge status={audit_status} />
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                            {companyName}
                        </h1>
                        <p className="mt-1 text-xs text-zinc-400">
                            Founder: <span className="font-semibold text-zinc-700">{founderName}</span> · {founder.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('founder.messages.index')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                            <span>Engagement Line</span>
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

                {/* ── Scrollable Body Canvas (No scrollbars) ── */}
                <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                    {/* Audit Progression Stepper Banner */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                            <span className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                PARAGON Audit Progression
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500 capitalize">
                                Current Stage: {audit_status.replace('_', ' ')}
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
                                              : 'border border-zinc-200/60 bg-white text-zinc-400',
                                    )}
                                >
                                    <Icon
                                        icon={
                                            step.completed
                                                ? 'solar:check-circle-bold'
                                                : step.current
                                                  ? 'solar:refresh-circle-bold'
                                                  : 'solar:circle-linear'
                                        }
                                        className={cn('size-4 shrink-0', step.current && 'animate-spin')}
                                    />
                                    <span className="truncate font-semibold">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 1: PARAGON Assessment & Radar Chart */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                        {/* Left Score Card (5 cols) */}
                        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-5">
                            <div>
                                <span className="block text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                    PARAGON Diagnostic Score
                                </span>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="font-mono text-5xl font-bold tracking-tight text-zinc-950">
                                        {finalScore}
                                    </span>
                                    <span className="font-mono text-sm text-zinc-400">/ 100</span>
                                </div>

                                <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    <span>Top Percentile · High Velocity Candidate</span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-xl border border-zinc-100 bg-[#FAFBFD] p-2.5">
                                        <span className="text-[11px] text-zinc-400">Potential</span>
                                        <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950">
                                            {Math.round(pillar_scores.potential ?? 91)}%
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-100 bg-[#FAFBFD] p-2.5">
                                        <span className="text-[11px] text-zinc-400">Agility</span>
                                        <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950">
                                            {Math.round(pillar_scores.agility ?? 78)}%
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-100 bg-[#FAFBFD] p-2.5">
                                        <span className="text-[11px] text-zinc-400">Governance</span>
                                        <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950">
                                            {Math.round(pillar_scores.governance ?? 88)}%
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-100 bg-[#FAFBFD] p-2.5">
                                        <span className="text-[11px] text-zinc-400">Operations</span>
                                        <p className="mt-0.5 font-mono text-sm font-bold text-zinc-950">
                                            {Math.round(pillar_scores.operations ?? 82)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-zinc-100 pt-4">
                                <p className="text-xs leading-relaxed text-zinc-500">
                                    {score_band_message ??
                                        'Demonstrates high execution capability, robust governance foundations, and institutional venture readiness.'}
                                </p>
                            </div>
                        </div>

                        {/* Right Radar Chart Card (7 cols) */}
                        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-7">
                            <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div>
                                    <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                        7-Pillar PARAGON Radar
                                    </h3>
                                    <p className="text-[11px] text-zinc-400">
                                        Diagnostic benchmark compared against institutional startup averages.
                                    </p>
                                </div>
                                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700">
                                    Benchmark Matrix
                                </span>
                            </div>

                            <div className="flex min-h-[300px] flex-1 items-center justify-center">
                                <ParagonRadarChart />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Audit Package Deliverables */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:box-minimalistic-linear" className="size-4 text-zinc-500" />
                                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                    {tier} Package Deliverables & Scope
                                </h3>
                            </div>
                            {payment && (
                                <span className="font-mono text-xs font-semibold text-zinc-900">
                                    Paid: NGN {payment.total_amount?.toLocaleString() ?? '2,090,000'}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                'Cap table & founding-document review',
                                'Financial model & forecast review',
                                'Unit-economics and LTV:CAC build',
                                'Analyst partner-reviewed 25-page report',
                                'Investor-readiness gap analysis list',
                                'Syndicate Spotlight Indexing & Intro facilitation',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                    <Icon icon="solar:check-circle-bold" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    <span className="font-medium text-zinc-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Quick Action Hub */}
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
                                <p className="text-xs text-zinc-500">
                                    Manage, upload, and review submitted KYC, financials, and pitch decks.
                                </p>
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
                                <h4 className="text-sm font-bold text-zinc-950">Analyst Engagement</h4>
                                <p className="text-xs text-zinc-500">
                                    Direct communication stream with your assigned Lead Analyst team.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-zinc-950 group-hover:underline">
                                <span>Open Live Chat</span>
                                <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                            </div>
                        </Link>

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
                                    Prepare and manage your public investor syndicate profile and badges.
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-zinc-950 group-hover:underline">
                                <span>Edit Profile</span>
                                <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                            </div>
                        </Link>
                    </div>

                    {/* Section 4: Investor Engagement Pipeline */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                            <div>
                                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                    Investor Engagement Pipeline
                                </h3>
                                <p className="text-[11px] text-zinc-400">
                                    Accredited investor discovery, data room grants, and introductory meeting requests.
                                </p>
                            </div>
                            <span className="font-mono text-xs font-semibold text-zinc-900">
                                {investor_interests.length} Engagements
                            </span>
                        </div>

                        {investor_interests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Icon icon="solar:users-group-two-rounded-linear" className="mb-2 size-8 text-zinc-300" />
                                <p className="text-xs font-semibold text-zinc-700">No investor engagements yet.</p>
                                <p className="mt-0.5 max-w-sm text-xs text-zinc-400">
                                    Once your PARAGON audit is complete, your venture is syndicated to approved investors and introduction requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {investor_interests.map((interest) => (
                                    <div key={interest.id} className="flex items-center justify-between py-3 text-xs">
                                        <div>
                                            <p className="font-semibold text-zinc-950">{interest.investor_name}</p>
                                            <p className="text-[11px] text-zinc-400">{interest.firm_name ?? 'Accredited Syndicate'}</p>
                                        </div>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 capitalize">
                                            {interest.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FounderLayout>
    );
}
