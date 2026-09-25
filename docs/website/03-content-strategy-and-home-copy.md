# Content Strategy and Home Page Copy

Status: Draft v0.1 | Date: 2026-09-21
Every claim below carries its ledger reference. `{VERIFY}` marks a fact to confirm before publishing.

## 1. Positioning

CivicLens is an independent civic issue platform. It gives residents, field officers and city administrators one
shared record of every issue, from first report to documented fix, with AI-assisted triage that people can override.

**For** the people who report, fix and oversee public-space problems, **CivicLens is** a complaint-to-closure
workflow **that** keeps status visible, sorts reports faster and attaches photo evidence to every closure.
**Unlike** a generic ticket system, it is built for location, field work and offline conditions.

### What is genuinely different (all True in the ledger)

1. One shared record with an immutable status history (T3).
2. Text-based AI triage with human override and duplicate clustering (T1, T2).
3. Officer closure requires photo evidence, notes, materials and duration `{VERIFY: required fields}` (T10).
4. Offline-first officer and citizen mobile app (T7).
5. Accountability tooling: SLA timers, escalation, appeals, hold approvals, audit log (T4, T6).

### What we do not say

Fake numbers, "official", "real-time", "computer vision", "cryptographic", "military-grade", "zero-trust", "AES-256",
"GDPR/DPDP compliant", "trusted by", "revolutionary", "seamless", "cutting-edge", "AI-powered" without saying what the AI does.

## 2. Voice

Plain, precise, calm, accountable. Short sentences. Active voice. Reading level around grade 8. Say what it does, then what it
does not. Numbers only with a source or a "sample data" label. No exclamation marks. No jargon without a one-line definition.

| Instead of | Write |
|---|---|
| "AI-powered platform" | "AI reads each report, suggests a category and severity, and flags duplicates. Staff can override it." |
| "Real-time updates" | "You get a notification when the status changes." |
| "Tamper-proof verification" | "Each closure includes before and after photos, notes, and the officer's name." |
| "Trusted by cities" | (nothing; do not imply customers) |

## 3. Message hierarchy

- **Level 1 (promise):** Every civic complaint, tracked to closure.
- **Level 2 (pillars):** One shared record; Triage that saves time; Fixes that leave evidence; Built for the field; Accountable by design.
- **Level 3 (proof):** Real screens, the live demo, public docs and API, architecture page, published budgets.

## 4. Home page copy (draft)

### 4.0 Header
Nav per sitemap. Button: **Open the live demo**.

### 4.1 Hero
- **H1:** Every civic complaint, tracked to closure.
- **Support:** CivicLens gives residents, field officers and city administrators one shared record of every issue, from first report to documented fix.
- **Primary CTA:** Open the live demo. **Secondary:** See how it works.
- **Note (small):** Demo with sample data. CivicLens is an independent project, not a government service.
- **Visual:** short loop of the real app: a report submitted, triaged, assigned, closed with photos.
- Alternates for H1: "From complaint to closure, on the record." / "Report it. Track it. See it fixed."

### 4.2 The problem
**Heading:** Complaints get lost between the report and the fix.
Three short points (qualitative, no statistics):
1. **Residents can't see progress.** A report goes in and nothing comes back.
2. **Staff sort by hand.** Every report must be read, categorized and routed before anyone can act.
3. **Closures are hard to check.** "Resolved" is a status, not evidence.

### 4.3 Lifecycle (scroll story)
**Heading:** One record, from first report to fix.
Six steps, each with a real screen and one sentence:
1. **Report** Photos, location and a short description, from web or the Android app, even offline. (T7)
2. **Triage** AI suggests a category, severity and department, and flags likely duplicates. (T1, T2)
3. **Assign** Staff confirm or override, then assign the task with a deadline. (T4)
4. **Fix** The officer acknowledges, starts work and adds updates from the field. (T4)
5. **Evidence** Before and after photos, notes, materials and duration are attached. (T10)
6. **Feedback** The resident rates the fix, or appeals if it was not resolved. (T4)

### 4.4 Three roles
**Heading:** Built for the three people involved.
- **Residents:** Report in under a minute, track every status change, get notified, rate the result.
- **Field officers:** Get a task list and map, work offline, submit proof of work, request a hold when blocked.
- **Administrators:** Review triage, manage assignments and deadlines, see analytics, read the audit log.
Each links to the Product page anchor.

### 4.5 AI triage, honestly
**Heading:** AI that reads, sorts and suggests. People decide.
| What the AI does | What it does not do |
|---|---|
| Reads the report's title and description | Look at the photos |
| Suggests one of the report categories | Make final decisions |
| Scores severity from low to critical | Replace staff review; anything can be overridden |
| Groups similar reports to flag duplicates | Learn from your data; models are used as published |
| Suggests the responsible department | Guarantee accuracy; low-confidence results are flagged for review |
Link: How the AI works (`/ai-triage`). `{VERIFY: needs_review flag behavior}`

### 4.6 Accountability
**Heading:** Every step leaves a record.
Cards: **Status history** (immutable timeline), **Deadlines** (SLA timers and escalation), **Appeals and feedback**,
**Hold approvals** (paused work needs sign-off), **Audit log** (who did what, and when), **Role-based access** (seven access levels).

### 4.7 Built for the field
**Heading:** Works where the signal doesn't.
Officer actions and citizen submissions are saved on the phone and sent when the connection returns. Short list: acknowledge,
start work, add an update, submit verification. Phone mockup with the real app. `{VERIFY in demo}`

### 4.8 Insight for administrators
**Heading:** See where problems cluster.
Real admin screens: map with heat layer, category breakdown, resolution times. Label: **Sample data.**

### 4.9 Trust
**Heading:** What we do about security and privacy.
Five plain bullets from the Security page (2FA for staff, rate limiting, audit logging, encrypted connections, role-based access).
Line: "CivicLens has not been independently audited." Links: Security, Privacy, Accessibility.

### 4.10 Demo CTA
**Heading:** Try it as a resident, an officer or an administrator.
Three buttons, one per role, to `/demo`. Note: "Sample data only. Please do not enter real personal information."

### 4.11 FAQ (feeds FAQPage schema; visible text must match)
1. **Is CivicLens an official government service?** No. It is an independent demonstration product.
2. **Does the AI analyze photos?** No. It reads report text only. Photos are stored as evidence.
3. **Can staff override the AI?** Yes. Category and severity can be changed manually, and the change is recorded. (`manual_category`, `manual_severity`)
4. **Does it work offline?** Yes, in the Android app: submissions and officer actions queue and sync on reconnect.
5. **What location data does it collect?** The location of the reported issue, and an officer's location while on duty `{VERIFY}`. See the Privacy policy.
6. **Is my data safe in the demo?** Use sample data only. Demo data may be reset at any time.
7. **Which languages does it support?** English at launch. Hindi and Marathi are planned.
8. **Is it open source?** `{DECIDE Q-06}`
9. **How do I report a security issue?** See `/security`.

### 4.12 Footer
Per sitemap, with the independence sentence.

## 5. Microcopy rules

- Buttons start with a verb: Open, Launch, Read, View. No "Submit" or "Click here".
- Errors: what happened, why if known, what to do next. No blame.
- Empty states: what belongs here and how to add it.
- Loading: a skeleton, not a spinner, for anything over 300 ms.
- Sample data always labeled where displayed.
- Dates in `12 Sep 2026` format; units spelled once, then abbreviated.

## 6. Per-page content standard

Each page has: one H1 stating the topic; a 1-2 sentence definition at the top that stands alone (used by search and
AI answers); scannable H2 sections (question-shaped where natural); a table where facts compare; a "Last updated" date;
one CTA; related links.
