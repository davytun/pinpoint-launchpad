import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

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
            setUploadError(`You can upload up to ${max_files} files.`);
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
        setUploadError(null);

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
            <Head title="Documents — Pinpoint" />

            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 pb-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                            <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950 sm:text-[2rem]">
                                Documents
                            </h1>
                            <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-zinc-500">
                                Pitch deck, financials, cap table, and anything else your analyst needs.
                            </p>
                        </div>
                        <p className="font-mono text-[13px] tabular-nums text-zinc-400">
                            {total_count}/{max_files}
                        </p>
                    </div>
                </header>

                <div className="no-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto pb-10">
                    {flash?.success && (
                        <p role="status" className="text-[14px] font-medium text-emerald-700">
                            {flash.success}
                        </p>
                    )}

                    {auditComplete && (
                        <p className="text-[13px] leading-relaxed text-zinc-500">
                            Review is complete. New uploads are stored as extras for the record.
                        </p>
                    )}

                    {showUpload && (
                        <form onSubmit={handleUpload} className="max-w-xl space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />

                            {selectedFiles.length === 0 ? (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center transition-colors',
                                        dragOver
                                            ? 'border-[#3A54A5] bg-[#3A54A5]/[0.06]'
                                            : 'border-zinc-300 bg-[#F0F2F8]/50 hover:border-zinc-400',
                                    )}
                                >
                                    <Icon icon="solar:cloud-upload-linear" className="mb-2 size-6 text-zinc-400" />
                                    <p className="text-[14px] font-semibold text-zinc-950">Drop files or browse</p>
                                    <p className="mt-1 text-[12px] text-zinc-500">PDF, DOCX, XLSX, images · 100MB max</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <ul className="space-y-0">
                                        {selectedFiles.map((file, i) => (
                                            <li
                                                key={`${file.name}-${i}`}
                                                className="flex items-center gap-3 border-b border-zinc-100 py-2.5 text-[13px]"
                                            >
                                                <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="shrink-0 text-[13px] font-medium text-zinc-500 hover:text-zinc-900"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[13px] font-medium text-[#3A54A5] hover:text-[#2D4182]"
                                    >
                                        Add more
                                    </button>

                                    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                                        <Select value={category || undefined} onValueChange={setCategory}>
                                            <SelectTrigger
                                                aria-label="Document category"
                                                className="min-h-10 w-full flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 shadow-none focus:border-[#3A54A5] focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-zinc-400"
                                            >
                                                <SelectValue placeholder="Category…" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-lg">
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat.value}
                                                        value={cat.value}
                                                        className="cursor-pointer rounded-lg text-[13px] focus:bg-[#F0F2F8] focus:text-zinc-950"
                                                    >
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <button
                                            type="submit"
                                            disabled={uploading || !category}
                                            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[#3A54A5] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2D4182] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {uploading ? `${uploadProgress}%…` : 'Upload'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {uploadError && (
                                <p role="alert" className="text-[13px] font-medium text-red-600">
                                    {uploadError}
                                </p>
                            )}
                        </form>
                    )}

                    {documents.length > 0 && (
                        <section className={showUpload ? 'border-t border-zinc-200 pt-8' : undefined}>
                            <h2 className="text-[15px] font-semibold text-zinc-950">{documents.length} uploaded</h2>
                            <ul className="mt-4 max-w-xl divide-y divide-zinc-100 border-t border-zinc-100">
                                {documents.map((doc) => (
                                    <li
                                        key={doc.id}
                                        className="flex items-start justify-between gap-3 py-3.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-semibold text-zinc-950">
                                                {doc.original_filename}
                                            </p>
                                            <p className="mt-0.5 text-[12px] text-zinc-500">
                                                {doc.category_label ?? doc.category}
                                                <span className="mx-1 text-zinc-300">·</span>
                                                {doc.is_reviewed ? 'Reviewed' : 'Pending'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3 pt-0.5">
                                            <a
                                                href={route('founder.documents.download', { document: doc.id })}
                                                className="text-[13px] font-medium text-[#3A54A5] hover:text-[#2D4182]"
                                            >
                                                Download
                                            </a>
                                            {doc.is_deletable && !auditComplete && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(doc)}
                                                    className="text-[13px] font-medium text-zinc-500 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="rounded-2xl border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950">Delete this file?</DialogTitle>
                    </DialogHeader>
                    <p className="py-2 text-[14px] leading-relaxed text-zinc-600">
                        Remove <span className="font-medium text-zinc-900">{deleteTarget?.original_filename}</span> from
                        your review folder?
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-xl border border-zinc-200 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FounderLayout>
    );
}
