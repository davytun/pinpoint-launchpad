import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Search, UserPlus, Zap } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

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
    pending: 'bg-slate-700 text-slate-300',
    in_progress: 'bg-amber-500/20 text-amber-400',
    needs_info: 'bg-red-500/20 text-red-400',
    on_hold: 'bg-orange-500/20 text-orange-400',
    complete: 'bg-emerald-500/20 text-emerald-400',
};

const auditStatusLabel: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    needs_info: 'Needs Info',
    on_hold: 'On Hold',
    complete: 'Complete',
};

const scoreBandColor: Record<string, string> = {
    low: 'text-red-400',
    mid_low: 'text-amber-400',
    mid_high: 'text-[#3A54A5]',
    high: 'text-emerald-400',
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
            <div className="w-full max-w-md rounded-2xl border border-[#232C43] bg-[#101623] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-1 text-lg font-bold text-[#D8E0F3]">Assign Analyst</h2>
                <p className="mb-5 text-sm text-[#C1CDE8]">{founderName}</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#91A7D8]">Analyst</label>
                        <select
                            value={data.analyst_id}
                            onChange={(e) => setData('analyst_id', e.target.value)}
                            className="w-full rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#D8E0F3] focus:border-[#3A54A5]/50 focus:outline-none"
                            required
                        >
                            <option value="">Select analyst…</option>
                            {analysts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} ({a.email})
                                </option>
                            ))}
                        </select>
                        {errors.analyst_id && <p className="mt-1 text-xs text-red-400">{errors.analyst_id}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#91A7D8]">Notes (optional)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Internal notes for the analyst…"
                            className="w-full resize-none rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#D8E0F3] placeholder:text-[#91A7D8] focus:border-[#3A54A5]/50 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[#232C43] px-4 py-2 text-sm text-[#C1CDE8] transition-colors hover:bg-[#1B294B] hover:text-[#D8E0F3]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl border border-[#3A54A5]/30 bg-[#1B294B] px-4 py-2 text-sm font-bold text-[#3A54A5] transition-colors hover:bg-[#3A54A5]/20 disabled:opacity-50"
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
                        <h1 className="text-2xl font-bold text-[#D8E0F3]">Founders</h1>
                        <p className="mt-1 text-sm text-[#C1CDE8]">{founders.total} total</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative max-w-xs min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#91A7D8]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or company…"
                            className="w-full rounded-xl border border-[#232C43] bg-[#101623] py-2.5 pr-4 pl-9 text-sm text-[#D8E0F3] placeholder:text-[#91A7D8] focus:border-[#3A54A5]/50 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={[
                                    'rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                                    statusFilter === s
                                        ? 'border-[#3A54A5]/30 bg-[#1B294B] text-[#3A54A5]'
                                        : 'border-[#232C43] text-[#C1CDE8] hover:bg-[#101623] hover:text-[#D8E0F3]',
                                ].join(' ')}
                            >
                                {s === 'all' ? 'All' : (auditStatusLabel[s] ?? s)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#C1CDE8]">No founders match your filter.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        {['Founder', 'Company', 'Score', 'Tier', 'Audit Status', 'Assigned Analyst', 'Actions'].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-[#91A7D8] uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((f) => (
                                        <tr key={f.id} className="border-b border-[#232C43] transition-colors last:border-0 hover:bg-[#1B294B]/30">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-[#D8E0F3]">{f.full_name ?? '—'}</p>
                                                <p className="max-w-[140px] truncate text-xs text-[#C1CDE8]">{f.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-[#C1CDE8]">{f.company_name ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${scoreBandColor[f.score_band ?? ''] ?? 'text-[#D8E0F3]'}`}>
                                                        {f.score ?? '—'}
                                                    </span>
                                                    {(f.score ?? 0) > 85 && (
                                                        <span title="High Velocity">
                                                            <Zap className="size-3.5 text-amber-400" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[#C1CDE8] capitalize">{f.tier ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                {f.audit_status ? (
                                                    <span
                                                        className={`rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold ${auditStatusColors[f.audit_status] ?? 'border-[#232C43] bg-[#080B11] text-[#C1CDE8]'}`}
                                                    >
                                                        {auditStatusLabel[f.audit_status] ?? f.audit_status}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#91A7D8]">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {f.assigned_analyst ? (
                                                    <span className="text-sm text-[#C1CDE8]">{f.assigned_analyst.name}</span>
                                                ) : (
                                                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.founders.show', { founder: f.id })}
                                                        className="text-xs font-bold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#C1CDE8]"
                                                    >
                                                        View
                                                    </Link>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => setAssignModal({ id: f.id, name: f.full_name ?? f.email })}
                                                            className="flex items-center gap-1 text-xs font-bold tracking-wider text-[#C1CDE8] uppercase transition-colors hover:text-[#D8E0F3]"
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
                    <div className="mt-4 flex items-center justify-between text-sm text-[#91A7D8]">
                        <span>
                            Page {founders.current_page} of {founders.last_page}
                        </span>
                        <div className="flex gap-2">
                            {founders.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${link.active ? 'border-[#3A54A5]/30 bg-[#1B294B] text-[#3A54A5]' : 'border-[#232C43] hover:bg-[#101623] hover:text-[#D8E0F3]'}`}
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
