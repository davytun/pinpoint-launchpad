### Investor Onboarding Form

File: resources/js/pages/Investor/Onboarding.tsx
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` with restrained `SideRays` ambient layer |
| Border | `border border-white/80` for primary panels; `border-[#3A54A5]/12` for the status panel |
| Border radius | `rounded-2xl` panels, `rounded-xl` controls and primary action |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `p-6 sm:p-9` primary panel; `gap-5` field grid; `gap-7` form sections |
| Hover state | `hover:bg-[#2D4182]` primary action; `hover:border-zinc-300` type option |
| Shadow | `shadow-[0_20px_55px_rgba(33,56,120,0.10)]` primary panel |
| Accent usage | `#3A54A5` is reserved for active selection, primary action, status progression, and focus |

**Pattern notes:**
Use one focused form panel plus a distinct status or trust panel. Avoid nested cards. Inputs must explicitly use `bg-white text-zinc-950 border-zinc-200` because the global shadcn tokens are dark. The investor portal keeps the existing Pinpoint side-ray atmosphere subtle, with rounded edges used consistently to make the flow feel current and approachable.

### Investor Landing

File: resources/js/pages/Investor/Landing.tsx
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` with restrained `SideRays` ambient layer |
| Border | `border border-white/80` |
| Border radius | `rounded-2xl` trust panel, `rounded-xl` primary CTA |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `px-6 py-18` feature section; `p-7` trust panel |
| Hover state | `hover:bg-[#2D4182]` primary CTA |
| Shadow | `shadow-[0_20px_55px_rgba(33,56,120,0.10)]` |
| Accent usage | `#3A54A5` for primary action and trust marker only |

**Pattern notes:**
The investor landing keeps a single primary action and one supporting trust panel. Legal context remains visible but subordinate to the CTA.

### Investor Login

File: resources/js/pages/Investor/Auth/Login.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` |
| Border | `border border-white/80` panel; `border-zinc-200` inputs |
| Border radius | `rounded-2xl` panel; `rounded-xl` controls |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `p-8` panel; `gap-5` form fields |
| Hover state | `hover:bg-[#2D4182]` primary action |
| Shadow | `shadow-[0_20px_55px_rgba(33,56,120,0.10)]` |
| Accent usage | `#3A54A5` for lock marker, primary action, and sign-up link |

**Pattern notes:**
Light portal forms must set text and input color classes explicitly because global tokens are dark. Keep authentication to one focused rounded panel.

### Investor Review Workspace

Files: resources/js/pages/Admin/InvestorAccounts/Index.tsx, resources/js/pages/Admin/InvestorAccounts/Show.tsx
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | `bg-white` table surface |
| Border | `border border-zinc-200` |
| Border radius | `rounded-2xl` table shell; `rounded-xl` controls |
| Text — primary | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-600` / `text-zinc-500` |
| Spacing | `px-6 py-4` table cells; `p-6` review panels; `gap-7` between workspace sections |
| Hover state | `hover:bg-zinc-50` row and inactive filter; `hover:text-[#2D4182]` review link |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` |
| Accent usage | `#3A54A5` only for the active KYC filter, review link, and profile/verification markers |

**Pattern notes:**
Use the list as an orientation layer and the detail page as the focused review workspace. KYC is the review state, never account activation. Use semantic status chips for KYC outcome and keep the row action to one quiet “Open review” link. Within the detail page, reveal the encrypted document inline behind a deliberate “View secure document” action, retain a quiet download link, and place pending-only approval or rejection controls directly beneath the document context.

### Admin Settings Group

File: resources/js/pages/Admin/Settings/Index.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-zinc-50/50` |
| Border | `border border-zinc-200` |
| Border radius | `rounded-xl` |
| Text — primary | `text-zinc-900` |
| Text — secondary | `text-zinc-555` |
| Spacing | `p-5`; `gap-4` related controls |
| Hover state | none |
| Shadow | none |
| Accent usage | `#3A54A5` for focus and enabled control only |

**Pattern notes:**
Settings are grouped by operational outcome and use compact explanatory copy. Do not let configuration controls compete with the page save action.

### Investor KYC Upload

File: resources/js/pages/Investor/Kyc.tsx
Last updated: 2026-08-20

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` |
| Border | `border border-white/80` panel, `border-dashed border-zinc-300` upload target |
| Border radius | `rounded-2xl` panel, `rounded-xl` upload target and action |
| Text â€” primary | `text-zinc-950` |
| Text â€” secondary | `text-zinc-600` |
| Spacing | `p-8` panel, `gap-5` form sections |
| Hover state | `hover:bg-[#2D4182]` submission action |
| Shadow | `shadow-[0_20px_55px_rgba(33,56,120,0.10)]` |
| Accent usage | `#3A54A5` for the lock marker, upload icon, and submission action |

**Pattern notes:**
Sensitive uploads use one focused panel, plain reassurance copy, and explicit light field colors. The upload target uses a dashed neutral border rather than another nested card. Keep the upload area conditional on the KYC state: amber pending and green approved states lock it with an inline status panel; rejected state exposes the reviewer note in a rose `Alert` above the replacement upload.

### Compliance KYC Queue

File: resources/js/pages/Admin/InvestorKyc/Index.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-white` table surface, `bg-zinc-50` table header, `bg-zinc-50/70` inline editor |
| Border | `border border-zinc-200`, `border-t border-zinc-100` rows |
| Border radius | `rounded-2xl` table shell, `rounded-xl` note field and decisions |
| Text â€” primary | `text-zinc-950` |
| Text â€” secondary | `text-zinc-600` and `text-zinc-500` metadata |
| Spacing | `px-6 py-4` cells, `gap-2` paired decisions |
| Hover state | `hover:bg-[#2D4182]` approve, `hover:bg-rose-50` reject |
| Shadow | none |
| Accent usage | `#3A54A5` for approval and the secure download link |

**Pattern notes:**
Compliance work remains a conventional table. Document access is a quiet text link, while approve and reject stay clearly labeled and visually distinct.

### Founder Spotlight Preparation

File: resources/js/pages/Founder/Spotlight.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-white` editor surface, `bg-[#eef2ff]` status panel |
| Border | `border border-zinc-200` editor, `border-[#3A54A5]/12` status panel |
| Border radius | `rounded-2xl` panels, `rounded-xl` fields and status blocks |
| Text — primary | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-600` |
| Spacing | `p-6 sm:p-7`, `gap-7` across primary and supporting panels |
| Hover state | `hover:bg-[#2D4182]` primary save action |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` editor surface |
| Accent usage | `#3A54A5` for the Spotlight marker and the single forward action |

**Pattern notes:**
Founder publishing preparation uses one editable surface and one operational-status panel. Keep the publishing rules explicit so founders understand that Spotlight remains Pinpoint-curated.

### Investor Spotlight

Files: resources/js/pages/Investor/Spotlight/Index.tsx, resources/js/pages/Investor/Spotlight/Show.tsx
Last updated: 2026-09-21

| Property | Class |
| --- | --- |
| Background | `bg-stone-50` page; `bg-white` materials / form surfaces |
| Border | `border-zinc-200` section rules and panels |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` / `text-zinc-500` |
| Accent | `#3A54A5` engage CTA and radar |
| Materials | PDF only gets inline preview; non-PDF is a compact download row |
| Status | Existing interest is a slim top strip, not a second “Next step” block |

**Pattern notes:**
Hide placeholder founder copy (`One-liner pending…`). Don’t render portraits as pitch decks. Engagement form appears only when no active request.

### Admin Spotlight Management

File: resources/js/pages/Admin/Spotlight/Index.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-white` table surface, `bg-zinc-50` table header |
| Border | `border border-zinc-200`, `border-t border-zinc-100` rows |
| Border radius | `rounded-2xl` table shell, `rounded-xl` staff actions |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `px-6 py-4` table cells, `px-6 py-5` inline editor, `gap-5` form fields |
| Hover state | `hover:bg-[#2D4182]` publish and save actions |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` |
| Accent usage | `#3A54A5` marks the published state and forward action |

**Pattern notes:**
Staff publishing is a conventional readiness table. Reviewed deck status must be visible at the decision point, and unready startups cannot be published from the UI. Copy corrections expand inline beneath the relevant row, using the same rounded field vocabulary as founder editing, so the action retains context and does not alter publication status.

### Investor Interest Workflow

Files: resources/js/pages/Investor/Spotlight/Show.tsx, resources/js/pages/Investor/Interests.tsx, resources/js/pages/Investor/DataRooms/Show.tsx
Last updated: 2026-09-21

| Property | Class |
| --- | --- |
| Interests list | Flat `divide-y` list on `bg-stone-50` — no shadow cards |
| Status | Plain text (`text-emerald-700` / `text-zinc-600` / `text-rose-700`), short labels |
| Copy | Hide placeholder one-liners; type as `Data room` not uppercase pills |
| Actions | Inline text links only when actionable (open data room, join meeting) |

**Pattern notes:**
Interest uses a type-first choice followed by an optional concise message. Never show a document-access action unless the grant is active.

### Admin Dealflow Access Log

File: resources/js/pages/Admin/Dealflow/DataRooms.tsx
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | `bg-white` operational table surface; `bg-zinc-50` table headers |
| Border | `border border-zinc-200`, `divide-zinc-100` table rows |
| Border radius | `rounded-2xl` table shell |
| Text — primary | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-600` / `text-zinc-500` |
| Spacing | `px-6 py-4` cells; `mt-8` between grant register and audit trail |
| Hover state | `hover:bg-zinc-50/50` audit and grant rows |
| Shadow | `shadow-xs` |
| Accent usage | `#3A54A5` only for the audit-trail label |

**Pattern notes:**
Separate current access management from the immutable activity history. Both remain compact, conventional tables so Investor Relations can scan high-volume operational data without mixing action controls into the audit log.

### Notification Centre

File: resources/js/pages/Notifications/Index.tsx
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` canvas; `bg-white` notification list |
| Border | `border border-white/80` list shell; `border-zinc-100` list rows |
| Border radius | `rounded-2xl` list shell; `rounded-xl` read action |
| Text — primary | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-600` / `text-zinc-500` |
| Spacing | `px-6 py-5` notification rows; `gap-4` header actions |
| Hover state | Native button focus/interaction, without decorative card treatment |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` |
| Accent usage | `#3A54A5` for unread markers and the platform-alert label |

**Pattern notes:**
Unread state is a subtle tinted row plus a compact dot, not a warning treatment. The notification centre preserves each alert until the recipient deliberately reads it or uses the explicit bulk action.
### Admin Verification Profiles Viewer

File: resources/js/pages/Admin/Profiles/Index.tsx
Last updated: 2026-08-28

| Property         | Class |
| ---------------- | ----- |
| Background       | Admin canvas from `AdminLayout`; `bg-white` data surface |
| Border           | `border border-zinc-200/90` |
| Border radius    | `rounded-[22px]` table shell; `rounded-full` status badges |
| Text — primary   | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-500` / `text-zinc-600` |
| Spacing          | `px-7 py-5` lead cell; `px-5 py-5` supporting cells |
| Hover state      | `hover:bg-zinc-50/70` rows; accent links deepen to `#2D4182` |
| Shadow           | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` |
| Accent usage     | `#3A54A5` for public profile link; emerald only for live state |

**Pattern notes:**
Admin list pages use a full-width operational surface with a clear title and contextual count above it. The first column carries the strongest identity signal, metadata sits one step quieter, and actions remain inline text links. Keep table headers compact and uppercase, with generous row height for scanability.

### Searchable Country Picker

File: resources/js/components/country-select.tsx
Last updated: 2026-08-30

| Property | Class |
| --- | --- |
| Background | `bg-white/80`, becoming `bg-white` on focus |
| Border | `border-zinc-200`; `border-[#3A54A5]` on focus; `border-red-400` for errors |
| Border radius | `rounded-xl` control and menu |
| Text — primary | `text-zinc-800` |
| Text — secondary | `text-zinc-400` placeholder, `text-zinc-500` label |
| Spacing | `px-3` control; `px-3 py-2.5` option rows |
| Hover state | `hover:border-zinc-300`; focused option `bg-[#3A54A5]/8` |
| Shadow | `shadow-2xs` control; `shadow-xl` menu |
| Accent usage | `#3A54A5` for focused border, active option, and focus ring |

**Pattern notes:**
Use the reusable searchable picker for country fields. It is backed by a local ISO country dataset, so it requires no network request and keeps submitted values as readable country names. The menu must remain restrained: a short search field, scrollable results, no flags or decorative country graphics, and the same rounded field treatment as other Pinpoint forms.

### Founder PIA Request Handoff Dialog

File: resources/js/pages/Checkout/Index.tsx
Last updated: 2026-08-31

| Property | Class |
| --- | --- |
| Background | `bg-white` dialog surface; `bg-zinc-50` contact panel |
| Border | `border border-zinc-200` dialog; `border-b border-zinc-100` header division |
| Border radius | `rounded-3xl` dialog; `rounded-2xl` icon and contact panel |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `px-7 pt-8 pb-6` header; `px-7 py-6` body, expanding to `px-9` on larger screens |
| Hover state | `hover:bg-[#2D4182]` primary return action; submitted-tier control follows that tier's existing hover treatment; `hover:text-[#2D4182]` contact and quiet close actions |
| Shadow | `shadow-[0_24px_80px_rgba(33,56,120,0.22)]` |
| Accent usage | `#3A54A5` for the forward action, step numbers, and contact; emerald only for the receipt icon |

**Pattern notes:**
When a Founder completes an asynchronous handoff, use one focused dialog to explain the selected tier, the operational sequence, and how to ask for help. Keep the tier-comparison page visually neutral behind it. The dialog must offer both a clear exit to diagnostic results and a direct `mailto:` contact route; it should not turn a comparison card into a success panel. If it can be dismissed, turn the selected tier's `Request received` control into the reopen action.

### Founder Landing Page (`/`)

Files: resources/js/pages/Welcome.tsx, resources/js/components/landing/*
Last updated: 2026-09-16

| Property | Class |
| --- | --- |
| Background | `bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white` with `SideRays` |
| Border | `border border-white/80` glass panels; output block `bg-[#1A2850]` |
| Border radius | `rounded-4xl` / `rounded-3xl`; CTAs `rounded-full` |
| Text — primary | `text-zinc-950` `font-display` headlines with founder-direct voice |
| Text — secondary | `text-zinc-500` body |
| Spacing | Section `py-16 sm:py-20`; `max-w-5xl` (or `max-w-3xl` for prose) |
| Hover state | `hover:bg-[#2D4182]` primary; investor `#6EBE44` |
| Shadow | Light glass shadows only |
| Accent usage | `#3A54A5` founder CTAs; green only for investor bridge |

**Pattern notes:**
Voice: founder-direct, not generic SaaS. Structure: Hero → product → problem → Self-Scan → Assessment → how it works → PARAGON → what you get → investor bridge → verified → pricing → FAQ → final CTA → email-only contact. Do not invent benchmark comparisons. Radar chart is illustrative example only. Contact on homepage is mailto only — no full form.

### Sample verification dossier (`/verify/sample-unicorn`)

Files: resources/js/pages/Verification/Show.tsx
Last updated: 2026-09-20

| Property | Class |
| --- | --- |
| Background | Quiet `#f3f5f9` wash — no SideRays, no glass mega-cards |
| Layout | Single narrow column (`max-w-3xl`); company + score as one header composition |
| Signature | PARAGON 7-cell score strip (letters P–N), not radar widgets |
| Type | `font-display` company/score; `font-mono` meta labels |
| Accent | `#3A54A5` score + links only |
| Anti-patterns | No pill clusters, portal lock chips, dual cards, or full-width CTA banners |

**Pattern notes:**
Reads as an analyst memo, not a SaaS certificate. Materials are a plain locked table. Portal join is a text link.
### Investor Landing Page (`/investor`)

Files: resources/js/pages/Investor/Landing.tsx, resources/js/components/investor-landing/*
Last updated: 2026-09-16

| Property | Class |
| --- | --- |
| Background | Dark hero `#0D1325` with grid + blue bloom; body `#F7F8FC` / white alternating bands |
| Border | Hairline `border-zinc-200` section rules; dark panels `border-white/10` |
| Border radius | Sharper `rounded-md` CTAs; product panels `rounded-2xl` (avoid pill soup) |
| Text — primary | White on dark hero; `font-display` headlines with tight tracking |
| Text — secondary | `text-white/55` on dark; `text-zinc-500` on light |
| Spacing | `max-w-6xl`; asymmetric editorial grids; timeline instead of card grids |
| Hover state | White CTA on dark; quiet text links |
| Shadow | Deep product shadow on hero profile panel only |
| Accent usage | `#3A54A5` / `#93C5FD` sparingly; mono labels for diligence tone |

**Pattern notes:**
Signature is the dark diligence-desk hero with live-feeling Spotlight score panel. Prefer spines, timelines, and Is/Is-not splits over glass card grids. Investor CTA stays settings-driven. No magnetic hover, no return promises.

### Founder desk overview (`/admin/founder`)

File: resources/js/pages/Admin/Dashboard.tsx (`FounderDeskHome`)
Last updated: 2026-09-20

| Property | Class / source |
| --- | --- |
| Canvas | Ref 1 — `bg-[#F4F6FA]` behind content |
| Card shell | Ref 2 — `DeskCard` soft white cards |
| Header | Plain greeting + single CTA “View founders” (no duplicate payment chip) |
| KPI row | Everyday labels: Assigned / In progress / Waiting on founder / New messages |
| Chart | shadcn `AreaChart` — started vs finished over 6 months (`engagement_trend`) |
| Status list | Not started / In progress / Waiting on founder / Paused / Finished |
| Side rail | “Things to handle” + “What’s been happening” |
| Copy | Plain English for staff — avoid “audit / PIA / pipeline” jargon on this page |
| Icons | Iconify Solar `*-linear` only |

**Pattern notes:**
Overview monitors work and money. Payments waiting appear once under Things to handle. Full payment list stays on `/admin/founder/pia-requests` — **operational table**, not stacked cards (same admin list pattern as Profiles/Founders).

### Founder auth (setup / login / password)

Files: `resources/js/pages/Founder/Auth/{Setup,Login,ForgotPassword,ResetPassword}.tsx`
Last updated: 2026-09-21

| Property | Class |
| --- | --- |
| Layout | `DiagnosticLayout` + left-aligned column `max-w-[420px]` (same as post-sign confirming) |
| Card | **None** — no glass panel, no floating `rounded-[2.5rem]` shell |
| Badges / steppers | **None** — no “Final Step”, progress dots, or portal pills |
| Text — primary | `font-display text-[1.75rem] font-bold text-zinc-950` |
| Text — secondary | `text-[15px] text-zinc-600` |
| Labels | Sentence case `text-[13px] font-medium text-zinc-700` (never all-caps tracking) |
| Inputs | `rounded-xl border-zinc-200 bg-white` — focus `border-[#3A54A5]` only |
| CTA | `min-h-12 rounded-xl bg-[#3A54A5] text-[14px] font-semibold` — sentence case, no uppercase tracking |
| Accent | `#3A54A5` / hover `#2D4182` |

**Pattern notes:**
Founder auth is a plain form after the agreement — brand, one headline, one sentence, fields, one button. Match `Onboarding/Verifying.tsx` composition. Do not reintroduce glass cards or badge chrome.

### Founder workspace dashboard

File: `resources/js/pages/Founder/Dashboard.tsx`
Last updated: 2026-09-21

| Property | Class |
| --- | --- |
| Composition | Status desk — one job per band; self-scan below |
| Authorization | No tinted card. Ask first (`Authorize data room access?`), firm + name, then Decline/Authorize under the copy — not stretched across the row |
| Status band | Shown only when nothing awaits authorization (or analyst `needs_info`) |
| Earlier requests | Quiet list after; no mediation sermon |
| Accent | `#3A54A5` primary actions |

**Pattern notes:**
Never stack “needs authorization” copy twice. Buttons live on the request row. Do not reintroduce shortcut cards or empty investor placeholders.

### Founder documents

File: `resources/js/pages/Founder/Documents/Index.tsx`
Last updated: 2026-09-21

| Property | Class |
| --- | --- |
| Title | `Documents` — not “Vault” |
| Upload | Dashed dropzone only (interaction surface) — no outer card |
| List | Flat divided list; text actions Download / Delete |
| Empty | One line: “Nothing here yet.” |
| Accent | `#3A54A5` upload CTA |

**Pattern notes:**
Same status-desk language as the founder dashboard. No uppercase section chrome, no nested white cards.
