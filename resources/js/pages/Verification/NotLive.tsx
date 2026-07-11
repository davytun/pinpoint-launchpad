import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

export default function NotLive() {
    return (
        <>
            <Head title="Profile Not Yet Live — Pinpoint Launchpad" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#080B11] px-4 text-center">
                <Clock className="mb-6 size-16 text-[#C1CDE8]" />
                <h1 className="mb-3 text-2xl font-bold text-[#D8E0F3]">This profile is not yet live.</h1>
                <p className="mb-8 text-[#C1CDE8]">The founder's audit is still in progress.</p>
                <button onClick={() => window.history.back()} className="text-sm text-[#91A7D8] hover:text-[#D8E0F3]">
                    &larr; Back
                </button>
            </div>
        </>
    );
}
