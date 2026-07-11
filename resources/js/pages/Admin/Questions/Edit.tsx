import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';

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

interface PageProps {
    question: Question;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AdminQuestionsEdit({ question }: PageProps) {
    const form = useForm({
        question_text: question.question_text,
        sub_text: question.sub_text ?? '',
        points: question.points,
        is_active: question.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(route('admin.questions.update', question.id));
    }

    const inputClass =
        'w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-3 text-sm text-[#D8E0F3] placeholder-[#91A7D8] focus:border-[#3A54A5]/50 focus:outline-none focus:ring-1 focus:ring-[#3A54A5]/50 transition-colors';

    return (
        <AdminLayout>
            <Head title={`Edit Q${question.order} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Back link */}
                    <Link
                        href={route('admin.questions.index')}
                        className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#C1CDE8] transition-colors hover:text-[#D8E0F3]"
                    >
                        ← Back to Questions
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-0.5 text-[11px] font-semibold tracking-[0.2em] text-[#91A7D8] uppercase">
                            Admin · Question {question.order}
                        </p>
                        <h1 className="text-2xl font-bold text-[#D8E0F3]">Edit Question</h1>
                        <p className="mt-1 text-sm text-[#C1CDE8] capitalize">Pillar: {question.pillar}</p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-7">
                        <form onSubmit={submit} noValidate className="space-y-6">
                            {/* question_text */}
                            <div className="space-y-1.5">
                                <label htmlFor="question_text" className="block text-[11px] font-semibold tracking-[0.18em] text-[#C1CDE8] uppercase">
                                    Question Text
                                </label>
                                <textarea
                                    id="question_text"
                                    rows={3}
                                    value={form.data.question_text}
                                    onChange={(e) => form.setData('question_text', e.target.value)}
                                    className={`${inputClass} resize-y leading-relaxed`}
                                />
                                {form.errors.question_text && <p className="text-xs text-rose-400">{form.errors.question_text}</p>}
                            </div>

                            {/* sub_text */}
                            <div className="space-y-1.5">
                                <label htmlFor="sub_text" className="block text-[11px] font-semibold tracking-[0.18em] text-[#C1CDE8] uppercase">
                                    Sub Text <span className="font-normal tracking-normal text-[#91A7D8] normal-case">optional</span>
                                </label>
                                <input
                                    id="sub_text"
                                    type="text"
                                    value={form.data.sub_text}
                                    onChange={(e) => form.setData('sub_text', e.target.value)}
                                    placeholder="Clarifying context shown below the question"
                                    className={inputClass}
                                />
                                {form.errors.sub_text && <p className="text-xs text-rose-400">{form.errors.sub_text}</p>}
                            </div>

                            {/* points */}
                            <div className="space-y-1.5">
                                <label htmlFor="points" className="block text-[11px] font-semibold tracking-[0.18em] text-[#C1CDE8] uppercase">
                                    Points <span className="font-normal tracking-normal text-[#91A7D8] normal-case">(1–20)</span>
                                </label>
                                <input
                                    id="points"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={form.data.points}
                                    onChange={(e) => form.setData('points', parseInt(e.target.value, 10) || 1)}
                                    className={`${inputClass} w-28 tabular-nums`}
                                />
                                {form.errors.points && <p className="text-xs text-rose-400">{form.errors.points}</p>}
                            </div>

                            {/* is_active toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-[#232C43] bg-[#0C1427]/50 px-4 py-3.5">
                                <div>
                                    <p className="text-sm font-medium text-[#D8E0F3]">Active</p>
                                    <p className="text-xs text-[#91A7D8]">Inactive questions are hidden from the diagnostic</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={form.data.is_active}
                                    onClick={() => form.setData('is_active', !form.data.is_active)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${form.data.is_active ? 'bg-emerald-500' : 'bg-[#232C43]'}`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${form.data.is_active ? 'translate-x-[20px]' : 'translate-x-[2px]'}`}
                                    />
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-[#232C43]" />

                            {/* Save */}
                            <div className="flex items-center justify-between">
                                <Link href={route('admin.questions.index')} className="text-sm text-[#C1CDE8] transition-colors hover:text-[#D8E0F3]">
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-2 rounded-lg bg-[#3A54A5] px-6 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#2F4587] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                            Saving…
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
