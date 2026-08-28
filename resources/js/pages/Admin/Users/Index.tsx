import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2, UserPen } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'analyst' | 'support';
    assigned_founders_count: number;
    created_at: string;
    is_self: boolean;
}

interface PageProps {
    users: TeamMember[];
    user_role: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const roleBadge: Record<string, string> = {
    superadmin: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
    analyst: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
    support: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
};

const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin',
    analyst: 'Analyst',
    support: 'Support',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersIndex({ users }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    function destroy(id: number) {
        if (!confirm('Remove this team member? Their audit assignments will be cleared.')) return;
        router.delete(route('admin.users.destroy', { user: id }));
    }

    return (
        <AdminLayout>
            <Head title="Team Management — Admin" />

            {/* ── Outer Card Container  ────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-zinc-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Team</h1>
                        </div>
                        <p className="mt-0.5 text-[12px] font-normal text-zinc-500">
                            {users.length} member{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.users.create')}
                            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                        >
                            <Plus className="size-4" />
                            <span>Add Team Member</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages (Inline) */}
                {(flash?.success || flash?.error) && (
                    <div className="border-b border-zinc-100 bg-white px-6 py-3 text-right">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap',
                                flash.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                            )}
                        >
                            {flash.success ?? flash.error}
                        </span>
                    </div>
                )}

                {/* ── Table Container (Independently Scrollable) ──────────────── */}
                <div className="min-h-0 flex-1 overflow-auto bg-white">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <h3 className="text-sm font-bold text-zinc-900">No team members yet</h3>
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur-xs">
                                <tr>
                                    {['Name', 'Email', 'Role', 'Assigned Founders', 'Joined', 'Actions'].map((h, i) => (
                                        <th
                                            key={h}
                                            className={cn(
                                                'px-6 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase',
                                                i === 5 ? 'text-right' : '',
                                            )}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="group transition-colors duration-150 hover:bg-[#F9F9FB]">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-zinc-950">{u.name}</span>
                                                {u.is_self && (
                                                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                                                        you
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-zinc-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={cn(
                                                    'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap shadow-xs',
                                                    roleBadge[u.role] ?? '',
                                                )}
                                            >
                                                {roleLabel[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-zinc-600">{u.assigned_founders_count}</td>
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-zinc-600">{u.created_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-zinc-400">
                                                <Link
                                                    href={route('admin.users.edit', { user: u.id })}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                                    title="Edit"
                                                >
                                                    <UserPen className="size-4" />
                                                </Link>
                                                {!u.is_self && (
                                                    <button
                                                        onClick={() => destroy(u.id)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
