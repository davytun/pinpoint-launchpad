import { Icon } from '@iconify/react';
import { Head, Link, useForm } from '@inertiajs/react';

import FounderLayout from '@/layouts/founder-layout';

type PitchDeck = { id: number; original_filename: string; is_reviewed: boolean };

export default function FounderSpotlight({
    founder,
    profile,
    pitch_decks: pitchDecks = [],
}: {
    founder: { full_name: string; company_name: string; email: string };
    profile: { spotlight_one_liner: string | null; spotlight_summary: string | null; is_featured_in_spotlight: boolean };
    pitch_decks: PitchDeck[];
}) {
    const form = useForm({
        spotlight_one_liner: profile?.spotlight_one_liner ?? '',
        spotlight_summary: profile?.spotlight_summary ?? '',
    });

    const reviewedDeck = pitchDecks.find((deck) => deck.is_reviewed);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(route('founder.spotlight.update'), {
            preserveScroll: true,
        });
    };

    return (
        <FounderLayout founder={founder}>
            <Head title="Founder Workspace — Spotlight Profile" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* ── Top Bar ── */}
                <div className="mb-6 flex shrink-0 items-center justify-between border-b border-zinc-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                                Investor Spotlight Profile
                            </h1>
                            {profile?.is_featured_in_spotlight ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                    <span>Featured on Syndicate</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                    <span>Syndicate Draft</span>
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Configure your high-level overview shown to accredited investors once your PARAGON audit is verified.
                        </p>
                    </div>
                </div>

                {/* ── Body Canvas ── */}
                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left: Overview Editor (7 cols) */}
                        <form onSubmit={submit} className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-7">
                            <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
                                <Icon icon="solar:crown-linear" className="size-4.5 text-zinc-900" />
                                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                    Investor-Facing Executive Overview
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-700">One-Liner Hook</label>
                                        <span className="font-mono text-[11px] text-zinc-400">
                                            {form.data.spotlight_one_liner.length}/120
                                        </span>
                                    </div>
                                    <input
                                        value={form.data.spotlight_one_liner}
                                        onChange={(event) => form.setData('spotlight_one_liner', event.target.value)}
                                        maxLength={120}
                                        placeholder="What your venture builds and solves, in one compelling sentence..."
                                        className="w-full rounded-xl border border-zinc-200 bg-[#FAFBFD] px-3.5 py-2 text-xs text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-700">Executive Summary</label>
                                        <span className="font-mono text-[11px] text-zinc-400">
                                            {form.data.spotlight_summary.length}/500
                                        </span>
                                    </div>
                                    <textarea
                                        value={form.data.spotlight_summary}
                                        onChange={(event) => form.setData('spotlight_summary', event.target.value)}
                                        maxLength={500}
                                        rows={6}
                                        placeholder="Describe the company, market opportunity, business model, and milestones achieved..."
                                        className="w-full resize-none rounded-xl border border-zinc-200 bg-[#FAFBFD] p-3 text-xs leading-relaxed text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                    />
                                </div>

                                {(form.errors.spotlight_one_liner || form.errors.spotlight_summary) && (
                                    <p className="text-xs font-medium text-red-600">
                                        {form.errors.spotlight_one_liner ?? form.errors.spotlight_summary}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                    ) : (
                                        <Icon icon="solar:diskette-linear" className="size-3.5" />
                                    )}
                                    <span>{form.processing ? 'Saving Changes…' : 'Save Spotlight Overview'}</span>
                                </button>
                            </div>
                        </form>

                        {/* Right: Diligence & Pitch Deck Status (5 cols) */}
                        <div className="space-y-5 lg:col-span-5">
                            {/* Pitch Deck Card */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-5 shadow-2xs">
                                <div className="mb-3 flex items-center gap-2 border-b border-zinc-200/60 pb-2.5">
                                    <Icon icon="solar:document-text-linear" className="size-4 text-zinc-700" />
                                    <h4 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                        Pitch Deck Diligence
                                    </h4>
                                </div>

                                {reviewedDeck ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Icon icon="solar:check-circle-bold" className="size-4 text-emerald-600" />
                                            <span>{reviewedDeck.original_filename}</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-emerald-700">
                                            Verified by Pinpoint analysts and syndicated to your Investor Spotlight dossier.
                                        </p>
                                    </div>
                                ) : pitchDecks.length > 0 ? (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-800">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Icon icon="solar:clock-circle-linear" className="size-4 text-blue-600" />
                                            <span>{pitchDecks[0].original_filename}</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-blue-700">
                                            Pitch deck uploaded and currently under analyst verification for spotlight syndication.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 rounded-xl border border-zinc-200/70 bg-white p-3.5 text-xs">
                                        <p className="text-zinc-600">
                                            Upload your investor pitch deck in Documents to allow our analyst team to verify your deck before spotlight distribution.
                                        </p>
                                        <Link
                                            href={route('founder.documents.index')}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50"
                                        >
                                            <span>Upload in Documents</span>
                                            <Icon icon="solar:arrow-right-linear" className="size-3" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* How Syndication Works */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs">
                                <h4 className="mb-2 text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                    How Investor Syndication Works
                                </h4>
                                <ol className="space-y-2 text-xs text-zinc-600">
                                    <li className="flex items-start gap-2">
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                                            1
                                        </span>
                                        <span>Submit executive summary and verify audit documents.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                                            2
                                        </span>
                                        <span>Analyst team finalizes PARAGON benchmark scoring and badges.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                                            3
                                        </span>
                                        <span>Dossier is published to accredited investors and matching syndicates.</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FounderLayout>
    );
}
