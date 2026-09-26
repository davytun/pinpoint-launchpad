import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Tier = 'foundation' | 'growth' | 'institutional';
type Currency = 'NGN' | 'USD';
type Status = 'pending' | 'contacted' | 'converted';

interface Application {
    id: number;
    name: string;
    email: string;
    company: string;
    country: string;
    stage: string;
    raise_target: string;
    score: number | null;
    score_band_label: string | null;
    message: string | null;
    selected_tier: Tier | null;
    status: Status;
    source: string;
    created_at: string;
    agreement_url?: string | null;
}

interface PaginatedApplications {
    data: Application[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface PageProps {
    applications: PaginatedApplications;
    activeStatus: 'all' | Status;
    statusCounts: Record<'all' | Status, number>;
    tierAmounts: Record<Currency, Record<Tier, number>>;
    desk?: 'platform' | 'founder';
    can_record_payment?: boolean;
}

const tierLabels: Record<Tier, string> = {
    foundation: 'Foundation',
    growth: 'Growth',
    institutional: 'Institutional',
};

const stageLabels: Record<string, string> = {
    concept: 'Concept',
    seed: 'Seed',
    growth: 'Growth',
};

const statusLabel: Record<Status, string> = {
    pending: 'New',
    contacted: 'Waiting',
    converted: 'Paid',
};

const filterTabs: { key: 'all' | Status; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'New' },
    { key: 'contacted', label: 'Waiting' },
    { key: 'converted', label: 'Paid' },
];

function formatMoney(amount: number, currency: Currency) {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function stageLabel(stage: string) {
    return stageLabels[stage] ?? stage;
}

function currencyFor(application: Application): Currency {
    return application.country.trim().toLowerCase() === 'nigeria' ? 'NGN' : 'USD';
}

export default function PiaRequestsIndex({
    applications,
    activeStatus,
    statusCounts,
    tierAmounts,
    desk = 'platform',
    can_record_payment = false,
}: PageProps) {
    const { flash } = usePage<{
        flash: { success?: string; error?: string; info?: string; agreement_url?: string | null };
    }>().props;
    const [submitting, setSubmitting] = useState<number | null>(null);
    const [confirming, setConfirming] = useState<Application | null>(null);
    const [confirmTier, setConfirmTier] = useState<Tier | ''>('');
    const [copied, setCopied] = useState(false);

    const basePath = desk === 'founder' ? '/admin/founder/pia-requests' : '/admin/pia-requests';
    const openCount = (statusCounts.pending ?? 0) + (statusCounts.contacted ?? 0);

    async function copyAgreementLink(url: string) {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore — user can still select the text
        }
    }

    function resendAgreement(application: Application) {
        setSubmitting(application.id);
        router.post(`${basePath}/${application.id}/resend-agreement`, {}, { preserveScroll: true, onFinish: () => setSubmitting(null) });
    }

    function setStatus(status: string) {
        router.get(basePath, status === 'all' ? {} : { status }, { preserveState: true, replace: true });
    }

    function markContacted(application: Application) {
        setSubmitting(application.id);
        router.patch(`${basePath}/${application.id}/contacted`, {}, { preserveScroll: true, onFinish: () => setSubmitting(null) });
    }

    function saveTier(application: Application, tier: Tier) {
        setSubmitting(application.id);
        router.patch(
            `${basePath}/${application.id}/tier`,
            { selected_tier: tier },
            { preserveScroll: true, onFinish: () => setSubmitting(null) },
        );
    }

    function openConfirm(application: Application) {
        setConfirmTier(application.selected_tier ?? '');
        setConfirming(application);
    }

    function submitPayment() {
        if (!confirming || !can_record_payment) return;
        const tier = (confirmTier || confirming.selected_tier) as Tier | null;
        if (!tier) return;

        const currency = currencyFor(confirming);
        setSubmitting(confirming.id);
        router.post(
            `${basePath}/${confirming.id}/payment-received`,
            {
                currency,
                amount: tierAmounts[currency][tier],
                selected_tier: tier,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(null);
                    setConfirming(null);
                },
            },
        );
    }

    const emptyCopy =
        activeStatus === 'pending'
            ? 'No new requests right now.'
            : activeStatus === 'contacted'
              ? 'Nobody is waiting on payment.'
              : activeStatus === 'converted'
                ? 'No paid requests yet.'
                : 'No payment requests yet.';

    return (
        <AdminLayout>
            <Head title="Payment requests" />

            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-7 sm:px-8 lg:px-10">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
                        <div>
                            <h1 className="text-[1.5rem] font-semibold tracking-tight text-zinc-950">Payment requests</h1>
                            <p className="mt-1 text-[13px] text-zinc-500">
                                {openCount} open · reach out, wait for payment, then confirm
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-5">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setStatus(tab.key)}
                                    className={cn(
                                        'border-b-2 pb-1 text-[13px] font-medium transition-colors',
                                        activeStatus === tab.key
                                            ? 'border-[#3A54A5] text-zinc-950'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800',
                                    )}
                                >
                                    {tab.label}
                                    <span className="ml-1.5 tabular-nums text-zinc-400">{statusCounts[tab.key] ?? 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {(flash.success || flash.error || flash.info || flash.agreement_url) && (
                        <div
                            className={cn(
                                'mt-5 space-y-2 border-l-2 px-3 py-2 text-[13px]',
                                flash.error && 'border-rose-500 bg-rose-50/60 text-rose-800',
                                flash.success && !flash.error && 'border-emerald-500 bg-emerald-50/60 text-emerald-800',
                                flash.info && !flash.success && !flash.error && 'border-sky-500 bg-sky-50/60 text-sky-800',
                                !flash.success && !flash.error && !flash.info && flash.agreement_url && 'border-[#3A54A5] bg-[#3A54A5]/5 text-zinc-800',
                            )}
                        >
                            {(flash.success || flash.error || flash.info) && (
                                <p className="font-medium">{flash.success ?? flash.error ?? flash.info}</p>
                            )}
                            {flash.agreement_url && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <code className="max-w-full truncate rounded-lg bg-white/80 px-2 py-1 text-[12px] text-zinc-700">
                                        {flash.agreement_url}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => copyAgreementLink(flash.agreement_url!)}
                                        className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-zinc-800"
                                    >
                                        {copied ? 'Copied' : 'Copy link'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-5 overflow-x-auto">
                        {applications.data.length === 0 ? (
                            <p className="py-16 text-center text-[13px] text-zinc-500">{emptyCopy}</p>
                        ) : (
                            <table className="w-full min-w-[920px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Company
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Diagnostic
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Plan
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Status
                                        </th>
                                        <th className="px-3 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Date
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.data.map((application) => {
                                        const currency = currencyFor(application);
                                        const busy = submitting === application.id;
                                        const amount =
                                            application.selected_tier != null
                                                ? formatMoney(tierAmounts[currency][application.selected_tier], currency)
                                                : null;

                                        return (
                                            <tr key={application.id} className="border-b border-zinc-100 hover:bg-zinc-50/60">
                                                <td className="px-3 py-3.5 align-middle">
                                                    <p className="text-[14px] font-semibold text-zinc-950">{application.company}</p>
                                                    <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                                                        {application.name} · {application.email}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3.5 align-middle">
                                                    {application.score != null ? (
                                                        <p className="text-[13px] font-medium text-zinc-900">
                                                            {application.score}
                                                            {application.score_band_label ? ` · ${application.score_band_label}` : ''}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[13px] text-zinc-400">No score</p>
                                                    )}
                                                    <p className="mt-0.5 text-[12px] text-zinc-500">
                                                        {stageLabel(application.stage)} · {application.country}
                                                    </p>
                                                    <p className="mt-0.5 text-[12px] text-zinc-500">{application.raise_target}</p>
                                                </td>
                                                <td className="px-3 py-3.5 align-middle">
                                                    {application.selected_tier ? (
                                                        <div>
                                                            <p className="text-[13px] font-medium text-zinc-900">
                                                                {tierLabels[application.selected_tier]}
                                                            </p>
                                                            {amount && (
                                                                <p className="mt-0.5 text-[12px] tabular-nums text-zinc-500">
                                                                    {amount}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : application.status !== 'converted' ? (
                                                        <div className="flex flex-col gap-1">
                                                            {(['foundation', 'growth', 'institutional'] as Tier[]).map((tier) => (
                                                                <button
                                                                    key={tier}
                                                                    type="button"
                                                                    disabled={busy}
                                                                    onClick={() => saveTier(application, tier)}
                                                                    className="rounded-lg px-2 py-1 text-left text-[12px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
                                                                >
                                                                    {tierLabels[tier]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[13px] text-zinc-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3.5 align-middle">
                                                    <span
                                                        className={cn(
                                                            'text-[13px] font-medium',
                                                            application.status === 'converted' && 'text-emerald-700',
                                                            application.status === 'contacted' && 'text-[#3A54A5]',
                                                            application.status === 'pending' && 'text-amber-700',
                                                        )}
                                                    >
                                                        {statusLabel[application.status]}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-[13px] text-zinc-500">
                                                    {formatDate(application.created_at)}
                                                </td>
                                                <td className="px-3 py-3.5 align-middle text-right">
                                                    <div className="inline-flex items-center justify-end gap-2">
                                                        {application.status === 'pending' && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => markContacted(application)}
                                                                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                                            >
                                                                {busy ? 'Saving…' : 'Mark contacted'}
                                                            </button>
                                                        )}
                                                        {application.status !== 'converted' && can_record_payment && (
                                                            <button
                                                                type="button"
                                                                disabled={busy || !application.selected_tier}
                                                                onClick={() => openConfirm(application)}
                                                                className="rounded-lg bg-[#3A54A5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2D4182] disabled:opacity-40"
                                                                title={
                                                                    !application.selected_tier
                                                                        ? 'Choose a plan first'
                                                                        : undefined
                                                                }
                                                            >
                                                                Confirm payment
                                                            </button>
                                                        )}
                                                        {application.status !== 'converted' && (
                                                            <a
                                                                href={`mailto:${application.email}?subject=${encodeURIComponent(`Pinpoint payment — ${application.company}`)}`}
                                                                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                                                            >
                                                                Email
                                                            </a>
                                                        )}
                                                        {application.status === 'converted' && (
                                                            <div className="inline-flex items-center gap-2">
                                                                {application.agreement_url && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyAgreementLink(application.agreement_url!)}
                                                                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50"
                                                                    >
                                                                        Copy link
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    disabled={busy}
                                                                    onClick={() => resendAgreement(application)}
                                                                    className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#3A54A5] hover:bg-[#3A54A5]/5 disabled:opacity-50"
                                                                >
                                                                    {busy ? 'Sending…' : 'Resend email'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {applications.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                            <button
                                type="button"
                                disabled={!applications.prev_page_url}
                                onClick={() => applications.prev_page_url && router.get(applications.prev_page_url)}
                                className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-[12px] text-zinc-400">
                                Page {applications.current_page} of {applications.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={!applications.next_page_url}
                                onClick={() => applications.next_page_url && router.get(applications.next_page_url)}
                                className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={confirming != null} onOpenChange={(open) => !open && setConfirming(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm payment?</DialogTitle>
                        <DialogDescription>
                            This marks {confirming?.company} as paid and emails {confirming?.email} a link to sign and continue.
                        </DialogDescription>
                    </DialogHeader>

                    {confirming && (
                        <div className="space-y-3">
                            <div className="text-[13px] text-zinc-600">
                                <p>
                                    {confirming.score != null
                                        ? `${confirming.score}${confirming.score_band_label ? ` · ${confirming.score_band_label}` : ''}`
                                        : 'No score'}
                                </p>
                                <p className="mt-0.5">
                                    {stageLabel(confirming.stage)} · {confirming.country}
                                </p>
                                <p className="mt-0.5">{confirming.raise_target}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-[12px] font-medium text-zinc-500">Plan</p>
                                {confirming.selected_tier ? (
                                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3.5 py-2.5 text-[13px]">
                                        <span className="font-medium text-zinc-900">{tierLabels[confirming.selected_tier]}</span>
                                        <span className="tabular-nums text-zinc-500">
                                            {formatMoney(
                                                tierAmounts[currencyFor(confirming)][confirming.selected_tier],
                                                currencyFor(confirming),
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-zinc-200">
                                        {(['foundation', 'growth', 'institutional'] as Tier[]).map((tier, index) => {
                                            const selected = confirmTier === tier;
                                            const amountLabel = formatMoney(
                                                tierAmounts[currencyFor(confirming)][tier],
                                                currencyFor(confirming),
                                            );
                                            return (
                                                <button
                                                    key={tier}
                                                    type="button"
                                                    onClick={() => setConfirmTier(tier)}
                                                    className={cn(
                                                        'flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition-colors',
                                                        index > 0 && 'border-t border-zinc-100',
                                                        selected
                                                            ? 'bg-[#3A54A5] font-semibold text-white'
                                                            : 'bg-white text-zinc-700 hover:bg-zinc-50',
                                                    )}
                                                >
                                                    <span>{tierLabels[tier]}</span>
                                                    <span className={cn('tabular-nums', selected ? 'text-white/90' : 'text-zinc-500')}>
                                                        {amountLabel}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirming(null)}
                            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!confirmTier || submitting === confirming?.id}
                            onClick={submitPayment}
                            className="rounded-xl bg-[#3A54A5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#2D4182] disabled:opacity-50"
                        >
                            {submitting === confirming?.id ? 'Confirming…' : 'Confirm payment'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
