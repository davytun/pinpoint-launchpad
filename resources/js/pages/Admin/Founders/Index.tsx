import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Search, UserPlus, Zap } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analyst {
    id: number;
    name: string;
    email: string;
}

interface FounderRow {
    id: number;
    full_name: string | null;
    company_name: string | null;
    email: string;
    score: number | null;
    score_band: string | null;
    tier: string | null;
    audit_status: string | null;
    assigned_analyst: { id: number; name: string } | null;
    created_at: string;
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
    founders: Paginated<FounderRow>;
    analysts: Analyst[];
    user_role: 'superadmin' | 'analyst' | 'support';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const auditStatusColors: Record<string, string> = {
    pending: 'bg-zinc-100 text-zinc-650 border border-zinc-200',
    in_progress: 'bg-amber-50 text-amber-700 border border-amber-250',
    needs_info: 'bg-red-50 text-red-700 border border-red-250',
    on_hold: 'bg-orange-50 text-orange-700 border border-orange-250',
    complete: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
};

const auditStatusLabel: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    needs_info: 'Needs Info',
    on_hold: 'On Hold',
    complete: 'Complete',
};

const scoreBandColor: Record<string, string> = {
    low: 'text-red-600 font-bold',
    mid_low: 'text-amber-600 font-bold',
    mid_high: 'text-[#3A54A5] font-bold',
    high: 'text-emerald-650 font-bold',
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({
    founderId,
    founderName,
    analysts,
    onClose,
}: {
    founderId: number;
    founderName: string;
    analysts: Analyst[];
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({
        analyst_id: '',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.founders.assign', { founder: founderId }), {
            onSuccess: () => onClose(),
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-1 text-lg font-extrabold text-zinc-950">Assign Analyst</h2>
                <p className="text-zinc-550 mb-5 text-sm">{founderName}</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-zinc-500">Analyst</label>
                        <select
                            value={data.analyst_id}
                            onChange={(e) => setData('analyst_id', e.target.value)}
                            className="text-zinc-955 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xs focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                            required
                        >
                            <option value="">Select analyst…</option>
                            {analysts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} ({a.email})
                                </option>
                            ))}
                        </select>
                        {errors.analyst_id && <p className="text-red-650 mt-1 text-xs">{errors.analyst_id}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-zinc-500">Notes (optional)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Internal notes for the analyst…"
                            className="text-zinc-955 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-zinc-650 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#3A54A5] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-50"
                        >
                            {processing ? 'Assigning…' : 'Assign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminFoundersIndex({ founders, analysts, user_role }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const isSuperAdmin = user_role === 'superadmin';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('all');
    const [assignModal, setAssignModal] = useState<{ id: number; name: string } | null>(null);

    const statuses = ['all', 'pending', 'in_progress', 'needs_info', 'on_hold', 'complete'];

    const filtered = founders.data.filter((f) => {
        const matchSearch =
            !search ||
            (f.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (f.company_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            f.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || f.audit_status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <AdminLayout>
            <Head title="Founders — Admin" />

            {assignModal && (
                <AssignModal founderId={assignModal.id} founderName={assignModal.name} analysts={analysts} onClose={() => setAssignModal(null)} />
            )}

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-zinc-950">Founders</h1>
                        <p className="text-zinc-555 mt-1 text-sm font-medium">{founders.total} total</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative max-w-xs min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or company…"
                            className="text-zinc-955 w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-4 pl-9 text-sm shadow-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={cn(
                                    'rounded-full border px-3.5 py-1.5 text-xs font-bold capitalize shadow-xs transition-colors',
                                    statusFilter === s
                                        ? 'border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5]'
                                        : 'text-zinc-650 border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-950',
                                )}
                            >
                                {s === 'all' ? 'All' : (auditStatusLabel[s] ?? s)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                    {filtered.length === 0 ? (
                        <div className="text-zinc-550 py-16 text-center text-sm font-medium">No founders match your filter.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                        {['Founder', 'Company', 'Score', 'Tier', 'Audit Status', 'Assigned Analyst', 'Actions'].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/80">
                                    {filtered.map((f) => (
                                        <tr key={f.id} className="group transition-colors hover:bg-zinc-50/40">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-zinc-900">{f.full_name ?? '—'}</p>
                                                <p className="max-w-[140px] truncate text-xs text-zinc-500">{f.email}</p>
                                            </td>
                                            <td className="text-zinc-650 px-5 py-4 font-medium">{f.company_name ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${scoreBandColor[f.score_band ?? ''] ?? 'text-zinc-800'}`}>
                                                        {f.score ?? '—'}
                                                    </span>
                                                    {(f.score ?? 0) > 85 && (
                                                        <span title="High Velocity">
                                                            <Zap className="size-3.5 text-amber-500" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-zinc-650 px-5 py-4 font-medium capitalize">{f.tier ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                {f.audit_status ? (
                                                    <span
                                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${auditStatusColors[f.audit_status] ?? 'border-zinc-200 bg-zinc-100 text-zinc-500'}`}
                                                    >
                                                        {auditStatusLabel[f.audit_status] ?? f.audit_status}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-zinc-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {f.assigned_analyst ? (
                                                    <span className="text-zinc-650 text-sm font-semibold">{f.assigned_analyst.name}</span>
                                                ) : (
                                                    <span className="border-amber-250 rounded-full border bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.founders.show', { founder: f.id })}
                                                        className="text-xs font-extrabold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#2D4182]"
                                                    >
                                                        View
                                                    </Link>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => setAssignModal({ id: f.id, name: f.full_name ?? f.email })}
                                                            className="text-zinc-550 flex items-center gap-1 text-xs font-extrabold tracking-wider uppercase transition-colors hover:text-zinc-950"
                                                        >
                                                            <UserPlus className="size-3" />
                                                            Assign
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {founders.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-zinc-500">
                        <span>
                            Page {founders.current_page} of {founders.last_page}
                        </span>
                        <div className="flex gap-2">
                            {founders.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={cn(
                                            'rounded-lg border px-3 py-1.5 text-xs shadow-xs transition-colors',
                                            link.active
                                                ? 'border-transparent bg-[#3A54A5] text-white'
                                                : 'text-zinc-650 hover:bg-zinc-150 border-zinc-200 bg-white hover:text-zinc-950',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : null,
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
