# Pinpoint Investor Portal — Current Production Architecture

> **Status:** Active production architecture (admin desks + offline PIA path, September 2026).
>
> Historical migrations and archived records remain in the repository and database. They are not part of the active product flow.

## Purpose

Pinpoint Investment Network is a controlled investor portal. Pinpoint, Admin, and Investor Relations mediate every engagement between a Founder and an Investor. The platform does not provide direct Founder–Investor messaging or private-contact disclosure.

## Active investor journey

1. Registration at `/investor/onboarding`
2. Profile completion and KYC submission
3. Compliance review: `not_submitted`, `pending`, `rejected`, or `approved`
4. Approved Investors browse `/investor/spotlight`
5. Investor submits a Pinpoint-mediated interest
6. Founder authorizes or declines Pinpoint coordination
7. Investor Relations makes the final operational decision
8. Pinpoint schedules an introduction and/or grants a startup-specific Data Room
9. Post-introduction diligence is mediated by Pinpoint (submit only after a completed founder introduction)

The public `/investor` page is the portal landing page. It directs visitors to registration and does not submit an old investor application.

Account access statuses for Investors are `pending_review | active | rejected`. Onboarding still auto-activates accounts; staff can reject or reactivate from the Investor desk.

## Founder, Pinpoint, and Investor boundaries

### Founder authorization

Founder authorization is consent for Pinpoint or Investor Relations to proceed. It is not a direct grant of access, a direct introduction, or permission to disclose contact details. The protected action is `PATCH /founder/interests/{interest}/authorization`.

### Data Rooms

`InvestorDataRoomGrant` is startup-specific and independent from an introduction. A grant is created or revoked only by authorized Admin or Investor Relations actions. Investors need approved KYC, an active grant for the correct startup, permitted document visibility, correct document ownership, and signed access where configured. Reinstate notifies the Investor.

### Diligence

The workflow is:

```text
Investor → Pinpoint → Founder → Pinpoint → Investor
```

Founder input and internal Admin notes remain private until Admin or Investor Relations explicitly releases an Investor-visible response. Server rejects diligence submit unless a completed `founder_call` introduction exists for that startup.

## Spotlight

Spotlight is visible only to approved Investors. It presents approved startup information and permitted materials, including PARAGON/verification signals. It is not a public startup profile.

- Founder editing: `/founder/spotlight`
- Investor browse: `/investor/spotlight`
- Investor detail: `/investor/spotlight/{slug}`
- Admin publication: `/admin/investors/spotlight`

Real startup `/verify/{slug}` URLs are retired and redirect to `/investor`. `/verify/sample-unicorn` is retained solely as an intentional marketing demo.

## Staff desks and roles

Staff share one login. Work is split into desks:

| Desk | URL | Roles |
|---|---|---|
| Platform | `/admin` | Superadmin (team, settings, revenue, blog, PIA requests) |
| Founder | `/admin/founder/*` | Superadmin, Analyst |
| Investor | `/admin/investors/*` | Superadmin, Compliance, Investor Relations |

| Role | Active responsibility |
|---|---|
| Founder (portal) | Startup profile, documents, Spotlight content, Pinpoint authorization, diligence response |
| Investor (portal) | Registration, KYC, Spotlight, interests, granted Data Rooms, post-intro diligence |
| Analyst | Founder desk audits, documents, messages |
| Compliance | Investor KYC review only (not IR) |
| Investor Relations | Spotlight, dealflow, Data Rooms, introductions, diligence release, announcements |
| Superadmin | Full operational oversight across desks |

The `support` role is retired and cannot operate admin desks.

Authorization is enforced by Laravel middleware (`require.role`, `admin.side`), requests, and controller-level checks. Hiding a UI element is not an authorization boundary.

## Founder money path (offline PIA)

Primary checkout is offline, not Paystack:

```text
Diagnostic → /checkout/request (PIA) → Admin confirm payment → BoldSign → Founder setup
```

`paystack_reference` may store offline identifiers (e.g. `offline-pia-{id}`). Legacy Paystack webhook/success endpoints remain only for historical transactions.

## Core models and states

| Model | Active role |
|---|---|
| `Investor` / `InvestorProfile` | Investor account and profile |
| `InvestorKycSubmission` | Encrypted KYC evidence and review history |
| `InvestorInterest` | Pinpoint-mediated interest, authorization, introduction, and engagement state |
| `InvestorDataRoomGrant` | Startup-specific access grant |
| `DiligenceRequest` | Admin-mediated post-introduction diligence |
| `SpotlightEntry` | Approved Spotlight publication |
| `AuditLog` | Sensitive workflow audit trail |

`InvestorInterest` coordination includes founder decision, introduction scheduling/completion, notes visible only to the appropriate actor, and the engagement deal stage. `DiligenceRequest` states include submitted, under review, waiting for Founder, Founder responded, resolved, and declined.

## Sensitive-data rules

- KYC documents and compliance notes are available only to authorized compliance staff.
- Investors never receive Founder private contact data or internal Admin notes.
- Founders never receive Investor KYC documents, compliance notes, or unnecessary private Investor contact data.
- Confidential documents remain Data Room-only and are never released through Spotlight or diligence responses.

## Notifications and email

Workflow notifications and transactional email link only to current portal destinations. They describe Pinpoint coordination rather than direct Founder–Investor communication.

## Retired architecture

The following are preserved only as historical database/migration records and must not be reintroduced into navigation, messages, or runtime behavior:

- `InvestorApplication` and `/investor/apply`
- Admin investor-application routes and screens
- `InvestorAccessRequest` and token-based public access requests
- `admin.profiles.access-requests`
- the former Founder access-request route
- public real-startup verification pages and token document links
- operable `support` staff role
- Paystack as the high-ticket happy path

Archived tables include `investor_applications` and `investor_access_requests`. Do not delete or modify their historical migrations without a separate approved data-retention plan.

## Quality gates

Before release, run:

```bash
php artisan test
php artisan migrate:status
php artisan migrate:fresh --env=testing --force
npm run format:check
npm exec eslint .
npm run build
vendor/bin/pint --test <changed PHP files>
composer audit
```

TypeScript has no separate configured typecheck script. The full suite, route integrity, migration integrity, and frontend production build are release gates.
