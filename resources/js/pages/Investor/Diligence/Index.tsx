import { InvestorHeader } from '@/components/investor-header';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Lock, MessageSquare, XCircle } from 'lucide-react';

interface DiligenceRequest {
    id: string;
    category: string;
    subject: string;
    request_details: string;
    status: string;
    investor_facing_status: string;
    investor_visible_response?: string | null;
    data_room_required: boolean;
    created_at: string;
    resolved_at?: string | null;
    profile: {
        slug: string;
        sector?: string | null;
        spotlight_one_liner?: string | null;
        founder: {
            company_name: string;
        } | null;
    };
}

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function DiligenceIndex({ diligence_requests }: { diligence_requests: DiligenceRequest[] }) {
    return (
        <main className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Post-Introduction Diligence — Pinpoint Investment Network" />
            <InvestorHeader activeTab="diligence" />

            <section className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                        Post-Introduction Diligence
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Track the status and approved responses for your post-call inquiries coordinated by Pinpoint Investor Relations.
                    </p>
                </div>

                {diligence_requests.length === 0 ? (
                    <div className="rounded-3xl border border-white/80 bg-white p-12 text-center shadow-[0_15px_40px_rgba(33,56,120,0.06)]">
                        <MessageSquare className="mx-auto mb-3 size-12 text-zinc-300" />
                        <h2 className="text-lg font-bold text-zinc-900">No diligence inquiries submitted yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                            After completing an introductory call or reviewing a venture on Spotlight, you can submit specific diligence queries to
                            Pinpoint IR.
                        </p>
                        <Link
                            href={route('investor.interests.index')}
                            className="mt-6 inline-flex rounded-xl bg-[#3A54A5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2D4182]"
                        >
                            View Active Engagements
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {diligence_requests.map((req) => {
                            const isResolved = req.status === 'resolved';
                            const isDeclined = req.status === 'declined';

                            return (
                                <article
                                    key={req.id}
                                    className="rounded-3xl border border-white/80 bg-white p-7 shadow-[0_15px_40px_rgba(33,56,120,0.06)] transition hover:shadow-[0_20px_50px_rgba(33,56,120,0.09)]"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-bold tracking-wider text-zinc-700 uppercase">
                                                    {req.category.replace('_', ' ')}
                                                </span>
                                                {req.data_room_required && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                                        <Lock className="size-3" />
                                                        Data Room Required
                                                    </span>
                                                )}
                                                <span className="text-xs text-zinc-400">Submitted {formatDate(req.created_at)}</span>
                                            </div>

                                            <h2 className="mt-3 text-xl font-extrabold text-zinc-950">{req.subject}</h2>
                                            <p className="mt-0.5 text-sm font-semibold text-indigo-900">
                                                Startup: {req.profile.founder?.company_name || 'PIN Startup'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                                                    isResolved
                                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : isDeclined
                                                          ? 'border border-red-200 bg-red-50 text-red-700'
                                                          : 'border border-blue-200 bg-blue-50 text-blue-700'
                                                }`}
                                            >
                                                {isResolved ? (
                                                    <CheckCircle2 className="size-3.5" />
                                                ) : isDeclined ? (
                                                    <XCircle className="size-3.5" />
                                                ) : (
                                                    <Clock3 className="size-3.5" />
                                                )}
                                                {req.investor_facing_status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Request details */}
                                    <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                                        <p className="mb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">Your Inquiry:</p>
                                        <p className="whitespace-pre-wrap">{req.request_details}</p>
                                    </div>

                                    {/* Approved Response */}
                                    {req.investor_visible_response && (
                                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                                            <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                Pinpoint Investor Relations Verified Response:
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
                                                {req.investor_visible_response}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action footer */}
                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                                        <p className="text-xs text-zinc-500">Coordinated securely via Pinpoint Investor Relations.</p>
                                        <Link
                                            href={route('investor.spotlight.show', req.profile.slug)}
                                            className="text-xs font-bold text-[#3A54A5] hover:underline"
                                        >
                                            View Startup Profile →
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
