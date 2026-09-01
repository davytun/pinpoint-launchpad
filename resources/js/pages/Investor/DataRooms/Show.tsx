import { InvestorHeader } from '@/components/investor-header';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, LockKeyhole } from 'lucide-react';

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

type Document = {
    id: number;
    original_filename: string;
    size_bytes: number;
    created_at: string;
    download_url: string;
};

export default function DataRoomShow({ company_name, documents }: { company_name: string | null; documents: Document[] }) {
    return (
        <main className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title={`${company_name ?? 'Startup'} Data Room`} />
            <InvestorHeader activeTab="data-rooms" />

            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('investor.data-rooms.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back
                        </Link>
                        <div className="ml-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{company_name ?? 'PIN Startup'}</h1>
                            <p className="mt-1 text-sm text-zinc-500">Secure Data Room</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                        <LockKeyhole className="size-4" />
                        Access Granted
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold tracking-tight">Available Documents</h2>
                    <div className="mt-5 space-y-3">
                        {documents.length === 0 ? (
                            <div className="rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                                <p className="font-bold text-zinc-900">No documents available.</p>
                                <p className="mt-2 text-sm text-zinc-600">The founder hasn't uploaded any documents to this data room yet.</p>
                            </div>
                        ) : (
                            documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-5 shadow-[0_16px_36px_rgba(33,56,120,0.06)] transition hover:border-[#3A54A5]/30"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                                            <FileText className="size-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-zinc-900" title={doc.original_filename}>
                                                {doc.original_filename}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-zinc-500">
                                                {formatBytes(doc.size_bytes)} &bull; Uploaded {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.download_url}
                                        target="_blank"
                                        className="ml-4 flex shrink-0 items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-900"
                                    >
                                        <Download className="size-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
