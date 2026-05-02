import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

export default function NotLive() {
    return (
        <>
            <Head title="Profile Not Yet Live — Pinpoint Launchpad" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
                <Clock className="mb-6 size-16 text-slate-400" />
                <h1 className="mb-3 text-2xl font-bold text-white">This profile is not yet live.</h1>
                <p className="mb-8 text-slate-400">The founder's audit is still in progress.</p>
                <button
                    onClick={() => window.history.back()}
                    className="text-sm text-slate-500 hover:text-slate-300"
                >
                    &larr; Back
                </button>
            </div>
        </>
    );
}
