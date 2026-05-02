import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function Expired() {
    return (
        <>
            <Head title="Verification Expired — Pinpoint Launchpad" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
                <AlertCircle className="mb-6 size-16 text-amber-400" />
                <h1 className="mb-3 text-2xl font-bold text-white">This verification has expired.</h1>
                <p className="mb-8 max-w-md text-slate-400">
                    PARAGON certifications are valid for 90 days. This founder's certification has not been renewed.
                </p>
                <Link
                    href="/waitlist"
                    className="text-sm text-slate-500 hover:text-slate-300"
                >
                    Learn about Pinpoint &rarr;
                </Link>
            </div>
        </>
    );
}
