import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleCheck, CircleDot, Edit, Eye, Layers, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string | null;
    author_name: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
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
    filters: { search: string; status: string | null };
    totals: { all: number; published: number; draft: number };
}

export default function AdminBlogIndex({ posts, filters, totals }: PageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilters(search, status);
    }

    function handleStatusChange(newStatus: string) {
        setStatus(newStatus);
        applyFilters(search, newStatus);
    }

    function applyFilters(searchVal: string, statusVal: string) {
        router.get(
            route('admin.blog.index'),
            {
                search: searchVal || undefined,
                status: statusVal || undefined,
            },
            { preserveState: true },
        );
    }

    function togglePublish(post: BlogPostItem) {
        router.patch(route('admin.blog.toggle', { post: post.slug }), {}, { preserveScroll: true });
    }

    function destroy(post: BlogPostItem) {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
        router.delete(route('admin.blog.destroy', { post: post.slug }), { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Blog Management — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-zinc-955 text-2xl font-extrabold">Blog Management</h1>
                        <p className="text-zinc-555 mt-1 text-sm font-medium">Create, update, and manage your public articles.</p>
                    </div>
                    <Link
                        href={route('admin.blog.create')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/20 transition-all hover:bg-[#2D4182] hover:shadow-lg active:scale-[0.98]"
                    >
                        <Plus className="size-4" />
                        Create New Post
                    </Link>
                </div>

                {/* Totals & Status Toggles */}
                <div className="mb-6 grid max-w-xl grid-cols-3 gap-4">
                    <button
                        onClick={() => handleStatusChange('')}
                        className={cn(
                            'flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
                            status === ''
                                ? 'border-[#3A54A5]/30 bg-[#3A54A5]/5 font-bold text-[#3A54A5] shadow-xs'
                                : 'text-zinc-550 border-zinc-200 bg-white/40 hover:bg-white/60',
                        )}
                    >
                        <Layers className="mb-2 size-4 opacity-80" />
                        <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">All Posts</span>
                        <span className="text-lg font-black">{totals.all}</span>
                    </button>

                    <button
                        onClick={() => handleStatusChange('published')}
                        className={cn(
                            'flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
                            status === 'published'
                                ? 'border-emerald-500/30 bg-emerald-50/50 font-bold text-emerald-700 shadow-xs'
                                : 'text-zinc-550 border-zinc-200 bg-white/40 hover:bg-white/60',
                        )}
                    >
                        <CircleCheck className="mb-2 size-4 opacity-80" />
                        <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">Published</span>
                        <span className="text-lg font-black text-emerald-600">{totals.published}</span>
                    </button>

                    <button
                        onClick={() => handleStatusChange('draft')}
                        className={cn(
                            'flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
                            status === 'draft'
                                ? 'border-amber-500/30 bg-amber-50/50 font-bold text-amber-700 shadow-xs'
                                : 'text-zinc-550 border-zinc-200 bg-white/40 hover:bg-white/60',
                        )}
                    >
                        <CircleDot className="mb-2 size-4 opacity-80" />
                        <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">Drafts</span>
                        <span className="text-lg font-black text-amber-600">{totals.draft}</span>
                    </button>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleSearchSubmit} className="mb-6 flex max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, category..."
                            className="w-full rounded-xl border border-zinc-200 bg-white/50 py-2 pr-4 pl-10 text-sm placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                        Search
                    </button>
                </form>

                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        className={cn(
                            'mb-6 rounded-xl border px-4 py-3 text-sm font-semibold',
                            flash.success ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700' : 'border-rose-500/25 bg-rose-50 text-rose-700',
                        )}
                    >
                        {flash.success ?? flash.error}
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md">
                    {posts.data.length === 0 ? (
                        <div className="py-16 text-center text-sm font-semibold text-zinc-500">No blog posts found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                        {['Title', 'Category', 'Status', 'Date Published', 'Actions'].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/80">
                                    {posts.data.map((post) => (
                                        <tr key={post.id} className="group transition-colors hover:bg-zinc-50/40">
                                            <td className="px-5 py-4">
                                                <div className="line-clamp-1 font-bold text-zinc-950">{post.title}</div>
                                                <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{post.excerpt}</div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-zinc-600">
                                                {post.category || <span className="text-zinc-400 italic">Uncategorized</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => togglePublish(post)}
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95',
                                                        post.is_published
                                                            ? 'border-emerald-250 border bg-emerald-50 text-emerald-700'
                                                            : 'border-amber-250 border bg-amber-50 text-amber-700',
                                                    )}
                                                >
                                                    {post.is_published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-zinc-500">
                                                {post.published_at ? (
                                                    new Date(post.published_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })
                                                ) : (
                                                    <span className="font-normal text-zinc-400 italic">N/A (Draft)</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {post.is_published && (
                                                        <a
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-zinc-650 flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors hover:border-[#3A54A5]/30 hover:text-[#3A54A5]"
                                                            title="View Live"
                                                        >
                                                            <Eye className="size-4" />
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={route('admin.blog.edit', { post: post.slug })}
                                                        className="text-zinc-650 flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors hover:border-[#3A54A5]/30 hover:text-[#3A54A5]"
                                                        title="Edit Post"
                                                    >
                                                        <Edit className="size-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => destroy(post)}
                                                        className="text-rose-650 flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors hover:border-rose-200 hover:bg-rose-50"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-1.5">
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
                                            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
