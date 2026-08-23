import { Head, Link } from '@inertiajs/react';

import AdminLayout from '@/layouts/admin-layout';

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

type Investor = {
    id: string;
    email: string;
    kyc_status: KycStatus;
    profile: { full_name: string; company_name: string | null; investor_type: 'individual' | 'corporate'; phone: string | null };
    latest_kyc_submission: { original_name: string; created_at: string } | null;
};

type StatusFilter = KycStatus | 'all';

const filters: { label: string; value: StatusFilter }[] = [
    { label: 'All investors', value: 'all' },
    { label: 'KYC pending', value: 'pending' },
    { label: 'Not submitted', value: 'not_submitted' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

const statusClasses: Record<KycStatus, string> = {
    not_submitted: 'border-zinc-200 bg-zinc-50 text-zinc-600',
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

const statusLabel: Record<KycStatus, string> = {
    not_submitted: 'Not submitted',
    pending: 'Pending review',
    approved: 'KYC approved',
    rejected: 'KYC rejected',
};

export default function InvestorAccountsIndex({
    investors,
    activeKycStatus,
}: {
    investors: { data: Investor[]; links: { url: string | null; label: string; active: boolean }[] };
    activeKycStatus: StatusFilter;
}) {
    return (
        <AdminLayout>
            <Head title="Investor reviews" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Investor Relations</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">Investor reviews</h1>
                        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                            Review investor profiles and follow the KYC status that controls protected deal access.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <Link
                                key={filter.value}
                                href={route('admin.investor-accounts.index', filter.value === 'all' ? {} : { kyc_status: filter.value })}
                                className={
                                    activeKycStatus === filter.value
                                        ? 'rounded-xl bg-[#3A54A5] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#2D4182]'
                                        : 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50'
                                }
                            >
                                {filter.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                    {investors.data.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-sm font-semibold text-zinc-900">No investors match this KYC status.</p>
                            <p className="mt-1 text-sm text-zinc-500">Try another filter to review a different group.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[880px] text-left">
                                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Investor</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">KYC status</th>
                                        <th className="px-6 py-4">Latest submission</th>
                                        <th className="px-6 py-4 text-right">Review</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investors.data.map((investor) => (
                                        <tr
                                            key={investor.id}
                                            className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/70"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-zinc-950">{investor.profile.full_name}</p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {investor.profile.company_name ?? investor.profile.investor_type}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-zinc-700">{investor.email}</p>
                                                {investor.profile.phone && <p className="mt-1 text-xs text-zinc-500">{investor.profile.phone}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[investor.kyc_status]}`}
                                                >
                                                    {statusLabel[investor.kyc_status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600">
                                                {investor.latest_kyc_submission ? (
                                                    <>
                                                        <p className="font-medium text-zinc-800">{investor.latest_kyc_submission.original_name}</p>
                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            {new Date(investor.latest_kyc_submission.created_at).toLocaleDateString()}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-zinc-400">No document yet</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.investor-accounts.show', investor.id)}
                                                    className="text-xs font-extrabold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#2D4182]"
                                                >
                                                    Open review
                                                </Link>
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
