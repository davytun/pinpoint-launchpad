import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, EyeOff, Globe, Save } from 'lucide-react';
import React from 'react';

import RichTextEditor from '@/components/admin/RichTextEditor';
import AdminLayout from '@/layouts/admin-layout';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    cover_image: string | null;
    author_name: string;
    category: string | null;
    is_published: boolean;
}

interface PageProps {
    post: BlogPostItem | null;
}

export default function AdminBlogForm({ post }: PageProps) {
    const isEdit = !!post;
    const { csrf_token } = usePage<{ csrf_token: string }>().props;

    const {
        data,
        setData,
        post: sendPost,
        patch,
        processing,
        errors,
    } = useForm({
        title: post?.title || '',
        excerpt: post?.excerpt || '',
        body: post?.body || '',
        cover_image: post?.cover_image || '',
        author_name: post?.author_name || 'Pinpoint Team',
        category: post?.category || '',
        is_published: post?.is_published || false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.blog.update', { post: post.slug }));
        } else {
            sendPost(route('admin.blog.store'));
        }
    }

    const inputClass =
        'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-955 placeholder:text-zinc-400 focus:border-[#3A54A5]/60 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none shadow-xs transition-all';

    const labelClass = 'mb-1.5 block text-xs font-bold tracking-widest text-zinc-500 uppercase';

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit Post: ${post.title} — Admin` : 'Create Blog Post — Admin'} />

            <div className="max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Back Link */}
                <Link
                    href={route('admin.blog.index')}
                    className="text-zinc-555 hover:text-zinc-955 mb-6 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                >
                    <ArrowLeft className="size-4" /> Back to Articles
                </Link>

                {/* Page Heading */}
                <div className="mb-8">
                    <h1 className="text-zinc-955 text-2xl font-extrabold">{isEdit ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
                    <p className="text-zinc-555 mt-1 text-sm font-medium">
                        {isEdit ? 'Make changes to your article and save.' : 'Draft or publish a new article.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left column: main content editor (col-span-2) */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                                {/* Title */}
                                <div>
                                    <label className={labelClass}>Post Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. 5 Due Diligence Red Flags Most Startups Ignore"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.title}</p>}
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className={labelClass}>Short Excerpt / Summary</label>
                                    <textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className={inputClass}
                                        placeholder="A compelling, short summary (maximum 500 characters) shown on list pages."
                                        required
                                    />
                                    <p className="mt-1 text-right text-[10px] font-semibold text-zinc-400">{data.excerpt.length} / 500 chars</p>
                                    {errors.excerpt && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.excerpt}</p>}
                                </div>

                                {/* Body */}
                                <div>
                                    <label className={labelClass}>Body</label>
                                    <RichTextEditor
                                        value={data.body}
                                        onChange={(val) => setData('body', val)}
                                        imageUploadUrl={route('admin.blog.images.store')}
                                        csrfToken={csrf_token}
                                    />
                                    {errors.body && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.body}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Right column: metadata & settings */}
                        <div className="space-y-6">
                            <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                                <h3 className="font-display text-zinc-450 border-b border-zinc-100 pb-2 text-xs font-black tracking-wider uppercase">
                                    Publishing Status
                                </h3>

                                {/* Publish Checkbox */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="mt-1 size-4 rounded-sm border-zinc-300 text-[#3A54A5] focus:ring-[#3A54A5]/20"
                                    />
                                    <label htmlFor="is_published" className="cursor-pointer select-none">
                                        <span className="block text-sm font-bold text-zinc-800">Publish Article</span>
                                        <span className="mt-0.5 block text-xs leading-relaxed font-semibold text-zinc-400">
                                            Make this article live on the public site immediately.
                                        </span>
                                    </label>
                                </div>

                                {/* Status Status Display */}
                                <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs font-bold">
                                    {data.is_published ? (
                                        <>
                                            <Globe className="size-4 text-emerald-600" />
                                            <span className="text-emerald-700">Status: Published Live</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="size-4 text-amber-600" />
                                            <span className="text-amber-700">Status: Private Draft</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
                                <h3 className="font-display text-zinc-450 border-b border-zinc-100 pb-2 text-xs font-black tracking-wider uppercase">
                                    Metadata & Settings
                                </h3>

                                {/* Category */}
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Fundraising, Vetting"
                                    />
                                    {errors.category && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.category}</p>}
                                </div>

                                {/* Author */}
                                <div>
                                    <label className={labelClass}>Author Name</label>
                                    <input
                                        type="text"
                                        value={data.author_name}
                                        onChange={(e) => setData('author_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="Pinpoint Team"
                                        required
                                    />
                                    {errors.author_name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.author_name}</p>}
                                </div>

                                {/* Cover Image */}
                                <div>
                                    <label className={labelClass}>Cover Image</label>

                                    {/* Upload box */}
                                    <div className="mt-1">
                                        {data.cover_image ? (
                                            <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                                <img
                                                    src={data.cover_image}
                                                    alt="Cover Preview"
                                                    className="h-40 w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=300';
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const fileInput = document.getElementById('cover-image-upload');
                                                            fileInput?.click();
                                                        }}
                                                        className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-sm hover:bg-zinc-50"
                                                    >
                                                        Change Image
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('cover_image', '')}
                                                        className="cursor-pointer rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => {
                                                    const fileInput = document.getElementById('cover-image-upload');
                                                    fileInput?.click();
                                                }}
                                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 px-4 py-8 text-center transition-all hover:border-zinc-300 hover:bg-zinc-50/50"
                                            >
                                                <div className="border-zinc-150 mb-3 flex size-10 items-center justify-center rounded-full border bg-zinc-50">
                                                    <svg className="size-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-bold text-zinc-700">Click to upload cover image</span>
                                                <span className="mt-1 text-[10px] text-zinc-400">PNG, JPG or WEBP (Max 5MB)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hidden upload input */}
                                    <input
                                        type="file"
                                        id="cover-image-upload"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('image', file);

                                            // Show a temporarily uploading text or state
                                            const originalText = document.getElementById('cover-upload-status');
                                            if (originalText) originalText.innerText = 'Uploading...';

                                            try {
                                                const res = await fetch(route('admin.blog.images.store'), {
                                                    method: 'POST',
                                                    headers: { 'X-CSRF-TOKEN': csrf_token },
                                                    body: formData,
                                                });
                                                if (!res.ok) throw new Error('Upload failed');
                                                const { url } = await res.json();
                                                setData('cover_image', url);
                                            } catch (err) {
                                                alert('Cover image upload failed. Please try again.');
                                            } finally {
                                                if (originalText) originalText.innerText = '';
                                            }
                                        }}
                                    />
                                    <span id="cover-upload-status" className="mt-1 block text-[10px] font-bold text-[#3A54A5]"></span>

                                    {/* Manual URL input fallback */}
                                    <div className="mt-3">
                                        <details className="group">
                                            <summary className="cursor-pointer text-[11px] font-bold text-zinc-400 transition-colors outline-none select-none hover:text-zinc-600">
                                                Or enter manual cover image URL...
                                            </summary>
                                            <div className="mt-2">
                                                <input
                                                    type="url"
                                                    value={data.cover_image}
                                                    onChange={(e) => setData('cover_image', e.target.value)}
                                                    className={inputClass}
                                                    placeholder="https://images.unsplash.com/..."
                                                />
                                            </div>
                                        </details>
                                    </div>
                                    {errors.cover_image && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.cover_image}</p>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-3 text-sm font-bold text-white shadow-md shadow-[#3A54A5]/25 transition-all hover:bg-[#2D4182] hover:shadow-lg active:scale-[0.985] disabled:opacity-50"
                            >
                                <Save className="size-4" />
                                {isEdit ? 'Save Article Changes' : 'Create Article'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
