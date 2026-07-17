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
                    <h1 className="text-2xl font-extrabold text-zinc-950">Settings</h1>
                    <p className="text-zinc-555 mt-1 text-sm font-medium">Platform configuration</p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* Settings card */}
                <div className="rounded-2xl border border-white/80 bg-white/30 p-7 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                    <h2 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Diagnostic Settings</h2>

                    <form onSubmit={submit} noValidate>
                        {/* Setting row */}
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 shadow-xs">
                            <div className="mb-4 flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-zinc-900">Diagnostic Cooldown Days</p>
                                    <p className="text-zinc-555 mt-1 text-xs leading-relaxed font-medium">
                                        Number of days a founder must wait before retaking after scoring below 65%
                                    </p>
                                </div>

                                {/* Current value pill */}
                                <span className="shrink-0 rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-3 py-1 text-xs font-bold text-[#3A54A5] tabular-nums shadow-xs">
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
                                    onChange={(e) => form.setData('diagnostic_cooldown_days', parseInt(e.target.value, 10) || 1)}
                                    className="text-zinc-955 w-24 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm tabular-nums shadow-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                                />
                                <span className="text-sm font-semibold text-zinc-500">days</span>
                            </div>

                            {form.errors.diagnostic_cooldown_days && (
                                <p className="mt-2 text-xs font-semibold text-rose-600">{form.errors.diagnostic_cooldown_days}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="my-6 h-px bg-zinc-200" />

                        {/* Save */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex items-center gap-2 rounded-xl bg-[#3A54A5] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-all duration-150 hover:bg-[#2D4182] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
