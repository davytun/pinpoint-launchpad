import SideRays from '@/components/SideRays';
import About from '@/components/landing/about';
import { ScrollReveal } from '@/components/landing/animations';
import AudienceSplit from '@/components/landing/audience-split';
import BlogTeaser from '@/components/landing/blog-teaser';
import Blueprint from '@/components/landing/blueprint';
import Contact from '@/components/landing/contact';
import CtaQuote from '@/components/landing/cta-quote';
import DashboardPreview from '@/components/landing/dashboard-preview';
import Faq from '@/components/landing/faq';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import ParagonModel from '@/components/landing/paragon-model';
import PiaTeaser from '@/components/landing/pia-teaser';
import ProgramsPricing from '@/components/landing/programs-pricing';
import WhyPinpoint from '@/components/landing/why-pinpoint';
import { Head } from '@inertiajs/react';

interface BlogPostItem {
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    reading_time_mins: number;
    published_at: string;
}

export default function Welcome({ latest_posts = [] }: { latest_posts?: BlogPostItem[] }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900">
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
                        opacity={0.42}
                    />
                </div>

                {/* Page Content / Sections */}
                <div className="relative z-10 flex min-h-screen w-full flex-col">
                    <Header />
                    <main className="flex w-full flex-1 flex-col items-center">
                        <Hero />
                        <DashboardPreview />

                        <ScrollReveal>
                            <About />
                        </ScrollReveal>

                        <ScrollReveal>
                            <WhyPinpoint />
                        </ScrollReveal>

                        <ScrollReveal>
                            <AudienceSplit />
                        </ScrollReveal>

                        <ScrollReveal>
                            <ParagonModel />
                        </ScrollReveal>

                        <ScrollReveal>
                            <Blueprint />
                        </ScrollReveal>

                        <ScrollReveal>
                            <PiaTeaser />
                        </ScrollReveal>

                        <ScrollReveal>
                            <ProgramsPricing />
                        </ScrollReveal>

                        <ScrollReveal>
                            <Faq />
                        </ScrollReveal>

                        <ScrollReveal>
                            <BlogTeaser posts={latest_posts} />
                        </ScrollReveal>

                        <ScrollReveal>
                            <CtaQuote />
                        </ScrollReveal>

                        <ScrollReveal>
                            <Contact />
                        </ScrollReveal>
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
