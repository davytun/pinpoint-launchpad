# Pinpoint Investor Portal — Implementation Spec

> **Status:** Approved by Senator Ihenyen Ihenyen (14 August 2026)  
> **Approved via:** WhatsApp — plan PDF + data room flow confirmed  
> **Developer:** Davytun  
> **Use this file:** Paste or attach when continuing work in any AI tool (Claude, ChatGPT, etc.)

---

## Quick start for AI assistants

You are building an **Investor Portal** for Pinpoint (PIN — Pinpoint Investment Network). The plan is **approved**. Do not re-plan from scratch — implement according to this spec.

**Stack:** Laravel 12, Inertia.js v2, React 19 + TypeScript, Tailwind CSS v4, shadcn/ui, MySQL.

**Run dev:**
```bash
composer run dev
# or separately: php artisan serve && npm run dev && php artisan queue:listen
```

**Always scaffold with Artisan** — never hand-write Laravel class files:
```bash
php artisan make:model Investor -m
php artisan make:controller Investor/InvestorAuthController
```

---

## What we are building (one paragraph)

A gated investor portal where investors onboard via `/investor`, complete KYC, browse PARAGON-complete startups in **Spotlight**, express interest, and access **data rooms** when founders grant permission (with admin automatically notified). Founders submit Spotlight content and tiered documents but do not deal with investors off-platform. Admin has expanded roles for compliance and investor relations. Slack is dropped; notifications are in-app + email.

---

## Approval record

| Item | Status |
|---|---|
| Full investor portal plan | ✅ Approved |
| Founder grants data room access (not admin) | ✅ Approved 14 Aug 2026 |
| Admin notified on every interest + grant/deny | ✅ Approved |
| Full audit log + Super Admin revoke | ✅ Approved |
| Less admin workload (oversight, not bottleneck) | ✅ Confirmed by stakeholder |

**Data room flow (final, approved):**

1. Investor shows interest on a startup in Spotlight
2. Admin and founder both get notified
3. Founder approves or denies from their dashboard
4. Admin gets notified again automatically (in-app + email)
5. Everything is logged — investor, startup, founder, date, approved/denied
6. Super Admin can revoke access if needed

---

## Current codebase (what exists)

### Three actor types today

| Actor | Storage | Auth | Login |
|---|---|---|---|
| Staff | `users` table | `web` guard | `/admin/login` |
| Founders | `founders` table | `founder` guard | `/founder/login` |
| Investors | **None yet** | **None** | **N/A** |

### Staff roles today (`users.role`)

- `superadmin` — full access
- `analyst` — founder audits, profiles, documents
- `support` — waitlist, investor applications

Middleware: `require.role` in `app/Http/Middleware/RequireRole.php`

### Investor-related code today (to replace/extend)

| What | Path | Notes |
|---|---|---|
| PIN landing + long form | `resources/js/pages/Investor/Index.tsx` | Remove form → CTA only |
| Application controller | `app/Http/Controllers/InvestorController.php` | Repurpose or replace |
| Applications table | `investor_applications` | Archive after migration |
| Admin investor review | `Admin/AdminInvestorApplicationController.php` | Extend for new flow |
| Public verify pages | `VerificationController.php`, `Verification/Show.tsx` | Retire after 30-day transition |
| Token data room access | `InvestorAccessRequest` model | Replace with portal grants |
| Founder approves access | `FounderDashboardController.php` | Keep pattern, move to portal |

### Founder / startup data (reuse)

| Model | Purpose |
|---|---|
| `Founder` | Founder account |
| `FounderProfile` | Startup profile (slug, scores, summary, badges) |
| `FounderDocument` | Documents (categories include `pitch_deck`) |
| `VerificationBadge` | PARAGON badges |

### Key paths

```
routes/web.php                          # All routes
config/auth.php                         # Add investor guard here
app/Models/User.php                     # Add role helpers
resources/js/layouts/admin-layout.tsx   # Mirror for investor-layout
resources/js/layouts/founder-layout.tsx # Pattern for investor portal
resources/js/pages/Admin/               # Admin pages
resources/js/pages/Founder/             # Founder pages
database/migrations/                    # All migrations
app/Models/Setting.php                  # Admin CTA config
```

---

## Investor flow (approved)

### 1. Landing page — `/investor`

- **Keep:** PIN value proposition, legal disclaimers, Investor Terms link
- **Remove:** Long mandate form (stages, sectors, cheque size, geographies, etc.)
- **Add:** Single CTA button → `/investor/onboarding`
- **Admin-configurable** (via `Setting` model): CTA label, destination URL, enabled/disabled

### 2. Onboarding — `/investor/onboarding`

Steps:
1. Choose **Individual** or **Corporate**
2. Fill profile fields
3. Upload KYC document
4. Accept terms + AML confirmations
5. Create password
6. Submit → status: `pending_review`

### 3. KYC fields

**Corporate investors**

| Field | Required |
|---|---|
| Contact person full name | ✓ |
| Email | ✓ |
| Phone | ✓ |
| Registered company/business name | ✓ |
| Company address | ✓ |
| KYC document: Company certificate | ✓ |

**Individual investors**

| Field | Required |
|---|---|
| Full name | ✓ |
| Email | ✓ |
| Phone | ✓ |
| Address | ✓ |
| KYC document: Valid ID card | ✓ |

### 4. Approval workflow

| Step | Who | Action |
|---|---|---|
| Application review | Investor Relations or Support | Check profile, terms, legitimacy |
| Account activation | Investor Relations | Create login, investor enters dashboard |
| KYC review | **Compliance Officer** | Review uploaded document |
| KYC approval | Compliance Officer | Unlocks pitch deck, interest submission |

Account activation and KYC approval are **separate steps**.

### 5. Access tiers

| Capability | Pending approval | Active, KYC pending | KYC approved |
|---|:---:|:---:|:---:|
| Log in | ✗ | ✓ | ✓ |
| Browse Spotlight listing | ✗ | ✓ | ✓ |
| Read startup summary | ✗ | ✓ | ✓ |
| View/download pitch deck | ✗ | ✗ | ✓ |
| Submit interest | ✗ | ✗ | ✓ |
| Access granted data rooms | ✗ | ✗ | ✓ |

### 6. Interest submission (after KYC approved)

Investor picks one option when interested in a startup:

| Code | Label |
|---|---|
| `more_details` | Interested in investing — share more details |
| `founder_call` | Interested in investing — let's have a call with the founders |
| `data_room_access` | Investing right away — secure data room access |

Optional short message. Submission goes to platform first — no direct founder contact.

---

## Spotlight (exhibition room)

### Purpose

Curated directory of startups that **completed PARAGON**. Summary + pitch deck only. Detailed docs stay in data room.

### What investors see (per startup)

- Company name, one-liner, summary (500 chars max)
- Sector, batch, PARAGON score, radar chart, verified badges
- Pitch deck (founder document with `visibility: spotlight`, `is_reviewed: true`)

### What investors do NOT see in Spotlight

- Cap table, financials, bank statements, contracts
- Founder contact details (Pinpoint mediates)

### Publishing workflow

1. Audit completes → admin sets profile live
2. Founder fills Spotlight content at `/founder/spotlight` (one-liner, summary, pitch deck)
3. Analyst reviews pitch deck (`is_reviewed`)
4. Investor Relations marks profile **Featured in Spotlight**
5. KYC-approved investors see it; notification sent to all investors

**Founders cannot self-publish.** Admin has final publish control.

---

## Data room access (approved flow)

> **Founder grants. Admin is always aware. No off-platform deals.**

```
Investor submits interest (portal)
        ↓
Admin + Founder notified
        ↓
Founder approves or denies (founder dashboard)
        ↓
Admin notified again (in-app + email)
        ↓
Logged: investor, startup, founder, date, decision
        ↓
If approved → investor sees data room in portal
Super Admin can revoke anytime
```

### Data room contents

Documents with `visibility: data_room` and `is_reviewed: true`:
- Cap table, financial forecast, bank statements
- Articles of incorporation, IP assignment
- Customer contracts, unit economics, other

### Rules

- No self-serve access
- No anonymous token links (retire after 30-day transition)
- Investors must be onboarded + KYC approved before interest submission
- All access happens inside authenticated investor portal

---

## Founder changes (required)

### Remove / replace

| Current | Change |
|---|---|
| "Investor Page" → public `/verify/{slug}` | **Spotlight Status** card on dashboard |
| Founder approves access on public verify flow | Approve/deny in dashboard (portal-based) |
| All documents same visibility | Split into tiers (see below) |
| "Share your verification link" copy | "Your startup appears in PIN Spotlight when approved" |

### Document visibility tiers

Add `visibility` to `founder_documents`:

| Tier | Documents | Who sees |
|---|---|---|
| `spotlight` | Pitch deck only | All KYC-approved investors |
| `data_room` | Cap table, financials, etc. | Founder-granted investors only |
| `internal` | Unreviewed docs | Admin/analyst only |

Default: `pitch_deck` → `spotlight`, everything else → `data_room`.

### New founder page: `/founder/spotlight`

| Field | Max | Who edits |
|---|---|---|
| Company one-liner | 120 chars | Founder (admin can override) |
| Spotlight summary | 500 chars | Founder (admin can override) |
| Pitch deck | — | Founder uploads, analyst reviews |

### Public verify pages — `/verify/{slug}`

- **T+0 to T+30:** Banner — "Investor access now via Pinpoint Investment Network"
- **T+30:** Redirect to `/investor`
- **Keep:** `/verify/sample` for marketing demo
- **Disable:** Token-based document downloads after T+30

---

## Admin roles (expanded)

### New roles to add to `users.role`

| Role | Code | Responsibility |
|---|---|---|
| Compliance Officer | `compliance` | KYC approve/reject |
| Investor Relations | `investor_relations` | Investor onboarding, Spotlight publish, interest monitoring, announcements |

May be same person initially — separate in system for scale.

### Permission summary

| Action | Super Admin | Analyst | Support | Compliance | IR |
|---|:---:|:---:|:---:|:---:|:---:|
| Review investor applications | ✓ | — | ✓ | — | ✓ |
| Activate investor account | ✓ | — | — | — | ✓ |
| Approve/reject KYC | ✓ | — | — | ✓ | — |
| Founder audits & documents | ✓ | ✓ | — | — | — |
| Publish to Spotlight | ✓ | ✓ | — | — | ✓ |
| View interest + access log | ✓ | — | — | — | ✓ |
| Revoke data room access | ✓ | — | — | — | ✓ |
| Settings, revenue, blog, team | ✓ | — | — | — | — |

**Admin does NOT grant data room access day-to-day** — founder does. Admin monitors via notifications + audit log.

### New admin nav sections

- **Investors:** Applications, KYC Queue, Active Investors
- **Dealflow:** Spotlight Management, Interest Log, Access Log
- **Settings:** Investor landing CTA config

---

## Notifications

In-app + email. No Slack.

### Investor

1. New startup in Spotlight
2. Startup announces fundraise (admin-created)
3. Startup receives investment (admin-created)
4. Upcoming community event (admin-created)
5. New investor joins PIN (**anonymous** — no name)
6. KYC approved/rejected
7. Data room access granted/denied

### Founder

- Spotlight content published
- Investor expressed interest (info only — they approve access separately)
- Document review complete

### Admin

- New investor onboarding submission
- KYC document uploaded
- Investor interest submitted
- **Founder granted or denied data room access** (automatic)

Fundraise/investment/event alerts are **admin-created** in v1 — not automated.

---

## Data model (to build)

### New tables

```
investors                  # Auth account (mirror founders pattern)
investor_profiles          # Individual/corporate fields
investor_kyc_submissions     # Document, status, reviewer_id, notes
investor_interests           # investor_id, profile_id, type, message, status
investor_data_room_grants    # investor_id, profile_id, granted_by_founder, granted_at, revoked_at
notifications                # Polymorphic: notifiable (investor/founder/user)
platform_announcements       # Admin-created fundraise/event/investment posts
spotlight_entries            # profile_id, published_at, published_by, is_featured
audit_logs                   # Action trail for KYC, grants, revokes, downloads
```

### Modify existing

```
users.role                   # Add: compliance, investor_relations
founder_documents.visibility # Enum: spotlight, data_room, internal
founder_profiles             # Add: spotlight_one_liner, spotlight_summary, is_featured_in_spotlight
settings                     # Add: investor_cta_label, investor_cta_url, investor_cta_enabled
```

### Archive (do not delete)

```
investor_applications        # Old PIN form submissions
investor_access_requests     # Old token-based requests
```

### Auth

Add `investor` guard in `config/auth.php` — mirror `founder` guard pattern:
- Login: `/investor/login`
- Password reset: `/investor/forgot-password`
- Middleware: `auth.investor`

---

## Investor dashboard pages

```
/investor/login
/investor/onboarding
/investor/dashboard          # Home — status, recent notifications
/investor/spotlight          # Browse startups
/investor/spotlight/{slug}   # Startup detail + pitch deck
/investor/interests          # My interest submissions
/investor/data-rooms         # Granted data rooms
/investor/data-rooms/{slug}  # Document list + download
/investor/profile            # Edit profile, re-upload KYC
/investor/notifications
```

Layout: `resources/js/layouts/investor-layout.tsx` (mirror founder-layout)

---

## Security requirements

- Separate investor auth guard
- Server-side permission checks on every admin route (not just hidden nav)
- KYC documents: encrypted storage, Compliance + Super Admin only
- Document downloads: signed URLs with expiry + grant check on every request
- Audit log: KYC decisions, grants, denies, revokes, document downloads
- File limits: KYC 10MB (PDF/JPG/PNG), pitch deck 25MB (PDF/PPT/PPTX)
- Feature tests per role and workflow before launch

---

## Migration & transition

| When | Action |
|---|---|
| Launch (T+0) | Portal live alongside existing system |
| T+0–T+30 | Verify pages show "Join PIN" banner; old token links still work |
| T+30 | Verify pages redirect to `/investor`; tokens disabled |
| T+30 | Remove public access request form from verify pages |
| Permanent | Old `investor_applications` archived, not deleted |

---

## Build phases (approved order)

| Phase | Scope | Weeks |
|---|---|---|
| **1. Foundation** | Investor auth, onboarding, landing page CTA, admin application review, new roles | 2 |
| **2. KYC** | KYC upload, compliance queue, access tiers | 1 |
| **3. Founder updates** | Document visibility tiers, `/founder/spotlight`, dashboard changes | 1.5 |
| **4. Spotlight** | Admin Spotlight mgmt, investor browse, pitch deck viewer | 1.5 |
| **5. Interest & data rooms** | Interest form, founder approve/deny, admin notifications, access log, investor data room view | 1.5 |
| **6. Notifications** | In-app + email for all actors | 1 |
| **7. Transition & QA** | Retire verify flow, security audit, full tests | 1 |

**Total: ~9–10 weeks from start.**

Each phase ends with a review checkpoint before the next begins.

---

## Approved decisions (do not re-debate)

1. Two new admin roles: Compliance + Investor Relations
2. **Founders grant data room access; admin auto-notified + full log**
3. Retire public `/verify` pages after 30-day transition
4. Pre-KYC: summaries yes, pitch decks no
5. Pitch deck in Spotlight only; all other docs in data room
6. Founders submit Spotlight content; admin publishes
7. New investor notification is anonymous
8. Fundraise/investment/event alerts are admin-created (not automated in v1)
9. 30-day transition for existing token links
10. KYC approval separate from account activation
11. Slack dropped
12. Long investor mandate form removed from landing page

---

## Out of scope (v1)

- Investor ↔ founder direct messaging
- Automated fundraise detection
- On-platform payments / investment execution
- Mobile app
- Investor mandate profiling (stages, sectors, cheque size)
- Founder-side investor CRM
- Slack integration

---

## Success criteria (definition of done)

- [ ] Investor: `/investor` → onboarding → approval → login (no manual dev steps)
- [ ] Compliance Officer: approve/reject KYC with audit trail
- [ ] Founders: submit Spotlight content, upload tiered documents
- [ ] Admin: feature startups; KYC-approved investors browse + view pitch decks
- [ ] Investors: submit interest; founders grant/deny; admin notified automatically
- [ ] All notification types work (in-app + email)
- [ ] Permission matrix enforced per role
- [ ] Public token access retired; no bypass paths
- [ ] Test suite passes; security review complete

---

## Stakeholder context

- **Client / approver:** Senator Ihenyen Ihenyen
- **Key principle:** Pinpoint stays in the loop — no deals behind the platform
- **Admin workload:** Minimize — oversight and logging, not manual approval on every data room request
- **KYC:** Keep minimal (one document per type)
- **PARAGON:** Quality bar for Spotlight — only completed journeys featured

---

## Related files in this repo

| File | Purpose |
|---|---|
| `docs/Pinpoint-Investor-Portal-Master-Plan.pdf` | 4-page PDF sent to stakeholder (pre data-room amendment) |
| `docs/pinpoint-investor-portal-plan.html` | PDF source HTML |
| `CLAUDE.md` | General repo dev guide (may be partially outdated on roles) |

**This file (`docs/INVESTOR-PORTAL-SPEC.md`) is the source of truth for implementation.** It includes the approved data room amendment not yet in the PDF.

---

*Last updated: 14 August 2026 — approved for development.*
