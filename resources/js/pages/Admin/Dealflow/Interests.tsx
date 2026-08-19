import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { BadgeCheck, Clock3, XCircle } from 'lucide-react';

type Interest = {
    id: number;
    type: string;
    message: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    investor: {
        profile: {
            full_name: string;
        } | null;
    } | null;
    profile: {
        founder: {
            company_name: string;
        } | null;
    } | null;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

function StatusBadge({ status }: { status: Interest['status'] }) {
    if (status === 'approved') return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800"><BadgeCheck className="size-3.5" /> Approved</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800"><XCircle className="size-3.5" /> Rejected</span>;
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800"><Clock3 className="size-3.5" /> Pending</span>;
}

export default function AdminInterests({ interests }: { interests: PaginatedData<Interest> }) {
    return (
        <AdminLayout>
            <Head title="Investor Interests | Dealflow" />
            <div className="px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-zinc-950">Investor Interests</h1>
                    <p className="mt-1 text-sm text-zinc-500">Monitor all investor interest submissions and founder approvals.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Investor</th>
                                <th className="px-6 py-4">Startup</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {interests.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No investor interests found.
                                    </td>
                                </tr>
                            ) : (
                                interests.data.map((interest) => (
                                    <tr key={interest.id} className="transition-colors hover:bg-zinc-50/50">
                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                            {interest.investor?.profile?.full_name ?? 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-zinc-900">
                                            {interest.profile?.founder?.company_name ?? 'Unknown Startup'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600 uppercase">
                                                {interest.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={interest.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                                            {new Date(interest.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
