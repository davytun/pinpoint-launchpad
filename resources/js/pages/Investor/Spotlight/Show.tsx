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
        kind: 'pdf' | 'image' | 'file';
        can_preview: boolean;
        preview_url: string | null;
        download_url: string | null;
    } | null;
    can_view_pitch_deck: boolean;
    can_submit_interest: boolean;
    existing_interest?: {
        type: InterestType;
        status: string;
        founder_decision: string | null;
        investor_facing_status: string;
    } | null;
};

const PILLARS = [
    ['potential', 'Potential'],
    ['agility', 'Agility'],
    ['risk', 'Risk'],
    ['alignment', 'Alignment'],
    ['governance', 'Governance'],
    ['operations', 'Operations'],
    ['network', 'Network'],
] as const;

const PLACEHOLDER_COPY = new Set([
    'What your venture builds and solves, in one compelling sentence...',
    'Describe the company, market opportunity, business model, and milestones achieved...',
]);

const interestOptions: { id: InterestType; label: string; description: string }[] = [
    { id: 'data_room_access', label: 'Request data room', description: 'Cap table, legal documents, financials, and audit materials.' },
    { id: 'founder_call', label: 'Arrange founder call', description: 'A mediated briefing with the founder.' },
    { id: 'more_details', label: 'Ask a question', description: 'Request analyst context or a specific follow-up.' },
];

function realCopy(value?: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    if (!trimmed || PLACEHOLDER_COPY.has(trimmed)) {
        return null;
    }

    return trimmed;
}

function interestLabel(type: InterestType) {
    return {
        data_room_access: 'Data room',
        founder_call: 'Founder call',
        more_details: 'Question',
    }[type];
}

export default function SpotlightShow({ entry }: { entry: Entry }) {
    const radarItems = PILLARS.map(([key, subject]) => ({
        subject,
        value: entry.radar_data?.[key] ?? 0,
    }));
    const companyName = entry.company_name ?? 'Featured Venture';
    const score = entry.overall_score ?? null;
    const oneLiner = realCopy(entry.spotlight_one_liner);
    const summary = realCopy(entry.summary);
    const interestForm = useForm<{ type: InterestType; message: string }>({ type: 'data_room_access', message: '' });
    const pdfDeck = entry.pitch_deck?.kind === 'pdf' ? entry.pitch_deck : null;
    const otherFile = entry.pitch_deck && entry.pitch_deck.kind !== 'pdf' ? entry.pitch_deck : null;

    function submitInterest(event: React.FormEvent) {
        event.preventDefault();
        interestForm.post(route('investor.interests.store', entry.slug));
    }

    return (
        <div className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title={`${companyName} | Pinpoint`} />
            <InvestorHeader activeTab="spotlight" />

            <div className="sticky top-16 z-30 border-b border-zinc-200 bg-stone-50/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('investor.spotlight.index')}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-950"
                    >
                        <Icon icon="solar:arrow-left-linear" className="size-4" />
                        Spotlight
                    </Link>
                    <p className="truncate text-[12px] text-zinc-500">
                        {entry.sector ?? 'General'}
                        <span className="mx-1.5 text-zinc-300">·</span>
                        {entry.batch ?? 'Current cohort'}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-10 lg:px-8 lg:pb-16">
                {entry.existing_interest && (
                    <div className="mb-8 flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-950">
                                {interestLabel(entry.existing_interest.type)} request
                            </p>
                            <p className="mt-0.5 text-[13px] text-zinc-500">{entry.existing_interest.investor_facing_status}</p>
                        </div>
                        <Link
                            href={route('investor.interests.index')}
                            className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#3A54A5] hover:text-[#2D4182]"
                        >
                            My Interests
                            <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                        </Link>
                    </div>
                )}

                <section className="border-b border-zinc-200 pb-8">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                            <Icon icon="solar:verified-check-bold" className="size-3.5" />
                            Analyst verified
                        </span>
                        {(entry.badges.length > 0 || entry.verified_badges_count > 0) && (
                            <>
                                <span className="text-zinc-300">·</span>
                                <span className="text-zinc-500">
                                    {entry.badges.length || entry.verified_badges_count} diligence checks
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 max-w-3xl">
                            <h1 className="font-display text-[2.5rem] leading-[1.05] font-bold tracking-tight text-zinc-950 sm:text-[3rem]">
                                {companyName}
                            </h1>
                            {oneLiner ? (
                                <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-zinc-600">{oneLiner}</p>
                            ) : (
                                <p className="mt-3 text-[14px] text-zinc-400">One-liner pending from the founder desk.</p>
                            )}
                            {entry.founder_name && (
                                <p className="mt-2 text-[13px] text-zinc-500">{entry.founder_name}</p>
                            )}
                        </div>

                        {score != null && (
                            <div className="shrink-0 lg:text-right">
                                <p className="font-mono text-[2.5rem] leading-none font-bold tracking-tight text-zinc-950">
                                    {score}
                                    <span className="ml-1 text-base font-medium text-zinc-400">/100</span>
                                </p>
                                <p className="mt-1.5 text-[12px] text-zinc-500">PARAGON readiness</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid gap-10 border-b border-zinc-200 py-8 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <h2 className="text-[15px] font-semibold text-zinc-950">Company brief</h2>
                        {summary ? (
                            <p className="mt-3 max-w-2xl text-[15px] leading-7 whitespace-pre-line text-zinc-600">{summary}</p>
                        ) : (
                            <p className="mt-3 text-[14px] text-zinc-400">
                                Full brief is being prepared. Score and diligence signals below are available now.
                            </p>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <h2 className="text-[15px] font-semibold text-zinc-950">PARAGON</h2>
                        <div className="mt-3 h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarItems} outerRadius="70%">
                                    <PolarGrid stroke="#e4e4e7" strokeDasharray="2 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} />
                                    <Radar dataKey="value" stroke="#3A54A5" fill="#3A54A5" fillOpacity={0.12} strokeWidth={1.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {radarItems.map((pillar) => (
                                <div key={pillar.subject} className="flex items-baseline justify-between gap-2 text-[12px]">
                                    <dt className="text-zinc-500">{pillar.subject}</dt>
                                    <dd className="font-mono font-semibold tabular-nums text-zinc-800">{pillar.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {entry.badges.length > 0 && (
                    <section className="border-b border-zinc-200 py-8">
                        <h2 className="text-[15px] font-semibold text-zinc-950">Verified diligence</h2>
                        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                            {entry.badges.map((badge) => (
                                <li key={badge.id} className="flex items-center gap-2 border-t border-zinc-100 py-2.5 text-[13px] text-zinc-700">
                                    <Icon icon="solar:check-circle-bold" className="size-4 shrink-0 text-emerald-600" />
                                    {badge.label}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="border-b border-zinc-200 py-8">
                    <h2 className="text-[15px] font-semibold text-zinc-950">Investor materials</h2>

                    {pdfDeck ? (
                        <div className="mt-4 overflow-hidden border border-zinc-200 bg-white">
                            <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div className="min-w-0">
                                    <p className="truncate text-[14px] font-semibold text-zinc-950">{pdfDeck.original_filename}</p>
                                    <p className="mt-0.5 text-[12px] text-zinc-500">Pitch deck · PDF</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                        <Icon icon="solar:verified-check-bold" className="size-3.5" />
                                        Verified
                                    </span>
                                    {entry.can_view_pitch_deck && pdfDeck.download_url && (
                                        <a
                                            href={pdfDeck.download_url}
                                            className="inline-flex items-center gap-1.5 border border-zinc-200 px-3 py-1.5 text-[12px] font-semibold text-zinc-800 hover:border-zinc-400"
                                        >
                                            <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                            Download
                                        </a>
                                    )}
                                </div>
                            </div>
                            {entry.can_view_pitch_deck && pdfDeck.can_preview && pdfDeck.preview_url ? (
                                <iframe
                                    title={`${companyName} pitch deck`}
                                    src={pdfDeck.preview_url}
                                    className="h-[28rem] w-full bg-zinc-100 sm:h-[34rem]"
                                />
                            ) : entry.can_view_pitch_deck ? (
                                <div className="px-5 py-10 text-center text-[13px] text-zinc-500">
                                    Preview unavailable. Download the PDF to review it.
                                </div>
                            ) : (
                                <div className="px-5 py-8 text-center text-[13px] text-zinc-500">
                                    Complete KYC to preview or download the pitch deck.
                                </div>
                            )}
                        </div>
                    ) : otherFile ? (
                        <div className="mt-4 flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold text-zinc-950">{otherFile.original_filename}</p>
                                <p className="mt-0.5 text-[12px] text-zinc-500">
                                    Supporting file · not a PDF pitch deck. Download only.
                                </p>
                            </div>
                            {entry.can_view_pitch_deck && otherFile.download_url ? (
                                <a
                                    href={otherFile.download_url}
                                    className="inline-flex shrink-0 items-center gap-1.5 border border-zinc-200 px-3 py-1.5 text-[12px] font-semibold text-zinc-800 hover:border-zinc-400"
                                >
                                    <Icon icon="solar:download-minimalistic-linear" className="size-3.5" />
                                    Download
                                </a>
                            ) : (
                                <span className="text-[12px] text-zinc-400">KYC required to download</span>
                            )}
                        </div>
                    ) : (
                        <p className="mt-3 text-[14px] text-zinc-400">Pitch deck not published yet.</p>
                    )}
                </section>

                <section id="request-data-room" className="pt-8">
                    {entry.existing_interest ? null : (
                        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                            <div className="lg:col-span-5">
                                <h2 className="text-[1.25rem] font-semibold tracking-tight text-zinc-950">Engage via Pinpoint</h2>
                                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-zinc-600">
                                    Requests stay mediated. Pinpoint coordinates with the founder — you are not introduced directly.
                                </p>
                            </div>

                            <div className="lg:col-span-7">
                                {entry.can_submit_interest ? (
                                    <form onSubmit={submitInterest} className="border border-zinc-200 bg-white p-5 sm:p-6">
                                        <fieldset>
                                            <legend className="text-[13px] font-semibold text-zinc-950">How would you like to engage?</legend>
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
                                                                    ? 'border-[#3A54A5] bg-[#3A54A5] text-white'
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
                                                            <span className="block text-[13px] font-semibold">{option.label}</span>
                                                            <span className="mt-0.5 block text-[12px] leading-5 text-zinc-500">
                                                                {option.description}
                                                            </span>
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </fieldset>
                                        <label className="mt-5 block text-[13px] font-semibold text-zinc-950">
                                            Note <span className="font-normal text-zinc-400">(optional)</span>
                                            <textarea
                                                value={interestForm.data.message}
                                                onChange={(event) => interestForm.setData('message', event.target.value)}
                                                maxLength={500}
                                                rows={3}
                                                placeholder="Ticket size, timing, or review focus"
                                                className="mt-2 w-full resize-none border border-zinc-200 bg-stone-50 p-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white focus:ring-2 focus:ring-zinc-200 focus:outline-none"
                                            />
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={interestForm.processing}
                                            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#3A54A5] px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#2D4182] disabled:opacity-50"
                                        >
                                            {interestForm.processing
                                                ? 'Submitting…'
                                                : interestForm.data.type === 'data_room_access'
                                                  ? 'Request data room'
                                                  : 'Submit request'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="border border-amber-200 bg-amber-50 p-5">
                                        <h3 className="text-[14px] font-semibold text-amber-950">KYC required</h3>
                                        <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800">
                                            Complete verification before requesting materials or a founder call.
                                        </p>
                                        <Link
                                            href={route('investor.kyc.create')}
                                            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-950 underline underline-offset-4"
                                        >
                                            Complete KYC
                                            <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {entry.can_submit_interest && !entry.existing_interest && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white p-3 sm:hidden">
                    <a
                        href="#request-data-room"
                        className="flex w-full items-center justify-center gap-2 bg-[#3A54A5] px-4 py-3 text-[13px] font-semibold text-white"
                    >
                        Request access
                    </a>
                </div>
            )}
        </div>
    );
}
