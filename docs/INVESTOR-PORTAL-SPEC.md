# Pinpoint Investor Portal — Current Production Architecture

> **Status:** Active production architecture, updated for Phase 9B (28 August 2026).
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
9. Post-introduction diligence is mediated by Pinpoint

The public `/investor` page is the portal landing page. It directs visitors to registration and does not submit an old investor application.

## Founder, Pinpoint, and Investor boundaries

### Founder authorization

Founder authorization is consent for Pinpoint or Investor Relations to proceed. It is not a direct grant of access, a direct introduction, or permission to disclose contact details. The protected action is `PATCH /founder/interests/{interest}/authorization`.

### Data Rooms

`InvestorDataRoomGrant` is startup-specific and independent from an introduction. A grant is created or revoked only by authorized Admin or Investor Relations actions. Investors need approved KYC, an active grant for the correct startup, permitted document visibility, correct document ownership, and signed access where configured.

### Diligence

The workflow is:

```text
Investor → Pinpoint → Founder → Pinpoint → Investor
```

Founder input and internal Admin notes remain private until Admin or Investor Relations explicitly releases an Investor-visible response.

## Spotlight

Spotlight is visible only to approved Investors. It presents approved startup information and permitted materials, including PARAGON/verification signals. It is not a public startup profile.

- Founder editing: `/founder/spotlight`
- Investor browse: `/investor/spotlight`
- Investor detail: `/investor/spotlight/{slug}`
- Admin publication: `/admin/spotlight`

Real startup `/verify/{slug}` URLs are retired and redirect to `/investor`. `/verify/sample-unicorn` is retained solely as an intentional marketing demo.

## Roles and server-side authorization

| Role | Active responsibility |
|---|---|
| Founder | Startup profile, documents, Spotlight content, Pinpoint authorization, diligence response |
| Investor | Registration, KYC, Spotlight, interests, granted Data Rooms, diligence requests |
| Analyst | Founder audit and documents |
| Compliance | Investor KYC review |
| Investor Relations | Spotlight publication, dealflow orchestration, Data Room grants, introductions, diligence release |
| Support | Support and waitlist operations |
| Superadmin | Full operational oversight |

Authorization is enforced by Laravel middleware, requests, policies, and controller-level checks. Hiding a UI element is not an authorization boundary.

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
