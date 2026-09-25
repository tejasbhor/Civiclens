# CivicLens Marketing Site: Planning Docs

Status: Draft v0.1 | Owner: Tejas Bhor | Last updated: 2026-09-21

These documents are the single source of truth for the CivicLens marketing site.
Rule: no code for a section or page until its spec is marked **Approved**. Changes go into
the doc (and `DECISIONS.md`) first, then into code.

## Reading order and status

| # | Document | Purpose | Status |
|---|---|---|---|
| - | [DECISIONS.md](DECISIONS.md) | Log of every decision and assumption | Draft |
| 00 | [00-claims-ledger.md](00-claims-ledger.md) | Every public claim vs. what the code does | Draft, needs review |
| 01 | [01-prd.md](01-prd.md) | Product requirements for the marketing site | Draft |
| 02 | [02-sitemap-ia.md](02-sitemap-ia.md) | Pages, URLs, navigation, per-page job | Draft |
| 03 | [03-content-strategy-and-home-copy.md](03-content-strategy-and-home-copy.md) | Voice, message hierarchy, home page copy | Draft |
| 04 | [04-seo-aeo-plan.md](04-seo-aeo-plan.md) | SEO, answer-engine optimization, schema, metadata | Draft |
| 05 | [05-architecture-and-roadmap.md](05-architecture-and-roadmap.md) | Tech stack, repo layout, milestones, CI | Draft |
| 06 | [06-launch-qa-checklist.md](06-launch-qa-checklist.md) | Accessibility, performance, content, launch checks | Draft |
| 07 | [07-toolkit.md](07-toolkit.md) | Skills, MCPs and libraries: status, vetting, usage rules | Draft |
| 08 | [08-design-directions.md](08-design-directions.md) | Three visual directions, recommendation, decision needed | Draft, awaiting your pick |
| L1 | [legal/data-inventory.md](legal/data-inventory.md) | What personal data the system really handles | Draft, needs your input |
| L2 | [legal/privacy-policy.md](legal/privacy-policy.md) | Privacy notice (DPDP-aligned) | Draft |
| L3 | [legal/terms-of-service.md](legal/terms-of-service.md) | Terms for the demo | Draft |
| L4 | [legal/cookie-policy.md](legal/cookie-policy.md) | Cookies and browser storage | Draft |
| L5 | [legal/accessibility-statement.md](legal/accessibility-statement.md) | Accessibility commitments and status | Draft |
| L6 | [legal/security-policy.md](legal/security-policy.md) | Security practices, only what is implemented | Draft |

Not yet written (they follow approvals): `DESIGN.md` v2 (after design direction is chosen),
per-page specs (`page-specs/`), product documentation content plan.

## Placeholders

`[DECIDE: ...]` marks a value only you can supply (contact email, jurisdiction, region).
`[VERIFY: ...]` marks a fact that must be confirmed in the running system before publishing.
The legal texts are drafts written from the code. They are not legal advice.
