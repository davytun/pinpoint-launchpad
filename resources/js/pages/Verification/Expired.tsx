import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Expired() {
    return (
        <>
            <Head title="Verification Expired — Pinpoint Launchpad" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#080B11] px-4 text-center">
                <AlertCircle className="mb-6 size-16 text-amber-400" />
                <h1 className="mb-3 text-2xl font-bold text-[#D8E0F3]">This verification has expired.</h1>
                <p className="mb-8 max-w-md text-[#C1CDE8]">
                    PARAGON certifications are valid for 90 days. This founder's certification has not been renewed.
                </p>
                <Link
                    href="/waitlist"
                    className="group flex items-center gap-1.5 text-sm text-[#91A7D8] hover:text-[#D8E0F3]"
                >
                    Learn about Pinpoint
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </>
    );
}
