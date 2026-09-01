import { InvestorHeader } from '@/components/investor-header';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FolderLock } from 'lucide-react';

type Grant = {
    slug: string;
    company_name: string | null;
    granted_at: string | null;
};

export default function DataRoomIndex({ grants }: { grants: Grant[] }) {
    return (
        <main className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
            <Head title="Data Rooms" />
            <InvestorHeader activeTab="data-rooms" />

            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
                <div className="mb-8">
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                        Your Data Rooms
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Access secure institutional materials and financial models granted by founders.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {grants.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                            <FolderLock className="mx-auto size-10 text-zinc-300" />
                            <p className="mt-4 font-bold text-zinc-900">No active data rooms.</p>
                            <p className="mt-2 text-sm text-zinc-600">
                                When founders grant you access after an interest submission, their data rooms will appear here.
                            </p>
                        </div>
                    ) : (
                        grants.map((grant) => (
                            <Link
                                key={grant.slug}
                                href={route('investor.data-rooms.show', grant.slug)}
                                className="group flex flex-col justify-between rounded-2xl border border-white/80 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)] transition hover:-translate-y-0.5 hover:border-[#3A54A5]/30"
                            >
                                <div>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                                        <FolderLock className="size-5" />
                                    </div>
                                    <h2 className="mt-5 text-xl font-extrabold tracking-tight">{grant.company_name ?? 'PIN Startup'}</h2>
                                    <p className="mt-2 text-xs font-semibold text-zinc-500">
                                        Granted {grant.granted_at ? new Date(grant.granted_at).toLocaleDateString() : 'recently'}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 text-sm font-bold text-[#3A54A5]">
                                    <span>Enter room</span>
                                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
