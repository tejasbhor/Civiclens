# Decision Log

Format: ID | Date | Decision | Why | Status. Change a decision here first, then in the docs, then in code.

| ID | Date | Decision | Why | Status |
|---|---|---|---|---|
| D-01 | 2026-09-21 | Focus is the marketing site. The web app and admin UI come later. | The site is the showcase for frontend capability. | Confirmed by owner |
| D-02 | 2026-09-21 | Marketing site is a separate, statically generated Next.js app at `civiclens.space`. The citizen/officer app moves to `app.civiclens.space`. | A client-rendered SPA gives crawlers an empty shell (bad for SEO/AEO). Next 16 is already used in admin. | Assumption, owner to confirm |
| D-03 | 2026-09-21 | Identity: an independent product "Built by Tejas Bhor". No fictional company, no fake customers. | Keeps every claim honest and credits the builder, which is the portfolio goal. | Assumption, owner to confirm |
| D-04 | 2026-09-21 | No pricing page at launch. Primary conversion is "Open live demo"; secondary is "Get in touch". | Invented prices are invented claims. | Assumption, owner to confirm |
| D-05 | 2026-09-21 | Honesty rule: no statistic, logo, testimonial, certification or capability appears unless the claims ledger marks it True and it is traceable to code or a cited source. | The current site overclaims. | Confirmed by owner |
| D-06 | 2026-09-21 | Remove "computer vision" and "cryptographic before/after verification" wording. May reappear only as a labeled roadmap item. | Not implemented (see ledger C2, C3). | Confirmed by owner |
| D-07 | 2026-09-21 | Cookie banner is a real consent manager with two categories: Essential (always on) and Analytics (off by default, cookieless, loaded only after opt-in). | A banner must control something real. | Assumption |
| D-08 | 2026-09-21 | Fonts are self-hosted, max two families. No Google Fonts request on the marketing site. | Avoids sending visitor IPs to a third party and fixes the type sprawl. | Assumption |
| D-09 | 2026-09-21 | Launch language is English. Content and layout are built i18n-ready (Hindi/Marathi later). | Two languages fully done beats three half done. | Assumption |
| D-10 | 2026-09-21 | Legal pages state "designed with DPDP principles in mind". They never say "compliant" or "certified". | No audit or certification exists. | Confirmed by owner |
| D-11 | 2026-09-21 | Site is presented as a demonstration. Users are told not to submit real personal data or real emergencies. | It is a portfolio demo with sample data. | Assumption |
| D-12 | 2026-09-21 | Toolkit is free and open source only. No Motion+ (its MCP entry is removed). Registries: `@animate-ui`, `@kokonutui`, `@componentry`, `@motion-primitives`. See `07-toolkit.md`. | Owner has no Motion+ membership; free tools cover the need. | Confirmed by owner |
| D-13 | 2026-09-21 | Design skills each have one job (`07-toolkit.md` section 3). Competing-aesthetic skills are not used on this project. The "10 Claude skills" list is not installed. | Avoids conflicting design opinions and context bloat. | Recommendation, owner to confirm |
| D-14 | 2026-09-21 | Visual direction: recommended C "Public Notice" with A's monospaced record line. Pending owner choice; see `08-design-directions.md`. | Most ownable, ties to the real subject, highest contrast, furthest from the current look. | Awaiting owner |
| D-15 | 2026-09-21 | Root `PRODUCT.md` rewritten from the claims ledger; the false capabilities and two nonexistent components (`MunicipalTelemetryChart`, `MunicipalCalculator`) removed. | Design tools read it as ground truth. | Done |

## Open questions (need owner input)

| ID | Question | Blocks |
|---|---|---|
| Q-01 | Public contact email for the site, grievance contact and security reports? | Legal pages, contact page, `security.txt` |
| Q-02 | Governing law / jurisdiction for the Terms (e.g. India, city)? | Terms |
| Q-03 | Which OCI region hosts production? Is data at rest encrypted at the volume level? | Privacy policy, security page |
| Q-04 | Which providers actually send OTP SMS and email in the live demo? Is Sentry enabled? | Privacy policy processors list |
| Q-05 | Retention periods for reports, photos and accounts (none are enforced today)? | Privacy policy, data inventory |
| Q-06 | Repository license and whether the source will be public? | Terms, footer, About |
