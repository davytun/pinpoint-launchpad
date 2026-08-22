import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FolderLock } from 'lucide-react';
import { PinpointLogo } from '@/components/pinpoint-logo';

type Grant = {
    slug: string;
    company_name: string | null;
    granted_at: string | null;
};

export default function DataRoomIndex({ grants }: { grants: Grant[] }) {
    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title="Data Rooms" />
            
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <PinpointLogo height={24} />
                <Link href={route('investor.dashboard')} className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white hover:text-zinc-950">
                    Dashboard
                </Link>
            </header>

            <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
                <div className="flex items-center gap-4">
                    <Link href={route('investor.dashboard')} className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm transition hover:text-zinc-900">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Secure Access</p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Your Data Rooms</h1>
                    </div>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {grants.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                            <FolderLock className="mx-auto size-10 text-zinc-300" />
                            <p className="mt-4 font-bold text-zinc-900">No active data rooms.</p>
                            <p className="mt-2 text-sm text-zinc-600">When founders grant you access after an interest submission, their data rooms will appear here.</p>
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
                                    <h2 className="mt-5 text-xl font-extrabold tracking-tight">
                                        {grant.company_name ?? 'PIN Startup'}
                                    </h2>
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
