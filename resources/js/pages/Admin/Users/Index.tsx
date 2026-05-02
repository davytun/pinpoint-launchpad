import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2, UserPen } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

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
    superadmin: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    analyst:    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    support:    'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin',
    analyst:    'Analyst',
    support:    'Support',
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
                        <h1 className="text-2xl font-bold text-[#ECF0F9]">Team</h1>
                        <p className="mt-1 text-sm text-[#788CBA]">{users.length} member{users.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href={route('admin.users.create')}
                        className="flex items-center gap-2 rounded-lg bg-[#4468BB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3C53A8]"
                    >
                        <Plus className="size-4" />
                        Add Team Member
                    </Link>
                </div>

                {(flash?.success || flash?.error) && (
                    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${flash.success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        {flash.success ?? flash.error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                    {users.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#576FA8]">No team members yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        {['Name', 'Email', 'Role', 'Assigned Founders', 'Joined', 'Actions'].map((h) => (
                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-[#ECF0F9]">{u.name}</span>
                                                    {u.is_self && (
                                                        <span className="rounded-full bg-[#1B294B] px-2 py-0.5 text-[10px] text-[#576FA8]">you</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[#788CBA]">{u.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[u.role] ?? ''}`}>
                                                    {roleLabel[u.role] ?? u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[#788CBA]">{u.assigned_founders_count}</td>
                                            <td className="px-5 py-4 text-[#788CBA]">{u.created_at}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={route('admin.users.edit', { user: u.id })}
                                                        className="flex items-center gap-1 text-xs text-[#576FA8] hover:text-[#ECF0F9]"
                                                    >
                                                        <UserPen className="size-3.5" />
                                                        Edit
                                                    </Link>
                                                    {!u.is_self && (
                                                        <button
                                                            onClick={() => destroy(u.id)}
                                                            className="flex items-center gap-1 text-xs text-rose-500/70 hover:text-rose-400"
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
