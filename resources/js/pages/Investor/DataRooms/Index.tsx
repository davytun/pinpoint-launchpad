import { InvestorHeader } from '@/components/investor-header';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FolderLock, ShieldCheck } from 'lucide-react';

type Grant = {
    slug: string;
    company_name: string | null;
    granted_at: string | null;
    document_count: number;
};

function formatDate(value: string | null) {
    return value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'Recently';
}

export default function DataRoomIndex({ grants }: { grants: Grant[] }) {
    return (
        <main className="min-h-screen bg-stone-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Data Rooms | Pinpoint" />
            <InvestorHeader activeTab="data-rooms" />

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="border-b border-zinc-200 pb-8 sm:flex sm:items-end sm:justify-between sm:pb-10">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400 uppercase">Private investor workspace</p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-4xl">Data rooms</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                            Founder-approved materials for your active investment reviews.
                        </p>
                    </div>
                    <p className="mt-5 text-sm text-zinc-500 sm:mt-0">
                        <span className="font-mono font-semibold text-zinc-900">{grants.length}</span> active {grants.length === 1 ? 'room' : 'rooms'}
                    </p>
                </div>

                {grants.length === 0 ? (
                    <div className="mx-auto max-w-xl py-20 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                            <FolderLock className="size-5" />
                        </div>
                        <h2 className="mt-5 text-lg font-semibold text-zinc-950">No active data rooms</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            When a founder grants access after your request is approved, their materials will appear here.
                        </p>
                        <Link
                            href={route('investor.spotlight.index')}
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 underline underline-offset-4"
                        >
                            Browse spotlight <ArrowRight className="size-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {grants.map((grant) => (
                            <Link
                                key={grant.slug}
                                href={route('investor.data-rooms.show', grant.slug)}
                                className="group grid gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-6 transition-colors hover:border-zinc-300 hover:shadow-sm sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-center"
                            >
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                        <FolderLock className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base font-semibold text-zinc-950">{grant.company_name ?? 'Pinpoint venture'}</h2>
                                        <p className="mt-1 text-sm text-zinc-500">Granted {formatDate(grant.granted_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <ShieldCheck className="size-4 text-emerald-600" />
                                    Active access
                                </div>
                                <div className="flex items-center justify-between gap-5">
                                    <span className="text-sm text-zinc-500">
                                        <span className="font-mono font-semibold text-zinc-900">{grant.document_count}</span>{' '}
                                        {grant.document_count === 1 ? 'document' : 'documents'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                                        Open room <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
