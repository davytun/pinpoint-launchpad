import SideRays from '@/components/SideRays';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Expired() {
    return (
        <>
            <Head title="Verification Expired — Pinpoint Launchpad" />
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white px-4 text-center font-sans text-zinc-900 antialiased">
                {/* Background SideRays */}
                <div className="pointer-events-none fixed inset-0 z-0">
                    <SideRays
                        rayColor1="#3A54A5"
                        rayColor2="#93C5FD"
                        origin="top-left"
                        speed={1.8}
                        intensity={1.2}
                        spread={2}
                        tilt={0}
                        saturation={1.5}
                        blend={0.35}
                        falloff={2.3}
                        opacity={0.35}
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <AlertCircle className="mb-6 size-16 text-amber-500 drop-shadow-sm" />
                    <h1 className="text-zinc-955 mb-3 text-2xl font-extrabold tracking-tight">This verification has expired.</h1>
                    <p className="text-zinc-555 mb-8 max-w-md font-semibold">
                        PARAGON certifications are valid for 90 days. This founder's certification has not been renewed.
                    </p>
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 text-sm font-extrabold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                    >
                        Learn about Pinpoint
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </>
    );
}
