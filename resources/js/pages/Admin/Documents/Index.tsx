import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Download, FileSpreadsheet, FileText, Image, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentItem {
    id: number;
    category: string;
    category_label: string;
    original_filename: string;
    file_size: string;
    extension: string;
    file_icon: string;
    mime_type: string;
    is_reviewed: boolean;
    reviewed_at: string | null;
    reviewed_by: string | null;
    analyst_note: string | null;
    created_at: string;
}

interface FounderData {
    id: number;
    full_name: string | null;
    company_name: string | null;
    email: string;
}

interface PageProps {
    founder: FounderData;
    documents: DocumentItem[];
    audit_status: string;
    flash?: { success?: string };
    [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FileIcon({ icon, extension }: { icon: string; extension: string }) {
    const colorClass =
        extension === 'pdf'
            ? 'text-red-500'
            : ['doc', 'docx'].includes(extension)
              ? 'text-blue-500'
              : ['xls', 'xlsx', 'csv'].includes(extension)
                ? 'text-emerald-500'
                : ['ppt', 'pptx'].includes(extension)
                  ? 'text-orange-500'
                  : ['jpg', 'jpeg', 'png'].includes(extension)
                    ? 'text-purple-500'
                    : 'text-slate-400';

    const cls = `size-4 shrink-0 ${colorClass}`;
    if (icon === 'file-spreadsheet') return <FileSpreadsheet className={cls} aria-hidden="true" />;
    if (icon === 'image') return <Image className={cls} aria-hidden="true" />;
    return <FileText className={cls} aria-hidden="true" />;
}

// ─── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc, founderId }: { doc: DocumentItem; founderId: number }) {
    const [noteOpen, setNoteOpen] = useState(false);
    const [note, setNote] = useState(doc.analyst_note ?? '');
    const [savingNote, setSavingNote] = useState(false);
    const [togglingReview, setTogglingReview] = useState(false);

    function handleDownload() {
        window.location.href = route('admin.documents.download', {
            founder: founderId,
            document: doc.id,
        });
    }

    function toggleReviewed() {
        setTogglingReview(true);
        router.patch(route('admin.documents.reviewed', { founder: founderId, document: doc.id }), {}, { onFinish: () => setTogglingReview(false) });
    }

    function saveNote() {
        setSavingNote(true);
        router.patch(route('admin.documents.note', { founder: founderId, document: doc.id }), { note }, { onFinish: () => setSavingNote(false) });
    }

    return (
        <>
            <tr className="border-b border-zinc-200/80 transition-colors hover:bg-zinc-50/40">
                <td className="px-4 py-3">
                    <span className="inline-block rounded-md border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-2 py-0.5 text-[11px] font-bold text-[#3A54A5] shadow-xs">
                        {doc.category_label}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <FileIcon icon={doc.file_icon} extension={doc.extension} />
                        <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-[13px] font-bold text-zinc-900" title={doc.original_filename}>
                                {doc.original_filename}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-medium">{doc.file_size}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-zinc-650 font-medium">{doc.created_at}</td>
                <td className="px-4 py-3">
                    {doc.is_reviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-255 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-xs">
                            <CheckCircle2 className="size-3" aria-hidden="true" /> Reviewed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-250 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-xs">
                            <Clock className="size-3" aria-hidden="true" /> Pending
                        </span>
                    )}
                    {doc.reviewed_by && <p className="mt-0.5 text-[10px] text-zinc-400 font-semibold">by {doc.reviewed_by}</p>}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleDownload}
                            title="Download"
                            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-650 shadow-xs transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                        >
                            <Download className="size-3.5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={toggleReviewed}
                            disabled={togglingReview}
                            title={doc.is_reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
                            className={cn(
                                'rounded-lg border p-1.5 transition-colors',
                                doc.is_reviewed
                                    ? 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 hover:text-zinc-955 shadow-xs'
                                    : 'border-emerald-250 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-xs font-bold',
                            )}
                        >
                            {togglingReview ? (
                                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            )}
                        </button>
                        <button
                            onClick={() => setNoteOpen((v) => !v)}
                            title="Add note"
                            className={cn(
                                'rounded-lg border p-1.5 transition-colors',
                                noteOpen || doc.analyst_note
                                    ? 'border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5] font-bold shadow-xs'
                                    : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 shadow-xs',
                            )}
                        >
                            <MessageSquare className="size-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Note row */}
            {noteOpen && (
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <label className="mb-1 block text-[11px] font-bold tracking-wide text-zinc-500 uppercase">Analyst Note</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Add a note about this document..."
                                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-955 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs"
                                />
                                <p className="mt-0.5 text-[10px] text-zinc-400 font-semibold">{note.length}/500</p>
                            </div>
                            <button
                                onClick={saveNote}
                                disabled={savingNote || !note.trim()}
                                className="mt-5 rounded-xl bg-[#3A54A5] px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-[#3A54A5]/20 hover:bg-[#2D4182] hover:shadow-lg transition-colors disabled:opacity-50"
                            >
                                {savingNote ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                            </button>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDocumentsIndex({ founder, documents, audit_status }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    const reviewedCount = documents.filter((d) => d.is_reviewed).length;

    return (
        <AdminLayout>
            <Head title={`Documents — ${founder.company_name ?? founder.full_name}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-[12px] font-bold tracking-wide text-zinc-500 uppercase">Founder Documents</p>
                                <h1 className="mt-0.5 text-2xl font-extrabold text-zinc-950">{founder.company_name ?? founder.full_name}</h1>
                                <p className="text-[13px] text-zinc-555 font-medium">{founder.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-[12px] font-bold shadow-xs',
                                        audit_status === 'complete'
                                            ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                                            : audit_status === 'in_progress'
                                              ? 'border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5]'
                                              : audit_status === 'needs_info'
                                                ? 'border-amber-250 bg-amber-50 text-amber-700'
                                                : 'border-zinc-200 bg-zinc-100 text-zinc-650',
                                    )}
                                >
                                    {audit_status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[12px] text-zinc-550 font-semibold">
                                    {reviewedCount}/{documents.length} reviewed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700 font-semibold">
                            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                            {flash.success}
                        </div>
                    )}

                    {/* Table */}
                    {documents.length === 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
                            <FileText className="mx-auto mb-3 size-10 text-zinc-400" aria-hidden="true" />
                            <p className="text-[14px] font-bold text-zinc-900">No documents uploaded yet</p>
                            <p className="mt-1 text-[12px] text-zinc-500 font-medium">The founder has not uploaded any documents.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                            <th className="px-4 py-3 text-[11px] font-bold tracking-wide text-zinc-500 uppercase">Category</th>
                                            <th className="px-4 py-3 text-[11px] font-bold tracking-wide text-zinc-500 uppercase">File</th>
                                            <th className="px-4 py-3 text-[11px] font-bold tracking-wide text-zinc-500 uppercase">Uploaded</th>
                                            <th className="px-4 py-3 text-[11px] font-bold tracking-wide text-zinc-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-[11px] font-bold tracking-wide text-zinc-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80">
                                        {documents.map((doc) => (
                                            <DocumentRow key={doc.id} doc={doc} founderId={founder.id} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
