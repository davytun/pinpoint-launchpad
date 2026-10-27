import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';

interface DocFile {
    id: number;
    original_filename: string;
    file_size: string;
    extension: string;
    is_reviewed: boolean;
    is_deletable: boolean;
    created_at: string;
}

interface Category {
    value: string;
    label: string;
    required: boolean;
    files: DocFile[];
}

interface PageProps {
    founder: {
        id: number;
        full_name?: string | null;
        company_name?: string | null;
        email?: string;
    };
    categories: Category[];
    required_total: number;
    required_done: number;
    can_upload: boolean;
    audit_status: string;
    locked: boolean;
    total_count: number;
    max_files: number;
    flash?: { success?: string };
    [key: string]: unknown;
}

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.webp';

/** Upload files straight into a category slot — no staging, no dropdown. */
function uploadToCategory(
    category: string,
    files: File[],
    handlers: {
        onProgress: (pct: number) => void;
        onSuccess: () => void;
        onError: (message: string) => void;
    },
) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files[]', f));
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
        if (ev.lengthComputable) handlers.onProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            handlers.onProgress(100);
            handlers.onSuccess();
        } else {
            handlers.onProgress(0);
            try {
                const body = JSON.parse(xhr.responseText);
                const errs = body?.props?.errors ?? body?.errors ?? {};
                const msg = errs.files ?? errs['files.0'] ?? errs.category ?? body?.message ?? 'Upload failed.';
                handlers.onError(Array.isArray(msg) ? msg[0] : msg);
            } catch {
                handlers.onError('Upload failed. Please try again.');
            }
        }
    };
    xhr.onerror = () => {
        handlers.onProgress(0);
        handlers.onError('Network error. Please try again.');
    };

    xhr.send(formData);
}

export default function FounderDocuments({
    founder,
    categories = [],
    required_total = 0,
    required_done = 0,
    can_upload = true,
    audit_status,
    locked = false,
    total_count = 0,
    max_files = 20,
}: PageProps) {
    const [deleteTarget, setDeleteTarget] = useState<{ file: DocFile; label: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Registry of each slot's hidden file input so the "Continue" button can open the right picker.
    const slotInputs = useRef<Record<string, HTMLInputElement | null>>({});

    const remaining = Math.max(max_files - total_count, 0);
    const allRequiredIn = required_done >= required_total;
    const allFiles = categories.flatMap((c) => c.files);
    const reviewComplete = allFiles.length > 0 && allFiles.every((f) => f.is_reviewed);
    const nextCategory = categories.find((c) => c.required && c.files.length === 0);

    const requiredCats = categories.filter((c) => c.required);
    const optionalCats = categories.filter((c) => !c.required);

    function focusSlot(value: string) {
        document.getElementById(`slot-${value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        slotInputs.current[value]?.click();
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('founder.documents.destroy', { document: deleteTarget.file.id }), {
            preserveScroll: true,
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
                {/* Top bar — mirrors the founder portal pattern */}
                <div className="mb-6 flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">Documents</h1>
                        <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-400">
                            Upload each document into its slot. Add as many files as you need to any category.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Required</p>
                            <p className="text-[13px] font-semibold text-zinc-950 tabular-nums">
                                {required_done} <span className="text-zinc-400">/ {required_total}</span>
                            </p>
                        </div>
                        <div
                            className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200"
                            role="progressbar"
                            aria-valuenow={required_done}
                            aria-valuemin={0}
                            aria-valuemax={required_total}
                        >
                            <div
                                className={cn('h-full rounded-full transition-all duration-500', allRequiredIn ? 'bg-emerald-500' : 'bg-[#3A54A5]')}
                                style={{ width: `${required_total ? Math.min(100, Math.round((required_done / required_total) * 100)) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                    {audit_status === 'needs_info' && (
                        <StatePanel tone="warn" icon="solar:chat-round-dots-linear" title="Your analyst needs more information">
                            Open <span className="font-semibold">Messages</span> to see what to add. Upload any new files into the matching slot
                            below.
                        </StatePanel>
                    )}
                    {locked && (
                        <StatePanel tone="info" icon="solar:lock-security-linear" title="Review is underway">
                            Required documents are locked so your submission stays intact. You can still add extras under Optional documents.
                        </StatePanel>
                    )}
                    {!can_upload && (
                        <StatePanel tone="info" icon="solar:info-circle-linear" title={`File limit reached (${max_files})`}>
                            Remove a file to make room for a new upload.
                        </StatePanel>
                    )}

                    {/* Guidance: always point to the single next action */}
                    <ContinuePanel
                        allRequiredIn={allRequiredIn}
                        reviewComplete={reviewComplete || audit_status === 'complete'}
                        auditComplete={audit_status === 'complete'}
                        nextLabel={nextCategory?.label}
                        onNextClick={nextCategory ? () => focusSlot(nextCategory.value) : undefined}
                    />

                    <section>
                        <SectionLabel icon="solar:folder-linear">Required documents</SectionLabel>
                        <ul className="mt-2 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs">
                            {requiredCats.map((cat) => (
                                <DocRow
                                    key={cat.value}
                                    category={cat}
                                    isNext={cat.value === nextCategory?.value}
                                    canUpload={can_upload}
                                    locked={locked}
                                    remaining={remaining}
                                    registerInput={(el) => {
                                        slotInputs.current[cat.value] = el;
                                    }}
                                    onRequestDelete={(file) => setDeleteTarget({ file, label: cat.label })}
                                />
                            ))}
                        </ul>
                    </section>

                    {optionalCats.length > 0 && (
                        <section>
                            <SectionLabel icon="solar:layers-linear">Optional documents</SectionLabel>
                            <ul className="mt-2 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xs">
                                {optionalCats.map((cat) => (
                                    <DocRow
                                        key={cat.value}
                                        category={cat}
                                        isNext={false}
                                        canUpload={can_upload}
                                        locked={false}
                                        remaining={remaining}
                                        registerInput={(el) => {
                                            slotInputs.current[cat.value] = el;
                                        }}
                                        onRequestDelete={(file) => setDeleteTarget({ file, label: cat.label })}
                                    />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="rounded-2xl border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-zinc-950">Remove this file?</DialogTitle>
                    </DialogHeader>
                    <p className="py-1 text-[13px] leading-relaxed text-zinc-600">
                        <span className="font-medium text-zinc-900">{deleteTarget?.file.original_filename}</span> will be deleted from{' '}
                        <span className="font-medium text-zinc-900">{deleteTarget?.label}</span>.
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
                            className="rounded-xl bg-zinc-950 px-4 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {deleting ? 'Removing…' : 'Remove'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FounderLayout>
    );
}

function ContinuePanel({
    allRequiredIn,
    reviewComplete,
    auditComplete,
    nextLabel,
    onNextClick,
}: {
    allRequiredIn: boolean;
    reviewComplete: boolean;
    auditComplete: boolean;
    nextLabel?: string;
    onNextClick?: () => void;
}) {
    // All required docs are in: keep the "analyst will review" reassurance until every uploaded
    // file has been reviewed. Once review is done, hide the banner.
    if (allRequiredIn) {
        // Review finished: point the founder to the next stage instead of a dead end.
        if (reviewComplete) {
            return (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex items-start gap-3">
                        <span
                            className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[6px] bg-emerald-600 text-white"
                            aria-hidden
                        >
                            <svg
                                viewBox="0 0 12 12"
                                className="size-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M2.5 6.2 4.9 8.5 9.5 3.6" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-emerald-600/90 uppercase">Next stage</p>
                            <p className="text-[13px] font-semibold text-emerald-800">
                                {auditComplete
                                    ? 'Your Spotlight profile is ready to build.'
                                    : 'Documents complete. Your analyst is finalizing the PARAGON audit.'}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
                                {auditComplete
                                    ? 'Turn your verified profile into a public Spotlight investors can discover.'
                                    : 'This is the last step before your profile is verified and opened to investors. We will message you the moment it clears, and your Spotlight profile unlocks then so you can publish a public page investors can find.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.get(auditComplete ? route('founder.spotlight.edit') : route('founder.messages.index'))}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-zinc-950 px-4 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                    >
                        {auditComplete ? 'Build Spotlight' : 'Open Messages'}
                        <Icon icon="solar:arrow-right-linear" className="size-4" />
                    </button>
                </div>
            );
        }
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[6px] bg-emerald-600 text-white" aria-hidden>
                    <svg
                        viewBox="0 0 12 12"
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2.5 6.2 4.9 8.5 9.5 3.6" />
                    </svg>
                </span>
                <div>
                    <p className="text-[13px] font-semibold text-emerald-800">Every required document is in.</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
                        Your analyst will review and follow up in Messages if anything else is needed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-[#FAFBFD] p-4 shadow-2xs">
            <div className="flex items-center gap-3">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-2 border-zinc-900 bg-white" aria-hidden />
                <div>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Next up</p>
                    <p className="text-[13px] font-semibold text-zinc-950">{nextLabel ?? 'Add your documents'}</p>
                </div>
            </div>
            {onNextClick && (
                <button
                    type="button"
                    onClick={onNextClick}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-zinc-950 px-4 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                >
                    <Icon icon="solar:upload-linear" className="size-4" />
                    Upload {nextLabel}
                </button>
            )}
        </div>
    );
}

function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <Icon icon={icon} className="size-4 text-zinc-500" />
            <h2 className="text-xs font-bold tracking-wider text-zinc-950 uppercase">{children}</h2>
        </div>
    );
}

interface RowProps {
    category: Category;
    isNext: boolean;
    canUpload: boolean;
    locked: boolean;
    remaining: number;
    registerInput: (el: HTMLInputElement | null) => void;
    onRequestDelete: (file: DocFile) => void;
}

function DocRow({ category, isNext, canUpload, locked, remaining, registerInput, onRequestDelete }: RowProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const hasFiles = category.files.length > 0;
    const filled = hasFiles;
    // Required slots lock during review; optional slots always accept files.
    const canAdd = canUpload && (category.required ? !locked : true);

    function startUpload(list: FileList | null) {
        if (!list || list.length === 0 || !canAdd) return;
        const files = Array.from(list);
        const allowed = Math.min(files.length, remaining);
        if (allowed === 0) {
            setError('No space left to upload more files.');
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        uploadToCategory(category.value, files.slice(0, allowed), {
            onProgress: setProgress,
            onSuccess: () => {
                setUploading(false);
                setProgress(0);
                router.reload({
                    only: ['categories', 'required_done', 'required_total', 'total_count', 'can_upload'],
                });
            },
            onError: (message) => {
                setUploading(false);
                setProgress(0);
                setError(message);
            },
        });
    }

    return (
        <li id={`slot-${category.value}`} className={cn('px-4 py-3.5 transition-colors sm:px-5', isNext && 'bg-[#3A54A5]/[0.035]')}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={cn(
                            'flex size-[18px] shrink-0 items-center justify-center rounded-[6px] transition-colors',
                            filled ? 'bg-emerald-600 text-white' : isNext ? 'border-2 border-zinc-900 bg-white' : 'border border-zinc-200 bg-white',
                        )}
                        aria-hidden
                    >
                        {filled && (
                            <svg
                                viewBox="0 0 12 12"
                                className="size-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M2.5 6.2 4.9 8.5 9.5 3.6" />
                            </svg>
                        )}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="truncate text-[13.5px] font-semibold text-zinc-950">{category.label}</span>
                            {isNext && (
                                <span className="shrink-0 rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                                    Next
                                </span>
                            )}
                        </div>
                        {hasFiles && (
                            <p className="mt-0.5 text-[11px] text-zinc-400">
                                {category.files.length} file{category.files.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <input
                        ref={(el) => {
                            inputRef.current = el;
                            registerInput(el);
                        }}
                        type="file"
                        multiple
                        className="hidden"
                        accept={ACCEPT}
                        onChange={(e) => {
                            startUpload(e.target.files);
                            e.target.value = '';
                        }}
                    />
                    {canAdd ? (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className={cn(
                                'inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                                isNext
                                    ? 'bg-zinc-950 text-white hover:bg-zinc-800'
                                    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                            )}
                        >
                            {uploading ? (
                                `${progress}%`
                            ) : (
                                <>
                                    <Icon icon={hasFiles ? 'solar:add-circle-linear' : 'solar:upload-linear'} className="size-3.5" />
                                    {hasFiles ? 'Add' : 'Upload'}
                                </>
                            )}
                        </button>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <Icon icon="solar:lock-password-linear" className="size-3.5" />
                            Locked
                        </span>
                    )}
                </div>
            </div>

            {hasFiles && (
                <ul className="mt-2 ml-8 space-y-0.5">
                    {category.files.map((file) => (
                        <li key={file.id} className="group flex items-center gap-2.5 py-1 text-[12.5px]">
                            <Icon icon="solar:document-text-linear" className="size-3.5 shrink-0 text-zinc-400" />
                            <span className="min-w-0 flex-1 truncate text-zinc-700">{file.original_filename}</span>
                            {file.is_reviewed && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-600">
                                    <Icon icon="solar:check-circle-linear" className="size-3.5" />
                                    Reviewed
                                </span>
                            )}
                            <span className="hidden shrink-0 text-[11px] text-zinc-400 tabular-nums sm:inline">{file.file_size}</span>
                            <a
                                href={route('founder.documents.download', { document: file.id })}
                                className="shrink-0 font-medium text-[#3A54A5] hover:text-[#2D4182]"
                            >
                                Download
                            </a>
                            {file.is_deletable && !locked && (
                                <button
                                    type="button"
                                    onClick={() => onRequestDelete(file)}
                                    className="shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-400 hover:text-red-600"
                                    aria-label={`Remove ${file.original_filename}`}
                                >
                                    <Icon icon="solar:trash-bin-trash-linear" className="size-3.5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p role="alert" className="mt-1.5 ml-8 text-[11px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </li>
    );
}

function StatePanel({ tone, icon, title, children }: { tone: 'warn' | 'info'; icon: string; title: string; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-2xl border p-4',
                tone === 'warn' ? 'border-amber-200 bg-amber-50/70' : 'border-zinc-200/80 bg-[#FAFBFD]',
            )}
        >
            <Icon icon={icon} className={cn('mt-0.5 size-5 shrink-0', tone === 'warn' ? 'text-amber-500' : 'text-[#3A54A5]')} />
            <div className="text-[13px] leading-relaxed">
                <p className={cn('font-semibold', tone === 'warn' ? 'text-amber-800' : 'text-zinc-900')}>{title}</p>
                <p className={cn('mt-0.5 text-xs', tone === 'warn' ? 'text-amber-700' : 'text-zinc-500')}>{children}</p>
            </div>
        </div>
    );
}
