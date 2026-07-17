import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

export default function AdminUsersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'analyst' as 'superadmin' | 'analyst' | 'support',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('admin.users.store'));
    }

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs';

    return (
        <AdminLayout>
            <Head title="Add Team Member — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Link
                    href={route('admin.users.index')}
                    className="text-zinc-550 hover:text-zinc-955 mb-6 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-zinc-955 text-2xl font-extrabold">Add Team Member</h1>
                    <p className="text-zinc-555 mt-1 text-sm">Create a new admin account</p>
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
                            placeholder="Jane Smith"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={inputClass}
                            placeholder="jane@example.com"
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Role</label>
                        <select value={data.role} onChange={(e) => setData('role', e.target.value as typeof data.role)} className={inputClass}>
                            <option value="analyst">Analyst</option>
                            <option value="support">Support</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {errors.role && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputClass}
                            placeholder="Min 8 characters"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase">Confirm Password</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={inputClass}
                            required
                        />
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
                            {processing ? 'Creating…' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
