import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    Image,
    Loader2,
    MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';

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
        extension === 'pdf' ? 'text-red-500' :
        ['doc', 'docx'].includes(extension) ? 'text-blue-500' :
        ['xls', 'xlsx', 'csv'].includes(extension) ? 'text-emerald-500' :
        ['ppt', 'pptx'].includes(extension) ? 'text-orange-500' :
        ['jpg', 'jpeg', 'png'].includes(extension) ? 'text-purple-500' :
        'text-slate-400';

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
        router.patch(
            route('admin.documents.reviewed', { founder: founderId, document: doc.id }),
            {},
            { onFinish: () => setTogglingReview(false) }
        );
    }

    function saveNote() {
        setSavingNote(true);
        router.patch(
            route('admin.documents.note', { founder: founderId, document: doc.id }),
            { note },
            { onFinish: () => setSavingNote(false) }
        );
    }

    return (
        <>
            <tr className="border-b border-[#232C43] transition-colors hover:bg-[#1B294B]/30">
                <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-[#1B294B] px-2 py-0.5 text-[11px] font-medium text-[#788CBA] border border-[#4468BB]/20">
                        {doc.category_label}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <FileIcon icon={doc.file_icon} extension={doc.extension} />
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-[#ECF0F9] max-w-[200px]" title={doc.original_filename}>
                                {doc.original_filename}
                            </p>
                            <p className="text-[11px] text-[#576FA8]">{doc.file_size}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#788CBA]">{doc.created_at}</td>
                <td className="px-4 py-3">
                    {doc.is_reviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="size-3" aria-hidden="true" /> Reviewed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                            <Clock className="size-3" aria-hidden="true" /> Pending
                        </span>
                    )}
                    {doc.reviewed_by && (
                        <p className="mt-0.5 text-[10px] text-[#576FA8]">by {doc.reviewed_by}</p>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleDownload}
                            title="Download"
                            className="rounded-lg border border-[#232C43] bg-[#0C1427] p-1.5 text-[#788CBA] transition-colors hover:bg-[#1B294B] hover:text-[#ECF0F9]"
                        >
                            <Download className="size-3.5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={toggleReviewed}
                            disabled={togglingReview}
                            title={doc.is_reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
                            className={[
                                'rounded-lg border p-1.5 transition-colors',
                                doc.is_reviewed
                                    ? 'border-[#232C43] bg-[#0C1427] text-[#576FA8] hover:bg-[#1B294B] hover:text-[#ECF0F9]'
                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
                            ].join(' ')}
                        >
                            {togglingReview
                                ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                                : <CheckCircle2 className="size-3.5" aria-hidden="true" />}
                        </button>
                        <button
                            onClick={() => setNoteOpen((v) => !v)}
                            title="Add note"
                            className={[
                                'rounded-lg border p-1.5 transition-colors',
                                noteOpen || doc.analyst_note
                                    ? 'border-[#4468BB]/30 bg-[#1B294B] text-[#4468BB]'
                                    : 'border-[#232C43] bg-[#0C1427] text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9]',
                            ].join(' ')}
                        >
                            <MessageSquare className="size-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Note row */}
            {noteOpen && (
                <tr className="border-b border-[#232C43] bg-[#0C1427]/40">
                    <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">
                                    Analyst Note
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Add a note about this document..."
                                    className="w-full rounded-xl border border-[#232C43] bg-[#080B11] px-3 py-2 text-[13px] text-[#ECF0F9] focus:border-[#4468BB]/50 focus:outline-none resize-none"
                                />
                                <p className="mt-0.5 text-[10px] text-[#576FA8]">{note.length}/500</p>
                            </div>
                            <button
                                onClick={saveNote}
                                disabled={savingNote || !note.trim()}
                                className="mt-5 rounded-xl border border-[#4468BB]/30 bg-[#1B294B] px-4 py-2 text-[12px] font-semibold text-[#4468BB] transition-colors hover:bg-[#4468BB]/20 disabled:opacity-50"
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
                                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#576FA8]">
                                    Founder Documents
                                </p>
                                <h1 className="mt-0.5 text-2xl font-bold text-[#ECF0F9]">
                                    {founder.company_name ?? founder.full_name}
                                </h1>
                                <p className="text-[13px] text-[#788CBA]">
                                    {founder.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={[
                                    'rounded-full px-3 py-1 text-[12px] font-semibold border',
                                    audit_status === 'complete'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    audit_status === 'in_progress' ? 'bg-[#1B294B] text-[#4468BB] border-[#4468BB]/30' :
                                    audit_status === 'needs_info'  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-[#0C1427] text-[#788CBA] border-[#232C43]',
                                ].join(' ')}>
                                    {audit_status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-[12px] text-[#576FA8]">
                                    {reviewedCount}/{documents.length} reviewed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
                            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                            {flash.success}
                        </div>
                    )}

                    {/* Table */}
                    {documents.length === 0 ? (
                        <div className="rounded-xl border border-[#232C43] bg-[#101623] py-16 text-center shadow-sm">
                            <FileText className="mx-auto mb-3 size-10 text-[#576FA8]" aria-hidden="true" />
                            <p className="text-[14px] font-semibold text-[#788CBA]">No documents uploaded yet</p>
                            <p className="mt-1 text-[12px] text-[#576FA8]">The founder has not uploaded any documents.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-[#232C43] bg-[#101623]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#232C43] bg-[#0C1427]/50">
                                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">Category</th>
                                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">File</th>
                                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">Uploaded</th>
                                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">Status</th>
                                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#576FA8]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <DocumentRow key={doc.id} doc={doc} founderId={founder.id} />
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
