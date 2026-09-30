import AssessmentLanding from '@/components/assessment/assessment-landing';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import SideRays from '@/components/SideRays';

export default function Assessment() {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900">
            <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
                <SideRays
                    rayColor1="#3A54A5"
                    rayColor2="#BFDBFE"
                    origin="top-left"
                    speed={1.4}
                    intensity={0.8}
                    spread={2}
                    tilt={0}
                    saturation={1.1}
                    blend={0.24}
                    falloff={2.3}
                    opacity={0.25}
                />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-col">
                <Header cta={{ label: 'Apply for assessment', href: '#apply' }} />
                <AssessmentLanding />
                <Footer />
            </div>
        </div>
    );
}
