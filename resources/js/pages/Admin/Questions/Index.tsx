import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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
    potential:  { bg: 'rgba(37,99,235,0.12)',  text: '#93B4FF', border: 'rgba(37,99,235,0.3)' },
    agility:    { bg: 'rgba(124,58,237,0.12)', text: '#C4B5FD', border: 'rgba(124,58,237,0.3)' },
    risk:       { bg: 'rgba(220,38,38,0.12)',  text: '#FCA5A5', border: 'rgba(220,38,38,0.3)' },
    alignment:  { bg: 'rgba(217,119,6,0.12)',  text: '#FCD34D', border: 'rgba(217,119,6,0.3)' },
    governance: { bg: 'rgba(5,150,105,0.12)',  text: '#6EE7B7', border: 'rgba(5,150,105,0.3)' },
    operations: { bg: 'rgba(8,145,178,0.12)',  text: '#67E8F9', border: 'rgba(8,145,178,0.3)' },
    need:       { bg: 'rgba(190,24,93,0.12)',  text: '#F9A8D4', border: 'rgba(190,24,93,0.3)' },
};

function PillarBadge({ pillar }: { pillar: string }) {
    const s = PILLAR_COLORS[pillar] ?? { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8', border: 'rgba(100,116,139,0.3)' };
    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
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
                            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#788CBA]">
                                Admin
                            </p>
                            <h1 className="text-2xl font-bold text-[#ECF0F9]">Diagnostic Questions</h1>
                        </div>
                        <Link
                            href={route('admin.waitlist.index')}
                            className="text-xs font-medium text-[#788CBA] transition-colors hover:text-[#ECF0F9]"
                        >
                            ← Waitlist
                        </Link>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                        {/* Table header */}
                        <div className="grid grid-cols-[40px_120px_1fr_60px_70px_72px] gap-4 border-b border-[#232C43] bg-[#0C1427]/50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#576FA8]">
                            <span>#</span>
                            <span>Pillar</span>
                            <span>Question</span>
                            <span className="text-right">Pts</span>
                            <span className="text-center">Active</span>
                            <span />
                        </div>

                        {/* Rows */}
                        {questions.data.map((q) => (
                            <div
                                key={q.id}
                                className="grid grid-cols-[40px_120px_1fr_60px_70px_72px] items-center gap-4 border-b border-[#232C43] px-5 py-4 transition-colors duration-150 last:border-0 hover:bg-[#1B294B]/30"
                            >
                                {/* Order */}
                                <span className="text-sm font-mono font-semibold text-[#576FA8]">
                                    {q.order}
                                </span>

                                {/* Pillar */}
                                <PillarBadge pillar={q.pillar} />

                                {/* Question text truncated */}
                                <p
                                    className="truncate text-sm text-[#ECF0F9]"
                                    title={q.question_text}
                                >
                                    {q.question_text}
                                </p>

                                {/* Points */}
                                <span className="text-right text-sm font-semibold tabular-nums text-[#788CBA]">
                                    {q.points}
                                </span>

                                {/* Active toggle (read-only indicator — editing happens on edit page) */}
                                <div className="flex justify-center">
                                    <span
                                        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${q.is_active ? 'bg-emerald-500/50' : 'bg-[#232C43]'}`}
                                    >
                                        <span
                                            className={`mx-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${q.is_active ? 'translate-x-[16px]' : 'translate-x-0'}`}
                                        />
                                    </span>
                                </div>

                                {/* Edit button */}
                                <div className="flex justify-end">
                                    <Link
                                        href={route('admin.questions.edit', q.id)}
                                        className="rounded-lg border border-[#232C43] bg-[#1B294B]/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#788CBA] transition-all duration-150 hover:bg-[#1B294B] hover:text-[#ECF0F9]"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {questions.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-[#576FA8]">
                                {questions.total} questions
                            </p>
                            <div className="flex gap-1">
                                {questions.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                                                link.active 
                                                    ? 'border-[#4468BB] bg-[#4468BB]/10 text-[#4468BB]' 
                                                    : 'border-[#232C43] bg-[#101623] text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9]'
                                            }`}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="rounded-lg px-3 py-1.5 text-xs text-[#576FA8]"
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
