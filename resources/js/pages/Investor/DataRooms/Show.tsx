import { InvestorHeader } from '@/components/investor-header';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileSpreadsheet, FileText, FolderLock, LockKeyhole, Presentation } from 'lucide-react';

type Document = {
    id: number;
    category: string;
    original_filename: string;
    size_bytes: number;
    mime_type: string | null;
    extension: string | null;
    created_at: string;
    download_url: string;
};

function formatBytes(bytes: number) {
    if (!bytes) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function fileIcon(extension: string | null) {
    if (['xls', 'xlsx', 'csv'].includes(extension ?? '')) return FileSpreadsheet;
    if (['ppt', 'pptx'].includes(extension ?? '')) return Presentation;
    return FileText;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function DataRoomShow({ company_name, documents }: { company_name: string | null; documents: Document[] }) {
    const companyName = company_name ?? 'Pinpoint venture';

    return (
        <main className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title={`${companyName} Data Room | Pinpoint`} />
            <InvestorHeader activeTab="data-rooms" />

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <Link
                    href={route('investor.data-rooms.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-950"
                >
                    <ArrowLeft className="size-4" />
                    All data rooms
                </Link>

                <div className="mt-8 border-b border-zinc-200 pb-8 sm:flex sm:items-end sm:justify-between sm:pb-10">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">Secure data room</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl">{companyName}</h1>
                        <p className="mt-3 text-sm text-zinc-600">
                            {documents.length} reviewed {documents.length === 1 ? 'document' : 'documents'} available for download.
                        </p>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:mt-0">
                        <LockKeyhole className="size-4" />
                        Access active
                    </div>
                </div>

                <div className="py-8 sm:py-10">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">Materials</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Available documents</h2>
                        </div>
                        <span className="hidden font-mono text-xs text-zinc-500 sm:inline">{documents.length} files</span>
                    </div>
                    {documents.length === 0 ? (
                        <div className="mx-auto max-w-xl py-20 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                <FolderLock className="size-5" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-zinc-950">No documents available yet</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">The founder has not added reviewed materials to this room.</p>
                        </div>
                    ) : (
                        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                            <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_7rem] gap-4 border-b border-zinc-200 bg-stone-100 px-5 py-3 text-[10px] font-bold tracking-[0.14em] text-zinc-400 uppercase sm:grid">
                                <span>Document</span>
                                <span>Category</span>
                                <span>Uploaded</span>
                                <span className="text-right">Access</span>
                            </div>
                            {documents.map((document) => {
                                const Icon = fileIcon(document.extension);
                                return (
                                    <div
                                        key={document.id}
                                        className="grid gap-3 border-b border-zinc-100 px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_7rem] sm:items-center sm:gap-4 sm:px-5"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-zinc-900" title={document.original_filename}>
                                                    {document.original_filename}
                                                </p>
                                                <p className="mt-0.5 text-xs text-zinc-500 sm:hidden">
                                                    {document.category} · {formatBytes(document.size_bytes)} · {formatDate(document.created_at)}
                                                </p>
                                                <p className="mt-0.5 hidden text-xs text-zinc-500 sm:block">
                                                    {formatBytes(document.size_bytes)} · {document.extension?.toUpperCase() ?? 'FILE'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="hidden text-xs text-zinc-600 sm:block">{document.category}</span>
                                        <span className="hidden text-xs text-zinc-500 sm:block">{formatDate(document.created_at)}</span>
                                        <a
                                            href={document.download_url}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
                                        >
                                            <Download className="size-4" />
                                            Download
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
