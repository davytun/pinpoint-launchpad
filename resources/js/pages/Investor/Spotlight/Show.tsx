import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, FileDown, FileText, LockKeyhole } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type RadarData = Record<string, number> | null;

type Entry = {
    slug: string;
    company_name: string | null;
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
    ['potential', 'Potential'],
    ['agility', 'Agility'],
    ['risk', 'Risk'],
    ['alignment', 'Alignment'],
    ['governance', 'Governance'],
    ['operations', 'Operations'],
    ['network', 'Network'],
] as const;

export default function SpotlightShow({ entry }: { entry: Entry }) {
    const radarItems = PILLARS.map(([key, subject]) => ({ subject, value: entry.radar_data?.[key] ?? 0 }));
    const hasRadarData = radarItems.some((item) => item.value > 0);
    const interestForm = useForm<{ type: 'more_details' | 'founder_call' | 'data_room_access'; message: string }>({
        type: 'more_details',
        message: '',
    });

    function submitInterest(event: React.FormEvent) {
        event.preventDefault();
        interestForm.post(route('investor.interests.store', entry.slug));
    }

    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title={entry.company_name ?? 'Spotlight startup'} />

            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <PinpointLogo height={24} />
                <Link
                    href={route('investor.spotlight.index')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-[#3A54A5] focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <ArrowLeft className="size-4" /> Spotlight
                </Link>
            </header>

            <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
                <div className="rounded-2xl border border-white/80 bg-white p-7 shadow-[0_20px_55px_rgba(33,56,120,0.10)] sm:p-10">
                    <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">
                        {entry.sector ?? 'PIN Spotlight'}
                        {entry.batch ? ` · ${entry.batch}` : ''}
                    </p>
                    <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-950">{entry.company_name ?? 'PIN startup'}</h1>
                            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">{entry.spotlight_one_liner}</p>
                        </div>
                        <span className="h-fit rounded-full bg-[#3A54A5]/10 px-4 py-2 text-sm font-bold text-[#3A54A5]">
                            PARAGON {entry.overall_score ?? '—'}
                        </span>
                    </div>

                    <div className="mt-9 border-t border-zinc-100 pt-8">
                        <h2 className="text-xl font-extrabold">Company overview</h2>
                        <p className="mt-4 max-w-3xl leading-7 whitespace-pre-line text-zinc-600">{entry.summary}</p>
                    </div>

                    <div className="mt-9 grid gap-8 border-t border-zinc-100 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
                        <div>
                            <h2 className="text-xl font-extrabold">Verified signals</h2>
                            {entry.badges.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {entry.badges.map((badge) => (
                                        <span
                                            key={badge.id}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700"
                                        >
                                            <BadgeCheck className="size-3.5 text-[#3A54A5]" />
                                            {badge.label}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm leading-6 text-zinc-600">Verified indicators will appear here as they are confirmed.</p>
                            )}
                        </div>

                        <div className="border-t border-zinc-100 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                            <h2 className="text-xl font-extrabold">PARAGON profile</h2>
                            {hasRadarData ? (
                                <>
                                    <div className="mt-3 h-64" aria-label="PARAGON assessment radar chart">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={radarItems} outerRadius="62%" margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                                                <PolarGrid stroke="#d4d4d8" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525b', fontSize: 11, fontWeight: 600 }} />
                                                <Radar dataKey="value" stroke="#3A54A5" fill="#3A54A5" fillOpacity={0.16} strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <dl className="sr-only">
                                        {radarItems.map((item) => (
                                            <div key={item.subject}>
                                                <dt>{item.subject}</dt>
                                                <dd>{item.value} out of 100</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </>
                            ) : (
                                <p className="mt-4 text-sm leading-6 text-zinc-600">PARAGON pillar scores are being finalised.</p>
                            )}
                        </div>
                    </div>
                </div>

                <section className="mt-7 rounded-2xl border border-[#3A54A5]/12 bg-[#eef2ff] p-6" aria-labelledby="pitch-deck-heading">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3A54A5]">
                            {entry.can_view_pitch_deck ? <FileText className="size-5" /> : <LockKeyhole className="size-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 id="pitch-deck-heading" className="font-extrabold">
                                Pitch deck
                            </h2>
                            {entry.pitch_deck ? (
                                <>
                                    <p className="mt-1 text-sm break-words text-zinc-600">
                                        {entry.can_view_pitch_deck
                                            ? entry.pitch_deck.original_filename
                                            : 'Complete KYC approval to access this reviewed pitch deck.'}
                                    </p>
                                    {entry.pitch_deck.can_preview && entry.pitch_deck.preview_url && (
                                        <iframe
                                            title={`${entry.company_name ?? 'Startup'} pitch deck preview`}
                                            src={entry.pitch_deck.preview_url}
                                            className="mt-5 h-[32rem] w-full rounded-xl border border-white bg-white"
                                        />
                                    )}
                                    {entry.can_view_pitch_deck && entry.pitch_deck.download_url && (
                                        <Button
                                            asChild
                                            variant={entry.pitch_deck.can_preview ? 'outline' : 'default'}
                                            className="mt-4 rounded-xl border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                                        >
                                            <a href={entry.pitch_deck.download_url}>
                                                <FileDown data-icon="inline-start" />
                                                Download pitch deck
                                            </a>
                                        </Button>
                                    )}
                                    {entry.can_view_pitch_deck && !entry.pitch_deck.can_preview && (
                                        <p className="mt-3 text-xs leading-5 text-zinc-600">
                                            This format can be downloaded securely, but cannot be previewed in the portal.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="mt-1 text-sm text-zinc-600">A reviewed pitch deck is not available yet.</p>
                            )}
                        </div>
                    </div>
                </section>
                <section
                    className="mt-7 rounded-2xl border border-white/80 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)] sm:p-8"
                    aria-labelledby="interest-heading"
                >
                    <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Pinpoint-mediated</p>
                    <h2 id="interest-heading" className="mt-2 text-xl font-extrabold text-zinc-950">
                        Express interest
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                        Choose a next step. Founder contact details remain private and Pinpoint stays in the loop.
                    </p>
                    {entry.can_submit_interest ? (
                        <form onSubmit={submitInterest} className="mt-6 flex max-w-3xl flex-col gap-5">
                            <fieldset>
                                <legend className="text-sm font-bold text-zinc-900">What would you like to do?</legend>
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={interestForm.data.type}
                                    onValueChange={(value) => value && interestForm.setData('type', value as typeof interestForm.data.type)}
                                    className="mt-3 grid justify-start gap-2 sm:grid-cols-3"
                                >
                                    <ToggleGroupItem
                                        value="more_details"
                                        className="h-auto justify-start px-4 py-3 text-left text-sm whitespace-normal"
                                    >
                                        Share more details
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="founder_call"
                                        className="h-auto justify-start px-4 py-3 text-left text-sm whitespace-normal"
                                    >
                                        Arrange a founder call
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="data_room_access"
                                        className="h-auto justify-start px-4 py-3 text-left text-sm whitespace-normal"
                                    >
                                        Request data-room access
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </fieldset>
                            <div>
                                <label htmlFor="interest-message" className="text-sm font-bold text-zinc-900">
                                    Short message <span className="font-medium text-zinc-500">(optional)</span>
                                </label>
                                <Textarea
                                    id="interest-message"
                                    value={interestForm.data.message}
                                    onChange={(event) => interestForm.setData('message', event.target.value)}
                                    aria-invalid={Boolean(interestForm.errors.message)}
                                    aria-describedby={interestForm.errors.message ? 'interest-message-error' : undefined}
                                    maxLength={500}
                                    placeholder="Add context for Pinpoint and the founder."
                                    className="mt-2 border-zinc-200 bg-white text-zinc-950"
                                />
                                {interestForm.errors.message && (
                                    <p id="interest-message-error" className="mt-2 text-sm font-medium text-rose-700">
                                        {interestForm.errors.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button type="submit" disabled={interestForm.processing} className="rounded-xl bg-[#3A54A5] hover:bg-[#2D4182]">
                                    {interestForm.processing ? 'Submitting…' : 'Submit interest'}
                                </Button>
                                <p className="text-xs leading-5 text-zinc-500">
                                    Only an approved data-room request grants access to detailed documents.
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 rounded-xl border border-[#3A54A5]/12 bg-[#eef2ff] p-4 text-sm leading-6 text-zinc-700">
                            Complete KYC approval to submit an interest or request access.{' '}
                            <Link href={route('investor.kyc.create')} className="font-bold text-[#3A54A5] hover:underline">
                                Complete KYC
                            </Link>
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
