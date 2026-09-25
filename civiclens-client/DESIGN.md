# CivicLens Design System

Source of truth for `civiclens-client`. Tokens live in `src/index.css`, mapped in `tailwind.config.ts`. If a page needs something this file doesn't define, extend the system here first, then use it.

## Philosophy
Editorial civic design with the restraint of an instrument panel. CivicLens is public infrastructure: it should read as trustworthy, legible and unhurried. Hierarchy comes from **type, spacing and one accent**, not from cards, gradients or effects. The marketing site is expressive; the portals are denser; both share type, colour, status language and component shapes.

**Personality:** institutional, precise, warm. A city clerk with a good eye, not a startup.

## Colour
Paper / ink / signage. Green is the civic voice; amber (`signal`) is used sparingly, for the one thing that needs attention.

| Role | Token | Use |
|---|---|---|
| Page | `background` / `surface` | App background |
| Panel | `surface-elevated` (`card`) | Only where a boundary is needed |
| Quiet fill | `surface-muted` (`muted`) | Wells, hover, table headers |
| Inverse | `surface-inverse` | Stats bands, footer, one dark moment per page |
| Brand | `primary`, `accent` | Actions, links, focus |
| Attention | `signal` | One highlight per view |
| Semantic | `success` `warning` `danger` `info` (+ `-foreground`) | Feedback, alerts |
| Lifecycle | `status-*` | Report state, always via `<StatusBadge>` |

Tinted UI uses the same hue at low alpha: `bg-success/12 text-success`. Tokens are tuned so that pairing holds 4.5:1 in both themes.

**Status language** (one meaning everywhere): submitted, received (blue), under review (teal), assigned (indigo), in progress (amber), completed (green), rejected (red), escalated (crimson), pending (grey, dashed). The map from backend status strings to these lives in `src/lib/status.ts`.

**Never** use raw palette classes (`bg-green-500`, `text-red-600`) in pages or components. **Never** hard-code hex outside WebGL.

Themes: `next-themes`, class strategy, key `theme`, default `system`, no flash.

## Typography
Schibsted Grotesk Variable, self-hosted. Mono is the system stack, for code and reference IDs only.

| Role | Class | Notes |
|---|---|---|
| Display | `text-display` | Marketing hero only |
| H1 | `text-h1` | Page title |
| H2 | `text-h2` | Section |
| H3 / H4 | `text-h3` / `text-h4` | Group / item title |
| Body | `text-body` | 16px, 65–75ch max |
| Body small | `text-body-sm` | Dense UI, tables |
| Label | `text-label` | Form labels, badges, tabs |
| Caption | `text-caption` | Help text, timestamps |
| Metadata | `text-meta` | IDs, footnotes |
| Code | `font-mono text-code` | |

No `text-[..px]`, `leading-[..]` or `tracking-[..]` in product code. Numerals in data use `tabular-nums`. No eyebrow labels above headings; the heading carries itself.

## Spacing
4px base. Product: gaps 8 / 12 / 16 / 24, section spacing 32. Marketing: section spacing 96–128 (`py-24 lg:py-32`). Page gutter `px-4 sm:px-6`, container max 1200 (portals) / 1280 (marketing). More space above a heading than below it.

## Radius
`rounded-control` 8 (buttons, inputs, badges) · `rounded-card` 12 (cards, list groups) · `rounded-panel` 16 (dialogs, sheets) · `rounded-surface` 28 (hero and marketing surfaces only). Pills only for status dots and avatars.

## Elevation
Default is **border, no shadow**. Then `shadow-raised` (cards that lift on interaction), `shadow-overlay` (menus, popovers), `shadow-floating` (dialogs, command menu, toasts). No inline shadows, no coloured glows.

## Components
- One `Button` (default / secondary / outline / ghost / destructive / link), 44px touch height on touch devices, `loading` prop.
- `Field` wraps label, control, hint, error and wires `aria-describedby`.
- `StatusBadge` is the only way a status is drawn.
- Lists beat card grids: rows separated by hairlines, not boxed tiles.
- `EmptyState` says what is empty, why, and the next step. `ErrorState` is calm and offers a retry.
- Loading: skeletons when structure is known, spinner for short actions.
- No nested cards.

## Interaction
Every control has hover, focus-visible, active, disabled and (where async) loading. Focus ring is 2px `ring` with offset. Destructive actions confirm. Feedback is inline first, toast second.

## Motion
Library: `motion` via `framer-motion` (already installed; one library for UI motion). Tokens: fast 150ms, base 200ms, slow 320ms; ease-out `cubic-bezier(0.23,1,0.32,1)`.
- **Functional / feedback / navigation motion** everywhere: press, presence, route fade (opacity + 6px translate).
- **Storytelling / decorative motion** on marketing only.
- Operational officer screens: no parallax, no springs on lists, no scroll effects.
- `prefers-reduced-motion`: transitions become instant or opacity-only, no parallax, no 3D drift, Lenis off.
- Animate `transform` and `opacity`. Never animate layout of large lists.

## Responsive
Mobile first. Checked at 320, 360, 390, 430, 768, 1024, 1280, 1440. No fixed widths on filters; tabs scroll or become a select; targets ≥44px on touch; use `dvh`, not `vh`; respect safe-area insets.

## Accessibility
WCAG AA. Real buttons and links (never clickable divs), labelled controls, errors associated to fields, visible focus, keyboard reachable, colour never the only signal (status badges carry a glyph and text).

## 3D policy
`CityScene` on the landing hero only. Lazy, gated by viewport visibility, device capability and reduced motion, with a static fallback. No 3D in forms, dashboards, officer flows, docs or settings.

## Content honesty
No invented customers, partners, testimonials, uptime or metrics. Demonstration content is labelled as such. Numbers on marketing come from the live public-stats endpoint or are removed.

## Anti-patterns
Gradient backgrounds and gradient text; glass everywhere; card soup; huge radii on small things; coloured glows; hover scale; bounce; eyebrow labels; hero-metric templates; sparklines with no meaning; decorative blobs and particles.
