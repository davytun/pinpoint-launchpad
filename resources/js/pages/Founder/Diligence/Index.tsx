import { Head, router, usePage } from '@inertiajs/react';
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
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function categoryLabel(value: string) {
    return value.replaceAll('_', ' ');
}

function statusTone(status: string): 'action' | 'wait' | 'ok' | 'bad' {
    if (status === 'waiting_for_founder' || status === 'submitted') return 'action';
    if (status === 'founder_responded') return 'wait';
    if (status === 'resolved') return 'ok';
    if (status === 'declined') return 'bad';
    return 'wait';
}

export default function FounderDiligenceIndex({
    founder,
    diligence_requests,
}: {
    founder: { id?: string; email: string; full_name?: string | null; company_name?: string | null; avatar?: string | null };
    diligence_requests: DiligenceRequest[];
}) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const [activeReq, setActiveReq] = useState<DiligenceRequest | null>(null);
    const [responseContent, setResponseContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const awaiting = diligence_requests.filter((r) => r.status === 'waiting_for_founder' || r.status === 'submitted');
    const other = diligence_requests.filter((r) => r.status !== 'waiting_for_founder' && r.status !== 'submitted');

    const openModal = (req: DiligenceRequest) => {
        setActiveReq(req);
        setResponseContent(req.founder_notes_to_admin || '');
    };

    const closeModal = () => setActiveReq(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeReq || !responseContent.trim()) return;

        setSubmitting(true);
        router.patch(
            route('founder.diligence.respond', activeReq.id),
            { founder_notes_to_admin: responseContent },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    closeModal();
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    return (
        <FounderLayout founder={founder}>
            <Head title="Diligence — Pinpoint" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 pb-6">
                    <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-zinc-950 sm:text-[2rem]">
                        Diligence
                    </h1>
                    <p className="mt-1.5 text-[14px] text-zinc-500">
                        Questions from Pinpoint after an investor introduction.
                    </p>
                </header>

                <div className="no-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto pb-10">
                    {flash?.success && (
                        <p role="status" className="text-[14px] font-medium text-emerald-700">
                            {flash.success}
                        </p>
                    )}

                    {diligence_requests.length === 0 ? (
                        <div className="border-t border-zinc-200 pt-8">
                            <p className="text-[15px] text-zinc-600">No requests yet.</p>
                            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-zinc-500">
                                When Pinpoint needs input after a founder call, it shows up here.
                            </p>
                        </div>
                    ) : (
                        <>
                            {awaiting.length > 0 && (
                                <section className="space-y-6">
                                    {awaiting.map((req) => (
                                        <div key={req.id}>
                                            <p className="text-[13px] text-zinc-500">Needs your response</p>
                                            <h2 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-zinc-950">
                                                {req.subject}
                                            </h2>
                                            <p className="mt-1 text-[13px] text-zinc-500">
                                                {categoryLabel(req.category)}
                                                <span className="mx-1.5 text-zinc-300">·</span>
                                                {formatDate(req.created_at)}
                                            </p>
                                            <p className="mt-3 max-w-xl text-[14px] leading-relaxed whitespace-pre-wrap text-zinc-600">
                                                {req.request_details}
                                            </p>
                                            {req.admin_instructions_for_founder && (
                                                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-zinc-500">
                                                    Pinpoint note: {req.admin_instructions_for_founder}
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openModal(req)}
                                                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#3A54A5] px-5 text-[13px] font-semibold text-white hover:bg-[#2D4182]"
                                            >
                                                Respond
                                            </button>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {other.length > 0 && (
                                <section>
                                    <h2 className="text-[15px] font-semibold text-zinc-950">
                                        {awaiting.length > 0 ? 'Earlier' : 'Requests'}
                                    </h2>
                                    <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
                                        {other.map((req) => {
                                            const tone = statusTone(req.status);
                                            return (
                                                <li key={req.id} className="py-4">
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <h3 className="min-w-0 truncate text-[14px] font-semibold text-zinc-950">
                                                            {req.subject}
                                                        </h3>
                                                        <span
                                                            className={cn(
                                                                'shrink-0 text-[12px] font-semibold',
                                                                tone === 'ok' && 'text-emerald-700',
                                                                tone === 'bad' && 'text-rose-700',
                                                                tone === 'wait' && 'text-[#3A54A5]',
                                                                tone === 'action' && 'text-amber-700',
                                                            )}
                                                        >
                                                            {req.founder_facing_status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[12px] text-zinc-400">
                                                        {categoryLabel(req.category)} · {formatDate(req.created_at)}
                                                    </p>
                                                    {req.founder_notes_to_admin && (
                                                        <p className="mt-2 max-w-xl text-[13px] leading-snug text-zinc-600">
                                                            Your reply: {req.founder_notes_to_admin}
                                                        </p>
                                                    )}
                                                    {(req.status === 'founder_responded' || req.status === 'waiting_for_founder') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(req)}
                                                            className="mt-3 text-[13px] font-semibold text-[#3A54A5] hover:text-[#2D4182]"
                                                        >
                                                            {req.founder_notes_to_admin ? 'Update reply' : 'Respond'}
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>

            {activeReq && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[12px] text-zinc-400">{categoryLabel(activeReq.category)}</p>
                                <h2 className="mt-0.5 text-[1.125rem] font-semibold text-zinc-950">{activeReq.subject}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg px-2 py-1 text-[13px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                Close
                            </button>
                        </div>

                        <p className="mt-4 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-600">
                            {activeReq.request_details}
                        </p>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <label className="block text-[13px] font-medium text-zinc-700">
                                Your reply to Pinpoint
                                <textarea
                                    rows={5}
                                    required
                                    value={responseContent}
                                    onChange={(e) => setResponseContent(e.target.value)}
                                    placeholder="Details Pinpoint can use when responding to the investor…"
                                    className="mt-1.5 w-full resize-none border border-zinc-200 bg-white px-3 py-2.5 text-[14px] text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-none"
                                />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !responseContent.trim()}
                                    className="rounded-xl bg-[#3A54A5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2D4182] disabled:opacity-50"
                                >
                                    {submitting ? 'Sending…' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </FounderLayout>
    );
}
