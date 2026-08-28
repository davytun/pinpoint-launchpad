import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock3, CheckCircle2, XCircle, Calendar, Video, Lock, ExternalLink, ShieldAlert } from 'lucide-react';
import { PinpointLogo } from '@/components/pinpoint-logo';

type Interest = {
    id: string;
    type: 'more_details' | 'founder_call' | 'data_room_access';
    message: string | null;
    status: 'pending' | 'approved' | 'denied';
    investor_facing_status?: string;
    founder_decision?: string | null;
    created_at: string;
    scheduled_at?: string | null;
    completed_at?: string | null;
    meeting_link?: string | null;
    introduction_status: 'not_requested' | 'requested' | 'approved' | 'scheduled' | 'completed' | 'denied';
    data_room_status: 'granted' | 'revoked' | 'none';
    profile: {
        slug: string;
        sector?: string | null;
        spotlight_one_liner?: string | null;
        founder: {
            company_name: string;
        } | null;
    };
};

function formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function Interests({ interests }: { interests: Interest[] }) {
    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title="My Interests & Engagements" />

            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <PinpointLogo height={24} />
                <div className="flex items-center gap-3">
                    <Link
                        href={route('investor.spotlight.index')}
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white hover:text-zinc-950"
                    >
                        Browse Spotlight
                    </Link>
                    <Link
                        href={route('investor.dashboard')}
                        className="rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50"
                    >
                        Dashboard
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('investor.dashboard')}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm transition hover:text-zinc-900"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Dealflow & Engagements</p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight">Submitted Interests & Calls</h1>
                    </div>
                </div>

                <div className="mt-10 space-y-5">
                    {interests.length === 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                            <p className="text-lg font-bold text-zinc-900">No interests submitted yet.</p>
                            <p className="mt-2 text-sm text-zinc-600">
                                Explore the Spotlight to discover verified startups and request introductions or data room access coordinated by Pinpoint IR.
                            </p>
                            <Link
                                href={route('investor.spotlight.index')}
                                className="mt-6 inline-block rounded-xl bg-[#3A54A5] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2D4182] transition"
                            >
                                Browse Spotlight
                            </Link>
                        </div>
                    ) : (
                        interests.map((interest) => {
                            const isFounderCall = interest.type === 'founder_call';
                            const isDataRoom = interest.type === 'data_room_access';

                            const displayStatus = interest.investor_facing_status ?? (
                                interest.status === 'approved'
                                    ? (isFounderCall ? (interest.completed_at ? 'Completed' : interest.scheduled_at ? 'Scheduled' : 'Approved') : isDataRoom ? (interest.data_room_status === 'granted' ? 'Data Room Granted' : 'Access Revoked') : 'Approved')
                                    : interest.status === 'denied'
                                    ? 'Declined'
                                    : 'Pinpoint Reviewing'
                            );

                            return (
                                <div
                                    key={interest.id}
                                    className="rounded-2xl border border-white/80 bg-white p-6 sm:p-7 shadow-[0_16px_36px_rgba(33,56,120,0.06)] transition-all hover:shadow-[0_20px_40px_rgba(33,56,120,0.09)]"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h2 className="text-xl font-extrabold tracking-tight text-zinc-950">
                                                    {interest.profile?.founder?.company_name ?? 'PIN Startup'}
                                                </h2>
                                                {interest.profile?.sector && (
                                                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                                        {interest.profile.sector}
                                                    </span>
                                                )}
                                                <span className="rounded-full bg-[#3A54A5]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3A54A5] uppercase tracking-wider">
                                                    {interest.type.replaceAll('_', ' ')}
                                                </span>
                                            </div>

                                            {interest.profile?.spotlight_one_liner && (
                                                <p className="text-xs font-medium text-zinc-500 max-w-2xl">
                                                    {interest.profile.spotlight_one_liner}
                                                </p>
                                            )}

                                            <p className="text-xs text-zinc-400 pt-1">
                                                Submitted on {formatDate(interest.created_at)}
                                            </p>
                                        </div>

                                        {/* Status Header Badge */}
                                        <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-50 px-3.5 py-2 border border-zinc-100 sm:self-start">
                                            {displayStatus === 'Data Room Granted' || displayStatus === 'Approved' || displayStatus === 'Scheduled' || displayStatus === 'Completed' ? (
                                                <>
                                                    <CheckCircle2 className="size-4.5 text-emerald-600" />
                                                    <span className="text-xs font-bold text-emerald-700">
                                                        {displayStatus}
                                                    </span>
                                                </>
                                            ) : displayStatus === 'Declined' || displayStatus === 'Access Revoked' ? (
                                                <>
                                                    <XCircle className="size-4.5 text-rose-600" />
                                                    <span className="text-xs font-bold text-rose-700">{displayStatus}</span>
                                                </>
                                            ) : displayStatus === 'Founder Coordination in Progress' ? (
                                                <>
                                                    <Clock3 className="size-4.5 text-blue-600" />
                                                    <span className="text-xs font-bold text-blue-700">Founder Coordination in Progress</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock3 className="size-4.5 text-amber-600" />
                                                    <span className="text-xs font-bold text-amber-700">Pinpoint Reviewing</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Investor message */}
                                    {interest.message && (
                                        <div className="mt-4 rounded-xl bg-zinc-50/80 border border-zinc-100 p-3.5 text-xs leading-relaxed text-zinc-700 italic">
                                            &ldquo;{interest.message}&rdquo;
                                        </div>
                                    )}

                                    {/* Introduction Details Box */}
                                    {isFounderCall && interest.status === 'approved' && (
                                        <div className="mt-5 rounded-xl border border-indigo-100 bg-[#f7f9ff] p-4 text-xs text-indigo-950 space-y-2">
                                            <div className="flex items-center gap-2 font-bold text-indigo-900">
                                                <Calendar className="size-4 text-indigo-600" />
                                                <span>
                                                    {interest.completed_at
                                                        ? 'Founder Introduction Completed'
                                                        : interest.scheduled_at
                                                        ? 'Scheduled Founder Call'
                                                        : 'Introduction Approved — Coordinating Timing'}
                                                </span>
                                            </div>

                                            {interest.scheduled_at && !interest.completed_at && (
                                                <div className="pl-6 space-y-1">
                                                    <p className="font-semibold text-zinc-800">
                                                        Time: {formatDateTime(interest.scheduled_at)}
                                                    </p>
                                                    {interest.meeting_link && (
                                                        <p className="flex items-center gap-1.5 text-zinc-600 font-mono">
                                                            <Video className="size-3.5 text-indigo-500" />
                                                            <span>{interest.meeting_link}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-zinc-500 pt-1">
                                                        Pinpoint Investor Relations will coordinate and facilitate the session.
                                                    </p>
                                                </div>
                                            )}

                                            {!interest.scheduled_at && !interest.completed_at && (
                                                <p className="pl-6 text-[11.5px] text-zinc-600">
                                                    Pinpoint Investor Relations is coordinating availability and will post verified meeting details here.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Data Room Action Footer */}
                                    {isDataRoom && interest.status === 'approved' && (
                                        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                                            {interest.data_room_status === 'granted' ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                                        <Lock className="size-3.5" /> Data Room Clearance Active (Granted by Pinpoint)
                                                    </span>
                                                    <Link
                                                        href={route('investor.data-rooms.show', interest.profile.slug)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3A54A5] hover:underline"
                                                    >
                                                        Open Data Room <ExternalLink className="size-3" />
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                                                    <ShieldAlert className="size-3.5" />
                                                    <span>Data room access was revoked by Pinpoint administration.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer Link to Spotlight */}
                                    <div className="mt-4 flex items-center justify-end">
                                        <Link
                                            href={route('investor.spotlight.show', interest.profile.slug)}
                                            className="text-xs font-semibold text-zinc-400 hover:text-[#3A54A5] transition"
                                        >
                                            View Spotlight Profile &rarr;
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </main>
    );
}
