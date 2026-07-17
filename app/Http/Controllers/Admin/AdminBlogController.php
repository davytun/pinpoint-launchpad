<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBlogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->query('search', ''));
        $status = $request->query('status'); // 'published' | 'draft' | null

        $posts = BlogPost::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($q2) => $q2
                ->where('title', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%")
            ))
            ->when($status === 'published', fn ($q) => $q->where('is_published', true))
            ->when($status === 'draft',     fn ($q) => $q->where('is_published', false))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Blog/Index', [
            'posts'   => $posts,
            'filters' => ['search' => $search, 'status' => $status],
            'totals'  => [
                'all'       => BlogPost::count(),
                'published' => BlogPost::where('is_published', true)->count(),
                'draft'     => BlogPost::where('is_published', false)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Blog/Form', ['post' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'excerpt'     => ['required', 'string', 'max:500'],
            'body'        => ['required', 'string'],
            'cover_image' => ['nullable', 'url', 'max:500'],
            'author_name' => ['required', 'string', 'max:100'],
            'category'    => ['nullable', 'string', 'max:100'],
            'is_published'=> ['boolean'],
        ]);

        $data['slug']         = BlogPost::generateSlug($data['title']);
        $data['published_at'] = ($data['is_published'] ?? false) ? now() : null;

        BlogPost::create($data);

        return redirect()->route('admin.blog.index')->with('success', 'Post created.');
    }

    public function edit(BlogPost $post): Response
    {
        return Inertia::render('Admin/Blog/Form', ['post' => $post]);
    }

    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'excerpt'     => ['required', 'string', 'max:500'],
            'body'        => ['required', 'string'],
            'cover_image' => ['nullable', 'url', 'max:500'],
            'author_name' => ['required', 'string', 'max:100'],
            'category'    => ['nullable', 'string', 'max:100'],
            'is_published'=> ['boolean'],
        ]);

        // Regenerate slug only if title changed
        if ($data['title'] !== $post->title) {
            $data['slug'] = BlogPost::generateSlug($data['title'], $post->id);
        }

        // Set published_at when first published
        if (($data['is_published'] ?? false) && ! $post->published_at) {
            $data['published_at'] = now();
        }

        $post->update($data);

        return redirect()->route('admin.blog.index')->with('success', 'Post updated.');
    }

    public function toggle(BlogPost $post): RedirectResponse
    {
        $nowPublishing = ! $post->is_published;
        $post->update([
            'is_published' => $nowPublishing,
            'published_at' => $nowPublishing && ! $post->published_at ? now() : $post->published_at,
        ]);

        $msg = $nowPublishing ? "'{$post->title}' published." : "'{$post->title}' moved to drafts.";
        return back()->with('success', $msg);
    }

    public function destroy(BlogPost $post): RedirectResponse
    {
        $title = $post->title;
        $post->delete();
        return back()->with('success', "'{$title}' deleted.");
    }
}