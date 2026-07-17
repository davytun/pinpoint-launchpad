import SideRays from '@/components/SideRays';
import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

export default function NotLive() {
    return (
        <>
            <Head title="Profile Not Yet Live — Pinpoint Launchpad" />
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
                    <Clock className="mb-6 size-16 text-[#3A54A5] drop-shadow-sm" />
                    <h1 className="text-zinc-955 mb-3 text-2xl font-extrabold tracking-tight">This profile is not yet live.</h1>
                    <p className="text-zinc-555 mb-8 font-semibold">The founder's audit is still in progress.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-sm font-extrabold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                    >
                        &larr; Back
                    </button>
                </div>
            </div>
        </>
    );
}
