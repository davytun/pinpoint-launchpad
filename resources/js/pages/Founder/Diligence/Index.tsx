import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, MessageSquare, ShieldCheck, ArrowRight, XCircle } from 'lucide-react';
import { useState } from 'react';

import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

interface DiligenceRequest {
    id: string;
    category: string;
    subject: string;
    request_details: string;
    admin_instructions_for_founder?: string | null;
    founder_notes_to_admin?: string | null;
    status: string;
    founder_facing_status: string;
    created_at: string;
    founder_responded_at?: string | null;
    resolved_at?: string | null;
}

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function FounderDiligenceIndex({ diligence_requests }: { diligence_requests: DiligenceRequest[] }) {
    const [activeReq, setActiveReq] = useState<DiligenceRequest | null>(null);
    const [responseContent, setResponseContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openModal = (req: DiligenceRequest) => {
        setActiveReq(req);
        setResponseContent(req.founder_notes_to_admin || '');
    };

    const closeModal = () => {
        setActiveReq(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeReq || !responseContent.trim()) return;

        setSubmitting(true);
        router.patch(
            route('founder.diligence.respond', activeReq.id),
            { founder_notes_to_admin: responseContent },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    closeModal();
                },
                onError: () => setSubmitting(false),
            }
        );
    };

    return (
        <FounderLayout>
            <Head title="Pinpoint Information Requests — Founder Portal" />

            <div className="space-y-8 pb-16">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3A54A5]">
                        <ShieldCheck className="size-4" />
                        Mediated Diligence Channel
                    </div>
                    <h1 className="mt-1 text-2xl font-bold text-zinc-950 sm:text-3xl">
                        Pinpoint Information Requests
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
                        When verified investors currently engaged with your startup have specific follow-up inquiries, Pinpoint Investor Relations coordinates the request here. Your responses are provided securely to Pinpoint for review.
                    </p>
                </div>

                {diligence_requests.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
                        <MessageSquare className="mx-auto size-12 text-zinc-300 mb-3" />
                        <h2 className="text-lg font-bold text-zinc-900">No pending diligence requests</h2>
                        <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                            When an investor submits a diligence question following an introduction, Pinpoint IR will notify you to provide input here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {diligence_requests.map((req) => {
                            const isPending = req.status === 'waiting_for_founder' || req.status === 'submitted';
                            const isResponded = req.status === 'founder_responded';
                            const isResolved = req.status === 'resolved';

                            return (
                                <div
                                    key={req.id}
                                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
                                                    {req.category.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-zinc-400">
                                                    Received {formatDate(req.created_at)}
                                                </span>
                                            </div>
                                            <h2 className="mt-2 text-lg font-bold text-zinc-950">{req.subject}</h2>
                                        </div>

                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                                                isPending
                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    : isResponded
                                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                    : isResolved
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : 'bg-zinc-100 text-zinc-700'
                                            )}
                                        >
                                            {isPending && <Clock className="size-3.5" />}
                                            {isResponded && <CheckCircle2 className="size-3.5 text-blue-600" />}
                                            {isResolved && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                                            {req.founder_facing_status}
                                        </span>
                                    </div>

                                    {/* Request Inquiry */}
                                    <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Inquiry from Pinpoint IR:</p>
                                        <p className="whitespace-pre-wrap">{req.request_details}</p>
                                    </div>

                                    {/* Admin instructions */}
                                    {req.admin_instructions_for_founder && (
                                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-950">
                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">Pinpoint IR Guidance:</p>
                                            <p className="whitespace-pre-wrap">{req.admin_instructions_for_founder}</p>
                                        </div>
                                    )}

                                    {/* Founder submitted response */}
                                    {req.founder_notes_to_admin && (
                                        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm text-zinc-800">
                                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Response to Pinpoint IR (Submitted {formatDate(req.founder_responded_at)}):</p>
                                            <p className="whitespace-pre-wrap">{req.founder_notes_to_admin}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                                        <p className="text-xs text-zinc-400">
                                            All responses are reviewed by Pinpoint IR prior to investor release.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => openModal(req)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3A54A5] px-4 py-2 text-xs font-bold text-white hover:bg-[#2D4182] transition"
                                        >
                                            {req.founder_notes_to_admin ? 'Update Response' : 'Submit Response to Pinpoint'}
                                            <ArrowRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {activeReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-5">
                        <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                            <div>
                                <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-bold uppercase text-zinc-700">
                                    {activeReq.category.replace('_', ' ')}
                                </span>
                                <h2 className="mt-1 text-xl font-bold text-zinc-950">{activeReq.subject}</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <XCircle className="size-5" />
                            </button>
                        </div>

                        <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-700">
                            <p className="font-bold text-zinc-500 mb-1">Inquiry Details:</p>
                            <p>{activeReq.request_details}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                    Your Response to Pinpoint Investor Relations:
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    value={responseContent}
                                    onChange={(e) => setResponseContent(e.target.value)}
                                    placeholder="Provide the requested details, explanation, or reference documents in your Data Room..."
                                    className="w-full rounded-xl border border-zinc-300 p-3.5 text-sm text-zinc-900 focus:border-[#3A54A5] focus:outline-hidden"
                                />
                                <p className="mt-1.5 text-xs text-zinc-500">
                                    Confidential. This response is submitted to Pinpoint IR and will be reviewed before any information is formatted for the investor.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !responseContent.trim()}
                                    className="rounded-xl bg-[#3A54A5] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4182] transition disabled:opacity-50"
                                >
                                    Submit Response to Pinpoint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </FounderLayout>
    );
}
