import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

export default function NotLive() {
    return (
        <>
            <Head title="Profile Not Yet Live — Pinpoint Launchpad" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#080B11] px-4 text-center">
                <Clock className="mb-6 size-16 text-[#788CBA]" />
                <h1 className="mb-3 text-2xl font-bold text-[#ECF0F9]">This profile is not yet live.</h1>
                <p className="mb-8 text-[#788CBA]">The founder's audit is still in progress.</p>
                <button
                    onClick={() => window.history.back()}
                    className="text-sm text-[#576FA8] hover:text-[#ECF0F9]"
                >
                    &larr; Back
                </button>
            </div>
        </>
    );
}
