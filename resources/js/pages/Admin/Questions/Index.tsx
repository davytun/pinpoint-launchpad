import { Head, Link, usePage } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
    id: number;
    order: number;
    pillar: string;
    question_text: string;
    sub_text: string | null;
    points: number;
    is_active: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface PageProps {
    questions: Paginated<Question>;
    flash?: { success?: string };
    [key: string]: unknown;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    potential: { bg: 'rgba(37,99,235,0.06)', text: '#1D4ED8', border: 'rgba(37,99,235,0.2)' },
    agility: { bg: 'rgba(124,58,237,0.06)', text: '#6D28D9', border: 'rgba(124,58,237,0.2)' },
    risk: { bg: 'rgba(220,38,38,0.06)', text: '#B91C1C', border: 'rgba(220,38,38,0.2)' },
    alignment: { bg: 'rgba(217,119,6,0.06)', text: '#B45309', border: 'rgba(217,119,6,0.2)' },
    governance: { bg: 'rgba(5,150,105,0.06)', text: '#047857', border: 'rgba(5,150,105,0.2)' },
    operations: { bg: 'rgba(8,145,178,0.06)', text: '#0369A1', border: 'rgba(8,145,178,0.2)' },
    network: { bg: 'rgba(190,24,93,0.06)', text: '#BE185D', border: 'rgba(190,24,93,0.2)' },
};

function PillarBadge({ pillar }: { pillar: string }) {
    const s = PILLAR_COLORS[pillar] ?? { bg: 'rgba(100,116,139,0.06)', text: '#4B5563', border: 'rgba(100,116,139,0.2)' };
    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase shadow-xs"
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
        >
            {pillar}
        </span>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AdminQuestionsIndex() {
    const { questions, flash } = usePage<PageProps>().props;

    return (
        <AdminLayout>
            <Head title="Diagnostic Questions — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header row */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <p className="mb-0.5 text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Admin</p>
                            <h1 className="text-2xl font-extrabold text-zinc-950">Diagnostic Questions</h1>
                        </div>
                        <Link
                            href={route('admin.waitlist.index')}
                            className="text-xs font-bold text-zinc-550 transition-colors hover:text-zinc-955"
                        >
                            ← Waitlist
                        </Link>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold animate-fade-in">
                            {flash.success}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)] animate-fade-in">
                        <div className="overflow-x-auto">
                            <div className="min-w-[720px]">
                                {/* Table header */}
                                <div className="grid grid-cols-[40px_120px_1fr_60px_70px_72px] gap-4 border-b border-zinc-200 bg-zinc-50/50 px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-zinc-500 uppercase">
                                    <span>#</span>
                                    <span>Pillar</span>
                                    <span>Question</span>
                                    <span className="text-right">Pts</span>
                                    <span className="text-center">Active</span>
                                    <span />
                                </div>

                                {/* Rows */}
                                <div className="divide-y divide-zinc-200/80">
                                    {questions.data.map((q) => (
                                        <div
                                            key={q.id}
                                            className="grid grid-cols-[40px_120px_1fr_60px_70px_72px] items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50/40"
                                        >
                                            {/* Order */}
                                            <span className="font-mono text-sm font-bold text-zinc-500">{q.order}</span>

                                            {/* Pillar */}
                                            <PillarBadge pillar={q.pillar} />

                                            {/* Question text truncated */}
                                            <p className="truncate text-sm text-zinc-900 font-semibold" title={q.question_text}>
                                                {q.question_text}
                                            </p>

                                            {/* Points */}
                                            <span className="text-right text-sm font-bold text-zinc-700 tabular-nums">{q.points}</span>

                                            {/* Active toggle (read-only indicator) */}
                                            <div className="flex justify-center">
                                                <span
                                                    className={cn(
                                                        'inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                                                        q.is_active ? 'bg-emerald-600' : 'bg-zinc-200',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'mx-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                                                            q.is_active ? 'translate-x-[16px]' : 'translate-x-0',
                                                        )}
                                                    />
                                                </span>
                                            </div>

                                            {/* Edit button */}
                                            <div className="flex justify-end">
                                                <Link
                                                    href={route('admin.questions.edit', q.id)}
                                                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-zinc-650 uppercase shadow-xs transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-950"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {questions.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between animate-fade-in">
                            <p className="text-xs text-zinc-550 font-semibold">{questions.total} questions</p>
                            <div className="flex gap-1">
                                {questions.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={cn(
                                                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                                                link.active
                                                    ? 'border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5] font-extrabold shadow-xs'
                                                    : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 shadow-xs',
                                            )}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-semibold"
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
