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

### Investor Access Dashboard

File: resources/js/pages/Investor/Dashboard.tsx
Last updated: 2026-08-15

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` |
| Border | `border border-white/80` main panel, `border-[#3A54A5]/12` access panel |
| Border radius | `rounded-2xl` panels, `rounded-xl` action and icon holders |
| Text â€” primary | `text-zinc-950` / `text-zinc-900` |
| Text â€” secondary | `text-zinc-600` |
| Spacing | `p-7 sm:p-9` primary panel, `gap-7` between panels |
| Hover state | `hover:bg-[#2D4182]` primary action |
| Shadow | `shadow-[0_20px_55px_rgba(33,56,120,0.10)]` primary panel |
| Accent usage | `#3A54A5` for status icon, access labels, and forward action |

**Pattern notes:**
The investor home states the exact verification outcome in one central panel and puts the longer-term access model in a quieter supporting panel. Use a semantic `Badge` for the KYC state and an `Alert` only when a compliance note requires attention. Do not expose unavailable dealflow as a fake navigation target.

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
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` with `bg-white` content surfaces |
| Border | `border border-white/80` primary surfaces, `border-[#3A54A5]/12` protected-document panel |
| Border radius | `rounded-2xl` cards and sections, `rounded-xl` actions |
| Text — primary | `text-zinc-950` |
| Text — secondary | `text-zinc-600` |
| Spacing | `p-6` listing cards, `p-7 sm:p-10` detail surface |
| Hover state | `hover:-translate-y-0.5` listing cards, `hover:bg-[#2D4182]` primary action |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` listing cards |
| Accent usage | `#3A54A5` for PARAGON status, verified markers, and document download |

**Pattern notes:**
Spotlight feels editorial rather than like a generic deal grid. Each startup leads with a factual one-liner; detailed content and the pitch deck are visually separated as progressively protected access. The detail page pairs verified signals with a restrained PARAGON radar and always includes a text equivalent for assistive technology. An approved PDF preview stays inside the protected-document panel; non-PDF decks retain a secure download action, and pre-KYC investors see a direct lock explanation instead of a disabled-looking control.

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
Last updated: 2026-08-22

| Property | Class |
| --- | --- |
| Background | `bg-[#f4f7ff]` page canvas; `bg-white` workflow surfaces |
| Border | `border border-white/80` primary sections; `border-[#3A54A5]/12` for protected-access context |
| Border radius | `rounded-2xl` workflow sections; `rounded-xl` controls and inline status panels |
| Text — primary | `text-zinc-950` / `text-zinc-900` |
| Text — secondary | `text-zinc-600` / `text-zinc-500` |
| Spacing | `p-6 sm:p-8` sections; `gap-5` within forms and requests |
| Hover state | `hover:bg-[#2D4182]` submit action; `hover:underline` for contextual links |
| Shadow | `shadow-[0_16px_36px_rgba(33,56,120,0.06)]` workflow surfaces |
| Accent usage | `#3A54A5` marks mediated action, secure access, and the single next step |

**Pattern notes:**
Interest uses a type-first choice followed by an optional concise message. Clearly separate a general interest approval from a data-room grant, and never show a document-access action unless the approved request type is `data_room_access`.

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
