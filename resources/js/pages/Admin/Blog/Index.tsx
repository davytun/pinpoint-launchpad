import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Layers, Plus, Search, Trash2, X } from 'lucide-react';
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

            {/* ── Outer Card Container  ────────────────────────── */}
            <div className="flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:rounded-[22px]">
                {/* ── Top Header & Actions Bar ───────────────────────────────── */}
                <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-zinc-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-[16.5px] font-bold tracking-tight text-zinc-950">Blog Management</h1>
                        </div>
                        <p className="mt-0.5 text-[12px] font-normal text-zinc-500">Create, update, and manage your public articles.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.blog.create')}
                            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-zinc-800"
                        >
                            <Plus className="size-4" />
                            <span>Create New Post</span>
                        </Link>
                    </div>
                </div>

                {/* ── Inline Metric Ribbon (Mercury Style) ──────────── */}
                <div className="grid shrink-0 grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100 bg-[#FAFBFD]">
                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Total Posts</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.all}</span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Published</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.published}</span>
                        </div>
                    </div>

                    <div className="px-6 py-3">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Drafts</span>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-[17px] font-bold text-zinc-950 tabular-nums">{totals.draft}</span>
                        </div>
                    </div>
                </div>

                {/* ── Toolbar: Segmented Views & Integrated Search ─────────────── */}
                <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-b border-zinc-100 bg-white px-6 py-3 sm:flex-row">
                    {/* Filter Segmented Control */}
                    <div className="flex items-center gap-1 rounded-xl border border-zinc-200/60 bg-[#F4F4F6] p-1">
                        {(
                            [
                                { key: '', label: 'All' },
                                { key: 'published', label: 'Published' },
                                { key: 'draft', label: 'Drafts' },
                            ] as const
                        ).map(({ key, label }) => {
                            const isSelected = status === key;
                            return (
                                <button
                                    key={label}
                                    onClick={() => handleStatusChange(key)}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-150',
                                        isSelected ? 'bg-white font-bold text-zinc-950 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex w-full items-center gap-4 sm:w-auto">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-76">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search title, category..."
                                className="w-full rounded-xl border border-zinc-200/90 bg-[#F9F9FB] py-1.5 pr-8 pl-9 text-[13px] text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters('', status);
                                    }}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Flash Messages (Inline) */}
                        {(flash?.success || flash?.error) && (
                            <span
                                className={cn(
                                    'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap',
                                    flash.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                                )}
                            >
                                {flash.success ?? flash.error}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Table Container (Independently Scrollable) ──────────────── */}
                <div className="min-h-0 flex-1 overflow-auto bg-white">
                    {posts.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                                <Layers className="size-6" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900">No blog posts found</h3>
                            <p className="mt-1 max-w-sm text-xs text-zinc-500">
                                {search ? `No posts match "${search}". Try clearing your search.` : 'Get started by creating your first blog post.'}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur-xs">
                                <tr>
                                    <th className="w-[45%] px-6 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                        Title & Excerpt
                                    </th>
                                    <th className="w-[15%] px-6 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Category</th>
                                    <th className="w-[15%] px-6 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Status</th>
                                    <th className="w-[15%] px-6 py-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Published</th>
                                    <th className="w-[10%] px-6 py-3 text-right text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {posts.data.map((post) => (
                                    <tr key={post.id} className="group transition-colors duration-150 hover:bg-[#F9F9FB]">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="line-clamp-1 text-[13px] font-semibold text-zinc-950">{post.title}</p>
                                                <p className="mt-0.5 line-clamp-1 text-[11.5px] font-normal text-zinc-500">
                                                    {post.excerpt || 'No excerpt provided.'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12.5px] font-medium text-zinc-700">
                                                {post.category || <span className="text-zinc-400 italic">Uncategorized</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(post)}
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95',
                                                    post.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                                                )}
                                            >
                                                <span
                                                    className={cn('h-1.5 w-1.5 rounded-full', post.is_published ? 'bg-emerald-500' : 'bg-amber-500')}
                                                />
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-[12.5px] font-medium text-zinc-500">
                                            {post.published_at ? (
                                                new Date(post.published_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            ) : (
                                                <span className="text-zinc-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-zinc-400">
                                                {post.is_published && (
                                                    <a
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                                        title="View Live"
                                                    >
                                                        <Eye className="size-4" />
                                                    </a>
                                                )}
                                                <Link
                                                    href={route('admin.blog.edit', { post: post.slug })}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                                    title="Edit Post"
                                                >
                                                    <Edit className="size-4" />
                                                </Link>
                                                <button
                                                    onClick={() => destroy(post)}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-rose-50 hover:text-rose-600"
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
                    )}
                </div>

                {/* ── Pagination Footer ───────────────────────────────────────── */}
                {posts.last_page > 1 && (
                    <div className="flex shrink-0 items-center justify-center border-t border-zinc-100 bg-white py-3">
                        <div className="flex items-center gap-1">
                            {posts.links.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={cn(
                                            'flex min-w-8 items-center justify-center rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors',
                                            link.active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
