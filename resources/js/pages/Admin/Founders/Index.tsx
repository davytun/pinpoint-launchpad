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
    mid_high: 'text-[#4468BB]',
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
            <div className="w-full max-w-md rounded-2xl border border-[#232C43] bg-[#101623] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-1 text-lg font-bold text-[#ECF0F9]">Assign Analyst</h2>
                <p className="mb-5 text-sm text-[#788CBA]">{founderName}</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#576FA8]">Analyst</label>
                        <select
                            value={data.analyst_id}
                            onChange={(e) => setData('analyst_id', e.target.value)}
                            className="w-full rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#ECF0F9] focus:outline-none focus:border-[#4468BB]/50"
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
                        <label className="mb-1.5 block text-xs font-semibold text-[#576FA8]">Notes (optional)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Internal notes for the analyst…"
                            className="w-full resize-none rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#ECF0F9] placeholder:text-[#576FA8] focus:outline-none focus:border-[#4468BB]/50"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-xl border border-[#232C43] px-4 py-2 text-sm text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9] transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl border border-[#4468BB]/30 bg-[#1B294B] px-4 py-2 text-sm font-bold text-[#4468BB] hover:bg-[#4468BB]/20 disabled:opacity-50 transition-colors"
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
                        <h1 className="text-2xl font-bold text-[#ECF0F9]">Founders</h1>
                        <p className="mt-1 text-sm text-[#788CBA]">{founders.total} total</p>
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
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#576FA8]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or company…"
                            className="w-full rounded-xl border border-[#232C43] bg-[#101623] pl-9 pr-4 py-2.5 text-sm text-[#ECF0F9] placeholder:text-[#576FA8] focus:outline-none focus:border-[#4468BB]/50"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={[
                                    'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors border',
                                    statusFilter === s
                                        ? 'bg-[#1B294B] text-[#4468BB] border-[#4468BB]/30'
                                        : 'border-[#232C43] text-[#788CBA] hover:bg-[#101623] hover:text-[#ECF0F9]',
                                ].join(' ')}
                            >
                                {s === 'all' ? 'All' : auditStatusLabel[s] ?? s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#788CBA]">No founders match your filter.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        {['Founder', 'Company', 'Score', 'Tier', 'Audit Status', 'Assigned Analyst', 'Actions'].map((h) => (
                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((f) => (
                                        <tr key={f.id} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-[#ECF0F9]">{f.full_name ?? '—'}</p>
                                                <p className="text-xs text-[#788CBA] truncate max-w-[140px]">{f.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-[#788CBA]">{f.company_name ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold ${scoreBandColor[f.score_band ?? ''] ?? 'text-[#ECF0F9]'}`}>
                                                        {f.score ?? '—'}
                                                    </span>
                                                    {(f.score ?? 0) > 85 && (
                                                        <Zap className="size-3.5 text-amber-400" title="High Velocity" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 capitalize text-[#788CBA]">{f.tier ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                {f.audit_status ? (
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${auditStatusColors[f.audit_status] ?? 'bg-[#080B11] text-[#788CBA] border-[#232C43]'}`}>
                                                        {auditStatusLabel[f.audit_status] ?? f.audit_status}
                                                    </span>
                                                ) : <span className="text-[#576FA8]">—</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                {f.assigned_analyst ? (
                                                    <span className="text-sm text-[#788CBA]">{f.assigned_analyst.name}</span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.founders.show', { founder: f.id })}
                                                        className="text-xs font-bold uppercase tracking-wider text-[#4468BB] hover:text-[#788CBA] transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => setAssignModal({ id: f.id, name: f.full_name ?? f.email })}
                                                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#788CBA] hover:text-[#ECF0F9] transition-colors"
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
                    <div className="mt-4 flex items-center justify-between text-sm text-[#576FA8]">
                        <span>Page {founders.current_page} of {founders.last_page}</span>
                        <div className="flex gap-2">
                            {founders.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`rounded-lg px-3 py-1.5 border text-xs transition-colors ${link.active ? 'border-[#4468BB]/30 bg-[#1B294B] text-[#4468BB]' : 'border-[#232C43] hover:text-[#ECF0F9] hover:bg-[#101623]'}`}
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
