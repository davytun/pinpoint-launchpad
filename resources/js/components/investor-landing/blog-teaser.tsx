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

interface Props {
    posts?: BlogPostItem[];
}

export default function InvestorBlogTeaser({ posts = [] }: Props) {
    const items = posts ?? [];

    return (
        <section id="blog-teaser" className="relative z-10 w-full border-t border-zinc-200/60 py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-8">
                <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-xl space-y-3">
                        <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">From the blog</p>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Latest on diligence and the platform
                        </h2>
                        <p className="text-base leading-relaxed text-zinc-500 sm:text-lg">
                            Short reads on how Pinpoint reviews startups, what shows up on profiles, and how investor access works.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                    >
                        View all articles
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200/90 bg-white px-6 py-10 text-center sm:px-10">
                        <p className="text-base font-semibold text-zinc-800">New articles are on the way.</p>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                            We publish short reads on diligence, profiles, and how investor access works on Pinpoint.
                        </p>
                        <Link
                            href="/blog"
                            className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                        >
                            Go to the blog
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {items.map((post) => (
                        <article
                            key={post.slug}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(58,84,165,0.06)]"
                        >
                            <Link href={`/blog/${post.slug}`} className="block">
                                <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
                                    <img
                                        src={post.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                </div>
                            </Link>

                            <div className="flex flex-1 flex-col p-5 sm:p-6">
                                {post.category ? (
                                    <span className="text-xs font-bold tracking-wider text-[#3A54A5] uppercase">{post.category}</span>
                                ) : null}
                                <h3 className="font-display mt-2 line-clamp-2 text-lg font-bold tracking-tight text-zinc-950 transition-colors group-hover:text-[#2F468B]">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h3>
                                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">{post.excerpt}</p>

                                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-500">
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="size-3.5 shrink-0" aria-hidden />
                                        {post.published_at}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="size-3.5 shrink-0" aria-hidden />
                                        {post.reading_time_mins} min read
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
                )}
            </div>
        </section>
    );
}
