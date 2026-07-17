import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';

import SideRays from '@/components/SideRays';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    reading_time_mins: number;
    published_at: string;
}

interface RelatedPostItem {
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    reading_time_mins: number;
    published_at: string;
}

interface PageProps {
    post: BlogPostItem;
    related: RelatedPostItem[];
}

export default function BlogShow({ post, related }: PageProps) {
    function share() {
        if (navigator.share) {
            navigator
                .share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Article link copied to clipboard!');
        }
    }

    return (
        <>
            <Head title={`${post.title} — The Pinpoint Blog`} />
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

                <div className="relative z-10 flex min-h-screen w-full flex-col">
                    <Header />

                    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:px-8">
                        {/* Back navigation */}
                        <Link
                            href={route('blog.index')}
                            className="text-zinc-550 mb-8 inline-flex items-center gap-2 pt-4 text-sm font-bold transition-colors hover:text-zinc-950"
                        >
                            <ArrowLeft className="size-4" /> Back to Blog
                        </Link>

                        {/* Article Header */}
                        <article className="space-y-8">
                            <header className="space-y-4">
                                {post.category && (
                                    <span className="inline-block rounded-full bg-[#3A54A5]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-[#3A54A5] uppercase">
                                        {post.category}
                                    </span>
                                )}
                                <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                                    {post.title}
                                </h1>
                                <p className="text-zinc-550 text-base leading-relaxed font-medium">{post.excerpt}</p>

                                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200/80 py-4 text-xs font-bold text-zinc-500">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <span className="flex items-center gap-1.5">
                                            <User className="size-4 text-zinc-400" />
                                            {post.author_name}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="size-4 text-zinc-400" />
                                            {post.published_at}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="size-4 text-zinc-400" />
                                            {post.reading_time_mins} min read
                                        </span>
                                    </div>
                                    <button
                                        onClick={share}
                                        className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 transition-colors hover:border-[#3A54A5]/30 hover:text-[#3A54A5]"
                                    >
                                        <Share2 className="size-3.5" />
                                        Share
                                    </button>
                                </div>
                            </header>

                            {/* Cover Image */}
                            {post.cover_image && (
                                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                                    <img src={post.cover_image} alt={post.title} className="max-h-[400px] w-full object-cover" />
                                </div>
                            )}

                            {/* Article Body Content */}
                            <div className="prose prose-zinc text-zinc-850 max-w-none space-y-6 pt-4 font-sans text-sm leading-relaxed md:text-base">
                                <div dangerouslySetInnerHTML={{ __html: post.body }} className="blog-content space-y-5" />
                            </div>
                        </article>

                        {/* Related Articles */}
                        {related.length > 0 && (
                            <section className="mt-20 border-t border-zinc-200 pt-16">
                                <h3 className="font-display mb-8 text-xl font-extrabold text-zinc-950">Related Articles</h3>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {related.map((rel) => (
                                        <div
                                            key={rel.slug}
                                            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/20 bg-white/40 p-4 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:shadow-lg"
                                        >
                                            <div className="space-y-3">
                                                {rel.cover_image && (
                                                    <div className="h-32 w-full overflow-hidden rounded-lg">
                                                        <img
                                                            src={rel.cover_image}
                                                            alt={rel.title}
                                                            className="h-full w-full object-cover transition-transform duration-550 group-hover:scale-102"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    {rel.category && (
                                                        <span className="text-[9px] font-bold tracking-wider text-[#3A54A5] uppercase">
                                                            {rel.category}
                                                        </span>
                                                    )}
                                                    <h4 className="font-display line-clamp-2 font-extrabold text-zinc-950 transition-colors group-hover:text-[#3A54A5]">
                                                        <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px] font-bold text-zinc-400">
                                                <span>{rel.published_at}</span>
                                                <span>{rel.reading_time_mins}m read</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
