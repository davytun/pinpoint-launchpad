import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

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

interface BlogTeaserProps {
    posts?: BlogPostItem[];
}

export default function BlogTeaser({ posts = [] }: BlogTeaserProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section id="blog-teaser" className="relative z-10 w-full border-t border-zinc-100 py-20 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-3">
                        <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Resource Library</span>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Latest from the Blog</h2>
                        <p className="max-w-xl font-sans text-sm text-zinc-500">
                            Actionable fundraising insights, founder playbooks, and structural checklists to accelerate your readiness journey.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="group inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#3A54A5] uppercase transition-colors hover:text-[#2d4182]"
                    >
                        View All Articles
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <div
                            key={post.slug}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:shadow-lg"
                        >
                            <div className="space-y-4">
                                {/* Cover Image */}
                                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-zinc-100">
                                    <img
                                        src={post.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'}
                                        alt={post.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {post.category && (
                                        <span className="text-[10px] font-bold tracking-wider text-[#3A54A5] uppercase">{post.category}</span>
                                    )}
                                    <h3 className="font-display line-clamp-2 text-base font-extrabold text-zinc-950 transition-colors group-hover:text-[#3A54A5]">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h3>
                                    <p className="line-clamp-3 text-xs leading-relaxed font-medium text-zinc-500">{post.excerpt}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-[11px] font-semibold text-zinc-500">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {post.published_at}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {post.reading_time_mins}m read
                                    </span>
                                </div>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="flex size-7 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[#3A54A5] transition-all hover:bg-[#3A54A5] hover:text-white"
                                >
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
