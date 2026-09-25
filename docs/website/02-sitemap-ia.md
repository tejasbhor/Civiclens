# Sitemap and Information Architecture

Status: Draft v0.1 | Date: 2026-09-21

## Domains

| Host | Purpose |
|---|---|
| `civiclens.space` | Marketing site (this project) |
| `app.civiclens.space` | Citizen and officer web app (moved from the root) |
| `admin.civiclens.space` | Admin dashboard (unchanged) |
| `api.civiclens.space` | REST API and Swagger (unchanged) |

## Pages

Priority: P0 launch-blocking, P1 launch if time allows, P2 after launch.

| URL | Page | Job (one sentence) | Primary CTA | Priority | Schema |
|---|---|---|---|---|---|
| `/` | Home | Explain CivicLens in 5 seconds and send the visitor to the demo | Open the live demo | P0 | WebSite, SoftwareApplication |
| `/product` | Product | Show what each role (citizen, officer, administrator) gets | Open the live demo | P0 | SoftwareApplication |
| `/how-it-works` | How it works | Walk the report lifecycle from submission to closure | Open the live demo | P0 | WebPage, BreadcrumbList |
| `/ai-triage` | AI triage | Explain exactly what the AI does and does not do | See the docs | P1 | TechArticle, FAQPage |
| `/demo` | Demo | Give safe access to the app with sample data | Launch as citizen / officer / admin | P0 | WebPage |
| `/about` | About | Say who built it, why, and with what | View the source [DECIDE: if public] | P1 | AboutPage, Person |
| `/how-its-built` | How it's built | Show the design system, budgets, accessibility approach, architecture | Read the docs | P1 | TechArticle |
| `/docs` | Docs hub | Route each reader to the right guide | Getting started | P0 | CollectionPage |
| `/docs/getting-started` | Getting started | First report in 5 minutes | Open the demo | P0 | TechArticle |
| `/docs/citizens` | Citizen guide | Reporting, tracking, appeals, feedback | n/a | P1 | TechArticle |
| `/docs/officers` | Officer guide | Tasks, offline use, proof of work, holds | n/a | P1 | TechArticle |
| `/docs/administrators` | Admin guide | Triage review, assignments, analytics, audit | n/a | P1 | TechArticle |
| `/docs/api` | API reference | Link and explain the public REST API | Open Swagger | P0 | TechArticle |
| `/docs/architecture` | Architecture | Components, data flow, AI pipeline, deployment | n/a | P0 | TechArticle |
| `/docs/faq` | FAQ | Direct answers to the common questions | n/a | P1 | FAQPage |
| `/status` | Status | Show live health of services, honestly | n/a | P0 | WebPage |
| `/changelog` | Changelog | Show the product moving | n/a | P2 | CollectionPage |
| `/contact` | Contact | Give one clear way to reach the builder | Email (mailto) | P1 | ContactPage |
| `/privacy` | Privacy policy | State what data is handled and the visitor's rights | n/a | P0 | WebPage |
| `/terms` | Terms of service | State the demo's terms | n/a | P0 | WebPage |
| `/cookies` | Cookie policy | List cookies and browser storage | Manage preferences | P0 | WebPage |
| `/accessibility` | Accessibility statement | State the standard, the status and how to report barriers | n/a | P0 | WebPage |
| `/security` | Security | State implemented controls and how to report a vulnerability | n/a | P0 | WebPage |
| `/404` | Not found | Help the visitor recover | Home / search | P0 | none |
| `/500` | Error | Say what happened and how to retry | Retry / home | P0 | none |

### Machine-readable and system files (P0)

`/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/.well-known/security.txt`, `/manifest.webmanifest`, `/favicon.ico`,
`/apple-touch-icon.png`, generated `/og/*.png`.

## Navigation

**Header:** Product, How it works, Docs, Security, then a button "Open the live demo". Theme toggle. Search (Ctrl/Cmd+K).
Mobile: full-screen menu with the same items, focus trapped and restorable.

**Footer (four groups):**
- Product: Product, How it works, AI triage, Demo, Changelog
- Resources: Docs, API, Architecture, FAQ, Status
- Trust: Privacy, Terms, Cookies, Accessibility, Security; "Cookie preferences" button
- Built by: About, How it's built, Contact, source link [DECIDE]

Footer also carries a sentence: "CivicLens is an independent demonstration product built by Tejas Bhor. It is not a government service."

## Redirect map (old to new)

| Old route on `civiclens.space` | New destination |
|---|---|
| `/citizen/*` | `https://app.civiclens.space/citizen/*` |
| `/officer/*` | `https://app.civiclens.space/officer/*` |
| `/auth/*` | `https://app.civiclens.space/auth/*` |
| `/privacy`, `/terms`, `/cookies`, `/security`, `/docs`, `/status` | Same paths on the marketing site (content replaced) |

Implement as 301 redirects at the edge, tested before DNS cutover.

## Internal linking rules

- Every page links to the demo and to one deeper page.
- Home links to each P0 page from a relevant section, using descriptive anchor text.
- Docs pages link to related docs, the API reference and the relevant product page.
- Breadcrumbs on all pages below the first level.
