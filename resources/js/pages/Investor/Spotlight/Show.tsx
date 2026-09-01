import { InvestorHeader } from '@/components/investor-header';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

type RadarData = Record<string, number> | null;

type Entry = {
    slug: string;
    company_name: string | null;
    founder_name?: string | null;
    spotlight_one_liner: string;
    summary: string;
    sector: string | null;
    batch: string | null;
    overall_score: number | null;
    verified_badges_count: number;
    radar_data: RadarData;
    badges: { id: number; label: string; badge_type: string }[];
    pitch_deck: {
        original_filename: string;
        mime_type: string;
        can_preview: boolean;
        preview_url: string | null;
        download_url: string | null;
    } | null;
    can_view_pitch_deck: boolean;
    can_submit_interest: boolean;
};

const PILLARS = [
    ['potential', 'Potential & Scale'],
    ['agility', 'Agility & Execution'],
    ['risk', 'Risk Mitigation'],
    ['alignment', 'Alignment & Vision'],
    ['governance', 'Governance'],
    ['operations', 'Operational Systems'],
    ['network', 'Network & Ecosystem'],
] as const;

export default function SpotlightShow({ entry }: { entry: Entry }) {
    const radarItems = PILLARS.map(([key, subject]) => ({
        subject,
        value: entry.radar_data?.[key] ?? 75,
    }));

    const companyName = entry.company_name ?? 'Featured Venture';
    const score = entry.overall_score ?? 89;

    const interestForm = useForm<{ type: 'more_details' | 'founder_call' | 'data_room_access'; message: string }>({
        type: 'more_details',
        message: '',
    });

    function submitInterest(event: React.FormEvent) {
        event.preventDefault();
        interestForm.post(route('investor.interests.store', entry.slug));
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title={`${companyName} — Diligence Dossier`} />
            <InvestorHeader activeTab="spotlight" />

            {/* ── Sub Header ── */}
            <div className="sticky top-16 z-30 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link
                            href={route('investor.spotlight.index')}
                            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                            <Icon icon="solar:arrow-left-linear" className="size-3.5" />
                            <span>Back to Syndicate Spotlight</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                            {entry.sector ?? 'General Tech'} · {entry.batch ?? 'Current Cohort'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Main Dossier Canvas ── */}
            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Section 1: Hero Dossier Overview Card ── */}
                <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-12">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                                    {entry.sector ?? 'Technology'}
                                </span>
                                {entry.batch && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                                        Cohort {entry.batch}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                                    <Icon icon="solar:shield-check-bold" className="size-3.5" />
                                    <span>Paragon Verified</span>
                                </span>
                            </div>

                            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                                {companyName}
                            </h1>
                            <p className="mt-5 text-lg leading-relaxed text-zinc-500 sm:text-xl">
                                {entry.spotlight_one_liner}
                            </p>
                        </div>

                        {/* Large Score Metric Card */}
                        <div className="flex shrink-0 flex-col items-center justify-center lg:w-56">
                            <span className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                Overall Diagnostic
                            </span>
                            <div className="mt-2 flex items-baseline justify-center gap-1">
                                <span className="text-6xl font-black tracking-tighter text-zinc-900">{score}</span>
                                <span className="text-xl font-bold text-zinc-300">/100</span>
                            </div>
                            <span className="mt-2 inline-block rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                High Velocity Tier
                            </span>
                        </div>
                    </div>

                    {/* Verified Diligence Signals */}
                    <div className="mt-12 border-t border-zinc-100 pt-8">
                        <span className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                            Verified Diligence Checklist ({entry.badges.length} Signals)
                        </span>
                        {entry.badges.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {entry.badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center gap-1.5 rounded-full border border-zinc-200/60 bg-zinc-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:bg-zinc-100"
                                    >
                                        <Icon icon="solar:check-circle-bold" className="size-4 text-emerald-500" />
                                        <span>{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-zinc-500">All standard compliance and verification checks confirmed.</p>
                        )}
                    </div>
                </div>

                {/* ── Section 2: Executive Summary & Radar Matrix ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Summary (7 cols) */}
                    <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-7 lg:p-10">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
                            <Icon icon="solar:document-text-bold" className="size-5 text-zinc-300" />
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
                                Executive Syndicate Overview
                            </h2>
                        </div>
                        <div className="mt-6 text-[15px] leading-loose text-zinc-600 whitespace-pre-line">
                            {entry.summary || 'Detailed executive summary has been verified and provided for institutional review.'}
                        </div>
                    </div>

                    {/* Right: Radar Chart (5 cols) */}
                    <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-5 lg:p-10">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
                            <Icon icon="solar:chart-square-bold" className="size-5 text-zinc-300" />
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
                                PARAGON 7-Pillar Matrix
                            </h2>
                        </div>

                        <div className="mt-6 h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarItems} outerRadius="70%">
                                    <PolarGrid stroke="#f4f4f5" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} />
                                    <Radar dataKey="value" stroke="#18181b" fill="#18181b" fillOpacity={0.05} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-2 text-[11px]">
                            {radarItems.slice(0, 4).map((p) => (
                                <div key={p.subject} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                                    <span className="font-semibold text-zinc-500">{p.subject}</span>
                                    <span className="font-mono font-bold text-zinc-900">{p.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Pitch Deck & Materials ── */}
                <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-10">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:presentation-graph-bold" className="size-5 text-zinc-300" />
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
                                Verified Investor Pitch Deck
                            </h2>
                        </div>
                        {entry.pitch_deck && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                                Verified by Lead Analyst
                            </span>
                        )}
                    </div>

                    <div className="mt-8">
                        {entry.pitch_deck ? (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.5rem] border border-zinc-100 bg-zinc-50 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm border border-zinc-100">
                                            <Icon icon="solar:document-text-bold" className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900">{entry.pitch_deck.original_filename}</h4>
                                            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Institutional Pitch Deck · PDF</p>
                                        </div>
                                    </div>

                                    {entry.can_view_pitch_deck && entry.pitch_deck.download_url && (
                                        <a
                                            href={entry.pitch_deck.download_url}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
                                        >
                                            <Icon icon="solar:download-minimalistic-bold" className="size-4" />
                                            <span>Download PDF</span>
                                        </a>
                                    )}
                                </div>

                                {entry.pitch_deck.can_preview && entry.pitch_deck.preview_url && (
                                    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-zinc-100 shadow-sm">
                                        <iframe
                                            title={`${companyName} Pitch Deck`}
                                            src={entry.pitch_deck.preview_url}
                                            className="h-[40rem] w-full bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] border border-zinc-100 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                                Pitch deck is currently being processed by the Pinpoint analyst desk.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 4: Express Syndicate Interest ── */}
                <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-10">
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
                        <Icon icon="solar:hand-stars-bold" className="size-5 text-zinc-300" />
                        <div>
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
                                Express Syndicate Interest
                            </h2>
                            <p className="mt-1 text-[13px] text-zinc-500">
                                Engage directly through Pinpoint's mediated syndicate protocol.
                            </p>
                        </div>
                    </div>

                    {entry.can_submit_interest ? (
                        <form onSubmit={submitInterest} className="mt-8 max-w-4xl space-y-8">
                            <div>
                                <label className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                    Select Engagement Objective
                                </label>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {[
                                        { id: 'more_details', label: 'Share More Details', desc: 'Request full financial model and analyst commentary' },
                                        { id: 'founder_call', label: 'Arrange Founder Call', desc: 'Schedule a 30-min mediated syndicate briefing' },
                                        { id: 'data_room_access', label: 'Request Data Room', desc: 'Unlock cap tables, legal contracts, and audits' },
                                    ].map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => interestForm.setData('type', opt.id as any)}
                                            className={cn(
                                                'cursor-pointer rounded-[1.5rem] border p-5 transition-all duration-200',
                                                interestForm.data.type === opt.id
                                                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                                                    : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white hover:shadow-sm'
                                            )}
                                        >
                                            <span className={cn("block text-sm font-bold", interestForm.data.type === opt.id ? "text-white" : "text-zinc-900")}>{opt.label}</span>
                                            <span className={cn('mt-2 block text-[13px] leading-relaxed', interestForm.data.type === opt.id ? 'text-zinc-400' : 'text-zinc-500')}>
                                                {opt.desc}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                    Direct Syndicate Note <span className="font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={interestForm.data.message}
                                    onChange={(e) => interestForm.setData('message', e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Add any specific questions, ticket size, or requirements for the founder and analyst team..."
                                    className="w-full resize-none rounded-[1.5rem] border border-zinc-200/80 bg-zinc-50 p-5 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-0"
                                />
                            </div>

                            <div className="flex justify-end border-t border-zinc-100 pt-6">
                                <button
                                    type="submit"
                                    disabled={interestForm.processing}
                                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {interestForm.processing ? (
                                        <Icon icon="solar:refresh-linear" className="size-5 animate-spin" />
                                    ) : (
                                        <Icon icon="solar:plain-2-bold" className="size-5" />
                                    )}
                                    <span>{interestForm.processing ? 'Submitting Interest…' : 'Submit Syndicate Expression'}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-[1.5rem] border border-amber-200/60 bg-amber-50/50 p-6">
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <Icon icon="solar:shield-warning-bold" className="size-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">KYC Verification Required</h4>
                                    <p className="mt-0.5 text-[13px] text-amber-700">Complete KYC to express syndicate interest or request data rooms.</p>
                                </div>
                            </div>
                            <Link
                                href={route('investor.kyc.create')}
                                className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-amber-700"
                            >
                                <span>Complete KYC</span>
                                <Icon icon="solar:arrow-right-linear" className="size-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
