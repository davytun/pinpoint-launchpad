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

Staff use the web guard (`routes/auth.php`, `resources/js/pages/auth/`). Founders and investors have separate guards and login surfaces:

- Founder: `/founder/login` (`auth.founder`)
- Investor: `/investor/login` (`auth.investor`)

### Role System (staff)

`users.role` is one of `superadmin | analyst | compliance | investor_relations`. The retired `support` value is no longer operable.

Desk access helpers on `User`: `canAccessPlatformAdmin()`, `canAccessFounderAdmin()`, `canAccessInvestorAdmin()`, `defaultAdminHomeRoute()`. Protect admin routes with:

```php
Route::middleware(['require.role:superadmin', 'admin.side:central'])->group(...);   // Platform
Route::middleware(['admin.side:founder', 'require.role:superadmin,analyst'])->...; // Founder desk
Route::middleware(['admin.side:investors', ...])->...;                               // Investor desk
```

Middleware: `RequireRole` (`require.role`), `EnsureAdminSide` (`admin.side:central|founder|investors`).

### Admin desks

| Desk | URL prefix | Roles |
|---|---|---|
| Platform | `/admin` | superadmin |
| Founder | `/admin/founder/*` | superadmin, analyst |
| Investor | `/admin/investors/*` | superadmin, compliance, investor_relations |

### Money path

Primary: diagnostic → PIA request (`/checkout/request`) → offline admin confirm → BoldSign → founder setup. Paystack initiate is removed; webhook/success remain only for historical references (`paystack_reference` may store offline IDs like `offline-pia-{id}`).

### Layouts

Admin uses `resources/js/layouts/admin-layout.tsx` (three desk shells). Founder uses `founder-layout.tsx`. Investor pages use `InvestorHeader`. Auth pages use `auth-layout.tsx`.

### Database

Target is **MySQL** (cPanel shared hosting). Config: `strict: false`, `utf8mb4`/`utf8mb4_unicode_ci`. Credentials come from `.env` — see `.env.example` for expected keys (`DB_DATABASE=pinpoint_db`, `DB_USERNAME=pinpoint_user`).

### Key Pending Work

- `ADMIN_PASSWORD` must be set in `.env` before running `AdminSeeder`
- `TESTER_GUIDE_TOKEN` must be set in `.env` for `/tester-guide` (no default token)
