import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { PinpointLogo } from '@/components/pinpoint-logo';

type Interest = {
    id: number;
    type: string;
    message: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profile: {
        founder: {
            company_name: string;
        } | null;
        slug: string;
    };
};

const StatusIcon = ({ status }: { status: Interest['status'] }) => {
    if (status === 'approved') return <CheckCircle2 className="size-5 text-emerald-600" />;
    if (status === 'rejected') return <XCircle className="size-5 text-red-600" />;
    return <Clock3 className="size-5 text-amber-600" />;
};

const StatusLabel = ({ status }: { status: Interest['status'] }) => {
    if (status === 'approved') return <span className="font-bold text-emerald-700">Approved</span>;
    if (status === 'rejected') return <span className="font-bold text-red-700">Declined</span>;
    return <span className="font-bold text-amber-700">Pending Review</span>;
};

export default function Interests({ interests }: { interests: Interest[] }) {
    return (
        <main className="min-h-screen bg-[#f4f7ff] text-zinc-950">
            <Head title="My Interests" />
            
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
                <PinpointLogo height={24} />
                <Link href={route('investor.dashboard')} className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-white hover:text-zinc-950">
                    Dashboard
                </Link>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
                <div className="flex items-center gap-4">
                    <Link href={route('investor.dashboard')} className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm transition hover:text-zinc-900">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Dealflow</p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight">Submitted Interests</h1>
                    </div>
                </div>

                <div className="mt-10 space-y-4">
                    {interests.length === 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white p-10 text-center shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                            <p className="font-bold text-zinc-900">No interests submitted yet.</p>
                            <p className="mt-2 text-sm text-zinc-600">Explore the Spotlight to find curated startups.</p>
                            <Link href={route('investor.spotlight.index')} className="mt-5 inline-block rounded-xl bg-[#3A54A5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2D4182]">
                                Browse Spotlight
                            </Link>
                        </div>
                    ) : (
                        interests.map((interest) => (
                            <div key={interest.id} className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_16px_36px_rgba(33,56,120,0.06)]">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-extrabold tracking-tight">
                                                {interest.profile?.founder?.company_name ?? 'PIN Startup'}
                                            </h2>
                                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                                {interest.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-zinc-500">
                                            Submitted on {new Date(interest.created_at).toLocaleDateString()}
                                        </p>
                                        {interest.message && (
                                            <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
                                                "{interest.message}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 sm:bg-transparent sm:px-0 sm:py-0">
                                        <StatusIcon status={interest.status} />
                                        <StatusLabel status={interest.status} />
                                    </div>
                                </div>
                                {interest.status === 'approved' && (
                                    <div className="mt-6 border-t border-zinc-100 pt-5">
                                        <Link href={route('data-rooms.show', interest.profile.slug)} className="text-sm font-bold text-[#3A54A5] hover:underline">
                                            View Data Room &rarr;
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
