import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ExternalLink,
    Globe,
    Mail,
    MapPin,
    Tag,
    User,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InvestorApplication {
    id: number;
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
        investor_status: boolean;
        risk_understood: boolean;
        no_recommendation: boolean;
        aml_source_of_funds: boolean;
        terms_agreed: boolean;
    } | null;
    submitted_at: string | null;
    created_at: string;
}

interface PageProps {
    application: InvestorApplication;
}

const INVESTOR_TYPE_LABELS: Record<string, string> = {
    angel: 'Angel Investor',
    vc: 'Venture Fund',
    family_office: 'Family Office',
    syndicate: 'Syndicate / Network',
    dfi: 'DFI / Impact Investor',
    corporate: 'Corporate / CVC',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending:           { label: 'Pending Review',  className: 'border-amber-200 bg-amber-50 text-amber-700' },
    approved:          { label: 'Approved',         className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    rejected:          { label: 'Rejected',         className: 'border-rose-200 bg-rose-50 text-rose-700' },
    request_more_info: { label: 'Needs More Info',  className: 'border-blue-200 bg-blue-50 text-blue-700' },
};

function fmt(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function humanize(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-100 last:border-0">
            <span className="text-xs font-semibold text-zinc-500 shrink-0">{label}</span>
            <span className="text-sm font-bold text-zinc-900 text-right">{value || '—'}</span>
        </div>
    );
}

function FlashBanner() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        const text = flash?.success || flash?.error;
        const type = flash?.success ? 'success' : 'error';
        if (!text) return;
        clearTimeout(timerRef.current);
        setMsg({ text, type });
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 5000);
    }, [flash]);

    if (!msg || !visible) return null;

    return (
        <div
            className={cn(
                'mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold',
                msg.type === 'success'
                    ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700'
                    : 'border-rose-500/25 bg-rose-50 text-rose-700',
            )}
        >
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {msg.text}
            </div>
            <button onClick={() => setVisible(false)}>
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function Show({ application }: PageProps) {
    const [updating, setUpdating] = useState(false);

    const updateStatus = (status: string) => {
        setUpdating(true);
        router.patch(
            `/admin/investors/${application.id}/status`,
            { status },
            {
                onFinish: () => setUpdating(false),
                preserveScroll: true,
            },
        );
    };

    const statusCfg = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;

    return (
        <AdminLayout>
            <Head title={`${application.name} — Investor Application`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/investors"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="font-display text-2xl font-black tracking-tight text-zinc-950">{application.name}</h1>
                            <p className="mt-0.5 text-sm text-zinc-500">
                                {INVESTOR_TYPE_LABELS[application.investor_type] || humanize(application.investor_type)}
                                {application.organisation && ` · ${application.organisation}`}
                            </p>
                        </div>
                    </div>

                    <span className={cn('inline-flex h-8 items-center rounded-xl border px-4 text-xs font-bold tracking-wider uppercase shrink-0', statusCfg.className)}>
                        {statusCfg.label}
                    </span>
                </div>

                <FlashBanner />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Application Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Contact card */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Contact Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                        <User className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Name</p>
                                        <p className="text-sm font-bold text-zinc-900">{application.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                        <Mail className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</p>
                                        <a href={`mailto:${application.email}`} className="text-sm font-bold text-[#3A54A5] hover:underline">
                                            {application.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                        <Tag className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Organisation & Role</p>
                                        <p className="text-sm font-bold text-zinc-900">{application.organisation || 'Independent'}</p>
                                        {application.role && <p className="text-xs text-zinc-500">{application.role}</p>}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                        <MapPin className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Country</p>
                                        <p className="text-sm font-bold text-zinc-900">{application.country}</p>
                                    </div>
                                </div>

                                {application.website && (
                                    <div className="flex items-start gap-3 sm:col-span-2">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                            <Globe className="h-4 w-4 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Website / LinkedIn</p>
                                            <a
                                                href={application.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm font-bold text-[#3A54A5] hover:underline"
                                            >
                                                {application.website}
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mandate card */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Investment Mandate</h2>
                            <div className="divide-y divide-zinc-100">
                                <DataRow
                                    label="Investor Type"
                                    value={INVESTOR_TYPE_LABELS[application.investor_type] || humanize(application.investor_type)}
                                />
                                <DataRow
                                    label="Stages"
                                    value={
                                        application.stages && application.stages.length > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                {application.stages.map((s) => (
                                                    <span key={s} className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                                                        {humanize(s)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                                <DataRow
                                    label="Sectors"
                                    value={
                                        application.sectors && application.sectors.length > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                {application.sectors.map((s) => (
                                                    <span key={s} className="inline-flex rounded-md border border-[#3A54A5]/20 bg-[#3A54A5]/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3A54A5]">
                                                        {humanize(s)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                                <DataRow
                                    label="Geographies"
                                    value={
                                        application.geographies && application.geographies.length > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                {application.geographies.map((g) => (
                                                    <span key={g} className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                                                        {humanize(g)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                                <DataRow label="Typical Cheque Size" value={application.cheque_size} />
                                <DataRow label="Preferred Instrument" value={application.instrument} />
                                <DataRow label="Deals per Year" value={application.deals_per_year} />
                                {application.fund_detail && (
                                    <DataRow label="Fund / AUM Detail" value={application.fund_detail} />
                                )}
                            </div>

                            {application.thesis_notes && (
                                <div className="mt-4 border-t border-zinc-100 pt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Thesis Notes</p>
                                    <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{application.thesis_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirmations card */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Eligibility Confirmations</h2>
                            <div className="space-y-3">
                                {[
                                    {
                                        key: 'investor_status',
                                        label: 'Qualifies as a sophisticated / professional / HNW investor under applicable law, including the Investments and Securities Act 2025.',
                                    },
                                    {
                                        key: 'risk_understood',
                                        label: 'Understands that early-stage investment is high-risk and illiquid, and decisions are made on own judgement.',
                                    },
                                    {
                                        key: 'no_recommendation',
                                        label: 'Understands that Pinpoint provides curated visibility only — not advice, endorsement, or arrangement.',
                                    },
                                    {
                                        key: 'aml_source_of_funds',
                                        label: 'Confirms funds derive from lawful sources and agrees to provide identity / source-of-funds information as requested.',
                                    },
                                    {
                                        key: 'terms_agreed',
                                        label: 'Has read and agreed to the Investor Terms, Terms of Service, and Privacy Policy.',
                                    },
                                ].map((item) => {
                                    const checked = application.confirmations?.[item.key as keyof typeof application.confirmations] ?? false;
                                    return (
                                        <div key={item.key} className="flex items-start gap-3">
                                            <div className={cn(
                                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                                                checked
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                                                    : 'border-rose-200 bg-rose-50 text-rose-500'
                                            )}>
                                                {checked ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3 stroke-[2.5]" />}
                                            </div>
                                            <p className="text-xs text-zinc-600 leading-relaxed">{item.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Review Panel */}
                    <div className="space-y-6">
                        {/* Timestamps */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Timeline</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Submitted</p>
                                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">{fmt(application.submitted_at)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Received</p>
                                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">{fmt(application.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Current status */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Current Status</h2>
                            <span className={cn('inline-flex h-8 items-center rounded-xl border px-4 text-xs font-bold tracking-wider uppercase', statusCfg.className)}>
                                {statusCfg.label}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Review Actions</h2>

                            <button
                                onClick={() => updateStatus('approved')}
                                disabled={updating || application.status === 'approved'}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all',
                                    application.status === 'approved'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-60 cursor-not-allowed'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-[0.98]'
                                )}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                            </button>

                            <button
                                onClick={() => updateStatus('request_more_info')}
                                disabled={updating || application.status === 'request_more_info'}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all',
                                    application.status === 'request_more_info'
                                        ? 'border-blue-200 bg-blue-50 text-blue-700 opacity-60 cursor-not-allowed'
                                        : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98]'
                                )}
                            >
                                Request More Info
                            </button>

                            <button
                                onClick={() => updateStatus('rejected')}
                                disabled={updating || application.status === 'rejected'}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all',
                                    application.status === 'rejected'
                                        ? 'border-rose-200 bg-rose-50 text-rose-700 opacity-60 cursor-not-allowed'
                                        : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98]'
                                )}
                            >
                                <X className="h-3.5 w-3.5" />
                                Reject
                            </button>

                            {application.status !== 'pending' && (
                                <button
                                    onClick={() => updateStatus('pending')}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 text-xs font-bold tracking-wider uppercase transition-all hover:bg-zinc-100"
                                >
                                    Reset to Pending
                                </button>
                            )}
                        </div>

                        <Link
                            href="/admin/investors"
                            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-500 uppercase tracking-wider transition-colors hover:text-zinc-900 hover:border-zinc-300 w-full"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to list
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
