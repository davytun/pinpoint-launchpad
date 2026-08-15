# Pinpoint Investor Portal — Production Readiness Plan

**Purpose:** This is the final-review document for the Investor Portal expansion. It explains what must be agreed, built, tested, and operated before the platform goes live. It does not begin development.

**Recommendation:** approve the direction only after the items marked **Required before launch** have been accepted by management, compliance, and the technical team.

---

## 1. The simple model

Pinpoint will have three connected areas:

1. **Founder area** — founders upload and keep their company information current.
2. **Investor area** — approved investors discover companies, register interest, and see approved information.
3. **Staff area** — the Pinpoint team controls approvals, KYC, published company information, document access, and the audit history of each action.

The important rule is this: **a founder supplies information, but Pinpoint decides what investors can see and who can see it.**

There will be two investor-facing levels of company information:

| Level | What it is | Who can see it |
|---|---|---|
| Spotlight | A professional company profile: company name, sector, batch, approved short summary, selected PARAGON information, badges, and approved pitch deck. | Approved investors; limited preview while KYC is pending. |
| Data Room | Sensitive documents such as financials, cap table, contracts, bank information, and detailed diligence information. | Only a KYC-approved investor who has been expressly granted access by Pinpoint staff. |

No sensitive document will be accessible through a shareable public link.

---

## 2. What the review found

The existing portal already has useful founder, admin, document, audit, and verification features. However, it currently works as a verification site, not yet as a production investor portal.

| Area checked | Current situation | What must change |
|---|---|---|
| Investor access | A person can request access on a public verification page using only contact details. | Replace with a registered investor account, approval, KYC, and staff-controlled access. |
| Document access | An approved request receives a link/token which can unlock reviewed documents. | Remove this method after a managed transition. Documents must be viewed through the signed-in investor account. |
| Founder authority | Founders can approve or reject investor requests. | Remove this authority. Founders may see activity, but cannot grant access. |
| Investor applications | The current investor form collects investment mandate information, not the identity/KYC information needed for an account. | Replace it with investor registration and KYC records. Do not try to adapt the old form in place. |
| Staff roles | Current roles are Superadmin, Analyst, and Support. | Add a dedicated KYC/Compliance role and separate permissions by responsibility. |
| Company display | The public page currently combines audit findings, profile information, and access request form. | Create a controlled Spotlight profile separate from the data room. |
| Audit history | Some records show document review and access status, but there is no complete governance trail for the new investor/KYC process. | Record who did what, when, why, and what changed for every sensitive decision. |

### Immediate security issue to correct during this work

The current founder document-access approval route needs correction as part of retiring that feature. It must not remain active or be carried into the new portal. The new design avoids this risk entirely by making staff-controlled, account-based access the only route to sensitive documents.

---

## 3. The end-to-end journeys

### A. Investor joins Pinpoint

1. Visitor sees the Investor landing page and selects the single call-to-action.
2. They create an investor account and select **Individual** or **Company**.
3. They enter their profile and upload the required KYC documents.
4. They accept the Investor Terms, privacy notice, AML declaration, and risk acknowledgement.
5. The application enters the staff queue.
6. Investor Operations checks completeness and legitimacy of the account.
7. KYC/Compliance approves, rejects, or asks for more information.
8. Once approved, the investor can sign in and use the portal. Their access is reviewed again when KYC expires or circumstances change.

An account is never activated merely because a form was submitted.

### B. Founder prepares a company for investors

1. Founder uploads the source documents and can replace the pitch deck when necessary.
2. Analyst reviews the company through the existing PARAGON process.
3. Analyst or authorised content staff prepares a short Spotlight summary.
4. A staff member approves the profile for Spotlight; this is separate from completing an audit.
5. A staff member chooses the exact pitch deck that can appear in Spotlight.
6. Sensitive documents remain in the data room and are not automatically released merely because they are reviewed.
7. Every later founder update creates a new review requirement before changed information becomes investor-visible.

### C. Investor requests a company data room

1. KYC-approved investor views a Spotlight profile.
2. They select one interest type: ask for more details, request a founder call, or request data-room access.
3. The request goes to the Interest Inbox, not directly to the founder.
4. Pinpoint staff reviews the request, checks eligibility and any conflicts, then grants, declines, or asks for more information.
5. If granted, the investor sees only that company’s approved data-room documents while signed in.
6. Founder receives a read-only notification that interest/access was granted, according to Pinpoint’s communication policy.
7. Access ends automatically on its expiry date, on suspension, or when staff revoke it.

No option grants access automatically, including an investor selecting “investing right away.”

---

## 4. Staff roles and separation of responsibility

The Superadmin should govern the system, not perform every daily activity. This reduces error, fraud risk, and operational bottlenecks.

| Role | Main responsibility | May do | Must not do alone |
|---|---|---|---|
| Superadmin | Governance and emergency control | Manage staff roles, settings, policy configuration, exceptions, reports, suspensions, and final escalation. | Approve their own sensitive actions without a recorded second reviewer where required. |
| Analyst | Founder audit and company quality | Review founder documents, update PARAGON data, draft Spotlight content, recommend publication. | Approve investor KYC or grant data-room access unless separately assigned that permission by policy. |
| Investor Operations | Investor account service | Check application completeness, communicate with investors, manage the interest inbox, prepare access recommendations. | Approve KYC or publish/release sensitive documents. |
| KYC/Compliance Officer | Identity, AML, and compliance decision | Review KYC evidence, request information, approve/reject/suspend KYC, set review dates, report concerns. | Alter founder audit results or approve their own escalated exception without a second reviewer. |
| Content/Community Manager (optional) | Communications and non-sensitive content | Prepare announcements, events, and Spotlight draft copy. | Publish a company or access a data room without the required approval. |

**Required before launch:** Pinpoint must name the people or job titles holding these roles, identify a backup for each, and set an escalation route for absences and conflicts of interest.

---

## 5. Approval rules that prevent confusion

### Investor status

| Status | Meaning | Investor can do |
|---|---|---|
| Submitted | Form received; no staff decision yet. | Nothing in the portal. |
| More information requested | Staff needs missing or clearer information. | Resubmit requested information only. |
| Account accepted, KYC pending | Account is suitable, but KYC is not complete. | Sign in and view basic Spotlight cards only. |
| KYC approved / active | Identity and required checks passed. | View full Spotlight, pitch decks, submit interest, and access data rooms only when separately granted. |
| Rejected | Application or KYC did not meet requirements. | No portal access; receives a suitable outcome message. |
| Suspended | Access is paused because of risk, expiry, or investigation. | No access until staff resolves the case. |

### Company publication status

| Status | Meaning |
|---|---|
| Draft | Internal work only. |
| Ready for review | Founder material and proposed Spotlight content are ready for staff review. |
| Spotlight live | Visible to the permitted investor audience. |
| Paused | Temporarily hidden while information is reviewed or updated. |
| Archived | No longer shown; historical records retained according to policy. |

### Data-room access status

Each grant must record the investor, company, granting staff member, date, expiry date, decision reason, and any document restrictions. Access must be revocable immediately.

---

## 6. Information founders submit and investors see

### Founder submission rules

- Founders upload documents into clear categories and see the current review state of each document.
- A founder may update a pitch deck after an audit, but the replacement is **not visible** until staff review and approve it.
- A founder may propose edits to basic company information and Spotlight wording; staff approval is required before publishing.
- A founder cannot change PARAGON scores, analyst findings, badges, or investor access.
- A founder sees a simple activity record: interest received, call requested, access granted, access withdrawn. Personal investor/KYC information is not exposed unless Pinpoint has a documented reason and consent basis.

### Investor display rules

- Spotlight contains only content approved for investor viewing.
- The full analyst report, cap table, bank information, contracts, and other sensitive diligence material never appear in Spotlight.
- Each document has a separately controlled visibility setting; “reviewed” does not mean “share with investors.”
- Investor downloads and views must be logged. Pinpoint should decide whether documents are view-only, downloadable, watermarked, or all three; the recommended default for sensitive documents is view-only plus personalised watermarking.

---

## 7. KYC and privacy controls

KYC is a sensitive process, not just a file upload screen. The operational policy must be agreed with Pinpoint’s legal/compliance adviser before launch.

**Required controls:**

- Minimum documents required for individuals and companies, including acceptable document types and age/expiry rules.
- Clear rule for beneficial owners and authorised representatives of corporate investors.
- Secure private storage; KYC files must never be placed in public storage, sent in ordinary email, or visible to staff without KYC permission.
- Screen-by-screen consent, privacy notice, investor terms, AML/risk declaration, with the version and acceptance time stored.
- KYC decision reasons, reviewer, second-reviewer requirement for exceptions, and review/expiry date.
- Procedure for requests for more information, rejection, suspension, appeal, and manual escalation.
- Data retention/deletion schedule approved by legal counsel, including what is retained for regulatory or dispute reasons.
- Breach-response owner and process for suspected account compromise or accidental disclosure.

Pinpoint must confirm the governing jurisdiction(s), its legal basis for collecting KYC data, and whether an external KYC provider is required before this feature is built.

---

## 8. Essential records and audit trail

The portal needs an append-only activity record for sensitive actions. Each record should show:

- who performed the action;
- which investor, founder, company, document, or staff account was affected;
- what changed (before and after where applicable);
- date and time;
- decision reason or note;
- whether an email/in-app notification was sent; and
- where appropriate, the second approver.

This applies to KYC decisions, account status, company publication, document visibility, data-room grants/revocations, staff role changes, exports, downloads, suspensions, and settings changes.

Staff must not be able to silently alter or delete these records.

---

## 9. Notifications

Use in-app notifications and email. Email must never contain sensitive documents, KYC evidence, access tokens, or confidential data-room content.

| Event | Recipient | Minimum message |
|---|---|---|
| Application submitted | Investor and Investor Operations | Confirmation / new item in queue. |
| More information requested | Investor | What is required and secure portal link. |
| KYC approved, rejected, suspended, or expiring | Investor; KYC team where relevant | Status and next step, without sensitive detail. |
| Company ready for Spotlight | Relevant staff | Approval task. |
| New investor interest | Investor Operations; optional founder notice | Interest type and next step. |
| Data room granted/revoked/expiring | Investor; relevant staff; optional founder notice | Access outcome and expiry. |
| New company/event/fundraise/community notice | Eligible active investors only | Admin-approved announcement. |

All notifications require delivery status and retry/failure monitoring.

---

## 10. Migration from the current system

The old public verification and token system must be retired carefully so existing founders and legitimate investors are not stranded.

1. Inventory every live verification page, existing access request, issued token, and document currently exposed through the old flow.
2. Freeze new public access requests on the agreed cutover date.
3. Invite legitimate existing investors to register and complete the new process.
4. Recreate only valid, approved data-room access inside the new portal, with an expiry date.
5. Disable old public document downloads and invalidate tokens after the transition window.
6. Keep public verification pages only if management wants them for marketing/verification; they must show no data-room request form or sensitive content.
7. Communicate the change to founders, staff, and existing investors before the cutover.
8. Maintain a rollback plan and a named support owner for the first two weeks after launch.

---

## 11. Production launch gates

The portal must not go live until every item below has an accountable owner and a recorded result.

### Business and policy

- [ ] Management approves the role model, decision rights, and escalation process.
- [ ] Legal/compliance approves KYC requirements, terms, privacy notice, retention policy, and jurisdictional obligations.
- [ ] Pinpoint approves the exact definition of what is public, Spotlight-only, and data-room-only.
- [ ] A policy is approved for conflicts of interest, complaints, suspensions, and investor/founder communications.

### Security and reliability

- [ ] No public token or shareable URL can unlock confidential documents.
- [ ] Every account and data-room permission is tested against unauthorised access.
- [ ] File-upload validation, malware scanning, secure storage, download/view protection, and access logging are in place.
- [ ] Password security, email verification, session expiry, rate limiting, and staff two-factor authentication are in place.
- [ ] Database backups, restore test, error monitoring, audit-log retention, and incident process are in place.
- [ ] Sensitive configuration/secrets are not stored in source code or exposed to the browser.

### Quality assurance

- [ ] Tests cover every investor state, KYC decision, role permission, company publication state, document visibility rule, data-room expiry/revocation, and notification outcome.
- [ ] A staff member cannot approve their own restricted exception.
- [ ] Founder cannot grant data-room access or publish unapproved changes.
- [ ] An investor cannot see another investor’s information or another company’s data room.
- [ ] Mobile, accessibility, error messages, empty states, and low-bandwidth use are checked.
- [ ] A full test run is performed using realistic but non-real KYC data before launch.

### Operational readiness

- [ ] Named staff, backups, training, service-level targets, daily queue checks, and escalation contacts are confirmed.
- [ ] Standard email templates and response scripts are approved.
- [ ] A first-week launch monitoring plan is agreed, including who can pause the portal if a risk is found.

---

## 12. Recommended delivery order

1. **Approve policy and responsibilities.** Do not build KYC or access controls before this is signed off.
2. **Design the secure data structure and staff permissions.** This is the foundation for every screen.
3. **Build investor registration, KYC queue, and staff decisions.** Test status changes and notifications.
4. **Build founder submission and staff publication controls.** Separate Spotlight approval from document review.
5. **Build Spotlight, Interest Inbox, and data-room access grants.** Test every permission and expiry path.
6. **Migrate existing valid records and retire the old public/token process.**
7. **Run security, role, workflow, and recovery testing.**
8. **Conduct staff training and controlled launch.**

---

## 13. Items for final reviewer confirmation

These are not technical questions; they are business decisions that Pinpoint should formally approve:

1. The role model in section 4, including the KYC/Compliance Officer.
2. The exact KYC requirements for individuals and companies, with legal/compliance review.
3. The exact information visible in Spotlight and the documents allowed in the data room.
4. Whether sensitive documents are view-only, downloadable, watermarked, or a combination.
5. Who may grant data-room access, how long it lasts, and whether a second staff approval is required.
6. How long KYC approvals and data-room grants remain valid.
7. Whether the public verification page remains for marketing/verification only, or is removed entirely.
8. The communication rule for what founders are told about investor interest and access decisions.

Once these eight points are confirmed, the implementation can be specified without guessing or changing direction mid-build.
