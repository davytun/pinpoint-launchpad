import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

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

export default function FounderDocuments({
    founder,
    documents = [],
    can_upload = true,
    audit_status,
    categories = [],
    total_count = 0,
    max_files = 20,
    flash,
}: PageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [category, setCategory] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const auditComplete = audit_status === 'complete';
    const showUpload = can_upload;

    function addFiles(incoming: FileList | null) {
        if (!incoming || incoming.length === 0) return;
        const remaining = max_files - total_count - selectedFiles.length;
        if (remaining <= 0) {
            setUploadError(`Maximum file limit (${max_files}) reached.`);
            return;
        }
        const valid = Array.from(incoming).slice(0, remaining);
        setSelectedFiles((prev) => [...prev, ...valid]);
        setUploadError(null);
    }

    function removeFile(index: number) {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    }

    function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (selectedFiles.length === 0 || !category || uploading) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append('files[]', f));
        formData.append('category', category);

        const xsrf = decodeURIComponent(
            document.cookie
                .split('; ')
                .find((c) => c.startsWith('XSRF-TOKEN='))
                ?.split('=')
                .slice(1)
                .join('=') ?? '',
        );

        const xhr = new XMLHttpRequest();
        xhr.open('POST', route('founder.documents.store'));
        xhr.setRequestHeader('X-XSRF-TOKEN', xsrf);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        xhr.onload = () => {
            setUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(100);
                setSelectedFiles([]);
                setCategory('');
                setTimeout(() => {
                    setUploadProgress(0);
                    router.reload({ only: ['documents', 'can_upload', 'total_count'] });
                }, 300);
            } else {
                setUploadProgress(0);
                try {
                    const body = JSON.parse(xhr.responseText);
                    const errs = body?.props?.errors ?? body?.errors ?? {};
                    const msg = errs.files ?? errs['files.0'] ?? body?.message ?? 'Upload failed.';
                    setUploadError(Array.isArray(msg) ? msg[0] : msg);
                } catch {
                    setUploadError('Upload failed. Please try again.');
                }
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setUploadProgress(0);
            setUploadError('Network error. Please try again.');
        };

        xhr.send(formData);
    }

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

    return (
        <FounderLayout founder={founder}>
            <Head title="Founder Workspace — Documents Vault" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* ── Header ── */}
                <div className="mb-6 flex shrink-0 items-center justify-between border-b border-zinc-100 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                            Documents Vault
                        </h1>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Upload and manage supporting evidence, financials, cap tables, and pitch decks for analyst verification.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-xl border border-zinc-200/80 bg-[#FAFBFD] px-3 py-1.5 font-mono text-xs font-semibold text-zinc-700">
                            {total_count} / {max_files} Files
                        </span>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-4 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {auditComplete && (
                    <div className="mb-4 flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                        <Icon icon="solar:shield-check-linear" className="size-4 shrink-0 text-emerald-600" />
                        <span>Audit Complete — Verified Audit Vault. Additional uploads will be flagged as supplementary documents.</span>
                    </div>
                )}

                {/* ── Scrollable Body Canvas (No scrollbars) ── */}
                <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                    {/* Upload Dropzone Section */}
                    {showUpload && (
                        <div className="rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-5 shadow-2xs">
                            <h3 className="mb-3 text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                Upload New Audit Document
                            </h3>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all',
                                        dragOver
                                            ? 'border-zinc-900 bg-zinc-100'
                                            : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/50',
                                    )}
                                >
                                    <Icon icon="solar:cloud-upload-linear" className="mb-2 size-7 text-zinc-400" />
                                    <p className="text-xs font-bold text-zinc-950">Click or drag files here to upload</p>
                                    <p className="mt-0.5 text-[11px] text-zinc-400">PDF, DOCX, XLSX, Images — max 100MB per file</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png"
                                        onChange={(e) => addFiles(e.target.files)}
                                    />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFiles.map((file, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800"
                                                >
                                                    <Icon icon="solar:document-text-linear" className="size-3.5 text-zinc-500" />
                                                    <span className="truncate max-w-[180px] font-medium">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="text-zinc-400 hover:text-zinc-900"
                                                    >
                                                        <Icon icon="solar:close-circle-linear" className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="flex-1">
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 shadow-2xs focus:border-zinc-400 focus:outline-none"
                                                    required
                                                >
                                                    <option value="">Select Document Category…</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={uploading || !category}
                                                className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                                            >
                                                {uploading ? (
                                                    <Icon icon="solar:refresh-linear" className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Icon icon="solar:upload-linear" className="size-3.5" />
                                                )}
                                                <span>{uploading ? `Uploading (${uploadProgress}%)…` : 'Upload Selected Files'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <p className="text-xs font-medium text-red-600">{uploadError}</p>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Documents Table */}
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs">
                        <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3">
                            <h3 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
                                Uploaded Documents ({documents.length})
                            </h3>
                        </div>

                        {documents.length === 0 ? (
                            <div className="py-16 text-center text-xs text-zinc-400">
                                <Icon icon="solar:document-text-linear" className="mx-auto mb-2 size-8 text-zinc-300" />
                                No documents uploaded yet. Upload your pitch deck, cap table, or financials above.
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 text-xs">
                                <div className="flex items-center gap-4 bg-zinc-50/30 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                    <div className="w-1/3 min-w-0">Document Name</div>
                                    <div className="w-1/4 min-w-0">Category</div>
                                    <div className="w-1/6 min-w-0">Analyst Status</div>
                                    <div className="w-1/6 min-w-0">Uploaded</div>
                                    <div className="w-24 shrink-0 text-right">Actions</div>
                                </div>

                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50/60">
                                        <div className="flex w-1/3 min-w-0 items-center gap-2.5">
                                            <Icon icon="solar:document-text-linear" className="size-4 shrink-0 text-zinc-400" />
                                            <div className="min-w-0">
                                                <span className="block truncate font-semibold text-zinc-950">{doc.original_filename}</span>
                                                <span className="block font-mono text-[10px] text-zinc-400">{doc.file_size}</span>
                                            </div>
                                        </div>

                                        <div className="w-1/4 min-w-0 font-medium text-zinc-700">
                                            {doc.category_label ?? doc.category}
                                        </div>

                                        <div className="w-1/6 min-w-0">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold',
                                                    doc.is_reviewed
                                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border border-zinc-200 bg-zinc-50 text-zinc-600',
                                                )}
                                            >
                                                <Icon
                                                    icon={doc.is_reviewed ? 'solar:check-circle-linear' : 'solar:clock-circle-linear'}
                                                    className="size-3"
                                                />
                                                <span>{doc.is_reviewed ? 'Reviewed' : 'Pending'}</span>
                                            </span>
                                        </div>

                                        <div className="w-1/6 min-w-0 text-[11.5px] text-zinc-400">{doc.created_at}</div>

                                        <div className="w-24 shrink-0 flex items-center justify-end gap-1">
                                            <a
                                                href={route('founder.documents.download', { document: doc.id })}
                                                className="rounded-lg border border-zinc-200/80 bg-white p-1.5 text-zinc-600 shadow-2xs hover:bg-zinc-50 hover:text-zinc-900"
                                                title="Download Document"
                                            >
                                                <Icon icon="solar:download-linear" className="size-3.5" />
                                            </a>

                                            {doc.is_deletable && !auditComplete && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(doc)}
                                                    className="rounded-lg border border-zinc-200/80 bg-white p-1.5 text-zinc-400 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    title="Delete Document"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-linear" className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="rounded-2xl border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-zinc-950">Delete Audit Document?</DialogTitle>
                    </DialogHeader>
                    <p className="py-2 text-xs text-zinc-500">
                        Are you sure you want to remove <span className="font-semibold text-zinc-900">{deleteTarget?.original_filename}</span>? This will remove it from the analyst review queue.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? 'Deleting…' : 'Delete Document'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FounderLayout>
    );
}
