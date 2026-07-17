<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->query('category');
        $search   = trim($request->query('search', ''));

        $posts = BlogPost::published()
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($search !== '', fn ($q) => $q->where(fn ($q2) => $q2
                ->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")
            ))
            ->orderByDesc('published_at')
            ->paginate(9)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'               => $p->id,
                'title'            => $p->title,
                'slug'             => $p->slug,
                'excerpt'          => $p->excerpt,
                'cover_image'      => $p->cover_image,
                'author_name'      => $p->author_name,
                'category'         => $p->category,
                'reading_time_mins'=> $p->reading_time_mins,
                'published_at'     => $p->published_at?->format('M j, Y'),
            ]);

        $categories = BlogPost::published()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Blog/Index', [
            'posts'      => $posts,
            'categories' => $categories,
            'filters'    => ['category' => $category, 'search' => $search],
        ]);
    }

    public function show(BlogPost $post): Response|\Illuminate\Http\RedirectResponse
    {
        // If post is not published, redirect to blog listing
        if (! $post->is_published) {
            return redirect()->route('blog.index');
        }

        $related = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->when($post->category, fn ($q) => $q->where('category', $post->category))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn ($p) => [
                'title'            => $p->title,
                'slug'             => $p->slug,
                'excerpt'          => $p->excerpt,
                'cover_image'      => $p->cover_image,
                'author_name'      => $p->author_name,
                'category'         => $p->category,
                'reading_time_mins'=> $p->reading_time_mins,
                'published_at'     => $p->published_at?->format('M j, Y'),
            ]);

        return Inertia::render('Blog/Show', [
            'post'    => [
                'id'               => $post->id,
                'title'            => $post->title,
                'slug'             => $post->slug,
                'excerpt'          => $post->excerpt,
                'body'             => $post->body,
                'cover_image'      => $post->cover_image,
                'author_name'      => $post->author_name,
                'category'         => $post->category,
                'reading_time_mins'=> $post->reading_time_mins,
                'published_at'     => $post->published_at?->format('M j, Y'),
            ],
            'related' => $related,
        ]);
    }
}
