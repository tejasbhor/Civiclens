# Architecture and Roadmap

Status: Draft v0.1 | Date: 2026-09-21
Assumes D-02 (separate static Next.js marketing site). Change D-02 first if that changes.

## 1. Architecture

### Repository layout

```
civiclens-web/                 new: marketing site
  src/app/                     App Router routes (one folder per page)
  src/content/                 MDX: docs, legal pages, changelog
  src/copy/                    typed copy files (home sections, FAQ)
  src/components/              one component per job
  src/styles/tokens.css        single source of design tokens
  public/                      icons, self-hosted fonts, product screens
  tests/                       Playwright + axe
```

Existing `civiclens-client`, `civiclens-admin`, `civiclens-backend`, `civiclens-mobile` stay as they are. The client keeps only
app routes; its landing and legal pages are removed after cutover (their reusable pieces are ported deliberately, not copied wholesale).

### Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) with static generation | Already used in admin; static HTML for SEO/AEO |
| Language | TypeScript strict | Rigor signal, fewer bugs |
| Styling | Tailwind with tokens in CSS variables | Matches existing tooling; one token source |
| Components | shadcn/ui primitives, restyled to tokens | Accessible primitives already in use |
| Content | MDX for docs and legal pages | Versioned text, diffable, typed frontmatter |
| Search | Pagefind (static index) | Zero backend, fast, works offline of any API |
| Motion | `motion` (motion/react) for UI transitions; GSAP ScrollTrigger for the scroll story | Existing skills; free plugins |
| 3D (optional) | Lazy-loaded React Three Fiber scene, with static poster fallback | Only if it serves the story |
| Fonts | `next/font` local, max two families | Privacy and performance (D-08) |
| Images | `next/image`, AVIF/WebP, explicit dimensions | LCP and CLS |
| OG images | `next/og` at build | Per-page social cards |
| Hosting | Static host with global CDN [DECIDE: Vercel or Cloudflare Pages] | No personal data on this host; app data stays on OCI |
| Contact | `mailto:` link | No backend, no form spam |
| Analytics | Cookieless, opt-in, self-hosted or privacy-first vendor [DECIDE] | D-07 |

Smooth-scroll libraries (Lenis) are not added by default: they can hurt accessibility and scroll performance. Adopt only if a measured comparison justifies it.

### Security headers (host config)

`Content-Security-Policy` (no inline scripts except hashed; `connect-src` limited to same origin and the status API),
`Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera, mic, geolocation),
`X-Content-Type-Options: nosniff`, `frame-ancestors 'none'`.

### Status page

Reads `https://api.civiclens.space/...health` `[VERIFY: endpoint and CORS]` with a timeout and a clear "unavailable" state. Keeps the existing honest wording (no history, no uptime percentage).

### CI (GitHub Actions)

On every push: lint, typecheck, build, Playwright with axe-core (0 serious/critical), Lighthouse CI with budget assertions
(Performance >= 90, A11y 100, Best Practices >= 95, SEO 100), link checker, sitemap/schema validation. Deploy previews per branch.

### Performance budget

Initial JS (home) <= 170 KB gz; LCP image <= 150 KB; total initial transfer <= 500 KB; no render-blocking third-party; 3D and
large animation assets lazy-loaded only above a viewport width and when motion is allowed.

## 2. Roadmap

Durations are working weeks alongside on-the-job training and are estimates. A milestone ends only when its exit criteria are met.

| # | Milestone | Weeks | Scope | Exit criteria |
|---|---|---|---|---|
| M0 | Foundations | 1 | Confirm D-02..D-04; answer Q-01..Q-06; review the claims ledger; **honesty hotfix on the live site**: delete C1 (usage numbers), C3-C6 wording, C7 "official" | Docs approved; false claims removed from the live site |
| M1 | Design direction | 1-2 | Moodboard; 2-3 static hero and section comps; type, color, spacing, motion tokens; component keep/kill inventory; `DESIGN.md` v2 | One direction chosen and written down |
| M2 | Shell | 2-3 | `civiclens-web` scaffold; layout, nav, footer, theme; MDX pipeline; 404/500; SEO plumbing; consent manager; headers; CI with budgets | Empty site passes every CI gate |
| M3 | Home | 3-5 | Sections built one at a time, each checked at three viewports, reduced motion and Lighthouse | Home meets all budgets |
| M4 | Core pages | 5-6 | Product, how it works, AI triage, demo, about, how it's built | Pages pass CI; copy matches ledger |
| M5 | Docs, legal, status | 6-7 | Docs hub with search; publish legal pages from `legal/` after Q inputs; status page | All `[DECIDE]`/`[VERIFY]` resolved |
| M6 | Demo environment (parallel from week 3) | 3-6 | Seeded data, demo accounts per role, reset job, demo banner in the app, remove OTP/reset-token leak paths (F1), drop Aadhaar columns (F2), move app to `app.` host | Demo works end to end, no credential leakage |
| M7 | Verify and launch | 7-8 | Full [QA checklist](06-launch-qa-checklist.md); device and screen-reader tests; redirects tested; DNS cutover; Search Console | Checklist complete; launch |

### Gate rule

Each page and section: spec approved, then build, then check, then next. No parallel half-built sections.

### After launch (not in v1)

Hindi and Marathi content; blog or write-ups; real product screens refreshed each release; app redesign; optional pricing if the project ever becomes a real offering.

## 3. Open technical questions

| ID | Question | Needed by |
|---|---|---|
| T-01 | Hosting choice: Vercel vs Cloudflare Pages | M2 |
| T-02 | Health endpoint and CORS for the status page | M5 |
| T-03 | Analytics vendor (or none at launch) | M2 |
| T-04 | Demo account and reset design | M6 |
| T-05 | Whether the 3D scene earns a place after M1 comps | M1 |
