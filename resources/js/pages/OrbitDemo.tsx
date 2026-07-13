import { CallToAction } from '@/components/templates/orbit/sections/cta';
import { FeatureSection } from '@/components/templates/orbit/sections/feature-section';
import { Footer } from '@/components/templates/orbit/sections/footer';
import { Header } from '@/components/templates/orbit/sections/header';
import { HeroSection } from '@/components/templates/orbit/sections/hero';
import { Integrations } from '@/components/templates/orbit/sections/integrations';
import { LogosSection } from '@/components/templates/orbit/sections/logos-section';

export default function OrbitDemoPage() {
    return (
        <div className="flex min-h-screen flex-col items-center">
            <Header />
            <main className="flex w-full flex-col gap-20">
                <HeroSection />
                <LogosSection />
                <FeatureSection />
                <Integrations />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
}
