# CivicLens Master Design, Motion Toolkit & Implementation Strategy

**Status:** Ready & Verified | **Date:** 2026-09-21  
**Author / Lead:** Tejas Bhor  
**Purpose:** Single source of truth for all vetted resources, design principles, component registries, and execution rules for the CivicLens SaaS showcase.

---

## 1. Verified Resource Arsenal (100% Free & Open-Source)

Every resource below has been verified directly in the project environment and confirmed ready to use without any paid subscriptions.

### A. Core Agent Skills
| Skill | Path / Trigger | Role & Scope |
| :--- | :--- | :--- |
| **`emil-design-eng`** | `.agents/skills/emil-design-eng` | Micro-interactions, spring physics, active press scale (`0.98`), gesture feedback, tactile polish. |
| **`impeccable`** | `.agents/skills/impeccable` | Anti-AI-slop auditor. Enforces typographic hierarchy, contrast, spatial discipline, and consistency. |
| **`ui-ux-pro-max`** | `.agents/skills/ui-ux-pro-max` | Comprehensive design intelligence: color palettes, typography scales, layout tokens, accessibility. |
| **`transitions-dev` & `transitions-polish`** | `.agents/skills/transitions-dev` | Motion token scale (`motion.css`), standardized durations (80ms–350ms), smooth bezier easing. |
| **`design-taste-frontend`** | `.agents/skills/design-taste-frontend` | Editorial layout discipline, wide typography, anti-template layout variance. |
| **`refero-design`** | `.agents/skills/refero-design` | Research-first UI patterns grounded in premier SaaS references. |

---

### B. Installed Animation & UI Libraries
* **`motion` (`motion/react`) v13.4.0**: Fully installed in `civiclens-client`. All motion imports MUST use `import { motion } from "motion/react"` (never legacy `framer-motion`).
* **`@designcodeio/threeui` v1.2.0**: Community MIT edition installed in `civiclens-client`. (Rule: max 1 WebGL canvas, lazy-loaded, disabled on mobile/reduced-motion).
* **`lenis` v1.3.26**: Smooth momentum scroll provider.
* **`sonner` v1.7.4**: Tactile, stacked notifications.
* **`radix-ui` primitives**: Accessible headless foundation.

---

### C. Live Verified shadcn Registries (`components.json`)
All four custom registries are wired and verified:

```json
"registries": {
  "@animate-ui": "https://animate-ui.com/r/{name}.json",
  "@kokonutui": "https://kokonutui.com/r/{name}.json",
  "@componentry": "https://componentry.dev/r/{name}.json",
  "@motion-primitives": "https://motion-primitives.com/c/{name}.json"
}
```

#### How to Add Components from Terminal (Always quote the registry name in PowerShell):
```powershell
# From civiclens-client directory:
npx shadcn@latest add "@componentry/magnetic-dock"
npx shadcn@latest add "@motion-primitives/text-effect"
npx shadcn@latest add "@kokonutui/card-01"
npx shadcn@latest add "@animate-ui/components-base-tabs"
```

---

## 2. Strategic Design Contract (How to Prevent "Frankenstein" UI)

To ensure CivicLens looks like a cohesive, multi-million dollar SaaS product rather than a patchwork of random components:

### Rule 1: The Token Skinning Mandate
* Whenever any component is imported from `@componentry`, `@kokonutui`, or `@motion-primitives`, **we immediately re-skin it** to use CivicLens semantic tokens from `src/index.css` and `src/motion.css`.
* Never allow hardcoded arbitrary colors (e.g. `bg-[#123456]`) from external examples into production.

### Rule 2: Typography Hierarchy
* **Primary Display & Body**: `Schibsted Grotesk` (clean, contemporary Scandinavian grotesque designed for public readability).
* **Monospace & Metrics**: `JetBrains Mono` for ticket IDs (`#CIV-4092`), timestamps, SLA timers, and AI confidence scores.
* **Strict Line Wraps**: Major headings must be tracked tightly (`tracking-tight`) with deliberate line wraps (`max-w-2xl` to `max-w-3xl`) to avoid sparse 6-line wrapping.

### Rule 3: Motion Discipline (Emil Kowalski Philosophy)
* **Micro-durations**: Tooltips & toggles: `80ms–150ms`. Modals & cards: `250ms–350ms`.
* **Physical Spring Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`.
* **Interaction Feedback**: Every interactive card, button, and pill must have an active press state:
  ```css
  active:scale-[0.98] transition-transform duration-100 ease-out
  ```
* **Accessible Motion**: Full `prefers-reduced-motion` compliance natively configured.

---

## 3. Truthful Claims & Substance (Zero Overclaiming)

As established in `00-claims-ledger.md`, the site's credibility rests on rigorous honesty. We never claim fake enterprise statistics. Instead, we highlight the **real, extraordinary engineering**:

| What We DO NOT Claim (Banned) | What We PROUDLY Showcase (True & Real) |
| :--- | :--- |
| ❌ "250,000+ residents in 120+ cities" | ✅ "Built as a high-integrity civic demonstration platform" |
| ❌ "Computer vision defect detection" | ✅ "BART zero-shot text classification for category & urgency" |
| ❌ "Cryptographic SHA-256 blockchain chain" | ✅ "Dual before/after photo evidence attached to each ticket closure" |
| ❌ "Hardware Security Modules / AES-256" | ✅ "Immutable status transition history and comprehensive audit logging" |
| ❌ "Zero-trust military architecture" | ✅ "7-tier role-based access control (Citizen, Officer, Admin)" |
| ❌ "Real-time WebSockets" | ✅ "Instant push notifications & offline SQLite queue sync for field officers" |

---

## 4. Full SaaS Production Pages (Scope & Roadmap)

1. **Flagship Landing Page (`/`)**:
   - Hero with clear promise ("Every civic complaint, tracked to closure") & live demo badge.
   - Interactive Triage & Duplicate Cluster Demo (explaining the real NLP & MiniLM pipeline).
   - Stakeholder Journey (Resident $\rightarrow$ Dispatcher $\rightarrow$ Field Officer).
   - Before/After photo verification interactive comparison.
   - Transparent Architecture & SLA accountability metrics.
   - Direct 1-click launchpad into Citizen, Officer, and Admin demo roles.
2. **Trust & Governance Ecosystem**:
   - `/privacy`: Real DPDP/GDPR-aligned privacy policy (transparent OpenStreetMap disclosure, no fake HSM claims).
   - `/terms`: Clear demonstration terms of use.
   - `/cookies`: Cookie policy + sleek, non-intrusive cookie consent banner.
   - `/security`: Real security controls (TOTP 2FA, rate limiting, session tracking, audit logs).
   - `/status`: System health polling with incident disclosure.
   - `/docs`: Architecture, API reference, and Getting Started guide.
   - `/404`: Branded, thoughtful error page with search/recovery links.

---

## 5. Execution Workflow

When building or updating each section:
1. **Audit First (`impeccable`)**: Check against claims ledger and design tokens.
2. **Component Integration**: Pull base layout or animation from verified registries (`@motion-primitives`, `@componentry`, `@kokonutui`).
3. **Reskin & Tokenize**: Apply `Schibsted Grotesk`, CivicLens palette, and `motion.css` tokens.
4. **Interactive Polish (`emil-design-eng`)**: Add tactile hover/active feedback and keyboard accessibility.
5. **Verify**: Test on desktop, tablet, and mobile viewport before declaring complete.
