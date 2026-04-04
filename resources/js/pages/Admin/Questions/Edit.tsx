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
        sub_text:      question.sub_text ?? '',
        points:        question.points,
        is_active:     question.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(route('admin.questions.update', question.id));
    }

    const inputStyle = {
        background:  'rgba(255,255,255,0.04)',
        border:      '1px solid rgba(255,255,255,0.10)',
        color:       'white',
        borderRadius: '0.75rem',
        outline:     'none',
        transition:  'border-color 0.15s',
    };

    return (
        <>
            <Head title={`Edit Q${question.order} — Admin`} />

            <div
                className="min-h-screen px-5 py-10 sm:px-8"
                style={{ background: '#0A0F1A' }}
            >
                <div className="mx-auto max-w-2xl">

                    {/* Back link */}
                    <Link
                        href={route('admin.questions.index')}
                        className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.70)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
                    >
                        ← Back to Questions
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <p
                            className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: 'rgba(255,255,255,0.28)' }}
                        >
                            Admin · Question {question.order}
                        </p>
                        <h1 className="text-xl font-bold text-white">
                            Edit Question
                        </h1>
                        <p
                            className="mt-1 text-sm capitalize"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                            Pillar: {question.pillar}
                        </p>
                    </div>

                    {/* Form card */}
                    <div
                        className="rounded-2xl border p-7"
                        style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                            background:  'rgba(255,255,255,0.025)',
                        }}
                    >
                        <form onSubmit={submit} noValidate className="space-y-6">

                            {/* question_text */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="question_text"
                                    className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                                    style={{ color: 'rgba(255,255,255,0.35)' }}
                                >
                                    Question Text
                                </label>
                                <textarea
                                    id="question_text"
                                    rows={3}
                                    value={form.data.question_text}
                                    onChange={e => form.setData('question_text', e.target.value)}
                                    className="w-full resize-y px-4 py-3 text-sm leading-relaxed"
                                    style={inputStyle}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                                />
                                {form.errors.question_text && (
                                    <p className="text-xs text-rose-400">{form.errors.question_text}</p>
                                )}
                            </div>

                            {/* sub_text */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="sub_text"
                                    className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                                    style={{ color: 'rgba(255,255,255,0.35)' }}
                                >
                                    Sub Text <span style={{ color: 'rgba(255,255,255,0.20)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
                                </label>
                                <input
                                    id="sub_text"
                                    type="text"
                                    value={form.data.sub_text}
                                    onChange={e => form.setData('sub_text', e.target.value)}
                                    placeholder="Clarifying context shown below the question"
                                    className="w-full px-4 py-3 text-sm"
                                    style={inputStyle}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                                />
                                {form.errors.sub_text && (
                                    <p className="text-xs text-rose-400">{form.errors.sub_text}</p>
                                )}
                            </div>

                            {/* points */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="points"
                                    className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                                    style={{ color: 'rgba(255,255,255,0.35)' }}
                                >
                                    Points <span style={{ color: 'rgba(255,255,255,0.20)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(1–20)</span>
                                </label>
                                <input
                                    id="points"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={form.data.points}
                                    onChange={e => form.setData('points', parseInt(e.target.value, 10) || 1)}
                                    className="w-28 px-4 py-3 text-sm tabular-nums"
                                    style={inputStyle}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                                />
                                {form.errors.points && (
                                    <p className="text-xs text-rose-400">{form.errors.points}</p>
                                )}
                            </div>

                            {/* is_active toggle */}
                            <div className="flex items-center justify-between rounded-xl border px-4 py-3.5"
                                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">Active</p>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                        Inactive questions are hidden from the diagnostic
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={form.data.is_active}
                                    onClick={() => form.setData('is_active', !form.data.is_active)}
                                    className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
                                    style={{
                                        background: form.data.is_active
                                            ? 'rgba(5,150,105,0.7)'
                                            : 'rgba(255,255,255,0.12)',
                                    }}
                                >
                                    <span
                                        className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                                        style={{
                                            transform: form.data.is_active ? 'translateX(20px)' : 'translateX(2px)',
                                        }}
                                    />
                                </button>
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

                            {/* Save */}
                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('admin.questions.index')}
                                    className="text-sm transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.30)' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.60)')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.30)')}
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        background: '#2563EB',
                                        boxShadow: '0 0 20px rgba(37,99,235,0.30)',
                                    }}
                                    onMouseEnter={e => {
                                        if (!form.processing) (e.currentTarget as HTMLButtonElement).style.background = '#1D4ED8';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = '#2563EB';
                                    }}
                                >
                                    {form.processing ? (
                                        <>
                                            <span
                                                className="h-4 w-4 animate-spin rounded-full border-2"
                                                style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }}
                                            />
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
        </>
    );
}
