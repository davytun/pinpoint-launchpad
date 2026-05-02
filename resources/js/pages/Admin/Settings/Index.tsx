import { Head, useForm, usePage } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    cooldown_days: number;
    flash?: { success?: string };
    [key: string]: unknown;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AdminSettingsIndex() {
    const { cooldown_days, flash } = usePage<PageProps>().props;

    const form = useForm({
        diagnostic_cooldown_days: cooldown_days,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(route('admin.settings.update'));
    }

    const inputStyle = {
        background:   'rgba(255,255,255,0.04)',
        border:       '1px solid rgba(255,255,255,0.10)',
        color:        'white',
        borderRadius: '0.75rem',
        outline:      'none',
        transition:   'border-color 0.15s',
    };

    return (
        <AdminLayout>
            <Head title="Settings — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="mt-1 text-sm text-slate-500">Platform configuration</p>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div
                            className="mb-6 rounded-xl border px-4 py-3 text-sm"
                            style={{
                                borderColor: 'rgba(5,150,105,0.35)',
                                background:  'rgba(5,150,105,0.08)',
                                color:       '#6EE7B7',
                            }}
                        >
                            {flash.success}
                        </div>
                    )}

                    {/* Settings card */}
                    <div
                        className="rounded-2xl border p-7"
                        style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                            background:  'rgba(255,255,255,0.025)',
                        }}
                    >
                        <h2
                            className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: 'rgba(255,255,255,0.28)' }}
                        >
                            Diagnostic Settings
                        </h2>

                        <form onSubmit={submit} noValidate>

                            {/* Setting row */}
                            <div
                                className="rounded-xl border p-5"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.07)',
                                    background:  'rgba(255,255,255,0.02)',
                                }}
                            >
                                <div className="mb-4 flex items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">
                                            Diagnostic Cooldown Days
                                        </p>
                                        <p
                                            className="mt-1 text-xs leading-relaxed"
                                            style={{ color: 'rgba(255,255,255,0.40)' }}
                                        >
                                            Number of days a founder must wait before retaking after scoring below 65%
                                        </p>
                                    </div>

                                    {/* Current value pill */}
                                    <span
                                        className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold tabular-nums"
                                        style={{
                                            background: 'rgba(37,99,235,0.12)',
                                            border:     '1px solid rgba(37,99,235,0.25)',
                                            color:      '#93B4FF',
                                        }}
                                    >
                                        {cooldown_days}d
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="cooldown_days"
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={form.data.diagnostic_cooldown_days}
                                        onChange={e =>
                                            form.setData(
                                                'diagnostic_cooldown_days',
                                                parseInt(e.target.value, 10) || 1,
                                            )
                                        }
                                        className="w-24 px-4 py-2.5 text-sm tabular-nums"
                                        style={inputStyle}
                                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)')}
                                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: 'rgba(255,255,255,0.35)' }}
                                    >
                                        days
                                    </span>
                                </div>

                                {form.errors.diagnostic_cooldown_days && (
                                    <p className="mt-2 text-xs text-rose-400">
                                        {form.errors.diagnostic_cooldown_days}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="my-6" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

                            {/* Save */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        background: '#2563EB',
                                        boxShadow:  '0 0 20px rgba(37,99,235,0.28)',
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
                                        'Save Settings'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
            </div>
        </AdminLayout>
    );
}
