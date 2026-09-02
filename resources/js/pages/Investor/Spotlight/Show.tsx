import { InvestorHeader } from '@/components/investor-header';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

type RadarData = Record<string, number> | null;
type InterestType = 'more_details' | 'founder_call' | 'data_room_access';

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

const interestOptions: { id: InterestType; label: string; description: string }[] = [
    { id: 'data_room_access', label: 'Request data room', description: 'Cap table, legal documents, financials, and audit materials.' },
    { id: 'founder_call', label: 'Arrange founder call', description: 'A mediated 30-minute briefing with the founder.' },
    { id: 'more_details', label: 'Ask a question', description: 'Request analyst context or a specific follow-up.' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">{children}</p>;
}

export default function SpotlightShow({ entry }: { entry: Entry }) {
    const radarItems = PILLARS.map(([key, subject]) => ({ subject, value: entry.radar_data?.[key] ?? 75 }));
    const companyName = entry.company_name ?? 'Featured Venture';
    const score = entry.overall_score ?? 89;
    const interestForm = useForm<{ type: InterestType; message: string }>({ type: 'data_room_access', message: '' });

    function submitInterest(event: React.FormEvent) {
        event.preventDefault();
        interestForm.post(route('investor.interests.store', entry.slug));
    }

    return (
        <div className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title={`${companyName} | Pinpoint`} />
            <InvestorHeader activeTab="spotlight" />

            <div className="sticky top-16 z-30 border-b border-zinc-200 bg-stone-50/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('investor.spotlight.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-950"
                    >
                        <Icon icon="solar:arrow-left-linear" className="size-4" />
                        <span className="hidden sm:inline">Back to syndicate spotlight</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                        {entry.sector ?? 'General tech'} <span className="px-1.5 text-zinc-300">/</span> {entry.batch ?? 'Current cohort'}
                    </span>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12 lg:px-8 lg:pb-12">
                <section className="border-b border-zinc-200 pb-8 sm:pb-10">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                    <Icon icon="solar:verified-check-bold" className="size-4" /> Analyst verified
                                </span>
                                <span className="h-3.5 w-px bg-zinc-200" />
                                <span className="text-[11px] font-medium text-zinc-500">
                                    {entry.badges.length || entry.verified_badges_count} diligence checks complete
                                </span>
                            </div>
                            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-5xl">{companyName}</h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">{entry.spotlight_one_liner}</p>
                        </div>
                        <div className="border-t border-zinc-200 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                            <SectionLabel>Diagnostic readiness</SectionLabel>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-semibold tracking-tight">{score}</span>
                                <span className="text-sm text-zinc-400">/ 100</span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">Verified across seven operating and execution dimensions.</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-x-14 gap-y-10 py-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,.75fr)] lg:py-14">
                    <div>
                        <SectionLabel>Company brief</SectionLabel>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">The investment case, in context</h2>
                        <div className="mt-5 max-w-2xl text-[15px] leading-7 whitespace-pre-line text-zinc-600">
                            {entry.summary || 'A detailed company brief has been reviewed and is available to qualified investors.'}
                        </div>
                    </div>
                    <div className="border-t border-zinc-200 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                        <div className="flex items-center justify-between">
                            <SectionLabel>Paragon assessment</SectionLabel>
                            <span className="font-mono text-xs font-semibold text-zinc-600">{score}%</span>
                        </div>
                        <div className="mt-3 h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarItems} outerRadius="68%">
                                    <PolarGrid stroke="#e4e4e7" strokeDasharray="2 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 9, fontWeight: 500 }} />
                                    <Radar dataKey="value" stroke="#18181b" fill="#18181b" fillOpacity={0.04} strokeWidth={1.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-zinc-200 pt-4">
                            {radarItems.slice(0, 4).map((pillar) => (
                                <div key={pillar.subject} className="flex items-baseline justify-between gap-2 text-[11px]">
                                    <dt className="text-zinc-500">{pillar.subject}</dt>
                                    <dd className="font-mono font-semibold text-zinc-800">{pillar.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section className="border-y border-zinc-200 py-8 sm:py-10">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <SectionLabel>Verified diligence</SectionLabel>
                            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">Review status</h2>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-zinc-500">
                            Pinpoint has reviewed the following materials and signals before listing this opportunity.
                        </p>
                    </div>
                    {entry.badges.length > 0 ? (
                        <ul className="mt-6 grid gap-x-8 border-t border-zinc-200 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                            {entry.badges.map((badge) => (
                                <li key={badge.id} className="flex items-center gap-2.5 py-2 text-xs font-medium text-zinc-700">
                                    <Icon icon="solar:check-circle-bold" className="size-4 shrink-0 text-emerald-600" />
                                    {badge.label}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-5 text-sm text-zinc-600">All standard compliance and verification checks are confirmed.</p>
                    )}
                </section>

                <section className="py-10 sm:py-14">
                    <div className="flex items-end justify-between gap-5">
                        <div>
                            <SectionLabel>Investor materials</SectionLabel>
                            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">Pitch deck</h2>
                        </div>
                        {entry.pitch_deck && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                <Icon icon="solar:verified-check-bold" className="size-4" /> Verified file
                            </span>
                        )}
                    </div>
                    {entry.pitch_deck ? (
                        <div className="mt-6 overflow-hidden border border-zinc-200 bg-white">
                            <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="flex items-center gap-3">
                                    <Icon icon="solar:document-text-linear" className="size-5 text-zinc-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">{entry.pitch_deck.original_filename}</p>
                                        <p className="mt-0.5 text-xs text-zinc-500">Institutional pitch deck · PDF</p>
                                    </div>
                                </div>
                                {entry.can_view_pitch_deck && entry.pitch_deck.download_url && (
                                    <a
                                        href={entry.pitch_deck.download_url}
                                        className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
                                    >
                                        <Icon icon="solar:download-minimalistic-linear" className="size-4" />
                                        Download
                                    </a>
                                )}
                            </div>
                            {entry.pitch_deck.can_preview && entry.pitch_deck.preview_url ? (
                                <iframe
                                    title={`${companyName} pitch deck`}
                                    src={entry.pitch_deck.preview_url}
                                    className="h-[32rem] w-full bg-zinc-100 sm:h-[38rem]"
                                />
                            ) : (
                                <div className="flex min-h-52 items-center justify-center bg-stone-100 px-6 text-center text-sm text-zinc-500">
                                    Preview unavailable. Download the verified file to review it.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-6 border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500">
                            The pitch deck is being prepared by the analyst desk.
                        </div>
                    )}
                </section>

                <section id="request-data-room" className="border-t border-zinc-200 py-10 sm:py-14">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.75fr)] lg:gap-16">
                        <div>
                            <SectionLabel>Next step</SectionLabel>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">Request data-room access</h2>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                                Submit a short request for the materials that support a deeper review. Pinpoint will keep the process mediated and
                                notify you of the decision.
                            </p>
                        </div>
                        {entry.can_submit_interest ? (
                            <form onSubmit={submitInterest} className="border border-zinc-200 bg-white p-5 sm:p-6">
                                <fieldset>
                                    <legend className="text-xs font-semibold text-zinc-900">How would you like to engage?</legend>
                                    <div className="mt-3 divide-y divide-zinc-100 border-y border-zinc-100">
                                        {interestOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => interestForm.setData('type', option.id)}
                                                className={cn(
                                                    'flex w-full items-start gap-3 py-3 text-left',
                                                    interestForm.data.type === option.id ? 'text-zinc-950' : 'text-zinc-500',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                                                        interestForm.data.type === option.id
                                                            ? 'border-zinc-950 bg-zinc-950 text-white'
                                                            : 'border-zinc-300',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'size-1.5 rounded-full bg-white',
                                                            interestForm.data.type === option.id ? 'opacity-100' : 'opacity-0',
                                                        )}
                                                    />
                                                </span>
                                                <span>
                                                    <span className="block text-xs font-semibold">{option.label}</span>
                                                    <span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                                <label className="mt-5 block text-xs font-semibold text-zinc-900">
                                    Note <span className="font-normal text-zinc-400">(optional)</span>
                                    <textarea
                                        value={interestForm.data.message}
                                        onChange={(event) => interestForm.setData('message', event.target.value)}
                                        maxLength={500}
                                        rows={4}
                                        placeholder="Questions, intended ticket size, or review requirements"
                                        className="mt-2 w-full resize-none border border-zinc-200 bg-stone-50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white focus:ring-2 focus:ring-zinc-200 focus:outline-none"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={interestForm.processing}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <Icon
                                        icon={interestForm.processing ? 'solar:refresh-linear' : 'solar:arrow-right-linear'}
                                        className={cn('size-4', interestForm.processing && 'animate-spin')}
                                    />
                                    {interestForm.processing
                                        ? 'Submitting request…'
                                        : interestForm.data.type === 'data_room_access'
                                          ? 'Request data room'
                                          : 'Submit request'}
                                </button>
                            </form>
                        ) : (
                            <div className="border border-amber-200 bg-amber-50 p-6">
                                <Icon icon="solar:shield-warning-linear" className="size-5 text-amber-700" />
                                <h3 className="mt-4 text-sm font-semibold text-amber-950">KYC verification required</h3>
                                <p className="mt-2 text-sm leading-6 text-amber-800">
                                    Complete verification before requesting access to investor materials.
                                </p>
                                <Link
                                    href={route('investor.kyc.create')}
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-900 underline underline-offset-4"
                                >
                                    Complete KYC <Icon icon="solar:arrow-right-linear" className="size-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            {entry.can_submit_interest && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white p-3 sm:hidden">
                    <a
                        href="#request-data-room"
                        className="flex w-full items-center justify-center gap-2 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                        <Icon icon="solar:lock-keyhole-linear" className="size-4" />
                        Request data room
                    </a>
                </div>
            )}
        </div>
    );
}
