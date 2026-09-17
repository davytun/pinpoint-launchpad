import InvestorLandingHeader from '@/components/investor-landing/header';
import InvestorLandingHero from '@/components/investor-landing/hero';
import InvestorLandingSections from '@/components/investor-landing/sections';
import Footer from '@/components/landing/footer';
import SideRays from '@/components/SideRays';

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

interface Props {
    cta: { label: string; url: string; enabled: boolean };
    latest_posts?: BlogPostItem[];
}

export default function Landing({ cta, latest_posts = [] }: Props) {
    return (
        <>
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
                    <InvestorLandingHeader cta={cta} />
                    <main className="flex w-full flex-1 flex-col items-center">
                        <InvestorLandingHero cta={cta} />
                        <InvestorLandingSections cta={cta} latest_posts={latest_posts} />
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
