import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

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

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs';

    return (
        <AdminLayout>
            <Head title={`Edit ${member.name} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Link
                    href={route('admin.users.index')}
                    className="text-zinc-550 hover:text-zinc-955 mb-6 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-zinc-955 text-2xl font-extrabold">Edit Team Member</h1>
                    <p className="text-zinc-555 mt-1 text-sm font-semibold">{member.email}</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            className={inputClass}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as typeof data.role)}
                            disabled={is_self}
                            className={cn(inputClass, 'disabled:opacity-50')}
                        >
                            <option value="analyst">Analyst</option>
                            <option value="support">Support</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {is_self && <p className="mt-1 text-xs font-semibold text-amber-600">You cannot change your own role.</p>}
                        {errors.role && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.role}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link
                            href={route('admin.users.index')}
                            className="text-zinc-650 flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-sm font-bold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-[#3A54A5] py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
