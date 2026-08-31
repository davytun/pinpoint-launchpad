import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

type Tier = 'foundation' | 'growth' | 'institutional';
type Currency = 'NGN' | 'USD';

interface Application {
    id: number;
    name: string;
    email: string;
    company: string;
    country: string;
    stage: string;
    raise_target: string;
    message: string | null;
    selected_tier: Tier | null;
    status: 'pending' | 'contacted' | 'converted';
    source: string;
    created_at: string;
}

interface PageProps {
    applications: { data: Application[] };
    activeStatus: 'all' | Application['status'];
    tierAmounts: Record<Currency, Record<Tier, number>>;
}

const tierLabels: Record<Tier, string> = {
    foundation: 'Foundation',
    growth: 'Growth',
    institutional: 'Institutional',
};

export default function PiaRequestsIndex({ applications, activeStatus, tierAmounts }: PageProps) {
    const [submitting, setSubmitting] = useState<number | null>(null);

    function setStatus(status: string) {
        router.get('/admin/pia-requests', status === 'all' ? {} : { status }, { preserveState: true, replace: true });
    }

    function markContacted(application: Application) {
        setSubmitting(application.id);
        router.patch(`/admin/pia-requests/${application.id}/contacted`, {}, { preserveScroll: true, onFinish: () => setSubmitting(null) });
    }

    function recordPayment(application: Application, currency: Currency) {
        if (!application.selected_tier) return;
        setSubmitting(application.id);
        router.post(
            `/admin/pia-requests/${application.id}/payment-received`,
            { currency, amount: tierAmounts[currency][application.selected_tier] },
            { preserveScroll: true, onFinish: () => setSubmitting(null) },
        );
    }

    return (
        <AdminLayout>
            <Head title="PIA Requests" />
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Founder pipeline</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">PIA requests</h1>
                        <p className="mt-1 max-w-2xl text-sm text-zinc-500">Confirm offline payment here to send the Founder a secure agreement-signing link.</p>
                    </div>
                    <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
                        {['all', 'pending', 'contacted', 'converted'].map((status) => (
                            <button key={status} type="button" onClick={() => setStatus(status)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${activeStatus === status ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    {applications.data.length === 0 ? (
                        <div className="p-12 text-center text-sm text-zinc-500">No PIA requests in this view.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {applications.data.map((application) => {
                                const currency: Currency = application.country.trim().toLowerCase() === 'nigeria' ? 'NGN' : 'USD';
                                const busy = submitting === application.id;
                                return (
                                    <article key={application.id} className="p-5 sm:p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-semibold text-zinc-950">{application.company}</h2>
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${application.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : application.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{application.status}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-zinc-600">{application.name} · {application.email}</p>
                                                <p className="mt-1 text-xs text-zinc-400">{application.country} · {application.stage} · Raising {application.raise_target}</p>
                                            </div>
                                            <div className="text-right text-xs text-zinc-500"><p>{new Date(application.created_at).toLocaleDateString()}</p><p className="mt-1 capitalize">{application.source.replace(/_/g, ' ')}</p></div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3">
                                            <div className="text-sm text-zinc-700"><span className="font-semibold">Tier:</span> {application.selected_tier ? tierLabels[application.selected_tier] : 'Not selected (direct PIA enquiry)'} {application.message && <span className="ml-2 text-zinc-500">{application.message}</span>}</div>
                                            {application.status !== 'converted' && <div className="flex flex-wrap gap-2">
                                                {application.status === 'pending' && <button type="button" disabled={busy} onClick={() => markContacted(application)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50">Mark contacted</button>}
                                                {application.selected_tier && <button type="button" disabled={busy} onClick={() => recordPayment(application, currency)} className="rounded-lg bg-[#3A54A5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2D4182] disabled:opacity-50">{busy ? 'Recording…' : `Record ${currency === 'NGN' ? '₦' : '$'}${tierAmounts[currency][application.selected_tier].toLocaleString()} received`}</button>}
                                            </div>}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
