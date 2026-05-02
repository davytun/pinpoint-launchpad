import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, UserPlus, Zap } from 'lucide-react';
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
    pending:     'bg-slate-700 text-slate-300',
    in_progress: 'bg-amber-500/20 text-amber-400',
    needs_info:  'bg-red-500/20 text-red-400',
    on_hold:     'bg-orange-500/20 text-orange-400',
    complete:    'bg-emerald-500/20 text-emerald-400',
};

const auditStatusLabel: Record<string, string> = {
    pending:     'Pending',
    in_progress: 'In Progress',
    needs_info:  'Needs Info',
    on_hold:     'On Hold',
    complete:    'Complete',
};

const scoreBandColor: Record<string, string> = {
    low:      'text-red-400',
    mid_low:  'text-amber-400',
    mid_high: 'text-blue-400',
    high:     'text-emerald-400',
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({ founderId, founderName, analysts, onClose }: {
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
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0F0F0F] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-1 text-lg font-bold text-white">Assign Analyst</h2>
                <p className="mb-5 text-sm text-slate-400">{founderName}</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Analyst</label>
                        <select
                            value={data.analyst_id}
                            onChange={(e) => setData('analyst_id', e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            required
                        >
                            <option value="">Select analyst…</option>
                            {analysts.map((a) => (
                                <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                            ))}
                        </select>
                        {errors.analyst_id && <p className="mt-1 text-xs text-red-400">{errors.analyst_id}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Notes (optional)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Internal notes for the analyst…"
                            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
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

    const [search, setSearch]       = useState('');
    const [statusFilter, setStatus] = useState('all');
    const [assignModal, setAssignModal] = useState<{ id: number; name: string } | null>(null);

    const statuses = ['all', 'pending', 'in_progress', 'needs_info', 'on_hold', 'complete'];

    const filtered = founders.data.filter((f) => {
        const matchSearch = !search ||
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
                <AssignModal
                    founderId={assignModal.id}
                    founderName={assignModal.name}
                    analysts={analysts}
                    onClose={() => setAssignModal(null)}
                />
            )}

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Founders</h1>
                        <p className="mt-1 text-sm text-slate-500">{founders.total} total</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or company…"
                            className="w-full rounded-xl border border-white/[0.06] bg-[#0A0A0A] pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={[
                                    'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                                    statusFilter === s
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'border border-white/[0.06] text-slate-400 hover:text-white',
                                ].join(' ')}
                            >
                                {s === 'all' ? 'All' : auditStatusLabel[s] ?? s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0A0A]">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-500">No founders match your filter.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        {['Founder', 'Company', 'Score', 'Tier', 'Audit Status', 'Assigned Analyst', 'Actions'].map((h) => (
                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((f) => (
                                        <tr key={f.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-white">{f.full_name ?? '—'}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[140px]">{f.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">{f.company_name ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${scoreBandColor[f.score_band ?? ''] ?? 'text-white'}`}>
                                                        {f.score ?? '—'}
                                                    </span>
                                                    {(f.score ?? 0) > 85 && (
                                                        <Zap className="size-3.5 text-amber-400" title="High Velocity" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 capitalize text-slate-300">{f.tier ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                {f.audit_status ? (
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${auditStatusColors[f.audit_status] ?? 'bg-slate-700 text-slate-300'}`}>
                                                        {auditStatusLabel[f.audit_status] ?? f.audit_status}
                                                    </span>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                {f.assigned_analyst ? (
                                                    <span className="text-sm text-slate-300">{f.assigned_analyst.name}</span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.founders.show', { founder: f.id })}
                                                        className="text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        View
                                                    </Link>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => setAssignModal({ id: f.id, name: f.full_name ?? f.email })}
                                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
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
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                        <span>Page {founders.current_page} of {founders.last_page}</span>
                        <div className="flex gap-2">
                            {founders.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`rounded-lg px-3 py-1.5 border text-xs transition-colors ${link.active ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/[0.06] hover:text-white'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : null
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
