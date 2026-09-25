# SEO and Answer-Engine Optimization Plan

Status: Draft v0.1 | Date: 2026-09-21

Research basis: answer-engine optimization is about 80% the same as good SEO: crawlable, indexable pages; content
structured for extraction; clear entities; structured data that matches visible text. Google states no special schema
is required for its AI features. Ranking for a new brand also depends on off-site mentions this site cannot create.
The realistic goal is technical correctness and quotable content, not a traffic promise.

## 1. Technical foundation

| Item | Requirement |
|---|---|
| Rendering | Static HTML for every route; primary content present without JavaScript |
| URLs | Lowercase, hyphenated, stable; no trailing-slash duplicates; one canonical per page |
| Metadata | Unique `<title>` (<= 60 chars) and meta description (<= 155) per page; canonical; `lang="en"` |
| Social | Open Graph and Twitter card tags; generated 1200x630 image per page |
| Crawl files | `sitemap.xml` (all indexable pages, `lastmod`); `robots.txt`; `llms.txt` |
| Indexing | Search Console and Bing Webmaster Tools verified; sitemap submitted |
| Performance | Core Web Vitals within budget (see PRD section 5) |
| Semantics | One H1; ordered headings; landmarks; descriptive link text; alt text on every meaningful image |
| Redirects | 301 map from old routes; no chains |
| Errors | Real 404 status code with helpful page; 500 page |

`robots.txt` policy: allow all public pages for search and AI crawlers (the content is public and meant to be cited).
Disallow nothing on the marketing site. The app and admin hosts disallow all crawling. `[DECIDE: confirm AI crawler policy]`

## 2. Page metadata (draft)

| URL | Title | Description |
|---|---|---|
| `/` | CivicLens: civic complaints tracked to closure | One shared record of every civic issue, from report to documented fix, with AI-assisted triage staff can override. |
| `/product` | Product: for residents, officers and administrators | What CivicLens gives each role: reporting and tracking, field task tools, and triage and analytics. |
| `/how-it-works` | How CivicLens works: from report to closure | The six steps of the CivicLens workflow, from submission and AI triage to assignment, fix evidence and feedback. |
| `/ai-triage` | How CivicLens AI triage works, and its limits | What the AI reads, what it suggests, how duplicates are flagged, and what it does not do. |
| `/demo` | Try the CivicLens live demo | Explore CivicLens as a resident, field officer or administrator with sample data. |
| `/docs` | CivicLens documentation | Guides for residents, officers and administrators, plus the API reference and architecture. |
| `/security` | Security at CivicLens | The security controls CivicLens implements and how to report a vulnerability. |
| `/privacy` | Privacy policy | What personal data CivicLens handles in its demo, why, and your rights. |

(Remaining pages follow the same pattern; final strings are set in each page spec.)

## 3. Structured data (JSON-LD)

Only markup that mirrors visible content. No fake ratings, reviews, prices or offers.

| Page | Types |
|---|---|
| Site-wide | `WebSite` (name, url), `Person` for the builder (name, url, sameAs: profile links) |
| `/` and `/product` | `SoftwareApplication`: name, description, `applicationCategory: BusinessApplication`, `operatingSystem: "Web, Android"`, author; **no** `offers`, `aggregateRating` |
| All below first level | `BreadcrumbList` |
| `/ai-triage`, `/docs/faq`, home FAQ | `FAQPage` (Q&A identical to visible text) |
| Docs articles | `TechArticle` with `dateModified` |
| `/about` | `AboutPage` |

Validate with Google Rich Results Test and Schema.org validator in CI where possible.

## 4. Content structure for answer engines

- Open each page with a 1-2 sentence definition that stands alone (who, what, for whom).
- Use question-shaped H2s where natural ("Does the AI analyze photos?") with the answer in the first sentence.
- Prefer tables for comparisons and limits (does / does not; role / permissions).
- State facts with precise wording and a date; avoid vague superlatives.
- One canonical explanation per topic; link to it instead of restating.
- Provide a public, complete Docs section and API reference: technical validation content is what gets cited.

## 5. Target topics

| Topic | Page | Intent |
|---|---|---|
| civic issue reporting software | `/`, `/product` | Informational / evaluative |
| municipal complaint management workflow | `/how-it-works` | Informational |
| AI complaint classification, duplicate detection | `/ai-triage` | Informational |
| offline field-officer task app | `/product`, docs | Informational |
| report a pothole / civic issue | Docs getting started, `/demo` | Navigational |
| CivicLens (brand) | `/`, `/about` | Navigational |

## 6. Entity and off-site

Consistent name ("CivicLens") and builder identity everywhere. Off-site signals to create honestly: GitHub repository README
linking to the site, LinkedIn project entry, a write-up on dev.to or a personal blog about the architecture. Link back to the
site from each. No purchased links, no directory spam.

## 7. Measurement

- Search Console: impressions, indexed pages, coverage errors, Core Web Vitals.
- Cookieless, opt-in analytics for page views and demo click-throughs (only after consent).
- Monthly manual check of 10 target questions in major AI assistants and search: is CivicLens described accurately? Log results.
- CI: Lighthouse SEO = 100, no broken links, valid sitemap and schema.

## 8. Pitfalls to avoid

Client-only rendering of content; the same title on every page; schema that says something the page does not; thin pages
created only for keywords; hidden text; claims a model could quote incorrectly (the claims ledger prevents this).
