import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'contacted' | 'replied';

interface Application {
    id: number;
    name: string;
    email: string;
    company: string;
    country: string;
    stage: string;
    raise_target: string;
    message: string | null;
    status: Status;
    created_at: string;
}

interface PaginatedApplications {
    data: Application[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface PageProps {
    applications: PaginatedApplications;
    activeStatus: 'all' | Status;
    statusCounts: Record<'all' | Status, number>;
    desk?: 'platform' | 'founder';
}

const stageLabels: Record<string, string> = {
    concept: 'Concept',
    seed: 'Seed',
    growth: 'Growth',
};

const statusLabel: Record<Status, string> = {
    pending: 'New',
    contacted: 'In review',
    replied: 'Replied',
};

const filterTabs: { key: 'all' | Status; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'New' },
    { key: 'contacted', label: 'In review' },
    { key: 'replied', label: 'Replied' },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function AssessmentsIndex({ applications, activeStatus, statusCounts, desk = 'platform' }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; info?: string } }>().props;
    const [submitting, setSubmitting] = useState<number | null>(null);

    const basePath = desk === 'founder' ? '/admin/founder/assessments' : '/admin/assessments';
    const openCount = (statusCounts.pending ?? 0) + (statusCounts.contacted ?? 0);

    function setStatus(status: string) {
        router.get(basePath, status === 'all' ? {} : { status }, { preserveState: true, replace: true });
    }

    function markInReview(application: Application) {
        setSubmitting(application.id);
        router.patch(`${basePath}/${application.id}/review`, {}, { preserveScroll: true, onFinish: () => setSubmitting(null) });
    }

    function markScopeSent(application: Application) {
        setSubmitting(application.id);
        router.patch(`${basePath}/${application.id}/scope-sent`, {}, { preserveScroll: true, onFinish: () => setSubmitting(null) });
    }

    const emptyCopy =
        activeStatus === 'pending'
            ? 'No new applications right now.'
            : activeStatus === 'contacted'
              ? 'Nothing is in review.'
              : activeStatus === 'replied'
                ? 'No replies sent yet.'
                : 'No assessment applications yet.';

    return (
        <AdminLayout>
            <Head title="Assessments" />

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-7 sm:px-8 lg:px-10">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
                        <div>
                            <h1 className="text-[1.5rem] font-semibold tracking-tight text-zinc-950">Assessments</h1>
                            <p className="mt-1 text-[13px] text-zinc-500">{openCount} open · review, then send scope and fee</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-5">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setStatus(tab.key)}
                                    className={cn(
                                        'border-b-2 pb-1 text-[13px] font-medium transition-colors',
                                        activeStatus === tab.key
                                            ? 'border-[#3A54A5] text-zinc-950'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    )}
                                >
                                    {tab.label}
                                    <span className="ml-1.5 tabular-nums text-zinc-400">{statusCounts[tab.key] ?? 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {(flash.success || flash.error || flash.info) && (
                        <div
                            className={cn(
                                'mt-5 border-l-2 px-3 py-2 text-[13px] font-medium',
                                flash.error && 'border-rose-500 bg-rose-50/60 text-rose-800',
                                flash.success && !flash.error && 'border-emerald-500 bg-emerald-50/60 text-emerald-800',
                                flash.info && !flash.success && !flash.error && 'border-sky-500 bg-sky-50/60 text-sky-800',
                            )}
                        >
                            {flash.success ?? flash.error ?? flash.info}
                        </div>
                    )}

                    <div className="mt-5 overflow-x-auto">
                        {applications.data.length === 0 ? (
                            <p className="py-16 text-center text-[13px] text-zinc-500">{emptyCopy}</p>
                        ) : (
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Company
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Stage
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Raise
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Status
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Date
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.data.map((application) => {
                                        const busy = submitting === application.id;

                                        return (
                                            <tr key={application.id} className="border-b border-zinc-100 hover:bg-zinc-50/60">
                                                <td className="px-3 py-3.5 align-middle">
                                                    <p className="text-[14px] font-semibold text-zinc-950">{application.company}</p>
                                                    <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                                                        {application.name} · {application.email}
                                                    </p>
                                                    <p className="mt-0.5 text-[12px] text-zinc-400">{application.country}</p>
                                                    {application.message && (
                                                        <p className="mt-1 max-w-sm text-[12px] text-zinc-500">{application.message}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-[13px] text-zinc-700">
                                                    {stageLabels[application.stage] ?? application.stage}
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-[13px] text-zinc-700">{application.raise_target}</td>
                                                <td className="px-3 py-3.5 align-middle">
                                                    <span
                                                        className={cn(
                                                            'text-[13px] font-medium',
                                                            application.status === 'replied' && 'text-emerald-700',
                                                            application.status === 'contacted' && 'text-[#3A54A5]',
                                                            application.status === 'pending' && 'text-amber-700',
                                                        )}
                                                    >
                                                        {statusLabel[application.status]}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-[13px] text-zinc-500">
                                                    {formatDate(application.created_at)}
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-right">
                                                    <div className="inline-flex items-center justify-end gap-2">
                                                        {application.status === 'pending' && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => markInReview(application)}
                                                                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                                            >
                                                                {busy ? 'Saving…' : 'Mark in review'}
                                                            </button>
                                                        )}
                                                        {application.status === 'contacted' && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => markScopeSent(application)}
                                                                className="rounded-lg bg-[#3A54A5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2D4182] disabled:opacity-50"
                                                            >
                                                                {busy ? 'Saving…' : 'Scope and fee sent'}
                                                            </button>
                                                        )}
                                                        {application.status !== 'replied' && (
                                                            <a
                                                                href={`mailto:${application.email}?subject=${encodeURIComponent(`Pinpoint assessment — ${application.company}`)}`}
                                                                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                                                            >
                                                                Email
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {applications.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                            <button
                                type="button"
                                disabled={!applications.prev_page_url}
                                onClick={() => applications.prev_page_url && router.get(applications.prev_page_url)}
                                className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-[12px] text-zinc-400">
                                Page {applications.current_page} of {applications.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={!applications.next_page_url}
                                onClick={() => applications.next_page_url && router.get(applications.next_page_url)}
                                className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
