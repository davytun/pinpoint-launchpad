import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Calendar, ChevronRight, Clock, Search } from 'lucide-react';
import React, { useState } from 'react';

import SideRays from '@/components/SideRays';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import { cn } from '@/lib/utils';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    reading_time_mins: number;
    published_at: string;
}

interface PaginatedBlogPosts {
    data: BlogPostItem[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface PageProps {
    posts: PaginatedBlogPosts;
    categories: string[];
    filters: { category: string | null; search: string };
}

export default function BlogIndex({ posts, categories, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters(search, selectedCategory);
    }

    function handleCategoryClick(cat: string) {
        const newCat = selectedCategory === cat ? '' : cat;
        setSelectedCategory(newCat);
        applyFilters(search, newCat);
    }

    function applyFilters(searchVal: string, catVal: string) {
        router.get(
            route('blog.index'),
            {
                search: searchVal || undefined,
                category: catVal || undefined,
            },
            { preserveState: true },
        );
    }

    const featuredPost = posts.data[0];
    const regularPosts = posts.data.slice(1);

    return (
        <>
            <Head title="Insights & Articles — Pinpoint Launchpad" />
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

                    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 md:px-8">
                        {/* Section Header */}
                        <div className="mx-auto mb-12 max-w-3xl pt-8 text-center">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Insights & Analysis</span>
                            <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">The Pinpoint Blog</h1>
                            <p className="mt-4 text-base leading-relaxed text-zinc-500">
                                Investment readiness advice, institutional vetting guides, and fundraising playbooks for early-stage founders.
                            </p>
                        </div>

                        {/* Search & Categories */}
                        <div className="mb-12 flex flex-col gap-6 border-b border-zinc-200 pb-8 md:flex-row md:items-center md:justify-between">
                            {/* Categories scrollable list */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleCategoryClick('')}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-xs font-bold transition-all',
                                        selectedCategory === ''
                                            ? 'border-transparent bg-[#3A54A5] text-white'
                                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300',
                                    )}
                                >
                                    All Topics
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={cn(
                                            'rounded-full border px-4 py-1.5 text-xs font-bold transition-all',
                                            selectedCategory === cat
                                                ? 'border-transparent bg-[#3A54A5] text-white'
                                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300',
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="relative w-full max-w-xs">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full rounded-full border border-zinc-200 bg-white/70 py-2 pr-4 pl-9 text-xs placeholder:text-zinc-400 focus:border-[#3A54A5]/65 focus:outline-none"
                                />
                            </form>
                        </div>

                        {posts.data.length === 0 ? (
                            <div className="py-20 text-center">
                                <BookOpen className="mx-auto mb-4 size-12 text-zinc-300" />
                                <h3 className="text-lg font-bold text-zinc-800">No articles found</h3>
                                <p className="mt-1 text-sm text-zinc-500">Try tweaking your search or filtering keywords.</p>
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {/* Featured post (only on page 1 when no filtering is active) */}
                                {featuredPost && !search && !selectedCategory && posts.current_page === 1 && (
                                    <div className="group relative grid overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-[#3A54A5]/25 hover:shadow-lg md:grid-cols-2">
                                        <div className="relative h-64 w-full overflow-hidden md:h-full">
                                            <img
                                                src={
                                                    featuredPost.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600'
                                                }
                                                alt={featuredPost.title}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between space-y-6 p-8">
                                            <div className="space-y-4">
                                                {featuredPost.category && (
                                                    <span className="inline-block rounded-full bg-[#3A54A5]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-[#3A54A5] uppercase">
                                                        {featuredPost.category}
                                                    </span>
                                                )}
                                                <h2 className="font-display line-clamp-2 text-2xl leading-tight font-extrabold text-zinc-950 sm:text-3xl">
                                                    {featuredPost.title}
                                                </h2>
                                                <p className="line-clamp-3 text-sm leading-relaxed font-medium text-zinc-500">
                                                    {featuredPost.excerpt}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
                                                <div className="text-zinc-550 flex items-center gap-4 text-xs font-semibold">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3.5" />
                                                        {featuredPost.published_at}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3.5" />
                                                        {featuredPost.reading_time_mins} min read
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/blog/${featuredPost.slug}`}
                                                    className="inline-flex items-center gap-1 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2d4182]"
                                                >
                                                    Read Article
                                                    <ChevronRight className="size-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Article Grid */}
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {(featuredPost && (search || selectedCategory || posts.current_page > 1) ? posts.data : regularPosts).map(
                                        (post) => (
                                            <div
                                                key={post.id}
                                                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:shadow-lg"
                                            >
                                                <div className="space-y-4">
                                                    {/* Cover Image */}
                                                    <div className="bg-zinc-150 relative h-44 w-full overflow-hidden rounded-xl">
                                                        <img
                                                            src={
                                                                post.cover_image ||
                                                                'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'
                                                            }
                                                            alt={post.title}
                                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        {post.category && (
                                                            <span className="text-[10px] font-bold tracking-wider text-[#3A54A5] uppercase">
                                                                {post.category}
                                                            </span>
                                                        )}
                                                        <h3 className="font-display line-clamp-2 text-lg font-extrabold text-zinc-950 transition-colors group-hover:text-[#3A54A5]">
                                                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                        </h3>
                                                        <p className="line-clamp-3 text-xs leading-relaxed font-medium text-zinc-500">
                                                            {post.excerpt}
                                                        </p>
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
                                                        <ChevronRight className="size-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-1.5">
                                {posts.links.map((link, idx) => {
                                    if (link.url === null) return null;
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            className={cn(
                                                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                                                link.active
                                                    ? 'border-transparent bg-[#3A54A5] text-white'
                                                    : 'text-zinc-650 border-zinc-200 bg-white hover:bg-zinc-50',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
}
