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



    return (
        <AdminLayout>
            <Head title="Settings — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#ECF0F9]">Settings</h1>
                        <p className="mt-1 text-sm text-[#788CBA]">Platform configuration</p>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    {/* Settings card */}
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-7">
                        <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#576FA8]">
                            Diagnostic Settings
                        </h2>

                        <form onSubmit={submit} noValidate>

                            {/* Setting row */}
                            <div className="rounded-xl border border-[#232C43] bg-[#0C1427]/50 p-5">
                                <div className="mb-4 flex items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#ECF0F9]">
                                            Diagnostic Cooldown Days
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-[#788CBA]">
                                            Number of days a founder must wait before retaking after scoring below 65%
                                        </p>
                                    </div>

                                    {/* Current value pill */}
                                    <span className="shrink-0 rounded-full border border-[#4468BB]/30 bg-[#4468BB]/10 px-3 py-1 text-xs font-semibold tabular-nums text-[#4468BB]">
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
                                        className="w-24 rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm tabular-nums text-[#ECF0F9] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                                    />
                                    <span className="text-sm text-[#576FA8]">
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
                            <div className="my-6 h-px bg-[#232C43]" />

                            {/* Save */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex items-center gap-2 rounded-lg bg-[#4468BB] px-6 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#3C53A8] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
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
