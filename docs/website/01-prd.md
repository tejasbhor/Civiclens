# PRD: CivicLens Marketing Site

Status: Draft v0.1 | Owner: Tejas Bhor | Date: 2026-09-21
Depends on: [DECISIONS.md](DECISIONS.md), [00-claims-ledger.md](00-claims-ledger.md)

## 1. Summary

A public marketing site that presents CivicLens, a civic issue reporting and resolution platform, as a credible
SaaS product, and doubles as the flagship showcase of the builder's frontend design and engineering ability.
It must be accurate (no claim the system cannot back), fast, accessible, discoverable by search and AI answer
engines, and consistent as one designed system.

## 2. Problem

- The current landing page grew by accumulation: five hero variants, 29 landing components, four typeface families, and
  claims the product does not support (fake usage numbers, computer vision, cryptographic verification, HSM encryption).
- The landing page and the app share one client-rendered SPA, so crawlers and AI answer engines see an empty shell.
- Required trust pages exist but state things that are untrue, which is worse than having no page.

## 3. Goals and non-goals

**Goals**
1. A visitor understands what CivicLens is, who it serves and what it does in 5 seconds, and can reach the live demo in 2 clicks.
2. Every statement is traceable to the claims ledger.
3. The site demonstrates senior-level frontend craft: design system, motion, data visualization, accessibility, performance, SEO.
4. The full trust suite is present and truthful: privacy, terms, cookies, accessibility, security, status, docs, 404/500.

**Non-goals (v1)**
- Real pricing, checkout, customer logos, testimonials, case studies, blog, multi-language content.
- Redesigning the citizen, officer or admin apps (a later phase).
- Any compliance certification or third-party audit claim.
- A contact form backend (a mailto link is enough).

## 4. Audience

| Persona | Wants | Design implication |
|---|---|---|
| **P1. Hiring manager / senior engineer** (primary) | Evidence of depth in under 2 minutes, then proof if they dig | Strong home, a "How it's built" page, real demo, public docs and API |
| **P2. Design peer / awards juror** | Interaction quality, performance, accessibility, cohesion | Scroll story, motion system, budgets and audit results shown openly |
| **P3. Technical evaluator (govtech-curious)** | Clear scope, limits, security and data handling | Plain "does / doesn't" tables, security and privacy pages, docs |
| **P4. Citizen visitor** | How to report an issue | Obvious path to the app, plain language |

## 5. Success metrics

| Metric | Target |
|---|---|
| Lighthouse mobile (throttled) on every template | Performance >= 90, Accessibility 100, Best Practices >= 95, SEO 100 |
| Core Web Vitals (lab, 75th percentile) | LCP <= 2.0 s, CLS <= 0.05, INP <= 200 ms |
| Initial JS on home (gzip) | <= 170 KB, excluding lazy-loaded 3D and demos |
| axe-core | 0 serious or critical issues; manual keyboard and screen-reader pass on key flows |
| Claim traceability | 100% of claims map to a True row in the ledger |
| Third-party requests before consent | 0 |
| Time from landing to live demo | <= 2 clicks |
| Broken links / invalid schema | 0 |

Traffic and ranking are not success criteria, since they depend on off-site links the site cannot control.

## 6. Scope

**In scope (v1):** home; product overview; how it works; AI triage explainer; demo access; about; how it's built;
docs (hub, getting started, role guides, API, architecture, FAQ); status; changelog; contact; privacy; terms;
cookies; accessibility statement; security; 404; 500; cookie consent manager; search; dark/light theme; SEO assets.
See [02-sitemap-ia.md](02-sitemap-ia.md).

**Out of scope:** listed under non-goals.

## 7. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Statically generated pages with full HTML content (no client-only rendering of primary content) | P0 |
| FR-02 | Global navigation, footer, skip link and theme toggle (light, dark, system) | P0 |
| FR-03 | Home page with the sections defined in [03-content-strategy-and-home-copy.md](03-content-strategy-and-home-copy.md) | P0 |
| FR-04 | Primary CTA "Open the live demo" on every page; secondary CTAs contextual | P0 |
| FR-05 | Demo page listing role-based demo accounts, sample-data notice, reset schedule, links to app and admin | P0 |
| FR-06 | Interactive product explorer: the report lifecycle with real screens | P0 |
| FR-07 | AI triage explainer with a clearly labeled example, stating what the AI does and does not do | P1 |
| FR-08 | Documentation with sidebar navigation, in-page table of contents, code blocks with copy, and client-side search | P0 |
| FR-09 | Legal pages rendered from MDX, each with a real "Last updated" date | P0 |
| FR-10 | Consent manager: Essential always on; Analytics off by default; reject as easy as accept; choice stored and revocable from the footer; no analytics script loads before opt-in | P0 |
| FR-11 | Command menu (Ctrl/Cmd+K) for page navigation and docs search | P1 |
| FR-12 | Status page reading the real health endpoint, with the existing honest "no history" wording | P0 |
| FR-13 | 404 and 500 pages with useful navigation, and a redirect map from old app routes | P0 |
| FR-14 | Generated Open Graph images per page | P1 |
| FR-15 | "How it's built" page exposing the design system, performance budget, accessibility approach and architecture | P1 |
| FR-16 | Changelog page | P2 |
| FR-17 | Sample-data labels on every chart, map or number that is not live | P0 |
| FR-18 | Sitemap, robots, `llms.txt`, `security.txt`, web manifest | P0 |

## 8. Non-functional requirements

**Performance.** Budgets in section 5. Heavy effects (3D, large animations) are lazy-loaded, disabled on small or
low-power devices and under reduced motion, and always have a static fallback. Scroll animation must not run on the
main thread beyond a lightweight per-frame update.

**Accessibility.** WCAG 2.1 AA minimum (target WCAG 2.2 AA where cheap). 4.5:1 text contrast, visible focus, full
keyboard operation, correct landmarks and heading order, labels on all controls, 44 px touch targets, 200% text
scaling without loss, `prefers-reduced-motion` respected everywhere, charts with text or table alternatives.

**SEO / AEO.** Per [04-seo-aeo-plan.md](04-seo-aeo-plan.md).

**Privacy.** No cookies at launch other than the consent preference itself. No third-party requests. Fonts self-hosted.
No fingerprinting. Analytics, if enabled, is cookieless, aggregate and opt-in.

**Security.** Strict Content Security Policy, HSTS, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`.
No secrets in the site. External links use `rel="noopener"`.

**Compatibility.** Last two versions of Chrome, Edge, Firefox, Safari; iOS Safari 16+; Android Chrome. Works without
JavaScript for reading content. Responsive from 320 px to 2560 px.

**Maintainability.** One design-token source. One component per job. Copy lives in content files, not scattered in JSX.

## 9. Design requirements

Full direction is decided at Gate 2 and recorded in `DESIGN.md` v2. Constraints already fixed:

1. One visual concept, one motif. No mixing of unrelated effects.
2. At most two type families, self-hosted, with a defined scale.
3. Color defined as roles (surface, text, accent, signal), each pairing contrast-checked in light and dark.
4. Motion uses the existing token scale (`motion.css`); each animation has a purpose (orient, confirm, explain), an
   interruption behavior and a reduced-motion alternative.
5. Product visuals are real screens of the real app, not stylized fakes. Illustrations support, never replace, the product.
6. Above the fold: headline under 8 words, one sentence of support, one primary CTA, product visual, and an honest
   "demo with sample data" note.

### Capability showcase matrix

Where the site demonstrates each frontend capability, so nothing is added for decoration:

| Capability | Where it is shown |
|---|---|
| Scroll-driven storytelling | Home lifecycle section (report to closure) |
| Interactive product UI | Product explorer (FR-06) |
| Data visualization | Admin insight section (sample data, labeled) |
| Motion system | Tokens plus one documented pattern library, on "How it's built" |
| Design system | "How it's built" page: tokens, type, color, components |
| Performance engineering | Published budget and live Lighthouse results |
| Accessibility | Statement, keyboard-first demos, reduced-motion behavior |
| Theming | Light/dark with system default |
| Content architecture and SEO | Docs, schema, sitemap, `llms.txt` |
| Optional 3D | One lazy-loaded scene, with static fallback, only if it serves the story |

## 10. Dependencies

- Demo environment ready (seeded data, demo accounts, reset job) before the demo page ships (Roadmap M6).
- Answers to Q-01 to Q-06 before legal pages are published.
- App moved to `app.civiclens.space` before old routes are redirected.
- Fixes F1 (demo OTP leak) and F2 (unused Aadhaar columns) before the security and privacy pages go live.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Scope creep and rebuild loops | Gates; spec approval before code; decision log |
| Spectacle hurting performance | Budgets enforced in CI; lazy loading; static fallbacks |
| Honesty reducing "wow" | Wow comes from craft, real product and clarity, not inflated claims |
| Solo capacity alongside on-the-job training | Vertical slices; P0/P1/P2 ordering; ship home and shell first |
| Demo abuse or spam data | Rate limits, reset job, demo notice, no real notifications |
| Old links breaking | Redirect map, tested before DNS cutover |
| Legal text drifting from reality | Data inventory is the source; policy changes require inventory changes |

## 12. Acceptance criteria (v1 launch)

1. Every P0 requirement implemented.
2. Success metrics in section 5 met and evidenced (reports stored in repo).
3. Claims ledger has no False or Unverified item present on the site.
4. All `[DECIDE]` and `[VERIFY]` placeholders resolved.
5. QA checklist ([06-launch-qa-checklist.md](06-launch-qa-checklist.md)) fully checked.

## 13. Milestones

See [05-architecture-and-roadmap.md](05-architecture-and-roadmap.md).
