import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import SideRays from '@/components/SideRays';

export default function NotLive() {
    return (
        <>
            <Head title="Profile Not Yet Live — Pinpoint Launchpad" />
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white px-4 text-center overflow-hidden font-sans text-zinc-900 antialiased">
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
                    <h1 className="mb-3 text-2xl font-extrabold text-zinc-955 tracking-tight">This profile is not yet live.</h1>
                    <p className="mb-8 text-zinc-555 font-semibold">The founder's audit is still in progress.</p>
                    <button onClick={() => window.history.back()} className="text-sm text-[#3A54A5] hover:text-[#2D4182] font-extrabold transition-colors">
                        &larr; Back
                    </button>
                </div>
            </div>
        </>
    );
}
