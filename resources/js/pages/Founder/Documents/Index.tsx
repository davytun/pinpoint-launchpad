import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    File,
    FileSpreadsheet,
    FileText,
    Image,
    Loader2,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FounderLayout from '@/layouts/founder-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
    value: string;
    label: string;
}

interface DocumentItem {
    id: number;
    category: string;
    category_label: string;
    original_filename: string;
    file_size: string;
    extension: string;
    file_icon: string;
    is_reviewed: boolean;
    is_deletable: boolean;
    created_at: string;
}

interface PageProps {
    founder: {
        id: number;
        full_name?: string | null;
        company_name?: string | null;
        email?: string;
    };
    documents: DocumentItem[];
    can_upload: boolean;
    audit_status: string;
    categories: Category[];
    total_count: number;
    max_files: number;
    flash?: { success?: string };
    errors?: Record<string, string>;
    [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
            {children}
        </motion.div>
    );
}

function FileIcon({ icon, extension }: { icon: string; extension: string }) {
    const colorClass =
        extension === 'pdf' ? 'text-red-400' :
        ['doc', 'docx'].includes(extension) ? 'text-blue-400' :
        ['xls', 'xlsx', 'csv'].includes(extension) ? 'text-emerald-400' :
        ['ppt', 'pptx'].includes(extension) ? 'text-orange-400' :
        ['jpg', 'jpeg', 'png'].includes(extension) ? 'text-purple-400' :
        'text-slate-400';

    const cls = `size-5 shrink-0 ${colorClass}`;

    if (icon === 'file-spreadsheet') return <FileSpreadsheet className={cls} aria-hidden="true" />;
    if (icon === 'image') return <Image className={cls} aria-hidden="true" />;
    if (icon === 'file-text') return <FileText className={cls} aria-hidden="true" />;
    return <File className={cls} aria-hidden="true" />;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
    categories,
    onSuccess,
}: {
    categories: Category[];
    onSuccess: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [category, setCategory]           = useState('');
    const [dragOver, setDragOver]           = useState(false);
    const [uploadError, setUploadError]     = useState<string | null>(null);
    const [processing, setProcessing]       = useState(false);
    const [progress, setProgress]           = useState(0);

    function addFiles(incoming: FileList | null) {
        if (!incoming) return;
        setUploadError(null);
        setSelectedFiles((prev) => {
            const names = new Set(prev.map((f) => f.name + f.size));
            const next = Array.from(incoming).filter((f) => !names.has(f.name + f.size));
            return [...prev, ...next];
        });
    }

    function removeFile(index: number) {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFiles.length || !category || processing) return;

        setUploadError(null);
        setProcessing(true);
        setProgress(0);

        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append('files[]', f));
        formData.append('category', category);

        // Read XSRF-TOKEN cookie — Laravel sets this as a plain (non-HttpOnly) cookie
        const xsrf = decodeURIComponent(
            document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') ?? ''
        );

        const xhr = new XMLHttpRequest();
        xhr.open('POST', route('founder.documents.store'));
        xhr.setRequestHeader('X-XSRF-TOKEN', xsrf);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        xhr.onload = () => {
            setProcessing(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                setProgress(100);
                setSelectedFiles([]);
                setCategory('');
                setTimeout(() => {
                    setProgress(0);
                    router.reload({ only: ['documents', 'can_upload', 'total_count'] });
                    onSuccess();
                }, 400);
            } else {
                setProgress(0);
                try {
                    const body = JSON.parse(xhr.responseText);
                    const errs = body?.props?.errors ?? body?.errors ?? {};
                    const msg  = errs.files ?? errs['files.0'] ?? errs['files.1'] ?? body?.message ?? 'Upload failed.';
                    setUploadError(Array.isArray(msg) ? msg[0] : msg);
                } catch {
                    setUploadError('Upload failed. Please try again.');
                }
            }
        };

        xhr.onerror = () => {
            setProcessing(false);
            setProgress(0);
            setUploadError('Network error. Please check your connection and try again.');
        };

        xhr.send(formData);
    }

    const canSubmit = selectedFiles.length > 0 && !!category && !processing;

    return (
        <form onSubmit={handleSubmit}>
            <div className="waitlist-panel mb-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                    Upload Document
                </p>

                {/* Drop zone */}
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Click or drop files to upload"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={[
                        'mb-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200',
                        dragOver ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-600 hover:border-blue-500/50',
                    ].join(' ')}
                >
                    <Upload className="mx-auto mb-3 size-12 text-slate-400" aria-hidden="true" />
                    <p className="text-[14px] font-medium text-white/60">Drop your files here</p>
                    <p className="text-[12px] text-white/30">or click to browse</p>
                    <p className="mt-2 text-[11px] text-white/20">PDF, Word, Excel, PowerPoint, Images — max 100MB per file</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={(e) => addFiles(e.target.files)}
                    />
                </div>

                {/* Selected files list */}
                <AnimatePresence initial={false}>
                    {selectedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 space-y-2"
                        >
                            {selectedFiles.map((file, i) => (
                                <div
                                    key={file.name + file.size + i}
                                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                                >
                                    <FileText className="size-4 shrink-0 text-blue-400" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] text-white/70">{file.name}</p>
                                        <p className="text-[11px] text-white/30">{formatBytes(file.size)}</p>
                                    </div>
                                    {!processing && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="rounded-lg p-1 text-white/30 transition-colors hover:text-white/60"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <X className="size-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload progress bar */}
                <AnimatePresence>
                    {processing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4"
                        >
                            <div className="mb-1.5 flex justify-between text-[11px] text-white/30">
                                <span>Uploading{selectedFiles.length > 1 ? ` ${selectedFiles.length} files` : ''}…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                    className="h-full rounded-full bg-blue-500"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category + upload button row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                            Document Category
                        </label>
                        <Select value={category} onValueChange={setCategory} disabled={processing}>
                            <SelectTrigger className="rounded-xl border-white/[0.08] bg-white/[0.04] text-white/60 focus:border-blue-500/50">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="border-white/[0.08] bg-[#111]">
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.value}
                                        value={cat.value}
                                        className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                                    >
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={[
                            'group relative overflow-hidden rounded-xl px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em] transition-all duration-200',
                            canSubmit
                                ? 'border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/20'
                                : 'cursor-not-allowed border border-white/[0.06] text-white/20',
                        ].join(' ')}
                    >
                        {canSubmit && !processing && (
                            <span className="waitlist-shimmer absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-40" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                    Uploading…
                                </>
                            ) : (
                                <>Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'Document'} →</>
                            )}
                        </span>
                    </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {uploadError && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-[12px] text-red-400"
                        >
                            {uploadError}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}

// ─── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc, onDelete }: { doc: DocumentItem; onDelete: (doc: DocumentItem) => void }) {
    function handleDownload() {
        window.location.href = route('founder.documents.download', { document: doc.id });
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.05]"
        >
            {/* File icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
                <FileIcon icon={doc.file_icon} extension={doc.extension} />
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white" title={doc.original_filename}>
                    {doc.original_filename}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-white/30">
                    <span>{doc.file_size}</span>
                    <span>·</span>
                    <span>{doc.created_at}</span>
                </div>
            </div>

            {/* Status badge */}
            <div className="hidden sm:block">
                {doc.is_reviewed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">
                        <CheckCircle2 className="size-3" aria-hidden="true" /> Reviewed
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                        Pending Review
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
                <button
                    onClick={handleDownload}
                    title="Download"
                    className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                    <Download className="size-4" aria-hidden="true" />
                </button>
                {doc.is_deletable && (
                    <button
                        onClick={() => onDelete(doc)}
                        title="Delete"
                        className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/[0.08] hover:text-red-400"
                    >
                        <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsIndex({
    founder,
    documents,
    can_upload,
    audit_status,
    categories,
    total_count,
    max_files,
}: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('founder.documents.destroy', { document: deleteTarget.id }), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    // Group documents by category
    const grouped = documents.reduce<Record<string, DocumentItem[]>>((acc, doc) => {
        if (!acc[doc.category_label]) acc[doc.category_label] = [];
        acc[doc.category_label].push(doc);
        return acc;
    }, {});

    const auditComplete = audit_status === 'complete';
    const showUpload = can_upload && !auditComplete;

    return (
        <FounderLayout founder={founder}>
            <Head title="Documents — Pinpoint Launchpad" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <FadeUp delay={0}>
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-white">Your Documents</h1>
                            <p className="mt-1.5 text-[14px] text-slate-400">
                                Upload supporting documents for your analyst to review during the audit.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[13px] text-slate-300">
                                {total_count} / {max_files} documents
                            </span>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Flash success ── */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            key="flash"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3"
                        >
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                            <p className="text-[13px] text-emerald-300">{flash.success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Audit complete notice ── */}
                {auditComplete && (
                    <FadeUp delay={0.06}>
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-4">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
                            <p className="text-[13px] text-amber-300">
                                Your audit is complete. Document uploads are now closed.
                            </p>
                        </div>
                    </FadeUp>
                )}

                {/* ── Upload section ── */}
                {showUpload && (
                    <FadeUp delay={0.08}>
                        <UploadZone categories={categories} onSuccess={() => {}} />
                    </FadeUp>
                )}

                {/* ── Documents list ── */}
                <FadeUp delay={showUpload ? 0.16 : 0.08}>
                    {documents.length === 0 ? (
                        <div className="waitlist-panel flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-[#0A0A0A] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <FileText className="mb-4 size-12 text-slate-500" aria-hidden="true" />
                            <p className="text-[15px] font-semibold text-white/50">No documents uploaded yet</p>
                            <p className="mt-1 text-[13px] text-white/25">
                                Upload your first document above to share it with your analyst.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(grouped).map(([categoryLabel, docs]) => (
                                <div key={categoryLabel}>
                                    <div className="mb-3 flex items-center gap-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            {categoryLabel}
                                        </p>
                                        <span className="text-[10px] text-white/20">({docs.length})</span>
                                    </div>
                                    <div className="space-y-2">
                                        <AnimatePresence mode="popLayout">
                                            {docs.map((doc) => (
                                                <DocumentRow
                                                    key={doc.id}
                                                    doc={doc}
                                                    onDelete={setDeleteTarget}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </FadeUp>
            </div>

            {/* ── Delete confirmation dialog ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="border-white/[0.08] bg-[#111] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete document?</DialogTitle>
                    </DialogHeader>
                    <p className="text-[13px] text-white/50">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-white/70">{deleteTarget?.original_filename}</span>?
                        This cannot be undone.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteTarget(null)}
                            className="text-white/40 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                            {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FounderLayout>
    );
}
