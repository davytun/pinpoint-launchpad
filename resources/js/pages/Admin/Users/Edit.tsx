import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

interface PageProps {
    member: { id: number; name: string; email: string; role: 'superadmin' | 'analyst' | 'support' };
    user_role: string;
    is_self: boolean;
}

export default function AdminUsersEdit({ member, is_self }: PageProps) {
    const { data, setData, patch, processing, errors } = useForm({
        name: member.name,
        role: member.role,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('admin.users.update', { user: member.id }));
    }

    return (
        <AdminLayout>
            <Head title={`Edit ${member.name} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Link href={route('admin.users.index')} className="mb-6 inline-flex items-center gap-2 text-sm text-[#788CBA] transition-colors hover:text-[#ECF0F9]">
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#ECF0F9]">Edit Team Member</h1>
                    <p className="mt-1 text-sm text-[#576FA8]">{member.email}</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#788CBA]">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#ECF0F9] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#788CBA]">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as typeof data.role)}
                            disabled={is_self}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#ECF0F9] transition-colors focus:border-[#4468BB]/50 focus:outline-none focus:ring-1 focus:ring-[#4468BB]/50 disabled:opacity-50"
                        >
                            <option value="analyst">Analyst</option>
                            <option value="support">Support</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {is_self && (
                            <p className="mt-1 text-xs text-amber-400">You cannot change your own role.</p>
                        )}
                        {errors.role && <p className="mt-1 text-xs text-rose-400">{errors.role}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link href={route('admin.users.index')} className="flex-1 rounded-lg border border-[#232C43] py-2.5 text-center text-sm font-semibold text-[#788CBA] transition-colors hover:bg-[#1B294B]/30 hover:text-[#ECF0F9]">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-lg bg-[#4468BB] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3C53A8] disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
