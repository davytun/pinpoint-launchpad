import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileText, MessageSquare, Zap } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analyst { id: number; name: string; email: string }

interface PageProps {
    founder: {
        id: number; full_name: string | null; company_name: string | null;
        email: string; phone: string | null; created_at: string;
        last_login_at: string | null; score: number | null;
        score_band: string | null; tier: string | null;
        pillar_scores: Record<string, number> | null;
    };
    payment: {
        id: number; tier: string; total_amount: number; currency: string;
        status: string; audit_status: string; paid_at: string | null;
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
    pending:     'bg-slate-700 text-slate-300',
    in_progress: 'bg-amber-500/20 text-amber-400',
    needs_info:  'bg-red-500/20 text-red-400',
    on_hold:     'bg-orange-500/20 text-orange-400',
    complete:    'bg-emerald-500/20 text-emerald-400',
};

const scoreBandColor: Record<string, string> = {
    low: 'text-red-400', mid_low: 'text-amber-400', mid_high: 'text-[#4468BB]', high: 'text-emerald-400',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-[#232C43] bg-[#101623] p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#576FA8]">{title}</h3>
            {children}
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 py-2 border-b border-[#232C43] last:border-0">
            <span className="text-xs text-[#576FA8] shrink-0">{label}</span>
            <span className="text-sm text-[#ECF0F9] text-right">{value ?? '—'}</span>
        </div>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Documents', 'Messages', 'Profile'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminFoundersShow({ founder, payment, signature, documents, message_thread, profile, assignment, analysts, user_role }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const isSuperAdmin = user_role === 'superadmin';
    const isAnalyst    = user_role === 'analyst';
    const canEdit      = isSuperAdmin || isAnalyst;

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
                <Link href={route('admin.founders.index')} className="mb-6 inline-flex items-center gap-2 text-sm text-[#788CBA] hover:text-[#ECF0F9] transition-colors">
                    <ArrowLeft className="size-4" /> Back to Founders
                </Link>

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#ECF0F9] flex items-center gap-2">
                            {founder.company_name ?? founder.full_name ?? '—'}
                            {(founder.score ?? 0) > 85 && <Zap className="size-5 text-amber-400" title="High Velocity" />}
                        </h1>
                        <p className="mt-1 text-sm text-[#788CBA]">{founder.full_name} · {founder.email}</p>
                    </div>
                    {payment?.audit_status && (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${auditStatusColors[payment.audit_status] ?? 'bg-[#0C1427] text-[#788CBA]'}`}>
                            {payment.audit_status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                    )}
                </div>

                {(flash?.success || flash?.error) && (
                    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${flash.success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        {flash.success ?? flash.error}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex gap-1 border-b border-[#232C43]">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={[
                                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                                activeTab === tab
                                    ? 'border-[#4468BB] text-[#ECF0F9]'
                                    : 'border-transparent text-[#788CBA] hover:text-[#ECF0F9]',
                            ].join(' ')}
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
                            <Field label="Full Name"    value={founder.full_name} />
                            <Field label="Company"      value={founder.company_name} />
                            <Field label="Email"        value={founder.email} />
                            <Field label="Phone"        value={founder.phone} />
                            <Field label="Member Since" value={founder.created_at} />
                            <Field label="Last Login"   value={founder.last_login_at} />
                        </Card>

                        {/* PARAGON Score */}
                        <Card title="PARAGON Score">
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`text-5xl font-bold ${scoreBandColor[founder.score_band ?? ''] ?? 'text-[#ECF0F9]'}`}>
                                    {founder.score ?? '—'}
                                </span>
                                <div>
                                    <p className="text-xs text-[#576FA8]">Score Band</p>
                                    <p className="text-sm font-medium capitalize text-[#ECF0F9]">{founder.score_band?.replace('_', ' ') ?? '—'}</p>
                                    <p className="text-xs text-[#576FA8] capitalize">Tier: {founder.tier ?? '—'}</p>
                                </div>
                            </div>
                            {founder.pillar_scores && (
                                <div className="space-y-2">
                                    {Object.entries(founder.pillar_scores).map(([pillar, score]) => (
                                        <div key={pillar} className="flex items-center gap-3">
                                            <span className="w-24 text-xs capitalize text-[#788CBA] shrink-0">{pillar}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-[#080B11] border border-[#232C43]">
                                                <div className="h-1.5 rounded-full bg-[#4468BB]" style={{ width: `${Math.round(score)}%` }} />
                                            </div>
                                            <span className="w-8 text-right text-xs font-mono text-[#788CBA]">{Math.round(score)}</span>
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
                                        className="w-full rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#ECF0F9] focus:outline-none focus:border-[#4468BB]/50"
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
                                        className="w-full rounded-xl border border-[#4468BB]/30 bg-[#1B294B] py-2 text-sm font-bold text-[#4468BB] hover:bg-[#4468BB]/20 disabled:opacity-50 transition-colors"
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
                                    <p className="font-medium text-[#ECF0F9]">{assignment.analyst_name ?? '—'}</p>
                                    <p className="text-xs text-[#576FA8]">Assigned {assignment.assigned_at}</p>
                                    {assignment.notes && <p className="mt-2 text-xs text-[#788CBA] italic">{assignment.notes}</p>}
                                </div>
                            ) : (
                                <p className="mb-4 text-sm text-[#576FA8]">No analyst assigned yet.</p>
                            )}
                            {isSuperAdmin && (
                                <>
                                    {showAssign ? (
                                        <form onSubmit={submitAssign} className="space-y-3">
                                            <select
                                                value={assignForm.data.analyst_id}
                                                onChange={(e) => assignForm.setData('analyst_id', e.target.value)}
                                                className="w-full rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2.5 text-sm text-[#ECF0F9] focus:outline-none"
                                                required
                                            >
                                                <option value="">Select analyst…</option>
                                                {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                            <textarea
                                                value={assignForm.data.notes}
                                                onChange={(e) => assignForm.setData('notes', e.target.value)}
                                                placeholder="Notes…" rows={2} maxLength={500}
                                                className="w-full resize-none rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2 text-sm text-[#ECF0F9] placeholder:text-[#576FA8] focus:outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setShowAssign(false)} className="flex-1 rounded-xl border border-[#232C43] py-2 text-xs text-[#788CBA] hover:bg-[#1B294B] transition-colors">Cancel</button>
                                                <button type="submit" disabled={assignForm.processing} className="flex-1 rounded-xl border border-[#4468BB]/30 bg-[#1B294B] py-2 text-xs font-bold text-[#4468BB] hover:bg-[#4468BB]/20 disabled:opacity-50 transition-colors">
                                                    {assignForm.processing ? 'Assigning…' : 'Assign'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button onClick={() => setShowAssign(true)} className="w-full rounded-xl border border-[#232C43] py-2 text-xs font-medium text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9] transition-colors">
                                            {assignment ? 'Change Analyst' : 'Assign Analyst'}
                                        </button>
                                    )}
                                </>
                            )}
                        </Card>

                        {/* Payment */}
                        {payment && (
                            <Card title="Payment">
                                <Field label="Tier"       value={<span className="capitalize">{payment.tier}</span>} />
                                <Field label="Amount"     value={`${payment.currency} ${(payment.total_amount / 100).toLocaleString()}`} />
                                <Field label="Status"     value={payment.status} />
                                <Field label="Paid At"    value={payment.paid_at} />
                                <Field label="Reference"  value={<span className="font-mono text-xs">{payment.paystack_reference}</span>} />
                            </Card>
                        )}

                        {/* Signature */}
                        <Card title="Agreement">
                            {signature ? (
                                <>
                                    <Field label="Status"    value={signature.status} />
                                    <Field label="Signed By" value={signature.signer_name} />
                                    <Field label="Signed At" value={signature.signed_at} />
                                </>
                            ) : (
                                <p className="text-sm text-[#576FA8]">No signature on record.</p>
                            )}
                        </Card>
                    </div>
                )}

                {/* ── Documents ── */}
                {activeTab === 'Documents' && (
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] overflow-hidden">
                        {documents.length === 0 ? (
                            <div className="py-16 text-center text-sm text-[#788CBA]">No documents uploaded.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        {['Filename', 'Type', 'Reviewed', 'Uploaded', 'Actions'].map((h) => (
                                            <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#576FA8]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="border-b border-[#232C43] last:border-0 hover:bg-[#1B294B]/30 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="size-4 shrink-0 text-[#576FA8]" />
                                                    <span className="text-[#ECF0F9] truncate max-w-[200px]">{doc.original_filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 capitalize text-[#788CBA]">{doc.type}</td>
                                            <td className="px-5 py-3.5">
                                                {doc.reviewed
                                                    ? <CheckCircle2 className="size-4 text-emerald-400" />
                                                    : <span className="text-xs text-[#576FA8]">Pending</span>
                                                }
                                            </td>
                                            <td className="px-5 py-3.5 text-[#788CBA]">{doc.created_at}</td>
                                            <td className="px-5 py-3.5">
                                                <a href={route('admin.documents.download', { founder: founder.id, document: doc.id })} className="text-xs font-bold uppercase tracking-wider text-[#4468BB] hover:text-[#788CBA] transition-colors">
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── Messages ── */}
                {activeTab === 'Messages' && (
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-6 text-center">
                        {message_thread ? (
                            <>
                                <MessageSquare className="mx-auto mb-3 size-10 text-[#576FA8]" />
                                <p className="text-[#ECF0F9] font-medium">{message_thread.total_messages} messages</p>
                                {message_thread.unread_count > 0 && (
                                    <p className="mt-1 text-sm text-amber-400">{message_thread.unread_count} unread</p>
                                )}
                                <Link
                                    href={route('admin.messages.show', { thread: message_thread.id })}
                                    className="mt-4 inline-block rounded-xl border border-[#4468BB]/30 bg-[#1B294B] px-5 py-2 text-sm font-bold text-[#4468BB] hover:bg-[#4468BB]/20 transition-colors"
                                >
                                    Open Thread →
                                </Link>
                            </>
                        ) : (
                            <>
                                <MessageSquare className="mx-auto mb-3 size-10 text-[#576FA8]" />
                                <p className="text-sm text-[#788CBA]">No messages yet.</p>
                            </>
                        )}
                    </div>
                )}

                {/* ── Profile ── */}
                {activeTab === 'Profile' && (
                    <div className="rounded-xl border border-[#232C43] bg-[#101623] p-6">
                        {profile ? (
                            <div className="space-y-4">
                                <Field label="Status"    value={profile.is_live ? <span className="text-emerald-400">Live</span> : profile.is_public ? 'Public (not live)' : 'Draft'} />
                                <Field label="Slug"      value={<span className="font-mono text-xs">{profile.slug}</span>} />
                                <div className="flex gap-3 pt-2">
                                    <a href={`/verify/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                                        className="rounded-xl border border-[#232C43] px-4 py-2 text-xs text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9] transition-colors">
                                        View Public Page →
                                    </a>
                                    <Link href={route('admin.profiles.show', { profile: profile.id })}
                                        className="rounded-xl border border-[#4468BB]/30 bg-[#1B294B] px-4 py-2 text-xs font-bold text-[#4468BB] hover:bg-[#4468BB]/20 transition-colors">
                                        Edit Profile →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-[#788CBA]">No investor profile yet. It is created automatically when the audit is marked complete.</p>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
