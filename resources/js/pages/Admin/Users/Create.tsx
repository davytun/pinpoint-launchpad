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
                <Link
                    href={route('admin.users.index')}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-[#C1CDE8] transition-colors hover:text-[#D8E0F3]"
                >
                    <ArrowLeft className="size-4" /> Back to Team
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#D8E0F3]">Add Team Member</h1>
                    <p className="mt-1 text-sm text-[#91A7D8]">Create a new admin account</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-widest text-[#C1CDE8] uppercase">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#D8E0F3] placeholder-[#91A7D8] transition-colors focus:border-[#3A54A5]/50 focus:ring-1 focus:ring-[#3A54A5]/50 focus:outline-none"
                            placeholder="Jane Smith"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-widest text-[#C1CDE8] uppercase">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#D8E0F3] placeholder-[#91A7D8] transition-colors focus:border-[#3A54A5]/50 focus:ring-1 focus:ring-[#3A54A5]/50 focus:outline-none"
                            placeholder="jane@example.com"
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-widest text-[#C1CDE8] uppercase">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as typeof data.role)}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#D8E0F3] transition-colors focus:border-[#3A54A5]/50 focus:ring-1 focus:ring-[#3A54A5]/50 focus:outline-none"
                        >
                            <option value="analyst">Analyst</option>
                            <option value="support">Support</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {errors.role && <p className="mt-1 text-xs text-rose-400">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-widest text-[#C1CDE8] uppercase">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#D8E0F3] placeholder-[#91A7D8] transition-colors focus:border-[#3A54A5]/50 focus:ring-1 focus:ring-[#3A54A5]/50 focus:outline-none"
                            placeholder="Min 8 characters"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-widest text-[#C1CDE8] uppercase">Confirm Password</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full rounded-lg border border-[#232C43] bg-[#1B294B]/30 px-4 py-2.5 text-sm text-[#D8E0F3] transition-colors focus:border-[#3A54A5]/50 focus:ring-1 focus:ring-[#3A54A5]/50 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link
                            href={route('admin.users.index')}
                            className="flex-1 rounded-lg border border-[#232C43] py-2.5 text-center text-sm font-semibold text-[#C1CDE8] transition-colors hover:bg-[#1B294B]/30 hover:text-[#D8E0F3]"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-lg bg-[#3A54A5] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2F4587] disabled:opacity-50"
                        >
                            {processing ? 'Creating…' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
