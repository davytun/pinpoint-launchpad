import { InvestorHeader } from '@/components/investor-header';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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

interface EligibleProfile {
    slug: string;
    company_name: string;
    sector?: string | null;
}

const CATEGORIES = [
    { value: 'financial', label: 'Financial' },
    { value: 'operational', label: 'Operational' },
    { value: 'legal_governance', label: 'Legal / Governance' },
    { value: 'product_market', label: 'Product / Market' },
    { value: 'document_request', label: 'Document request' },
    { value: 'general_clarification', label: 'General clarification' },
] as const;

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function categoryLabel(value: string) {
    return CATEGORIES.find((c) => c.value === value)?.label ?? value.replaceAll('_', ' ');
}

function statusTone(status: string): 'ok' | 'wait' | 'bad' {
    if (status === 'resolved' || status.toLowerCase().includes('ready') || status.toLowerCase().includes('answered')) {
        return 'ok';
    }
    if (status === 'declined' || status.toLowerCase().includes('declined')) {
        return 'bad';
    }
    return 'wait';
}

function DiligenceSubmitForm({ profiles }: { profiles: EligibleProfile[] }) {
    const [slug, setSlug] = useState(profiles[0]?.slug ?? '');
    const form = useForm({
        category: 'general_clarification' as (typeof CATEGORIES)[number]['value'],
        subject: '',
        request_details: '',
        data_room_required: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!slug) return;
        form.post(route('investor.diligence.store', slug), {
            onSuccess: () => form.reset('subject', 'request_details', 'data_room_required'),
        });
    }

    if (profiles.length === 0) {
        return null;
    }

    const field =
        'mt-1.5 w-full border border-zinc-200 bg-white px-3 py-2.5 text-[14px] text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-none';

    return (
        <form onSubmit={submit} className="mb-10 border-b border-zinc-200 pb-10">
            <h2 className="text-[15px] font-semibold text-zinc-950">New inquiry</h2>
            <p className="mt-1 text-[13px] text-zinc-500">After a completed founder call. Pinpoint coordinates the answer.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] font-medium text-zinc-700">
                    Startup
                    <select value={slug} onChange={(e) => setSlug(e.target.value)} className={field} required>
                        {profiles.map((p) => (
                            <option key={p.slug} value={p.slug}>
                                {p.company_name}
                                {p.sector ? ` · ${p.sector}` : ''}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block text-[13px] font-medium text-zinc-700">
                    Category
                    <select
                        value={form.data.category}
                        onChange={(e) => form.setData('category', e.target.value as typeof form.data.category)}
                        className={field}
                        required
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <label className="mt-4 block text-[13px] font-medium text-zinc-700">
                Subject
                <input
                    type="text"
                    value={form.data.subject}
                    onChange={(e) => form.setData('subject', e.target.value)}
                    maxLength={255}
                    className={field}
                    placeholder="e.g. Clarification on Q3 gross margins"
                    required
                />
                {form.errors.subject && <p className="mt-1 text-[12px] text-rose-600">{form.errors.subject}</p>}
            </label>

            <label className="mt-4 block text-[13px] font-medium text-zinc-700">
                Details
                <textarea
                    value={form.data.request_details}
                    onChange={(e) => form.setData('request_details', e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className={cn(field, 'resize-none')}
                    placeholder="What should Pinpoint ask the founder?"
                    required
                />
                {form.errors.request_details && (
                    <p className="mt-1 text-[12px] text-rose-600">{form.errors.request_details}</p>
                )}
            </label>

            <label className="mt-4 flex items-center gap-2 text-[13px] text-zinc-700">
                <input
                    type="checkbox"
                    checked={form.data.data_room_required}
                    onChange={(e) => form.setData('data_room_required', e.target.checked)}
                    className="rounded border-zinc-300"
                />
                May need data room materials
            </label>

            <button
                type="submit"
                disabled={form.processing || !slug}
                className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-[#3A54A5] px-4 text-[13px] font-semibold text-white hover:bg-[#2D4182] disabled:opacity-50"
            >
                {form.processing ? 'Submitting…' : 'Submit inquiry'}
            </button>
        </form>
    );
}

export default function DiligenceIndex({
    diligence_requests,
    eligible_profiles = [],
}: {
    diligence_requests: DiligenceRequest[];
    eligible_profiles?: EligibleProfile[];
}) {
    return (
        <main className="min-h-screen bg-stone-50 text-zinc-900 antialiased">
            <Head title="Diligence — Pinpoint" />
            <InvestorHeader activeTab="diligence" />

            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <header className="mb-6">
                    <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-zinc-950">Diligence</h1>
                    <p className="mt-1 text-[14px] text-zinc-500">Post-call inquiries mediated by Pinpoint.</p>
                </header>

                <DiligenceSubmitForm profiles={eligible_profiles} />

                {diligence_requests.length === 0 ? (
                    <div className="border-t border-zinc-200 pt-8">
                        <p className="text-[15px] text-zinc-600">No inquiries yet.</p>
                        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-zinc-500">
                            {eligible_profiles.length > 0
                                ? 'Use the form above after a completed founder introduction.'
                                : 'Opens after Pinpoint marks a founder call as completed.'}
                        </p>
                        {eligible_profiles.length === 0 && (
                            <Link
                                href={route('investor.interests.index')}
                                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3A54A5] hover:text-[#2D4182]"
                            >
                                My Interests
                                <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
                        {diligence_requests.map((req) => {
                            const tone = statusTone(req.status);
                            const company = req.profile.founder?.company_name ?? 'Startup';

                            return (
                                <li key={req.id} className="py-4">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h2 className="min-w-0 truncate text-[15px] font-semibold text-zinc-950">
                                            {req.subject}
                                        </h2>
                                        <span
                                            className={cn(
                                                'shrink-0 text-[12px] font-semibold',
                                                tone === 'ok' && 'text-emerald-700',
                                                tone === 'bad' && 'text-rose-700',
                                                tone === 'wait' && 'text-[#3A54A5]',
                                            )}
                                        >
                                            {req.investor_facing_status}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[12px] text-zinc-400">
                                        {company}
                                        <span className="mx-1.5 text-zinc-300">·</span>
                                        {categoryLabel(req.category)}
                                        <span className="mx-1.5 text-zinc-300">·</span>
                                        {formatDate(req.created_at)}
                                        {req.data_room_required ? ' · Needs data room' : ''}
                                    </p>

                                    <p className="mt-2 text-[13px] leading-snug whitespace-pre-wrap text-zinc-600">
                                        {req.request_details}
                                    </p>

                                    {req.investor_visible_response && (
                                        <div className="mt-3 border-l-2 border-emerald-500 pl-3">
                                            <p className="text-[12px] font-semibold text-emerald-800">Pinpoint response</p>
                                            <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-700">
                                                {req.investor_visible_response}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <Link
                                            href={route('investor.spotlight.show', req.profile.slug)}
                                            className="text-[13px] font-medium text-zinc-400 hover:text-zinc-700"
                                        >
                                            Spotlight
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </main>
    );
}
