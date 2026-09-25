# Product

<!-- impeccable:product-schema 1 -->

Status: rewritten 2026-09-21 from the claims ledger (`docs/website/00-claims-ledger.md`). Every statement below is backed by code or is
labeled as intent. If a statement here and the code disagree, the code wins and this file is wrong: fix it.

## Platform

web (marketing site first). The product also ships a citizen/officer web app, an admin dashboard and an Android app, but the current design work is the public marketing site.

## Users

**Visitors to the marketing site (who the design serves now):**

1. **Hiring managers and senior engineers** (primary): judging craft and depth of a solo-built, full-stack project. They want proof within two minutes and detail if they dig.
2. **Design peers and awards jurors**: judging interaction quality, performance, accessibility and cohesion.
3. **Technical evaluators curious about civic tech**: want clear scope, limits, security and data handling.
4. **Residents looking to report an issue**: want the shortest path to the app.

**Users of the product itself:**

1. **Residents**: report civic issues (potholes, garbage, streetlights, water leaks) with photos and location, track status, appeal or rate the outcome.
2. **Field officers**: receive assigned tasks on a map, work offline, submit before/after photos, notes, materials and duration, request holds when blocked.
3. **Administrators and staff**: review AI triage, manage assignments and deadlines, see analytics, read the audit log. Access follows seven role levels.

## Product Purpose

CivicLens is an independent civic issue platform that gives residents, field officers and administrators one shared record of every issue, from first report to documented fix. AI reads each report's text to suggest a category, severity and department and to flag likely duplicates; staff can override every suggestion. Officers attach before and after photos to closures. Every state change is written to an immutable history.

CivicLens is a demonstration project built by Tejas Bhor. It is not a government service, has no customers, and must never imply otherwise.

## Positioning

Not a generic ticket system: built around location, field work, offline conditions and photo evidence at closure.
Differentiators that are true today: one immutable status history; text-based AI triage with human override and duplicate clustering; photo evidence attached to closures; offline-first mobile use; accountability tooling (SLA timers, escalation, appeals, hold approvals, audit log).

## Operating Context

- **Residents**: often outdoors, on weak networks; need fast, high-contrast reporting with camera and GPS.
- **Field officers**: mobile, sometimes offline; need a task list and map, and simple state changes.
- **Administrators**: desktop, data-dense screens; need review queues, deadlines and analytics.
- **Visitors to the marketing site**: usually on a phone or laptop with no context; they decide within seconds whether to keep reading.

## Capabilities and Constraints

**Capabilities (all verified in code):**
- Reporting with photos, GPS and description, from web or Android, with an offline submission queue on mobile.
- AI triage on report text only: zero-shot category and severity classification (BART-MNLI), sentence-embedding similarity with clustering for duplicate detection (MiniLM, HDBSCAN), department routing. Low-confidence results are flagged for review. Staff can set the category and severity manually.
- Officer workflow: acknowledge, start work, progress updates, submit verification (before/after photos, notes, materials, duration), reject an assignment, request a hold that an admin approves.
- Accountability: immutable status history, SLA deadlines and escalation, appeals, citizen feedback, audit log, seven-tier role-based access, two-factor authentication for staff, rate limiting and account lockout.
- Public REST API with generated interactive docs.

**Not capabilities (must never appear in copy):** computer vision or any analysis of photos; cryptographic or tamper-evident verification of fixes (the only hash is a per-file SHA-256 used for deduplication); on-device AI; hardware-level or application-level encryption claims; real-time streaming (notifications and polling only); usage numbers, customer counts, city counts, testimonials or logos; compliance, certification or audit claims; "official" or government affiliation; ROI or cost-savings figures.

**Constraints:**
- Static, fast, accessible: budgets in `docs/website/01-prd.md` (LCP <= 2.0 s, CLS <= 0.05, INP <= 200 ms, Lighthouse a11y 100).
- WCAG 2.1 AA as the target, stated as a goal until independently tested.
- Every non-live number, chart or map is labeled "sample data".
- Free and open-source tooling only.

## Brand Commitments

- **Name**: CivicLens.
- **Voice**: plain, precise, calm, accountable. Short sentences, active voice, no hype, no exclamation marks. Say what it does, then what it does not. Full rules in `docs/website/03-content-strategy-and-home-copy.md`.
- **Visual identity**: to be decided at design direction (milestone M1) and recorded in `DESIGN.md` v2. The earlier "hardware bezel / floating glass island" identity is not assumed; treat `DESIGN.md` v1 as superseded.
- **Independence line** used in the hero note and footer: "CivicLens is an independent demonstration product built by Tejas Bhor. It is not a government service."

## Evidence on Hand

Real, working, and safe to show:
- Citizen/officer web app (`civiclens-client/`), admin dashboard (`civiclens-admin/`), Android app (`civiclens-mobile/`), FastAPI backend with AI worker (`civiclens-backend/`), deployed on Oracle Cloud with automatic HTTPS.
- Existing landing components that can be reused after review: `BeforeAfterSlider` (before/after photo comparison UI), `ProductBento`, `FlippingWordSwap`, `ScrollBasedVelocity`, `CountUp`, `CommandMenu`, `FAQ`, `StepJourney`, `Lifecycle`, `SystemStatus` page (honest about keeping no history).
- Existing components that need a truth check before reuse: `AiTriageSimulator` (scripted or real model?), `CivicHeatmap` (sample data?), `AiExplodedLayers` (contains a false "computer vision" layer), `CityScene` (decorative).

Removed from this list because the files do not exist: `MunicipalTelemetryChart`, `MunicipalCalculator`.

## Product Principles

1. **Say only what is true.** No claim without evidence in code or a cited source; label samples; state limits next to capabilities.
2. **One shared record.** Every issue's journey from report to closure is visible and recorded.
3. **People decide, AI suggests.** AI output is always overridable and its limits are stated.
4. **Operational rigor.** Favor clear, actionable information over decoration; every animation has a purpose.
5. **Inclusive by default.** Contrast, keyboard operation, touch targets, reduced motion and low-bandwidth performance are requirements, not polish.
6. **One designed system.** One concept, two type families at most, tokens as the single source; no parts that look imported from elsewhere.

## Accessibility & Inclusion

- Target WCAG 2.1 AA on all light and dark surfaces; achieved status is stated only after testing (`docs/website/legal/accessibility-statement.md`).
- Contrast at least 4.5:1 for body text and 3:1 for large text and interface elements.
- Interactive targets at least 44x44 px.
- `prefers-reduced-motion` honored everywhere: state changes stay immediate and clear, nothing essential depends on motion.
- Charts and maps have text or table alternatives.
