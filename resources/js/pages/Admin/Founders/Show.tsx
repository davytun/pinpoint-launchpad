import { Icon } from '@iconify/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analyst {
    id: number;
    name: string;
    email: string;
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
    documents: { id: string; original_filename: string; type: string; reviewed: boolean; created_at: string }[];
    message_thread: { id: number; total_messages: number; unread_count: number } | null;
    profile: { id: string; is_live: boolean; is_public: boolean; slug: string } | null;
    assignment: { analyst_id: number; analyst_name: string | null; assigned_at: string | null; notes: string | null } | null;
    analysts: Analyst[];
    user_role: 'superadmin' | 'analyst' | 'support' | 'investor_relations';
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-5 shadow-2xs space-y-3">
            <h3 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-2 last:border-0">
            <span className="shrink-0 text-xs text-zinc-400 font-medium">{label}</span>
            <span className="text-right text-xs font-semibold text-zinc-950">{value ?? '—'}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'complete':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <Icon icon="solar:check-circle-linear" className="size-3 text-emerald-600" />
                    <span>Complete</span>
                </span>
            );
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-900">
                    <Icon icon="solar:refresh-linear" className="size-3 text-zinc-600" />
                    <span>In Progress</span>
                </span>
            );
        case 'needs_info':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <Icon icon="solar:danger-circle-linear" className="size-3 text-amber-600" />
                    <span>Needs Info</span>
                </span>
            );
        case 'on_hold':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    <Icon icon="solar:pause-circle-linear" className="size-3 text-zinc-500" />
                    <span>On Hold</span>
                </span>
            );
        case 'pending':
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    <Icon icon="solar:clock-circle-linear" className="size-3 text-zinc-400" />
                    <span>Pending</span>
                </span>
            );
    }
}

const TABS = ['Overview', 'Documents', 'Messages', 'Profile'];

export default function AdminFoundersShow({
    founder,
    payment,
    signature,
    documents,
    message_thread,
    profile,
    assignment,
    analysts,
    user_role,
}: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst = user_role === 'analyst';
    const canEdit = isSuperAdmin || isAnalyst;

    const [activeTab, setActiveTab] = useState('Overview');
    const [showAssign, setShowAssign] = useState(false);

    const auditForm = useForm({ audit_status: payment?.audit_status ?? 'pending' });
    const assignForm = useForm({
        analyst_id: assignment?.analyst_id?.toString() ?? '',
        notes: assignment?.notes ?? '',
    });

    function submitAuditStatus(e: React.FormEvent) {
        e.preventDefault();
        auditForm.patch(route('admin.founders.audit-status', { founder: founder.id }));
    }

    function submitAssign(e: React.FormEvent) {
        e.preventDefault();
        assignForm.post(route('admin.founders.assign', { founder: founder.id }), {
            onSuccess: () => setShowAssign(false),
        });
    }

    return (
        <AdminLayout>
            <Head title={`${founder.company_name ?? founder.full_name} — Founder Dossier`} />

            {/* ── Main Full-Height Container (Refero Spec) ─────────────────────── */}
            <div className="flex flex-1 min-w-0 h-full max-h-full flex-col bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-xs overflow-hidden p-6 lg:p-8">
                {/* ── Top Bar ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0 mb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.founders.index')}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 shadow-2xs transition-colors"
                            title="Back to Directory"
                        >
                            <Icon icon="solar:arrow-left-linear" className="size-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-zinc-950">
                                    {founder.company_name ?? founder.full_name ?? 'Startup'}
                                </h1>
                                {(founder.score ?? 0) > 85 && (
                                    <span title="High Velocity">
                                        <Icon icon="solar:bolt-linear" className="size-4 text-amber-500" />
                                    </span>
                                )}
                                {payment?.audit_status && <StatusBadge status={payment.audit_status} />}
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {founder.full_name} · <span className="font-mono">{founder.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {message_thread && (
                            <Link
                                href={route('admin.messages.show', { thread: message_thread.id })}
                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                            >
                                <Icon icon="solar:chat-round-dots-linear" className="size-3.5 text-zinc-500" />
                                <span>Message Founder</span>
                            </Link>
                        )}

                        {profile && (
                            <a
                                href={`/verify/${profile.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                            >
                                <Icon icon="solar:link-circle-linear" className="size-3.5 text-zinc-500" />
                                <span>Public Spotlight</span>
                            </a>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-xs font-semibold text-emerald-800 shrink-0">
                        {flash.success}
                    </div>
                )}

                {/* ── Navigation Tabs ─────────────────────────────────────────── */}
                <div className="flex items-center gap-1 shrink-0 pb-3 border-b border-zinc-100 mb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                                activeTab === tab
                                    ? 'bg-zinc-100 border border-zinc-200/80 text-zinc-950 font-semibold shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent',
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Scrollable Tab Body (No Scrollbars) ──────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                    {/* ── Overview Tab ── */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Founder Details */}
                            <Card title="Founder & Entity Details">
                                <Field label="Full Legal Name" value={founder.full_name} />
                                <Field label="Company / Entity" value={founder.company_name} />
                                <Field label="Direct Email" value={<span className="font-mono text-[11px]">{founder.email}</span>} />
                                <Field label="Contact Phone" value={founder.phone} />
                                <Field label="Registered Date" value={founder.created_at} />
                                <Field label="Last Active" value={founder.last_login_at} />
                            </Card>

                            {/* PARAGON Score */}
                            <Card title="PARAGON Diagnostic Assessment">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold font-mono text-zinc-950">
                                            {founder.score ?? '—'}
                                        </span>
                                        <span className="text-xs text-zinc-400 font-mono">/ 100</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-zinc-400 block">Venture Tier</span>
                                        <span className="text-xs font-semibold text-zinc-900 capitalize">
                                            {founder.tier ?? '—'}
                                        </span>
                                    </div>
                                </div>

                                {founder.pillar_scores && (
                                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                                        {Object.entries(founder.pillar_scores).map(([pillar, score]) => (
                                            <div key={pillar} className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-medium text-zinc-600 capitalize">{pillar}</span>
                                                    <span className="font-bold text-zinc-900 font-mono">{Math.round(score)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-zinc-200/60 overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Audit Status Controller */}
                            {canEdit && payment && (
                                <Card title="Audit Status Controller">
                                    <form onSubmit={submitAuditStatus} className="space-y-3">
                                        <select
                                            value={auditForm.data.audit_status}
                                            onChange={(e) => auditForm.setData('audit_status', e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none shadow-2xs"
                                        >
                                            <option value="pending">Pending Review</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="needs_info">Needs Information</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="complete">Complete & Verified</option>
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={auditForm.processing}
                                            className="w-full rounded-xl bg-zinc-950 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {auditForm.processing ? 'Updating Status…' : 'Save Audit Status'}
                                        </button>
                                    </form>
                                </Card>
                            )}

                            {/* Assigned Analyst */}
                            <Card title="Assigned Analyst">
                                {assignment ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-zinc-900">
                                                {assignment.analyst_name ?? '—'}
                                            </span>
                                            <span className="text-[11px] text-zinc-400">
                                                Assigned {assignment.assigned_at}
                                            </span>
                                        </div>
                                        {assignment.notes && (
                                            <p className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-2.5 text-xs text-zinc-600">
                                                {assignment.notes}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400 font-medium">No analyst lead assigned yet.</p>
                                )}

                                {isSuperAdmin && (
                                    <div className="pt-2 border-t border-zinc-100">
                                        {showAssign ? (
                                            <form onSubmit={submitAssign} className="space-y-3">
                                                <select
                                                    value={assignForm.data.analyst_id}
                                                    onChange={(e) => assignForm.setData('analyst_id', e.target.value)}
                                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none shadow-2xs"
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
                                                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 shadow-2xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={assignForm.processing}
                                                        className="flex-1 rounded-xl bg-zinc-950 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs disabled:opacity-50"
                                                    >
                                                        {assignForm.processing ? 'Assigning…' : 'Save Assignment'}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setShowAssign(true)}
                                                className="w-full rounded-xl border border-zinc-200/80 bg-white py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
                                            >
                                                {assignment ? 'Change Assigned Analyst' : 'Assign Analyst Lead'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Card>

                            {/* Payment Record */}
                            {payment && (
                                <Card title="Audit Payment & Package">
                                    <Field label="Tier Level" value={<span className="capitalize">{payment.tier}</span>} />
                                    <Field label="Amount Paid" value={`${payment.currency} ${payment.total_amount.toLocaleString()}`} />
                                    <Field label="Payment Status" value={payment.status} />
                                    <Field label="Paid Date" value={payment.paid_at} />
                                    <Field label="Reference" value={<span className="font-mono text-[11px]">{payment.paystack_reference}</span>} />
                                </Card>
                            )}

                            {/* Agreement & Signature */}
                            <Card title="Legal Agreement & NDA">
                                {signature ? (
                                    <>
                                        <Field label="Status" value={signature.status} />
                                        <Field label="Signer" value={signature.signer_name} />
                                        <Field label="Timestamp" value={signature.signed_at} />
                                    </>
                                ) : (
                                    <p className="text-xs text-zinc-400 font-medium">No signature agreement on record.</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* ── Documents Tab ── */}
                    {activeTab === 'Documents' && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-2xs">
                            {documents.length === 0 ? (
                                <div className="py-16 text-center text-xs text-zinc-400">
                                    <Icon icon="solar:document-text-linear" className="size-8 text-zinc-300 mx-auto mb-2" />
                                    No audit documents uploaded yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 text-xs">
                                    <div className="flex items-center gap-4 px-5 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                                        <div className="w-1/3 min-w-0">Filename</div>
                                        <div className="w-1/4 min-w-0">Category</div>
                                        <div className="w-1/6 min-w-0">Verification</div>
                                        <div className="w-1/6 min-w-0">Uploaded</div>
                                        <div className="w-20 shrink-0 text-right">Action</div>
                                    </div>
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50/60 transition-colors">
                                            <div className="w-1/3 min-w-0 flex items-center gap-2 font-medium text-zinc-950">
                                                <Icon icon="solar:document-text-linear" className="size-4 text-zinc-400 shrink-0" />
                                                <span className="truncate">{doc.original_filename}</span>
                                            </div>
                                            <div className="w-1/4 min-w-0 text-zinc-600 capitalize">
                                                {doc.type}
                                            </div>
                                            <div className="w-1/6 min-w-0">
                                                {doc.reviewed ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2 py-0.2 text-[10.5px] font-medium">
                                                        <Icon icon="solar:check-circle-linear" className="size-3" />
                                                        <span>Verified</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-full px-2 py-0.2 text-[10.5px] font-medium">
                                                        <span>Pending</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-1/6 min-w-0 text-zinc-400 text-[11.5px]">
                                                {doc.created_at}
                                            </div>
                                            <div className="w-20 shrink-0 text-right">
                                                <a
                                                    href={route('admin.documents.download', { founder: founder.id, document: doc.id })}
                                                    className="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
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

                    {/* ── Messages Tab ── */}
                    {activeTab === 'Messages' && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-8 text-center shadow-2xs max-w-md mx-auto space-y-4">
                            <Icon icon="solar:chat-round-dots-linear" className="size-10 text-zinc-300 mx-auto" />
                            <div>
                                <h4 className="text-sm font-bold text-zinc-950">Analyst Communications Thread</h4>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {message_thread
                                        ? `${message_thread.total_messages} messages exchanged with this founder.`
                                        : 'No direct messages exchanged yet.'}
                                </p>
                            </div>
                            {message_thread && (
                                <Link
                                    href={route('admin.messages.show', { thread: message_thread.id })}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 transition-colors"
                                >
                                    <span>Open Live Conversation</span>
                                    <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                                </Link>
                            )}
                        </div>
                    )}

                    {/* ── Profile Tab ── */}
                    {activeTab === 'Profile' && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs max-w-lg space-y-4">
                            {profile ? (
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                        <span className="text-zinc-400">Spotlight Status</span>
                                        <span className="font-semibold text-zinc-950">
                                            {profile.is_live ? 'Live on Syndicate Spotlight' : profile.is_public ? 'Public Dossier' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                        <span className="text-zinc-400">Public Slug</span>
                                        <span className="font-mono text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-md">
                                            {profile.slug}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <a
                                            href={`/verify/${profile.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
                                        >
                                            View Public Page
                                        </a>
                                        <Link
                                            href={route('admin.spotlight.index')}
                                            className="flex-1 rounded-xl bg-zinc-950 py-2 text-center text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs transition-colors"
                                        >
                                            Spotlight Hub
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-400 py-8 text-center">
                                    No investor spotlight profile yet. Complete the PARAGON audit to generate one automatically.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
