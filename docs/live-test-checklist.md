# Live End-to-End Test Checklist

Walk this once, in order, with three browser profiles (or one normal + two incognito): **Investor**, **Founder**, **IR/Admin**. Every step lists the login, the action, and the exact state you should see. If anything differs, stop and note it — that's a bug to fix, not a doc to edit.

Reference model: [`user-flow.html`](./user-flow.html) and [`INVESTOR-PORTAL-SPEC.md`](./INVESTOR-PORTAL-SPEC.md).

## Setup

- [ ] Server running: `php artisan serve` + `npm run dev` (or a fresh `npm run build`).
- [ ] One published spotlight venture to test against (founder has completed audit and IR published it).
- [ ] Investor account with **approved KYC**. Founder account owning the venture. IR or superadmin staff account.

## Phase 1 — Investor engages (all three tracks, one venture)

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 1.1 | Investor | Spotlight → open the venture | Engage form shows all three options: Request data room, Arrange founder call, Ask a question |
| 1.2 | Investor | Submit **Ask a question** | Redirect to My Interests; row shows **Pinpoint Reviewing** |
| 1.3 | Investor | Back to venture → submit **Arrange founder call** | New row appears; the question row is untouched. Venture page lists both under **Your engagements** |
| 1.4 | Investor | Submit **Request data room** | Third independent row. Form now shows the "already engaged with every option" note |
| 1.5 | Investor | Re-submit the **same** type with a new message | No duplicate row; the existing row's message updates |

## Phase 2 — Founder consents (three separate decisions)

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 2.1 | Founder | Dashboard → "Needs your decision" | Three separate cards, one per engagement type, each with its own Approve/Authorize button |
| 2.2 | Founder | Approve/Authorize **all three** | Rows move to Requests with **Approved — Pinpoint coordinating**. No row says "Data room open" or "scheduled" yet (consent ≠ access) |
| 2.3 | Founder | Check the Requests list labels | Each row keeps its own engagement label: Question / Founder call / Data room |

## Phase 3 — IR makes the operational decisions

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 3.1 | IR | Dealflow → Interests: queue filters | `Founder authorized` shows the three rows; `Awaiting schedule` shows only the call; `Awaiting grant` shows only the data room |
| 3.2 | IR | Open the **data room** row → Approve | Investor side: data room row flips to **Open** with an "Open data room" button. Call/question rows unchanged |
| 3.3 | IR | Open the **call** row → Approve → Schedule (date + meeting link) | Investor side: call row shows **Scheduled** + "Join meeting" |
| 3.4 | IR | Open the **question** row → Approve | Investor side: question row shows **Approved** |

## Phase 4 — Data room access, revoke, reinstate

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 4.1 | Investor | My Interests → **Open data room** | Data room page lists only reviewed, data-room-visible documents; downloads work |
| 4.2 | IR | Dealflow → Data rooms → **Revoke** | Investor sees **Access revoked**; downloads blocked. Call and question rows **unchanged** (revoke ≠ cancel) |
| 4.3 | IR | **Reinstate** | Investor sees **Open** again + receives a reinstate notification |

## Phase 5 — Complete the call, unlock diligence

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 5.1 | IR | Call row → **Mark Call Completed** | Investor: call row shows **Completed**, links to Diligence. Founder: row reads "Call completed" |
| 5.2 | Investor | Open **Diligence** | The gate is gone: the venture appears as eligible and the inquiry form is available |

## Phase 6 — Diligence branches

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 6.1 | Investor | Submit inquiry **A** (needs founder input) | Row appears: submitted state, "Pinpoint is coordinating" |
| 6.2 | IR | Dealflow → Diligence → **Request founder response** | Founder gets a notification; item appears on the founder Diligence desk |
| 6.3 | Founder | Answer inquiry A on the founder desk | Admin sees `founder_responded`; investor still sees only "coordinating" (nothing leaks early) |
| 6.4 | IR | **Release response** (sanitized text) | Investor sees the released answer + notification. Founder's raw notes and internal notes are not visible to the investor |
| 6.5 | Investor | Submit inquiry **B**, IR **releases a direct answer** without founder input | Resolved with IR's own text |
| 6.6 | Investor | Submit inquiry **C**, IR **declines with reason** | Investor sees the decline reason; status declined |

## Phase 7 — Isolation and guardrails

| # | Login | Action | Expected |
|---|-------|--------|----------|
| 7.1 | Investor (2nd) | Try diligence on a venture with **no completed call** | Blocked (server rejects, not just hidden) |
| 7.2 | Investor | Open a data room URL for a venture without an active grant | 403 / not found |
| 7.3 | Founder B | Try to act on Founder A's interest (direct PATCH) | 403 |
| 7.4 | Analyst staff | Visit `/admin/investors/*` | Blocked by desk middleware (role restrictions) |
| 7.5 | Investor | Check investor-facing text everywhere | No founder internal notes, no KYC data, no direct founder contact info anywhere |

## Notification sweep

After each phase, verify the notification centers received (and only received) the expected items: investor (decision updates, data room revoke/reinstate, diligence answer), founder (new interest, diligence request), IR staff (dealflow + diligence events).
