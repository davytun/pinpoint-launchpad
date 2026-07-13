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
    superadmin: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
    analyst: 'bg-[#3A54A5]/10 text-[#3A54A5] border border-[#3A54A5]/25',
    support: 'bg-zinc-100 text-zinc-650 border border-zinc-200',
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
            <Head title="Team — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-zinc-955">Team</h1>
                        <p className="mt-1 text-sm text-zinc-555 font-medium">
                            {users.length} member{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href={route('admin.users.create')}
                        className="flex items-center gap-2 rounded-xl bg-[#3A54A5] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 hover:bg-[#2D4182] hover:shadow-lg transition-colors"
                    >
                        <Plus className="size-4" />
                        Add Team Member
                    </Link>
                </div>

                {(flash?.success || flash?.error) && (
                    <div
                        className={cn(
                            'mb-4 rounded-xl border px-4 py-3 text-sm font-semibold',
                            flash.success
                                ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700'
                                : 'border-rose-500/25 bg-rose-50 text-rose-700',
                        )}
                    >
                        {flash.success ?? flash.error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
                    {users.length === 0 ? (
                        <div className="py-16 text-center text-sm text-zinc-500 font-semibold">No team members yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                        {['Name', 'Email', 'Role', 'Assigned Founders', 'Joined', 'Actions'].map((h) => (
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
                                    {users.map((u) => (
                                        <tr key={u.id} className="group transition-colors hover:bg-zinc-50/40">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900">{u.name}</span>
                                                    {u.is_self && (
                                                        <span className="rounded-full bg-zinc-200 border border-zinc-300/40 px-2 py-0.5 text-[10px] text-zinc-600 font-bold shadow-xs">you</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-zinc-655 font-medium">{u.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap shadow-xs', roleBadge[u.role] ?? '')}>
                                                    {roleLabel[u.role] ?? u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-zinc-650 font-medium">{u.assigned_founders_count}</td>
                                            <td className="px-5 py-4 text-zinc-655 font-medium">{u.created_at}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.users.edit', { user: u.id })}
                                                        className="flex items-center gap-1 text-xs text-zinc-555 hover:text-zinc-950 font-bold"
                                                    >
                                                        <UserPen className="size-3.5" />
                                                        Edit
                                                    </Link>
                                                    {!u.is_self && (
                                                        <button
                                                            onClick={() => destroy(u.id)}
                                                            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                            Remove
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
            </div>
        </AdminLayout>
    );
}
