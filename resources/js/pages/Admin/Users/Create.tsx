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

    return (
        <AdminLayout>
            <Head title="Add Team Member — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Link href={route('admin.users.index')} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Add Team Member</h1>
                    <p className="mt-1 text-sm text-slate-500">Create a new admin account</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="Jane Smith"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="jane@example.com"
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as typeof data.role)}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        >
                            <option value="analyst">Analyst</option>
                            <option value="support">Support</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="Min 8 characters"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Confirm Password</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link href={route('admin.users.index')} className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-center text-sm text-slate-400 hover:text-white">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            {processing ? 'Creating…' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
