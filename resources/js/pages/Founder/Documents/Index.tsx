import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    File,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    Loader2,
    Trash2,
    Upload,
    X,
    ArrowRight
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] }}
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

    const cls = `size-4.5 shrink-0 ${colorClass}`;

    if (icon === 'file-spreadsheet') return <FileSpreadsheet className={cls} aria-hidden="true" />;
    if (icon === 'image') return <ImageIcon className={cls} aria-hidden="true" />;
    if (icon === 'file-text') return <FileText className={cls} aria-hidden="true" />;
    return <File className={cls} aria-hidden="true" />;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function ProCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`overflow-hidden rounded-xl border border-[#232C43] bg-[#101623] shadow-sm ${className}`}>
            {children}
        </div>
    );
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
            <ProCard className="mb-6 p-6">
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-[#576FA8]">
                    Upload Supporting Documents
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
                        'mb-6 cursor-pointer rounded-xl border border-dashed p-8 text-center transition-all duration-200',
                        dragOver ? 'border-[#4468BB] bg-[#1B294B]/50' : 'border-[#232C43] hover:border-[#4468BB] hover:bg-[#1B294B]/20',
                    ].join(' ')}
                >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0C1427] border border-[#232C43]">
                        <Upload className="size-6 text-[#9AA9CB]" aria-hidden="true" />
                    </div>
                    <p className="text-[14px] font-medium text-[#ECF0F9]">Drop your files here</p>
                    <p className="text-[13px] text-[#788CBA]">or click to browse</p>
                    <p className="mt-3 text-[11px] text-[#455987]">PDF, DOCX, XLSX, Images — max 100MB</p>
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
                            className="mb-6 space-y-2"
                        >
                            {selectedFiles.map((file, i) => (
                                <div
                                    key={file.name + file.size + i}
                                    className="flex items-center gap-3 rounded-lg border border-[#232C43] bg-[#0C1427] px-4 py-3"
                                >
                                    <FileText className="size-4 shrink-0 text-[#4468BB]" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] text-[#DCE2EF]">{file.name}</p>
                                        <p className="text-[11px] text-[#576FA8]">{formatBytes(file.size)}</p>
                                    </div>
                                    {!processing && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="rounded-md p-1 text-[#455987] transition-colors hover:bg-red-500/10 hover:text-red-400"
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
                            className="mb-6"
                        >
                            <div className="mb-2 flex justify-between text-[11px] text-[#788CBA]">
                                <span>Uploading{selectedFiles.length > 1 ? ` ${selectedFiles.length} files` : ''}…</span>
                                <span className="font-bold">{progress}%</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-[#232C43]">
                                <motion.div
                                    className="h-full rounded-full bg-[#4468BB]"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category + upload button row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end border-t border-[#232C43] pt-6">
                    <div className="flex-1">
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#576FA8]">
                            Document Category
                        </label>
                        <Select value={category} onValueChange={setCategory} disabled={processing}>
                            <SelectTrigger className="rounded-lg border-[#232C43] bg-[#0C1427] text-[#ECF0F9] focus:ring-1 focus:ring-[#4468BB]/50">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="border-[#232C43] bg-[#101623]">
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.value}
                                        value={cat.value}
                                        className="text-[#BCC5DC] focus:bg-[#1B294B] focus:text-[#ECF0F9]"
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
                            'group relative flex h-10 items-center justify-center rounded-lg px-6 text-[13px] font-semibold uppercase tracking-wider transition-all duration-200',
                            canSubmit
                                ? 'bg-[#4468BB] text-white hover:bg-[#365396] shadow-lg shadow-[#4468BB]/10'
                                : 'cursor-not-allowed bg-[#232C43] text-[#455987]',
                        ].join(' ')}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                    Uploading…
                                </>
                            ) : (
                                <>Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'Document'} <ArrowRight className="size-3.5" /></>
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
                            className="mt-4 text-[13px] text-red-400"
                        >
                            {uploadError}
                        </motion.p>
                    )}
                </AnimatePresence>
            </ProCard>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="group flex items-center gap-4 py-3 transition-all duration-150 hover:bg-[#1B294B]/20 px-4"
        >
            {/* File icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#232C43] bg-[#0C1427]">
                <FileIcon icon={doc.file_icon} extension={doc.extension} />
            </div>

            {/* File info */}
            <div className="min-w-0 flex-[2.5]">
                <p className="truncate text-[13.5px] font-medium text-[#ECF0F9]" title={doc.original_filename}>
                    {doc.original_filename}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#576FA8] sm:hidden">
                    <span>{doc.file_size}</span>
                    <span className="opacity-30">·</span>
                    <span>{doc.created_at}</span>
                </div>
            </div>

            {/* Desktop columns */}
            <div className="hidden sm:flex flex-1 items-center gap-4 text-[12.5px] text-[#788CBA]">
                <span className="w-20 shrink-0 text-right">{doc.file_size}</span>
                <span className="flex-1 text-right opacity-60 font-mono text-[11px]">{doc.created_at}</span>
            </div>

            {/* Status badge */}
            <div className="w-32 shrink-0 flex justify-end">
                {doc.is_reviewed ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
                        Reviewed
                    </span>
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#455987]">
                        Pending
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex w-24 shrink-0 items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={handleDownload}
                    title="Download"
                    className="rounded-md p-1.5 text-[#788CBA] transition-colors hover:bg-[#101623] hover:text-[#ECF0F9]"
                >
                    <Download className="size-4" aria-hidden="true" />
                </button>
                {doc.is_deletable && (
                    <button
                        onClick={() => onDelete(doc)}
                        title="Delete"
                        className="rounded-md p-1.5 text-[#455987] transition-colors hover:bg-red-500/10 hover:text-red-400"
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

            <div className="mx-auto max-w-[64rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* ── Header ── */}
                <FadeUp delay={0}>
                    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your Documents</h1>
                            <p className="mt-2 text-[15px] text-[#788CBA]">
                                Upload supporting evidence for your analyst to review.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <div className="inline-flex items-center rounded-lg border border-[#232C43] bg-[#101623] px-4 py-2 text-[13px] font-medium text-[#ECF0F9]">
                                <span className="mr-2 font-bold text-[#4468BB]">{total_count}</span>
                                <span className="opacity-30">/</span>
                                <span className="ml-2 opacity-50">{max_files} Documents</span>
                            </div>
                        </div>
                    </div>
                </FadeUp>

                {/* ── Flash success ── */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            key="flash"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-8 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5"
                        >
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                            <p className="text-[14px] font-medium text-emerald-300">{flash.success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Audit complete notice ── */}
                {auditComplete && (
                    <FadeUp delay={0.05}>
                        <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                            <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-amber-400" aria-hidden="true" />
                            <div>
                                <p className="text-[14px] font-medium text-amber-400">Audit Complete</p>
                                <p className="mt-1 text-[13px] text-amber-300/80">
                                    Your audit is finalized. Document uploads are now closed for this cycle.
                                </p>
                            </div>
                        </div>
                    </FadeUp>
                )}

                {/* ── Upload section ── */}
                {showUpload && (
                    <FadeUp delay={0.1}>
                        <UploadZone categories={categories} onSuccess={() => {}} />
                    </FadeUp>
                )}

                {/* ── Documents list ── */}
                <FadeUp delay={showUpload ? 0.2 : 0.1}>
                    {documents.length === 0 ? (
                        <ProCard className="flex flex-col items-center justify-center px-6 py-20 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C1427] border border-[#232C43]">
                                <FileText className="size-8 text-[#455987]" aria-hidden="true" />
                            </div>
                            <p className="text-[17px] font-medium text-[#ECF0F9]">No documents yet</p>
                            <p className="mt-2 text-[14px] text-[#788CBA] max-w-sm">
                                Documents you upload will appear here grouped by their category.
                            </p>
                        </ProCard>
                    ) : (
                        <ProCard className="overflow-visible">
                            <div className="hidden sm:flex items-center gap-4 border-b border-[#232C43] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#455987]">
                                <div className="w-8 shrink-0" /> {/* Icon spacer */}
                                <div className="flex-[2.5]">Document Name</div>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="w-20 text-right">Size</div>
                                    <div className="flex-1 text-right">Uploaded</div>
                                </div>
                                <div className="w-32 text-right">Status</div>
                                <div className="w-24 shrink-0" /> {/* Actions spacer */}
                            </div>
                            
                            <div className="divide-y divide-[#232C43]/50">
                                {Object.entries(grouped).map(([categoryLabel, docs]) => (
                                    <div key={categoryLabel}>
                                        <div className="bg-[#1B294B]/10 px-4 py-2 flex items-center justify-between border-b border-[#232C43]/30">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#576FA8]">
                                                {categoryLabel}
                                            </p>
                                            <span className="text-[10px] font-medium text-[#455987]">
                                                {docs.length} Items
                                            </span>
                                        </div>
                                        <div className="divide-y divide-[#232C43]/30">
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
                        </ProCard>
                    )}
                </FadeUp>
            </div>

            {/* ── Delete confirmation dialog ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="border-[#232C43] bg-[#101623] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold text-[#ECF0F9]">Delete document?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-[14px] leading-relaxed text-[#788CBA]">
                            Are you sure you want to delete{' '}
                            <span className="font-bold text-[#ECF0F9]">{deleteTarget?.original_filename}</span>?
                            This action cannot be undone and will remove it from the analyst's queue.
                        </p>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteTarget(null)}
                            className="text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        >
                            {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
                            Delete Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FounderLayout>
    );
}
