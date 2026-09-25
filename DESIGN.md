---
name: CivicLens Design System
description: Vanguard Municipal Precision & High-Density Operational Craft
colors:
  primary: "#0e5e43"
  primary-hover: "#0a4531"
  primary-foreground: "#f7fdf9"
  neutral-bg: "#09120f"
  neutral-surface: "#101d18"
  neutral-surface-hover: "#152620"
  neutral-border: "rgba(255, 255, 255, 0.08)"
  neutral-border-highlight: "rgba(255, 255, 255, 0.16)"
  text-primary: "#f4f7f5"
  text-secondary: "#8ea499"
  text-muted: "#5a7065"
  accent-emerald: "#10b981"
  accent-teal: "#14b8a6"
  accent-amber: "#f59e0b"
  accent-red: "#ef4444"
  accent-blue: "#3b82f6"
typography:
  display:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Outfit, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  mono:
    fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-bezel-outer:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.3xl}"
    padding: "6px"
  card-bezel-inner:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  nav-floating-island:
    backgroundColor: "rgba(9, 18, 15, 0.85)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
---

# CivicLens Design System

## Overview
CivicLens pairs high-density municipal telemetry with tactile, hardware-inspired precision. Rather than looking like a generic SaaS template or standard government form, CivicLens draws inspiration from avionics command consoles, precision-milled Swiss engineering, and modern dark-tech aesthetics. 

The visual thesis is built upon four foundational pillars:
1. **Double-Bezel Hardware Architecture (Doppelrand)**: Concentric nested geometry creating physical framing and tactile containment.
2. **Fluid Island Navigation**: Detached, floating glass pill floating cleanly above all content.
3. **Button-in-Button Trailing Kineticism**: High-contrast icon badges nested inside pill actions.
4. **Authentic Civic Telemetry**: Functional data visualization, real-time status pulses, and cryptographic verification stamps.

---

## Colors
The palette balances an ultra-deep municipal ink substrate with vibrant emerald and signal amber accents.

- **Substrate & Neutrals**:
  - `neutral-bg`: `#09120f` (Deep obsidian spruce)
  - `neutral-surface`: `#101d18` (Elevation surface)
  - `neutral-surface-hover`: `#152620` (Tactile hover surface)
  - `neutral-border`: `rgba(255, 255, 255, 0.08)` (Subtle separation border)
  - `neutral-border-highlight`: `rgba(255, 255, 255, 0.16)` (Focused highlight border)
- **Primary & Civic Brand**:
  - `primary`: `#0e5e43` (Deep Civic Emerald)
  - `accent-emerald`: `#10b981` (Vibrant telemetry status green)
  - `accent-teal`: `#14b8a6` (Secondary telemetry accent)
- **Functional Semantics**:
  - `accent-amber`: `#f59e0b` (In-progress / SLA warning)
  - `accent-red`: `#ef4444` (Critical severity / Emergency escalation)
  - `accent-blue`: `#3b82f6` (Triage intake / Citizen submission)

---

## Typography
Typography is treated with editorial clarity and deliberate spatial rhythm.

- **Display & Headlines (`Outfit`)**:
  - Display: `clamp(2.75rem, 6vw, 4.5rem)`, 800 weight, `-0.035em` letter-spacing, tight `1.05` line-height.
  - Headline: `clamp(2rem, 4vw, 3rem)`, 700 weight, `-0.025em` letter-spacing.
  - Rule: Never use generic rainbow text gradients; emphasis comes from pure typographic weight and deliberate scale shifts.
- **Body & Controls (`Inter`)**:
  - Body: `1rem`, regular 400 or medium 500, `1.6` line-height for optimal scanability.
  - Measure: 65–75 characters per line to guarantee reading comfort.
- **Data & Telemetry (`JetBrains Mono` / Monospace)**:
  - Used strictly for timestamps, GPS coordinates, ticket hashes, and numeric values.

---

## Layout
Layouts adhere to asymmetric editorial grids rather than repetitive 3-column cookie-cutter cards.

- **Bento Composition**:
  - 12-column asymmetric grid (e.g. 7-column primary stage + 5-column secondary telemetry console).
  - Gap spacing strictly calibrated at `gap-6` (`24px`) to `gap-8` (`32px`).
- **Section Rhythm**:
  - Generous vertical padding (`py-28` to `py-36`) allowing complex interactive instruments to breathe.
  - Clear reading priority: Display heading first, followed by clear 2-line rationale, followed by the functional instrument.

---

## Elevation & Depth
Depth is created through optical physics rather than heavy drop-shadow blurs.

- **Tonal Layering**:
  - Level 0 (Base Canvas): `#09120f`
  - Level 1 (Outer Bezel): `#101d18` with 1px `border-white/10`
  - Level 2 (Inner Core): `#0a1511` with inset drop shadows (`inset 0 1px 1px rgba(255, 255, 255, 0.05)`)
  - Level 3 (Interactive Controls): Floating pill elevation with `shadow-2xl` and backdrop blur (`backdrop-blur-xl`).

---

## Shapes
All curves and boundaries follow the mathematical rule of **Concentric Radii**:
$$R_{\text{inner}} = R_{\text{outer}} - \text{Padding}$$

- Outer bezel container: `rounded-[2.5rem]` (`40px`) with `p-1.5` (`6px`) border bezel.
- Inner stage content: `rounded-[calc(2.5rem-0.375rem)]` (`34px`), preserving concentric parallelism.
- Buttons & Pills: `rounded-full` (`9999px`) for high-velocity interactive controls.

---

## Components

### 1. Fluid Island Navigation
- Fixed floating glass capsule at top center: `fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(94%,78rem)]`.
- Frosted glass finish with `backdrop-blur-xl` and `bg-background/80`.
- Integrated kinetic Button-in-Button CTA at the right edge.

### 2. Double-Bezel Hardware Card
- Encapsulates all primary features (Product Bento, Before/After Slider, AI Triage Simulator, Telemetry Chart).
- Outer rim: Subtle metallic gradient border (`border-border/80`).
- Inner core: High-contrast dark operational canvas with clean data readouts.

### 3. Button-in-Button Action Pills
- Primary call to action: Pill button containing text label on the left and an elevated circular icon container on the right (`w-8 h-8 rounded-full bg-white/20`).
- On hover, the inner icon container translates `translate-x-0.5` with spring easing.

### 4. Floating Action Dock
- KokonutUI-inspired spring dock floating above bottom-center viewport.
- Expands dynamically with tactile tooltip labels and direct shortcut navigation.

---

## Do's and Don'ts

### Do's:
- **DO** maintain strict concentric border radii on all nested containers.
- **DO** use authentic SVG icons with consistent 1.5px to 2px stroke weights.
- **DO** provide full keyboard focus visibility (`focus-visible:ring-2 focus-visible:ring-primary`).
- **DO** format all municipal coordinates and ticket IDs in monospace.
- **DO** support reduced motion via graceful static rendering.

### Don'ts:
- **DON'T** use generic 1px gray borders or plain rectangular cards.
- **DON'T** use artificial AI kicker pills or eyebrows above headings.
- **DON'T** use rainbow text gradients; use solid typographic contrast.
- **DON'T** use emojis as interface icons.
- **DON'T** nest cards inside cards without the double-bezel concentric architecture.
