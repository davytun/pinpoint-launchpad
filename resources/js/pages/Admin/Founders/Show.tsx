import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, MessageSquare, Zap } from 'lucide-react';
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
        id: number;
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
    documents: { id: number; original_filename: string; type: string; reviewed: boolean; created_at: string }[];
    message_thread: { id: number; total_messages: number; unread_count: number } | null;
    profile: { id: number; is_live: boolean; is_public: boolean; slug: string } | null;
    assignment: { analyst_id: number; analyst_name: string | null; assigned_at: string | null; notes: string | null } | null;
    analysts: Analyst[];
    user_role: 'superadmin' | 'analyst' | 'support';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const auditStatusColors: Record<string, string> = {
    pending: 'bg-zinc-100 text-zinc-650 border border-zinc-200',
    in_progress: 'bg-amber-50 text-amber-700 border border-amber-250',
    needs_info: 'bg-red-50 text-red-700 border border-red-250',
    on_hold: 'bg-orange-50 text-orange-700 border border-orange-250',
    complete: 'bg-emerald-50 text-emerald-700 border border-emerald-250',
};

const scoreBandColor: Record<string, string> = {
    low: 'text-red-650 font-bold',
    mid_low: 'text-amber-605 font-bold',
    mid_high: 'text-[#3A54A5] font-bold',
    high: 'text-emerald-650 font-bold',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500 uppercase">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 border-b border-zinc-200/60 py-2.5 last:border-0">
            <span className="shrink-0 text-xs font-semibold text-zinc-500">{label}</span>
            <span className="text-right text-sm font-bold text-zinc-950">{value ?? '—'}</span>
        </div>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Documents', 'Messages', 'Profile'];

// ─── Page ─────────────────────────────────────────────────────────────────────

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

    const auditForm = useForm({ audit_status: payment?.audit_status ?? '' });
    const assignForm = useForm({ analyst_id: assignment?.analyst_id?.toString() ?? '', notes: assignment?.notes ?? '' });

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
            <Head title={`${founder.company_name ?? founder.full_name} — Admin`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Back */}
                <Link
                    href={route('admin.founders.index')}
                    className="text-zinc-550 mb-6 inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-zinc-950"
                >
                    <ArrowLeft className="size-4" /> Back to Founders
                </Link>

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-zinc-955 flex items-center gap-2 text-2xl font-extrabold">
                            {founder.company_name ?? founder.full_name ?? '—'}
                            {(founder.score ?? 0) > 85 && (
                                <span title="High Velocity">
                                    <Zap className="text-amber-550 size-5" />
                                </span>
                            )}
                        </h1>
                        <p className="text-zinc-550 mt-1 text-sm font-medium">
                            {founder.full_name} · {founder.email}
                        </p>
                    </div>
                    {payment?.audit_status && (
                        <span
                            className={cn(
                                'rounded-full border px-3 py-1 text-xs font-extrabold tracking-wide uppercase shadow-xs',
                                auditStatusColors[payment.audit_status] ?? 'border-zinc-200 bg-zinc-100 text-zinc-500',
                            )}
                        >
                            {payment.audit_status.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {(flash?.success || flash?.error) && (
                    <div
                        className={cn(
                            'mb-4 rounded-xl border px-4 py-3 text-sm font-semibold',
                            flash.success ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700' : 'border-rose-500/25 bg-rose-50 text-rose-700',
                        )}
                    >
                        {flash.success ?? flash.error}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex gap-1 border-b border-zinc-200">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                '-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition-colors',
                                activeTab === tab
                                    ? 'border-[#3A54A5] text-[#3A54A5]'
                                    : 'text-zinc-550 border-transparent hover:border-zinc-300 hover:text-zinc-950',
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Overview ── */}
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Founder details */}
                        <Card title="Founder Details">
                            <Field label="Full Name" value={founder.full_name} />
                            <Field label="Company" value={founder.company_name} />
                            <Field label="Email" value={founder.email} />
                            <Field label="Phone" value={founder.phone} />
                            <Field label="Member Since" value={founder.created_at} />
                            <Field label="Last Login" value={founder.last_login_at} />
                        </Card>

                        {/* PARAGON Score */}
                        <Card title="PARAGON Score">
                            <div className="mb-4 flex items-center gap-4">
                                <span className={`text-5xl font-extrabold ${scoreBandColor[founder.score_band ?? ''] ?? 'text-zinc-800'}`}>
                                    {founder.score ?? '—'}
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500">Score Band</p>
                                    <p className="mt-0.5 text-sm font-extrabold text-zinc-950 capitalize">
                                        {founder.score_band?.replace('_', ' ') ?? '—'}
                                    </p>
                                    <p className="text-zinc-450 mt-0.5 text-xs font-semibold capitalize">Tier: {founder.tier ?? '—'}</p>
                                </div>
                            </div>
                            {founder.pillar_scores && (
                                <div className="space-y-2.5">
                                    {Object.entries(founder.pillar_scores).map(([pillar, score]) => (
                                        <div key={pillar} className="flex items-center gap-3">
                                            <span className="text-zinc-650 w-24 shrink-0 text-xs font-semibold capitalize">{pillar}</span>
                                            <div className="h-1.5 flex-1 rounded-full border border-zinc-200 bg-zinc-100/50">
                                                <div className="h-1.5 rounded-full bg-[#3A54A5]" style={{ width: `${Math.round(score)}%` }} />
                                            </div>
                                            <span className="w-8 text-right font-mono text-xs font-bold text-zinc-700">{Math.round(score)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Audit status */}
                        {canEdit && payment && (
                            <Card title="Audit Status">
                                <form onSubmit={submitAuditStatus} className="space-y-3">
                                    <select
                                        value={auditForm.data.audit_status}
                                        onChange={(e) => auditForm.setData('audit_status', e.target.value)}
                                        className="text-zinc-955 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xs focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="needs_info">Needs Info</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="complete">Complete</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={auditForm.processing}
                                        className="w-full rounded-xl bg-[#3A54A5] py-2 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-50"
                                    >
                                        {auditForm.processing ? 'Updating…' : 'Update Status'}
                                    </button>
                                </form>
                            </Card>
                        )}

                        {/* Assignment */}
                        <Card title="Assigned Analyst">
                            {assignment ? (
                                <div className="mb-4">
                                    <p className="font-bold text-zinc-900">{assignment.analyst_name ?? '—'}</p>
                                    <p className="mt-0.5 text-xs text-zinc-500">Assigned {assignment.assigned_at}</p>
                                    {assignment.notes && (
                                        <p className="mt-2 rounded-lg border border-zinc-200/80 bg-zinc-50 p-2.5 text-xs text-zinc-600 italic">
                                            {assignment.notes}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mb-4 text-sm font-semibold text-zinc-500">No analyst assigned yet.</p>
                            )}
                            {isSuperAdmin && (
                                <>
                                    {showAssign ? (
                                        <form onSubmit={submitAssign} className="space-y-3">
                                            <select
                                                value={assignForm.data.analyst_id}
                                                onChange={(e) => assignForm.setData('analyst_id', e.target.value)}
                                                className="text-zinc-955 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xs focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                                                required
                                            >
                                                <option value="">Select analyst…</option>
                                                {analysts.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea
                                                value={assignForm.data.notes}
                                                onChange={(e) => assignForm.setData('notes', e.target.value)}
                                                placeholder="Notes…"
                                                rows={2}
                                                maxLength={500}
                                                className="text-zinc-955 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAssign(false)}
                                                    className="text-zinc-650 flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={assignForm.processing}
                                                    className="flex-1 rounded-xl bg-[#3A54A5] py-2 text-xs font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg disabled:opacity-50"
                                                >
                                                    {assignForm.processing ? 'Assigning…' : 'Assign'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setShowAssign(true)}
                                            className="text-zinc-650 w-full rounded-xl border border-zinc-200 bg-white py-2 text-xs font-bold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                                        >
                                            {assignment ? 'Change Analyst' : 'Assign Analyst'}
                                        </button>
                                    )}
                                </>
                            )}
                        </Card>

                        {/* Payment */}
                        {payment && (
                            <Card title="Payment">
                                <Field label="Tier" value={<span className="capitalize">{payment.tier}</span>} />
                                <Field label="Amount" value={`${payment.currency} ${payment.total_amount.toLocaleString()}`} />
                                <Field label="Status" value={payment.status} />
                                <Field label="Paid At" value={payment.paid_at} />
                                <Field label="Reference" value={<span className="font-mono text-xs">{payment.paystack_reference}</span>} />
                            </Card>
                        )}

                        {/* Signature */}
                        <Card title="Agreement">
                            {signature ? (
                                <>
                                    <Field label="Status" value={signature.status} />
                                    <Field label="Signed By" value={signature.signer_name} />
                                    <Field label="Signed At" value={signature.signed_at} />
                                </>
                            ) : (
                                <p className="text-sm font-semibold text-zinc-500">No signature on record.</p>
                            )}
                        </Card>
                    </div>
                )}

                {/* ── Documents ── */}
                {activeTab === 'Documents' && (
                    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        {documents.length === 0 ? (
                            <div className="text-zinc-550 py-16 text-center text-sm font-medium">No documents uploaded.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            {['Filename', 'Type', 'Reviewed', 'Uploaded', 'Actions'].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {documents.map((doc) => (
                                            <tr key={doc.id} className="group transition-colors hover:bg-zinc-50/40">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="size-4 shrink-0 text-zinc-400" />
                                                        <span className="max-w-[200px] truncate font-semibold text-zinc-900">
                                                            {doc.original_filename}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-zinc-650 px-5 py-3.5 font-medium capitalize">{doc.type}</td>
                                                <td className="px-5 py-3.5">
                                                    {doc.reviewed ? (
                                                        <CheckCircle2 className="text-emerald-650 size-4" />
                                                    ) : (
                                                        <span className="text-zinc-450 text-xs font-bold">Pending</span>
                                                    )}
                                                </td>
                                                <td className="text-zinc-650 px-5 py-3.5 font-medium">{doc.created_at}</td>
                                                <td className="px-5 py-3.5">
                                                    <a
                                                        href={route('admin.documents.download', { founder: founder.id, document: doc.id })}
                                                        className="text-xs font-extrabold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#2D4182]"
                                                    >
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Messages ── */}
                {activeTab === 'Messages' && (
                    <div className="rounded-2xl border border-white/80 bg-white/30 p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        {message_thread ? (
                            <>
                                <MessageSquare className="mx-auto mb-3 size-10 text-zinc-400" />
                                <p className="font-bold text-zinc-900">{message_thread.total_messages} messages</p>
                                {message_thread.unread_count > 0 && (
                                    <p className="mt-1 text-sm font-semibold text-amber-600">{message_thread.unread_count} unread</p>
                                )}
                                <Link
                                    href={route('admin.messages.show', { thread: message_thread.id })}
                                    className="mt-4 inline-block rounded-xl bg-[#3A54A5] px-5 py-2 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg"
                                >
                                    <span className="flex items-center gap-2">
                                        Open Thread
                                        <ArrowRight className="size-4" />
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <MessageSquare className="mx-auto mb-3 size-10 text-zinc-400" />
                                <p className="text-zinc-550 text-sm font-semibold">No messages yet.</p>
                            </>
                        )}
                    </div>
                )}

                {/* ── Profile ── */}
                {activeTab === 'Profile' && (
                    <div className="rounded-2xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                        {profile ? (
                            <div className="space-y-4">
                                <Field
                                    label="Status"
                                    value={
                                        profile.is_live ? (
                                            <span className="text-emerald-650">Live</span>
                                        ) : profile.is_public ? (
                                            'Public (not live)'
                                        ) : (
                                            'Draft'
                                        )
                                    }
                                />
                                <Field
                                    label="Slug"
                                    value={
                                        <span className="rounded bg-zinc-100/60 px-2 py-1 font-mono text-xs font-bold text-zinc-800">
                                            {profile.slug}
                                        </span>
                                    }
                                />
                                <div className="flex gap-3 pt-2">
                                    <a
                                        href={`/verify/${profile.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group text-zinc-650 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            View Public Page
                                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </a>
                                    <Link
                                        href={route('admin.profiles.show', { profile: profile.id })}
                                        className="group rounded-xl bg-[#3A54A5] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-colors hover:bg-[#2D4182] hover:shadow-lg"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            Edit Profile
                                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-550 text-sm font-medium">
                                No investor profile yet. It is created automatically when the audit is marked complete.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
