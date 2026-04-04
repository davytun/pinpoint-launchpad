# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
composer run dev        # starts artisan serve + queue:listen + npm run dev concurrently
```

Or individually:
```bash
php artisan serve
npm run dev
php artisan queue:listen
```

### Frontend

```bash
npm run build           # production Vite build
npm run build:ssr       # SSR build (client + server)
npm run lint            # ESLint with auto-fix
npm run format          # Prettier on resources/
npm run format:check    # check formatting without writing
```

### Backend

```bash
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=AdminSeeder
php artisan tinker
```

### Testing

```bash
php artisan test                                    # run all tests
php artisan test --filter TestName                  # single test
php artisan test tests/Feature/ExampleTest.php      # single file
composer run pint                                   # PHP code style (Laravel Pint)
```

Tests run on SQLite in-memory (`DB_CONNECTION=sqlite`, `:memory:`). No database setup needed.

## Scaffolding — Always Use Artisan

Never write Laravel class files manually. Always generate then customise:

```bash
php artisan make:controller Name
php artisan make:model Name -m        # model + migration together
php artisan make:middleware Name
php artisan make:job Name
php artisan make:seeder Name
php artisan make:request Name
php artisan make:mail Name --markdown
php artisan make:policy Name
php artisan make:event Name
php artisan make:listener Name
```

## Architecture

### Stack

- **Laravel 12** — PHP backend, API + routing
- **Inertia.js v2** — bridge between Laravel controllers and React; no separate API layer
- **React 19 + TypeScript** — all frontend pages
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **shadcn/ui** — component library via `components.json`; Radix UI primitives + Lucide icons
- **Ziggy** — exposes Laravel named routes to JS via `route()` helper

### Request Lifecycle

Controllers return `Inertia::render('PageName', $props)`. The Blade root template (`resources/views/app.blade.php`) is rendered once; Inertia handles subsequent navigation client-side. Page components live in `resources/js/pages/` and are resolved by name in `app.tsx`.

### Shared Inertia Props

`HandleInertiaRequests` middleware shares these props to every page:
- `auth.user` — authenticated user or null
- `name` — app name
- `quote` — object with `message` and `author`

### Authentication

Full Breeze auth scaffolding is present (`routes/auth.php`, `app/Http/Controllers/Auth/`). Auth pages live in `resources/js/pages/auth/`. No dashboard or settings pages exist — only auth flows are kept.

### Role System

`users.role` is an enum `['founder', 'admin']` defaulting to `'founder'`. Use `$user->isAdmin()` / `$user->isFounder()` for checks. Protect routes with the `role` middleware alias:

```php
Route::get('/admin', ...)->middleware('role:admin');
```

Middleware: `app/Http/Middleware/EnsureUserHasRole.php`.

### Layouts

Two layout trees in `resources/js/layouts/`:
- `auth-layout.tsx` — wraps auth pages; delegates to `auth/auth-card-layout`, `auth-simple-layout`, or `auth-split-layout`
- `app-layout.tsx` — wraps authenticated app pages; delegates to `app/app-sidebar-layout` or `app/app-header-layout`

### Database

Target is **MySQL** (cPanel shared hosting). Config: `strict: false`, `utf8mb4`/`utf8mb4_unicode_ci`. Credentials come from `.env` — see `.env.example` for expected keys (`DB_DATABASE=pinpoint_db`, `DB_USERNAME=pinpoint_user`).

The `waitlist_entries` table is referenced in `WaitlistController` but its migration has not been created yet.

### Jobs

`app/Jobs/SendWaitlistEmail.php` — dispatched after a successful waitlist signup. The `handle()` method is a stub pending email implementation.

### Key Pending Work

- Migration for `waitlist_entries` table
- `SendWaitlistEmail` job implementation
- `Waitlist/Index` React page (`resources/js/pages/Waitlist/Index.tsx`)
- `ADMIN_PASSWORD` must be set in `.env` before running `AdminSeeder`
