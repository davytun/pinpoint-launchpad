import { Head, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    cooldown_days: number;
    investor_cta: { label: string; url: string; enabled: boolean };
    flash?: { success?: string };
    [key: string]: unknown;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AdminSettingsIndex() {
    const { cooldown_days, investor_cta, flash } = usePage<PageProps>().props;

    const form = useForm({
        diagnostic_cooldown_days: cooldown_days,
        investor_cta_label: investor_cta.label,
        investor_cta_url: investor_cta.url,
        investor_cta_enabled: investor_cta.enabled,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(route('admin.settings.update'));
    }

    return (
        <AdminLayout>
            <Head title="Settings — Admin" />

            {/* ── Outer Card Container  ────────────────────────── */}
            <div className="flex min-h-0 flex-1 flex-col overflow-auto rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                <form onSubmit={submit} noValidate className="flex flex-col">
                    {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                    <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-zinc-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Settings</h1>
                            </div>
                            <p className="mt-0.5 text-[12px] font-normal text-zinc-500">Platform configuration</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing ? (
                                    <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                <span>Save Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Flash Messages (Inline) */}
                    {flash?.success && (
                        <div className="border-b border-zinc-100 bg-white px-6 py-3 text-right">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-emerald-700">
                                {flash.success}
                            </span>
                        </div>
                    )}

                    {/* ── Settings Workspace ────────────── */}
                    <div className="flex-1 bg-zinc-50/30 p-6 sm:p-8">
                        <div className="mx-auto max-w-3xl space-y-8">
                            {/* ── Section: Diagnostic Settings ── */}
                            <div>
                                <h2 className="mb-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Diagnostic Settings</h2>
                                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
                                    <div className="mb-6 flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-zinc-900">Diagnostic Cooldown Days</p>
                                            <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500">
                                                Number of days a founder must wait before retaking after scoring below 65%
                                            </p>
                                        </div>

                                        {/* Current value pill */}
                                        <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-600 tabular-nums shadow-xs">
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
                                            className="w-24 rounded-xl border border-zinc-200/90 bg-[#F9F9FB] px-4 py-2.5 text-[13px] text-zinc-900 tabular-nums transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none"
                                        />
                                        <span className="text-xs font-semibold text-zinc-500">days</span>
                                    </div>

                                    {form.errors.diagnostic_cooldown_days && (
                                        <p className="mt-2 text-xs font-semibold text-rose-600">{form.errors.diagnostic_cooldown_days}</p>
                                    )}
                                </div>
                            </div>

                            {/* ── Section: Investor Landing CTA ── */}
                            <div>
                                <h2 className="mb-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Investor Portal</h2>
                                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
                                    <div className="mb-6">
                                        <p className="text-sm font-bold text-zinc-900">Landing Call-To-Action</p>
                                        <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500">
                                            Controls the single primary action shown on the public investor landing page.
                                        </p>
                                    </div>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Button label</span>
                                            <input
                                                value={form.data.investor_cta_label}
                                                onChange={(e) => form.setData('investor_cta_label', e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] px-4 py-2.5 text-[13px] font-medium text-zinc-900 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">Destination URL</span>
                                            <input
                                                value={form.data.investor_cta_url}
                                                onChange={(e) => form.setData('investor_cta_url', e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] px-4 py-2.5 text-[13px] font-medium text-zinc-900 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-6 border-t border-zinc-100 pt-5">
                                        <label className="flex items-center gap-3 text-[13px] font-semibold text-zinc-700">
                                            <input
                                                type="checkbox"
                                                checked={form.data.investor_cta_enabled}
                                                onChange={(e) => form.setData('investor_cta_enabled', e.target.checked)}
                                                className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                            />
                                            Show the CTA on the investor landing page
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
