import { Icon } from '@iconify/react';
import { Head, Link, router } from '@inertiajs/react';
import {useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvestorApplication {
    id: string;
    investor_type: 'angel' | 'vc' | 'family_office' | 'syndicate' | 'dfi' | 'corporate';
    name: string;
    email: string;
    organisation: string | null;
    role: string | null;
    country: string;
    website: string | null;
    stages: string[] | null;
    sectors: string[] | null;
    geographies: string[] | null;
    cheque_size: string | null;
    instrument: string | null;
    deals_per_year: string | null;
    fund_detail: string | null;
    thesis_notes: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'request_more_info';
    confirmations: {
        investor_status?: boolean;
        risk_understood?: boolean;
        no_recommendation?: boolean;
        aml_source_of_funds?: boolean;
        terms_agreed?: boolean;
    } | null;
    submitted_at: string | null;
    created_at: string;
}

interface PageProps {
    application: InvestorApplication;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INVESTOR_TYPE_LABELS: Record<string, string> = {
    angel: 'Angel Investor',
    vc: 'Venture Fund',
    family_office: 'Family Office',
    syndicate: 'Syndicate / Network',
    dfi: 'DFI / Impact Investor',
    corporate: 'Corporate / CVC',
};

function getInitials(name?: string | null): string {
    if (!name) return 'I';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function humanize(str: string | null): string {
    if (!str) return '—';
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status Capsule Pill ──────────────────────────────────────────────────────

function StatusPill({ status }: { status: InvestorApplication['status'] }) {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Approved
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Pending Review
                </span>
            );
        case 'request_more_info':
            return (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    Needs Info
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Rejected
                </span>
            );
        default:
            return null;
    }
}

// ─── Main Review Page (Polar Style) ───────────────────────────────────────────

export default function ApplicationShow({ application }: PageProps) {
    const [updating, setUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    function updateStatus(status: string) {
        setUpdating(true);
        router.patch(
            `/admin/investors/${application.id}/status`,
            { status },
            {
                onFinish: () => setUpdating(false),
                preserveScroll: true,
            },
        );
    }

    function copyEmail() {
        navigator.clipboard.writeText(application.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <AdminLayout>
            <Head title={`${application.name} — Review`} />

            {/* ── Main Container ───────────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* ── Header Bar ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 lg:px-8 py-5 border-b border-zinc-100 shrink-0 bg-white">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link
                            href="/admin/investors"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 transition-colors shrink-0"
                            title="Back to Applications"
                        >
                            <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
                        </Link>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
                            {getInitials(application.name)}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <h1 className="truncate text-lg font-bold tracking-tight text-zinc-950">
                                    {application.name}
                                </h1>
                                <StatusPill status={application.status} />
                            </div>
                            <p className="truncate text-xs text-zinc-500 mt-0.5">
                                {application.email}
                                {application.organisation && ` · ${application.organisation}`}
                                {application.role && ` · ${application.role}`}
                            </p>
                        </div>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => updateStatus('approved')}
                            disabled={updating || application.status === 'approved'}
                            className={cn(
                                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-2xs',
                                application.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                                    : 'bg-zinc-950 hover:bg-zinc-800 text-white',
                            )}
                        >
                            <Icon icon="solar:check-circle-linear" className="size-3.5" />
                            <span>Approve</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateStatus('request_more_info')}
                            disabled={updating || application.status === 'request_more_info'}
                            className={cn(
                                'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-2xs',
                                application.status === 'request_more_info'
                                    ? 'border-blue-200 bg-blue-50 text-blue-800 cursor-not-allowed'
                                    : 'border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-800',
                            )}
                        >
                            <Icon icon="solar:info-circle-linear" className="size-3.5 text-blue-600" />
                            <span>Request Info</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateStatus('rejected')}
                            disabled={updating || application.status === 'rejected'}
                            className={cn(
                                'rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                                application.status === 'rejected'
                                    ? 'text-zinc-400 cursor-not-allowed'
                                    : 'text-zinc-400 hover:text-rose-600',
                            )}
                        >
                            Reject
                        </button>
                    </div>
                </div>

                {/* ── Content Stream ─────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 space-y-6">
                    {/* Polar Top Metric Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Investor Type</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {INVESTOR_TYPE_LABELS[application.investor_type] || humanize(application.investor_type)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Cheque Size</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {application.cheque_size ?? '—'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Deals per Year</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {application.deals_per_year ?? '—'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                            <span className="text-[11px] font-medium text-zinc-500 block">Jurisdiction</span>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                                {application.country}
                            </p>
                        </div>
                    </div>

                    {/* Polar 2-Column Key-Value Properties Panel */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-6 shadow-2xs">
                        {/* Section: Applicant Details */}
                        <div>
                            <h2 className="text-xs font-semibold text-zinc-950 mb-3">Applicant Details</h2>
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Full Name</span>
                                    <span className="font-medium text-zinc-900">{application.name}</span>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Email Address</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900">{application.email}</span>
                                        <button onClick={copyEmail} className="text-zinc-400 hover:text-zinc-800">
                                            <Icon
                                                icon={copied ? 'solar:check-circle-linear' : 'solar:copy-linear'}
                                                className="size-3.5"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Organisation</span>
                                    <span className="font-medium text-zinc-900">
                                        {application.organisation ?? 'Independent Investor'}
                                    </span>
                                </div>

                                {application.role && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Role / Title</span>
                                        <span className="font-medium text-zinc-900">{application.role}</span>
                                    </div>
                                )}

                                {application.website && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Website</span>
                                        <a
                                            href={application.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:underline"
                                        >
                                            <span>{application.website.replace(/^https?:\/\//, '')}</span>
                                            <Icon icon="solar:arrow-right-up-linear" className="size-3 text-zinc-400" />
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-500">Submitted At</span>
                                    <span className="font-medium text-zinc-900">
                                        {formatDate(application.submitted_at ?? application.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section: Investment Mandate */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h2 className="text-xs font-semibold text-zinc-950 mb-3">Investment Mandate</h2>
                            <div className="divide-y divide-zinc-100 text-xs">
                                {application.sectors && application.sectors.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Target Sectors</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.sectors.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(s)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.stages && application.stages.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Target Stages</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.stages.map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(s)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.geographies && application.geographies.length > 0 && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Target Geographies</span>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {application.geographies.map((g) => (
                                                <span
                                                    key={g}
                                                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                                                >
                                                    {humanize(g)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.instrument && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Preferred Instrument</span>
                                        <span className="font-medium text-zinc-900">{application.instrument}</span>
                                    </div>
                                )}

                                {application.fund_detail && (
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-zinc-500">Fund Detail</span>
                                        <span className="font-medium text-zinc-900">{application.fund_detail}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section: Thesis Notes */}
                        {application.thesis_notes && (
                            <div className="pt-4 border-t border-zinc-100">
                                <h2 className="text-xs font-semibold text-zinc-950 mb-2">Thesis & Strategic Focus</h2>
                                <p className="text-xs text-zinc-700 leading-relaxed font-normal bg-zinc-50/70 border border-zinc-100 p-3.5 rounded-xl">
                                    "{application.thesis_notes}"
                                </p>
                            </div>
                        )}

                        {/* Section: Compliance Affirmations */}
                        <div className="pt-4 border-t border-zinc-100">
                            <h2 className="text-xs font-semibold text-zinc-950 mb-3">Regulatory Confirmations</h2>
                            <div className="space-y-2.5 text-xs">
                                {[
                                    {
                                        key: 'investor_status',
                                        label: 'Qualifies as a sophisticated / professional / HNW investor.',
                                    },
                                    {
                                        key: 'risk_understood',
                                        label: 'Understands venture investment is high-risk and illiquid.',
                                    },
                                    {
                                        key: 'aml_source_of_funds',
                                        label: 'Confirms capital derives from lawful sources and agrees to KYC.',
                                    },
                                    {
                                        key: 'terms_agreed',
                                        label: 'Agrees to Platform Investor Terms & Syndicate Rules.',
                                    },
                                ].map((item) => {
                                    const checked =
                                        application.confirmations?.[
                                            item.key as keyof typeof application.confirmations
                                        ] ?? true;

                                    return (
                                        <div key={item.key} className="flex items-center gap-2">
                                            <Icon
                                                icon={checked ? 'solar:check-circle-linear' : 'solar:close-circle-linear'}
                                                className={cn('size-3.5 shrink-0', checked ? 'text-emerald-600' : 'text-rose-500')}
                                            />
                                            <span className="text-zinc-600">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
