import { Head, Link, router, usePage } from '@inertiajs/react';

import ParagonRadarChart from '@/components/ParagonRadarChart';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

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
    assigned_analyst?: { id: number; name: string } | null;
}

const PILLARS: { key: keyof PillarScores; label: string }[] = [
    { key: 'potential', label: 'Potential' },
    { key: 'agility', label: 'Agility' },
    { key: 'risk', label: 'Risk' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'governance', label: 'Governance' },
    { key: 'operations', label: 'Operations' },
    { key: 'network', label: 'Network' },
];

function engagementLabel(type: InvestorInterest['type']) {
    return {
        data_room_access: 'Data room',
        founder_call: 'Founder call',
        more_details: 'More details',
    }[type];
}

function engagementStatus(interest: InvestorInterest) {
    if (interest.data_room_granted) return 'Data room open';
    if (interest.founder_decision === 'approved') return 'Approved — Pinpoint coordinating';
    if (interest.founder_decision === 'declined' || interest.status === 'denied') return 'Declined';
    return 'Waiting on you';
}

function plainBand(scoreBand?: string | null) {
    switch (scoreBand) {
        case 'high':
            return 'Strong early signal from your self-scan.';
        case 'mid_high':
            return 'Solid foundation — a few areas to tighten before investors.';
        case 'mid_low':
            return 'Useful signal, with clear gaps to close.';
        case 'low':
            return 'Early build stage — the review will dig into fundamentals.';
        default:
            return null;
    }
}

type NextAction = {
    tone: 'wait' | 'action' | 'warn';
    title: string;
    body: string;
    href?: string;
    cta?: string;
};

function nextAction(args: {
    auditStatus: string;
    pendingDiligence: number;
    spotlightReady: boolean;
    spotlightFeatured: boolean;
    analystName?: string | null;
}): NextAction {
    const analyst = args.analystName?.trim() || null;

    if (args.auditStatus === 'needs_info') {
        return {
            tone: 'warn',
            title: analyst ? `${analyst} needs a reply` : 'Your analyst needs a reply',
            body: 'Open messages for the request, then upload anything missing.',
            href: route('founder.messages.index'),
            cta: 'Open messages',
        };
    }
    // Awaiting authorizations render inline on the dashboard — no duplicate banner.
    if (args.pendingDiligence > 0) {
        return {
            tone: 'action',
            title: `${args.pendingDiligence} diligence ${args.pendingDiligence === 1 ? 'request' : 'requests'}`,
            body: 'Answer here. Pinpoint checks it before the investor sees it.',
            href: route('founder.diligence.index'),
            cta: 'Respond',
        };
    }
    if (args.spotlightReady && !args.spotlightFeatured) {
        return {
            tone: 'action',
            title: 'Write your Spotlight profile',
            body: 'One-liner and summary for Investor Relations to publish.',
            href: route('founder.spotlight.edit'),
            cta: 'Open Spotlight',
        };
    }
    if (args.spotlightFeatured) {
        return {
            tone: 'wait',
            title: 'Spotlight is live',
            body: 'Keep your profile current. New investor requests show below when they arrive.',
            href: route('founder.spotlight.edit'),
            cta: 'Edit profile',
        };
    }
    if (args.auditStatus === 'in_progress') {
        return {
            tone: 'wait',
            title: analyst ? `Your analyst is ${analyst}` : 'Review in progress',
            body: analyst
                ? 'No action needed unless they message you.'
                : 'No action needed unless your analyst messages you.',
            href: route('founder.messages.index'),
            cta: 'Messages',
        };
    }
    if (args.auditStatus === 'on_hold') {
        return {
            tone: 'wait',
            title: 'Review on hold',
            body: analyst
                ? `Check messages from ${analyst} for why, and what to do next.`
                : 'Check messages for why, and what to do next.',
            href: route('founder.messages.index'),
            cta: 'Messages',
        };
    }
    if (analyst) {
        return {
            tone: 'wait',
            title: `Your analyst is ${analyst}`,
            body: 'They will drive the review. Message them anytime — or upload documents while you wait.',
            href: route('founder.messages.index'),
            cta: 'Messages',
        };
    }
    return {
        tone: 'wait',
        title: 'Waiting for an analyst',
        body: 'While you wait, upload the documents your review will need. You can also message Pinpoint.',
        href: route('founder.documents.index'),
        cta: 'Upload documents',
    };
}

export default function FounderDashboard({
    founder,
    score,
    score_band,
    pillar_scores = {},
    tier,
    audit_status = 'pending',
    spotlight_ready = false,
    spotlight_featured = false,
    investor_interests = [],
    pending_diligence_count = 0,
    assigned_analyst = null,
}: PageProps) {
    const { flash } = usePage<{ flash?: { info?: string; success?: string; error?: string } }>().props;
    const founderName = founder.full_name ?? founder.email;
    const companyName = founder.company_name ?? 'Your company';
    const band = plainBand(score_band);
    const awaitingYou = investor_interests.filter((i) => i.is_awaiting_founder);
    const otherInterests = investor_interests.filter((i) => !i.is_awaiting_founder);
    const showNextBand = awaitingYou.length === 0 || audit_status === 'needs_info';
    const next = nextAction({
        auditStatus: audit_status,
        pendingDiligence: pending_diligence_count,
        spotlightReady: spotlight_ready,
        spotlightFeatured: spotlight_featured,
        analystName: assigned_analyst?.name,
    });

    return (
        <FounderLayout founder={founder}>
            <Head title="Dashboard — Pinpoint" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 pb-6">
                    <p className="text-[13px] text-zinc-500">
                        {tier ? <span className="capitalize">{tier} track</span> : 'Founder workspace'}
                    </p>
                    <h1 className="font-display mt-1 text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950 sm:text-[2rem]">
                        {companyName}
                    </h1>
                    <p className="mt-1.5 truncate text-[13px] text-zinc-500">
                        {founderName}
                        <span className="mx-1.5 text-zinc-300">·</span>
                        {founder.email}
                    </p>
                </header>

                <div className="no-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto pb-10">
                    {flash?.info && (
                        <p role="status" className="text-[14px] font-medium text-[#2D4182]">
                            {flash.info}
                        </p>
                    )}
                    {flash?.success && (
                        <p role="status" className="text-[14px] font-medium text-emerald-700">
                            {flash.success}
                        </p>
                    )}

                    {awaitingYou.length > 0 && (
                        <section id="investor-requests" className="space-y-6">
                            {awaitingYou.map((interest) => (
                                <div key={interest.id}>
                                    <p className="text-[13px] text-zinc-500">Needs your decision</p>
                                    <h2 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-zinc-950">
                                        {interest.type === 'data_room_access'
                                            ? 'Authorize data room access?'
                                            : interest.type === 'founder_call'
                                              ? 'Approve a founder call?'
                                              : 'Share more details?'}
                                    </h2>
                                    <p className="mt-1.5 text-[14px] text-zinc-600">
                                        <span className="font-medium text-zinc-800">
                                            {interest.firm_name ?? interest.investor_name}
                                        </span>
                                        {interest.firm_name && interest.investor_name ? (
                                            <span className="text-zinc-500"> · {interest.investor_name}</span>
                                        ) : null}
                                    </p>
                                    {interest.message ? (
                                        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-600">
                                            {interest.message}
                                        </p>
                                    ) : null}
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.patch(
                                                    route('founder.interests.authorize', interest.id),
                                                    { status: 'denied' },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-[13px] font-medium text-zinc-700 hover:border-zinc-400"
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
                                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3A54A5] px-5 text-[13px] font-semibold text-white hover:bg-[#2D4182]"
                                        >
                                            {interest.type === 'data_room_access' ? 'Authorize' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {showNextBand && (
                        <section
                            className={cn(
                                'rounded-2xl px-5 py-5 sm:px-6 sm:py-6',
                                next.tone === 'warn' && 'bg-amber-50/90',
                                next.tone === 'action' && 'bg-[#3A54A5]/[0.07]',
                                next.tone === 'wait' && 'bg-[#F0F2F8]',
                            )}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 max-w-xl">
                                    <h2 className="text-[1.125rem] font-semibold tracking-tight text-zinc-950">
                                        {next.title}
                                    </h2>
                                    <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-600">{next.body}</p>
                                </div>
                                {next.href && next.cta && (
                                    <Link
                                        href={next.href}
                                        className={cn(
                                            'inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-5 text-[13px] font-semibold transition-colors',
                                            next.tone === 'warn'
                                                ? 'bg-amber-900 text-white hover:bg-amber-800'
                                                : 'bg-[#3A54A5] text-white hover:bg-[#2D4182]',
                                        )}
                                    >
                                        {next.cta}
                                    </Link>
                                )}
                            </div>
                        </section>
                    )}

                    {otherInterests.length > 0 && (
                        <section>
                            <h2 className="text-[15px] font-semibold text-zinc-950">Requests</h2>
                            <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
                                {otherInterests.map((interest) => (
                                    <li key={interest.id} className="py-4">
                                        <p className="text-[14px] font-semibold text-zinc-950">
                                            {interest.firm_name ?? interest.investor_name}
                                        </p>
                                        <p className="mt-0.5 text-[13px] text-zinc-500">
                                            {engagementLabel(interest.type)}
                                            <span className="mx-1.5 text-zinc-300">·</span>
                                            {engagementStatus(interest)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <div className="mb-5">
                            <h2 className="text-[15px] font-semibold text-zinc-950">Self-scan</h2>
                            <p className="mt-1 text-[13px] text-zinc-500">
                                From your answers. The analyst review may change this.
                            </p>
                        </div>

                        {score != null ? (
                            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                                <div className="lg:col-span-5">
                                    <p className="font-mono text-[3.25rem] leading-none font-bold tracking-tight text-zinc-950">
                                        {score}
                                        <span className="ml-1 text-base font-medium text-zinc-400">/100</span>
                                    </p>
                                    {band && (
                                        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-zinc-600">{band}</p>
                                    )}

                                    <dl className="mt-8 space-y-0">
                                        {PILLARS.map(({ key, label }) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between gap-4 border-b border-zinc-100 py-2.5 text-[13px]"
                                            >
                                                <dt className="text-zinc-500">{label}</dt>
                                                <dd className="font-mono text-[13px] font-semibold tabular-nums text-zinc-900">
                                                    {pillar_scores[key] != null ? `${Math.round(pillar_scores[key]!)}%` : '—'}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="rounded-2xl bg-[#F0F2F8]/80 px-2 py-4 lg:col-span-7 lg:px-4 lg:py-6">
                                    <div className="flex min-h-[300px] items-center justify-center">
                                        <ParagonRadarChart scores={pillar_scores} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600">
                                Your self-scan score will show here once it is linked to this account.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </FounderLayout>
    );
}
