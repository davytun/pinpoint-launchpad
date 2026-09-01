import { Icon } from '@iconify/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analyst {
    id: number;
    name: string;
    email: string;
}

interface MessageItem {
    id: number;
    sender_type: 'founder' | 'admin';
    sender_name: string;
    body: string | null;
    has_attachment: boolean;
    attachment_filename: string | null;
    attachment_size: string | null;
    created_at: string;
    created_at_date: string;
    is_from_founder: boolean;
}

interface DocumentItem {
    id: string;
    original_filename: string;
    category?: string;
    category_label?: string;
    file_size?: string;
    reviewed: boolean;
    analyst_note?: string | null;
    created_at: string;
}

interface PageProps {
    founder: {
        id: string;
        full_name: string | null;
        company_name: string | null;
        email: string;
        phone: string | null;
        created_at: string;
        last_login_at: string | null;
        score: number | null;
        score_band: string | null;
        tier: string | null;
        pillar_scores: Record<string, number> | null;
    };
    payment: {
        id: number;
        tier: string;
        total_amount: number;
        currency: string;
        status: string;
        audit_status: string;
        paid_at: string | null;
        paystack_reference: string;
    } | null;
    signature: { id: number; status: string; signed_at: string | null; signer_name: string | null } | null;
    documents: DocumentItem[];
    message_thread: { id: number; total_messages: number; unread_count: number } | null;
    thread_messages?: MessageItem[];
    profile: { id: string; is_live: boolean; is_public: boolean; slug: string } | null;
    assignment: { analyst_id: number; analyst_name: string | null; assigned_at: string | null; notes: string | null } | null;
    analysts: Analyst[];
    user_role: 'superadmin' | 'analyst' | 'support' | 'investor_relations';
}

function SectionCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs">
            <div className="mb-3.5 flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">{title}</h3>
                {badge}
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100/70 py-1.5 text-xs last:border-0">
            <span className="shrink-0 font-medium text-zinc-400">{label}</span>
            <span className="text-right font-semibold text-zinc-950 truncate max-w-[260px]">{value ?? '—'}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'complete':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>Complete</span>
                </span>
            );
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>In Progress</span>
                </span>
            );
        case 'needs_info':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Needs Info</span>
                </span>
            );
        case 'on_hold':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>On Hold</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <span>Pending</span>
                </span>
            );
    }
}

const TABS = [
    { id: 'Overview', label: 'Overview & Audit', icon: 'solar:shield-check-linear' },
    { id: 'Documents', label: 'Audit Documents', icon: 'solar:document-text-linear' },
    { id: 'Messages', label: 'Live Messages', icon: 'solar:chat-round-dots-linear' },
    { id: 'Spotlight', label: 'Spotlight Profile', icon: 'solar:crown-linear' },
];

export default function AdminFoundersShow({
    founder,
    payment,
    signature,
    documents = [],
    message_thread,
    thread_messages = [],
    profile,
    assignment,
    analysts = [],
    user_role,
}: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst = user_role === 'analyst';
    const canEdit = isSuperAdmin || isAnalyst;

    const [activeTab, setActiveTab] = useState('Overview');
    const [showAssign, setShowAssign] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const auditForm = useForm({
        audit_status: payment?.audit_status ?? 'pending',
        response_message: '',
        send_message_to_founder: true,
    });

    const assignForm = useForm({
        analyst_id: assignment?.analyst_id?.toString() ?? '',
        notes: assignment?.notes ?? '',
    });

    const replyForm = useForm<{ body: string; attachment: File | null }>({
        body: '',
        attachment: null,
    });

    function submitAuditStatus(e: React.FormEvent) {
        e.preventDefault();
        auditForm.patch(route('admin.founders.audit-status', { founder: founder.id }), {
            preserveScroll: true,
            onSuccess: () => {
                auditForm.setData('response_message', '');
            },
        });
    }

    function submitAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.post(route('admin.founders.assign', { founder: founder.id }), {
            onSuccess: () => setShowAssign(false),
            preserveScroll: true,
        });
    }

    function submitReply(e: React.FormEvent) {
        e.preventDefault();
        if (!message_thread) return;
        replyForm.post(route('admin.messages.reply', { thread: message_thread.id }), {
            preserveScroll: true,
            onSuccess: () => {
                replyForm.reset();
            },
        });
    }

    function toggleDocumentReviewed(docId: string) {
        router.patch(route('admin.documents.reviewed', { founder: founder.id, document: docId }), {}, { preserveScroll: true });
    }

    function copyEmail() {
        navigator.clipboard.writeText(founder.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    }

    useEffect(() => {
        if (activeTab === 'Messages') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, thread_messages]);

    const companyName = founder.company_name ?? 'Startup';
    const founderName = founder.full_name ?? founder.email;

    return (
        <AdminLayout>
            <Head title={`${companyName} — Founder Dossier`} />

            {/* ── Main Full-Height Container ─────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-xs lg:p-8">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="mb-5 flex shrink-0 items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3.5">
                        <Link
                            href={route('admin.founders.index')}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-500 shadow-2xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                            title="Back to Directory"
                        >
                            <Icon icon="solar:arrow-left-linear" className="size-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                                    {companyName}
                                </h1>
                                {payment?.audit_status && <StatusBadge status={payment.audit_status} />}
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-400">
                                {founderName} · <span className="font-mono">{founder.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('Messages')}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                        >
                            <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                            <span>Live Messages</span>
                            {message_thread && message_thread.unread_count > 0 && (
                                <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                    {message_thread.unread_count}
                                </span>
                            )}
                        </button>

                        {profile && (
                            <a
                                href={`/investor/spotlight/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800"
                            >
                                <span>Spotlight Page</span>
                                <Icon icon="solar:arrow-right-up-linear" className="size-3 text-zinc-400" />
                            </a>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {/* ── Navigation Tabs ─────────────────────────────────────────── */}
                <div className="mb-5 flex shrink-0 items-center gap-1.5 border-b border-zinc-100 pb-3">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                                    isActive
                                        ? 'border border-zinc-200/80 bg-zinc-100 font-semibold text-zinc-950 shadow-2xs'
                                        : 'border border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                                )}
                            >
                                <Icon icon={tab.icon} className="size-3.5" />
                                <span>{tab.label}</span>
                                {tab.id === 'Documents' && (
                                    <span className="rounded-full bg-zinc-200/80 px-1.5 py-0.2 text-[10px] font-bold text-zinc-700">
                                        {documents.length}
                                    </span>
                                )}
                                {tab.id === 'Messages' && message_thread && message_thread.unread_count > 0 && (
                                    <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                        {message_thread.unread_count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Tab Body (Scrollable, No scrollbars) ────────────────────── */}
                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                    {/* ── TAB 1: Overview & Audit ── */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Card 1: Founder & Entity Details */}
                            <SectionCard title="Founder & Entity Details">
                                <DataRow label="Full Legal Name" value={founderName} />
                                <DataRow label="Company / Entity" value={companyName} />
                                <DataRow
                                    label="Direct Email"
                                    value={
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-[11px]">{founder.email}</span>
                                            <button onClick={copyEmail} className="text-zinc-400 hover:text-zinc-700" title="Copy Email">
                                                <Icon icon={copiedEmail ? 'solar:check-circle-linear' : 'solar:copy-linear'} className="size-3.5" />
                                            </button>
                                        </div>
                                    }
                                />
                                <DataRow label="Contact Phone" value={founder.phone} />
                                <DataRow label="Registered Date" value={founder.created_at} />
                                <DataRow label="Last Active" value={founder.last_login_at} />
                            </SectionCard>

                            {/* Card 2: PARAGON Diagnostic Assessment */}
                            <SectionCard title="PARAGON Diagnostic Assessment">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-mono text-3xl font-bold text-zinc-950">{founder.score ?? '—'}</span>
                                        <span className="font-mono text-xs text-zinc-400">/ 100</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[11px] text-zinc-400">Venture Tier</span>
                                        <span className="text-xs font-semibold text-zinc-900 capitalize">{founder.tier ?? '—'}</span>
                                    </div>
                                </div>

                                {founder.pillar_scores && (
                                    <div className="space-y-2 border-t border-zinc-100 pt-2">
                                        {Object.entries(founder.pillar_scores).map(([pillar, score]) => (
                                            <div key={pillar} className="space-y-0.5">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-medium text-zinc-600 capitalize">{pillar}</span>
                                                    <span className="font-mono font-bold text-zinc-900">{Math.round(score)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/60">
                                                    <div
                                                        className="h-full rounded-full bg-zinc-900 transition-all duration-300"
                                                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            {/* Card 3: Audit Workflow Controller & Directives */}
                            {canEdit && payment && (
                                <SectionCard title="Audit Status Controller & Directives">
                                    <form onSubmit={submitAuditStatus} className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold text-zinc-500">Audit Status</label>
                                            <select
                                                value={auditForm.data.audit_status}
                                                onChange={(e) => auditForm.setData('audit_status', e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-zinc-400 focus:outline-none"
                                            >
                                                <option value="pending">Pending Review</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="needs_info">Needs Information</option>
                                                <option value="on_hold">On Hold</option>
                                                <option value="complete">Complete & Verified</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold text-zinc-500">
                                                Audit Directives / Response Note to Founder
                                            </label>
                                            <textarea
                                                value={auditForm.data.response_message}
                                                onChange={(e) => auditForm.setData('response_message', e.target.value)}
                                                placeholder="Provide audit feedback, request missing verification documents, or explain next steps..."
                                                rows={2}
                                                className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                                            />
                                        </div>

                                        <label className="flex cursor-pointer items-center gap-2 text-[11.5px] font-medium text-zinc-700">
                                            <input
                                                type="checkbox"
                                                checked={auditForm.data.send_message_to_founder}
                                                onChange={(e) => auditForm.setData('send_message_to_founder', e.target.checked)}
                                                className="rounded text-zinc-900 focus:ring-zinc-900"
                                            />
                                            <span>Send response directly into Founder live messages & email notification</span>
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={auditForm.processing}
                                            className="w-full rounded-xl bg-zinc-950 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {auditForm.processing ? 'Saving Audit & Dispatching…' : 'Save Status & Dispatch Directives'}
                                        </button>
                                    </form>
                                </SectionCard>
                            )}

                            {/* Card 4: Assigned Analyst */}
                            <SectionCard title="Assigned Analyst Lead">
                                {assignment ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-zinc-900">{assignment.analyst_name ?? '—'}</span>
                                            <span className="text-[11px] text-zinc-400">Assigned {assignment.assigned_at}</span>
                                        </div>
                                        {assignment.notes && (
                                            <p className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-2.5 text-xs text-zinc-600">
                                                {assignment.notes}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs font-medium text-zinc-400">No analyst lead assigned yet.</p>
                                )}

                                {isSuperAdmin && (
                                    <div className="border-t border-zinc-100 pt-2">
                                        {showAssign ? (
                                            <form onSubmit={submitAssign} className="space-y-3">
                                                <select
                                                    value={assignForm.data.analyst_id}
                                                    onChange={(e) => assignForm.setData('analyst_id', e.target.value)}
                                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-zinc-400 focus:outline-none"
                                                >
                                                    <option value="">Select Analyst Lead…</option>
                                                    {analysts.map((a) => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.name} ({a.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    value={assignForm.data.notes}
                                                    onChange={(e) => assignForm.setData('notes', e.target.value)}
                                                    placeholder="Analyst assignment notes & directives…"
                                                    rows={2}
                                                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAssign(false)}
                                                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-1.5 text-xs font-semibold text-zinc-600 shadow-2xs hover:bg-zinc-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={assignForm.processing}
                                                        className="flex-1 rounded-xl bg-zinc-950 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 disabled:opacity-50"
                                                    >
                                                        {assignForm.processing ? 'Assigning…' : 'Save Assignment'}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setShowAssign(true)}
                                                className="w-full rounded-xl border border-zinc-200/80 bg-white py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                            >
                                                {assignment ? 'Change Assigned Analyst' : 'Assign Analyst Lead'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </SectionCard>

                            {/* Card 5: Payment Record */}
                            {payment && (
                                <SectionCard title="Audit Payment & Package">
                                    <DataRow label="Tier Level" value={<span className="capitalize">{payment.tier}</span>} />
                                    <DataRow label="Amount Paid" value={`${payment.currency} ${payment.total_amount.toLocaleString()}`} />
                                    <DataRow label="Payment Status" value={<span className="capitalize">{payment.status}</span>} />
                                    <DataRow label="Paid Date" value={payment.paid_at} />
                                    <DataRow label="Reference" value={<span className="font-mono text-[11px]">{payment.paystack_reference}</span>} />
                                </SectionCard>
                            )}

                            {/* Card 6: Legal Agreement & NDA */}
                            <SectionCard title="Legal Agreement & NDA">
                                {signature ? (
                                    <>
                                        <DataRow label="Status" value={<span className="font-semibold text-emerald-700 capitalize">{signature.status}</span>} />
                                        <DataRow label="Signer Name" value={signature.signer_name} />
                                        <DataRow label="Timestamp" value={signature.signed_at} />
                                    </>
                                ) : (
                                    <p className="text-xs font-medium text-zinc-400">No signature agreement on record.</p>
                                )}
                            </SectionCard>
                        </div>
                    )}

                    {/* ── TAB 2: Documents Review ── */}
                    {activeTab === 'Documents' && (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs">
                            {documents.length === 0 ? (
                                <div className="py-16 text-center text-xs text-zinc-400">
                                    <Icon icon="solar:document-text-linear" className="mx-auto mb-2 size-8 text-zinc-300" />
                                    No audit documents uploaded yet by this founder.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 text-xs">
                                    <div className="flex items-center gap-4 bg-zinc-50/50 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        <div className="w-1/3 min-w-0">Filename</div>
                                        <div className="w-1/4 min-w-0">Category</div>
                                        <div className="w-1/6 min-w-0">Verification</div>
                                        <div className="w-1/6 min-w-0">Uploaded</div>
                                        <div className="w-28 shrink-0 text-right">Actions</div>
                                    </div>
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50/60">
                                            <div className="flex w-1/3 min-w-0 items-center gap-2.5">
                                                <Icon icon="solar:document-text-linear" className="size-4 shrink-0 text-zinc-400" />
                                                <div className="min-w-0">
                                                    <span className="block truncate font-semibold text-zinc-950">{doc.original_filename}</span>
                                                    {doc.file_size && (
                                                        <span className="block font-mono text-[10px] text-zinc-400">{doc.file_size}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-1/4 min-w-0 font-medium text-zinc-700">
                                                {doc.category_label ?? doc.category ?? 'Audit Document'}
                                            </div>
                                            <div className="w-1/6 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDocumentReviewed(doc.id)}
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold transition-all',
                                                        doc.reviewed
                                                            ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'border border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-amber-100',
                                                    )}
                                                    title="Click to toggle verification status"
                                                >
                                                    <Icon
                                                        icon={doc.reviewed ? 'solar:check-circle-linear' : 'solar:clock-circle-linear'}
                                                        className="size-3"
                                                    />
                                                    <span>{doc.reviewed ? 'Verified' : 'Pending'}</span>
                                                </button>
                                            </div>
                                            <div className="w-1/6 min-w-0 text-[11.5px] text-zinc-400">{doc.created_at}</div>
                                            <div className="w-28 shrink-0 flex items-center justify-end gap-1.5">
                                                <a
                                                    href={route('admin.documents.download', { founder: founder.id, document: doc.id })}
                                                    className="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 3: Live Messages ── */}
                    {activeTab === 'Messages' && (
                        <div className="flex h-[560px] max-h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] shadow-2xs">
                            {/* Message Header */}
                            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white">
                                        {founder.full_name ? founder.full_name.charAt(0).toUpperCase() : 'F'}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-950">
                                            Conversation with {founderName}
                                        </h4>
                                        <p className="text-[11px] text-zinc-400">{founder.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/messages?founder_id=${founder.id}`}
                                    className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
                                >
                                    <span>Open in Full Inbox</span>
                                    <Icon icon="solar:arrow-right-up-linear" className="size-3" />
                                </Link>
                            </div>

                            {/* Message Bubbles Body */}
                            <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                                {thread_messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400">
                                        <Icon icon="solar:chat-round-dots-linear" className="mb-2 size-8 text-zinc-300" />
                                        <p className="text-xs">No messages yet. Send an audit directive or note to start the conversation.</p>
                                    </div>
                                ) : (
                                    thread_messages.map((msg) => {
                                        const isAdmin = !msg.is_from_founder;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn('flex flex-col max-w-[80%]', isAdmin ? 'ml-auto items-end' : 'mr-auto items-start')}
                                            >
                                                <div className="mb-1 flex items-center gap-1.5 text-[10.5px] text-zinc-400">
                                                    <span className="font-semibold text-zinc-700">{msg.sender_name}</span>
                                                    <span>·</span>
                                                    <span>{msg.created_at}</span>
                                                </div>

                                                <div
                                                    className={cn(
                                                        'rounded-2xl px-4 py-2.5 text-xs shadow-2xs',
                                                        isAdmin
                                                            ? 'bg-zinc-950 text-white rounded-tr-xs'
                                                            : 'border border-zinc-200/90 bg-white text-zinc-900 rounded-tl-xs',
                                                    )}
                                                >
                                                    {msg.body && <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>}

                                                    {msg.has_attachment && msg.attachment_filename && (
                                                        <div
                                                            className={cn(
                                                                'mt-2 flex items-center justify-between gap-3 rounded-xl p-2 text-xs',
                                                                isAdmin ? 'bg-zinc-800/80 text-zinc-200' : 'bg-zinc-50 text-zinc-700 border border-zinc-200/60',
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Icon icon="solar:paperclip-linear" className="size-3.5 shrink-0" />
                                                                <span className="truncate">{msg.attachment_filename}</span>
                                                                {msg.attachment_size && (
                                                                    <span className="text-[10px] opacity-70">({msg.attachment_size})</span>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={route('admin.messages.attachment.download', { message: msg.id })}
                                                                className={cn(
                                                                    'shrink-0 rounded-lg px-2 py-0.5 text-[10.5px] font-semibold',
                                                                    isAdmin ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white',
                                                                )}
                                                            >
                                                                Download
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Composer */}
                            <form onSubmit={submitReply} className="shrink-0 border-t border-zinc-200/80 bg-white p-3.5">
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={replyForm.data.body}
                                        onChange={(e) => replyForm.setData('body', e.target.value)}
                                        placeholder="Type a message or audit response to the founder..."
                                        rows={2}
                                        className="w-full resize-none rounded-xl border border-zinc-200 bg-[#FAFBFD] p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                                        onKeyDown={(e) => {
                                             if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                submitReply(e);
                                            }
                                        }}
                                    />

                                    <div className="flex items-center justify-between">
                                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
                                            <Icon icon="solar:paperclip-linear" className="size-3.5 text-zinc-500" />
                                            <span className="truncate max-w-[140px]">
                                                {replyForm.data.attachment ? replyForm.data.attachment.name : 'Attach file'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => replyForm.setData('attachment', e.target.files ? e.target.files[0] : null)}
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={replyForm.processing || (!replyForm.data.body.trim() && !replyForm.data.attachment)}
                                            className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {replyForm.processing ? (
                                                <Icon icon="solar:refresh-linear" className="size-3 animate-spin" />
                                            ) : (
                                                <Icon icon="solar:plain-3-linear" className="size-3.5" />
                                            )}
                                            <span>Send Message</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── TAB 4: Spotlight Profile ── */}
                    {activeTab === 'Spotlight' && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {profile ? (
                                <>
                                    {/* Left: Syndicate Dossier Overview (7 cols) */}
                                    <div className="space-y-4 lg:col-span-7">
                                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs">
                                            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-950">Investor Spotlight Syndicate</h3>
                                                    <p className="text-[11px] text-zinc-400">Public profile indexed for accredited investor syndication.</p>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                                    <span>{profile.is_live ? 'Live on Syndicate' : profile.is_public ? 'Public Dossier' : 'Draft'}</span>
                                                </span>
                                            </div>

                                            <div className="space-y-3 text-xs">
                                                <div className="flex items-center justify-between border-b border-zinc-100 py-1.5">
                                                    <span className="text-zinc-400">Public Slug</span>
                                                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-800">
                                                        {profile.slug}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between py-1.5">
                                                    <span className="text-zinc-400">Syndicate Spotlight URL</span>
                                                    <a
                                                        href={`/investor/spotlight/${profile.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-900 underline hover:text-zinc-600"
                                                    >
                                                        <span>/investor/spotlight/{profile.slug}</span>
                                                        <Icon icon="solar:arrow-right-up-linear" className="size-3" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex gap-2.5">
                                                <a
                                                    href={`/investor/spotlight/${profile.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-center text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50"
                                                >
                                                    View Public Page
                                                </a>
                                                <Link
                                                    href={`/admin/profiles/${profile.id}`}
                                                    className="flex-1 rounded-xl bg-zinc-950 py-2 text-center text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                                                >
                                                    Edit Spotlight Dossier
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Diligence Badges & Actions (5 cols) */}
                                    <div className="space-y-4 lg:col-span-5">
                                        <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-5 shadow-2xs">
                                            <h4 className="mb-2 text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                                Verified Diligence Badges
                                            </h4>
                                            <p className="mb-4 text-[11px] text-zinc-500">
                                                Badges verified during the audit are displayed on the investor spotlight card.
                                            </p>
                                            <div className="space-y-1.5">
                                                {[
                                                    'LEGAL: VERIFIED',
                                                    'FINANCING: VERIFIED',
                                                    'TECH STACK: AUDITED',
                                                    'CAP TABLE: CLEAN',
                                                    'IP OWNERSHIP: CONFIRMED',
                                                    'UNIT ECONOMICS: VERIFIED',
                                                    'MARKET SIZE: VALIDATED',
                                                ].map((badge) => (
                                                    <div
                                                        key={badge}
                                                        className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-xs"
                                                    >
                                                        <span className="font-semibold text-zinc-800">{badge}</span>
                                                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                                                            <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-600" />
                                                            Active
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="lg:col-span-12">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                        {/* Left: Audit Readiness Checklist (7 cols) */}
                                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs lg:col-span-7">
                                            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-950">Spotlight Syndicate Readiness</h3>
                                                    <p className="text-[11px] text-zinc-400">Prerequisites required before investor spotlight publishing.</p>
                                                </div>
                                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                                    Audit in Review
                                                </span>
                                            </div>

                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon
                                                            icon={payment?.status === 'paid' ? 'solar:check-circle-bold' : 'solar:clock-circle-linear'}
                                                            className={cn('size-4', payment?.status === 'paid' ? 'text-emerald-600' : 'text-zinc-400')}
                                                        />
                                                        <span className="font-semibold text-zinc-900">Audit Payment Confirmed</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-zinc-500 capitalize">{payment?.status ?? 'Pending'}</span>
                                                </div>

                                                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon
                                                            icon={signature?.status === 'signed' ? 'solar:check-circle-bold' : 'solar:clock-circle-linear'}
                                                            className={cn('size-4', signature?.status === 'signed' ? 'text-emerald-600' : 'text-zinc-400')}
                                                        />
                                                        <span className="font-semibold text-zinc-900">Legal Agreement & NDA Executed</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-zinc-500 capitalize">{signature?.status ?? 'Pending'}</span>
                                                </div>

                                                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon
                                                            icon={founder.score ? 'solar:check-circle-bold' : 'solar:clock-circle-linear'}
                                                            className={cn('size-4', founder.score ? 'text-emerald-600' : 'text-zinc-400')}
                                                        />
                                                        <span className="font-semibold text-zinc-900">PARAGON Diagnostic Assessed</span>
                                                    </div>
                                                    <span className="font-mono text-[11px] font-bold text-zinc-900">{founder.score ? `${founder.score}/100` : '—'}</span>
                                                </div>

                                                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-[#FAFBFD] p-3 text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon
                                                            icon={documents.length > 0 ? 'solar:check-circle-bold' : 'solar:clock-circle-linear'}
                                                            className={cn('size-4', documents.length > 0 ? 'text-emerald-600' : 'text-zinc-400')}
                                                        />
                                                        <span className="font-semibold text-zinc-900">Audit Documents Submitted</span>
                                                    </div>
                                                    <span className="font-mono text-[11px] font-bold text-zinc-900">{documents.length} Files</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Publish Action Card (5 cols) */}
                                        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-6 shadow-2xs lg:col-span-5">
                                            <div className="space-y-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                                                    <Icon icon="solar:crown-linear" className="size-5 text-amber-400" />
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-950">Publish Investor Spotlight Profile</h4>
                                                <p className="text-xs leading-relaxed text-zinc-500">
                                                    Finalizing the audit marks the venture as complete, mints the verification badges, indexes the founder for syndicate matching, and notifies all parties.
                                                </p>
                                            </div>

                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        auditForm.setData('audit_status', 'complete');
                                                        auditForm.setData(
                                                            'response_message',
                                                            'PARAGON Audit complete. Your Investor Spotlight profile is now live and syndicated.',
                                                        );
                                                        auditForm.setData('send_message_to_founder', true);
                                                        router.patch(
                                                            route('admin.founders.audit-status', { founder: founder.id }),
                                                            {
                                                                audit_status: 'complete',
                                                                response_message:
                                                                    'PARAGON Audit complete. Your Investor Spotlight profile is now live and syndicated.',
                                                                send_message_to_founder: true,
                                                            },
                                                            { preserveScroll: true },
                                                        );
                                                    }}
                                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-zinc-800"
                                                >
                                                    <Icon icon="solar:check-circle-linear" className="size-4 text-emerald-400" />
                                                    <span>Complete Audit & Launch Spotlight</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
