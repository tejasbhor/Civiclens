# Design and Motion Toolkit

Status: Draft v0.1 | Date: 2026-09-21
Verified against the repo, `skills-lock.json`, `.mcp.json`, npm and each project's README on 2026-09-21.

## 1. Status of everything requested

| Resource | Type | Status | Notes |
|---|---|---|---|
| Emil Kowalski skills (`emilkowalski/skills`) | Skill pack (13) | **Installed, locked** | `emil-design-eng`, `animate`, `improve-animations`, `review-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `mobile-native`, `pick-ui-library`, `prototype`, `ask-sonner`, `animate-expo`, `write-swift` |
| Impeccable | Skill + hooks | **Installed, hooks active** | Script present; runs after every Edit/Write and on Stop. Reads `PRODUCT.md` and `DESIGN.md` (see section 4) |
| UI/UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`) | Skill pack (7) | **Installed, locked** | `ui-ux-pro-max`, `design-system`, `design`, `brand`, `banner-design`, `slides`, `ui-styling` |
| Taste skill (`Leonxlnx/taste-skill`) | Skill pack (13) | **Installed, locked** | Use `design-taste-frontend`; see conflicts in section 3 
| transitions.dev + Polish | Skill pack (2) | **Installed, locked** | Motion tokens already applied in `civiclens-client` (`motion.css`) |
| Motion docs MCP (`mcp.motion.dev`) | MCP, free | **Connected** | Search Motion docs. Import from `motion` / `motion/react`, never `framer-motion` |
| Motion+ MCP | MCP, paid | **Removed (decision D-12)** | No membership. Free and open-source only |
| shadcn MCP | MCP | **Fixed, enabled, verified** | Launched via a `cmd /c cd /d ...` wrapper so its working directory is `civiclens-client` (its `--cwd` flag is ignored by tool calls). Verified searching all five registries |
| Animate UI | shadcn registry `@animate-ui` | **Ready, verified** | 580 items. Separate `animate-ui` MCP entry removed as redundant |
| KokonutUI | shadcn registry `@kokonutui` | **Ready, verified** | 51 items |
| Componentry | shadcn registry `@componentry` | **Added, verified** | 55 items (magnetic dock, kinetic text reveal, scroll choreography, and more). Free, backed by the Vercel Open Source Program. Includes heavy WebGL items; see rule 6 |
| Motion Primitives (`ibelick`) | shadcn registry `@motion-primitives` | **Added, verified** | 33 items, MIT, pushed 2026-09-16, self-described beta. URL pattern is `/c/{name}.json` |
| ThreeUI (`MengTo/threeui`) | npm `@designcodeio/threeui` | **Installed, constrained** | MIT Community package v1.2.0 is available in `civiclens-client`; adopt a selected component only through a scoped, performance-tested page implementation |
| Refero skill | Skill + optional external MCP | **Installed, MCP intentionally disabled** | Free MIT research-first methodology is available as `refero-design`; it will use public research and local craft references only |
| The "10 Claude skills" list | Various | **Not installed** | Recommend against; see section 3 |

**Why shadcn and animate-ui showed "failed to connect":** both were switched off in `.claude/settings.local.json`, and shadcn's first
`npx` run downloads the package, which took 34 s against a 30 s connection limit. The cache is warm now (3 s start). **Restart the Claude Code session** so the shadcn MCP loads.

## 1a. How to use it (quick reference)

**Find and add a component.** With the shadcn MCP loaded, ask in plain words, for example "add the magnetic dock from Componentry" or
"add the text effect from Motion Primitives". Without the MCP, use the CLI from the app folder:

```bash
npx shadcn@latest search @componentry -q "kinetic"          # search a registry
npx shadcn@latest view @componentry/magnetic-dock            # inspect before adding
npx shadcn@latest add @componentry/magnetic-dock             # copy source into the project
npx shadcn@latest add @motion-primitives/text-effect
npx shadcn@latest add @animate-ui/components-base-tabs
```

**Registries** live in `components.json` (`@animate-ui`, `@kokonutui`, `@componentry`, `@motion-primitives`). Copy the same `registries`
block into `civiclens-web/components.json` at M2.

**Motion docs.** The free Motion MCP is loaded; ask "search the Motion docs for useScroll". Always import from `motion/react`.

**Skills.** Invoke by name (for example `/impeccable`, `/animate`, `/transitions-dev`, `/emil-design-eng`, `/ui-ux-pro-max`). Which skill for which stage: section 3.

**Re-verify the setup** any time: run the shadcn search commands above; check `claude mcp list` shows `shadcn` and `motion` connected; confirm
`skills-lock.json` is unchanged in git.

**When the site moves to `civiclens-web`:** update the path in `.mcp.json` (the `cd /d` target) from `civiclens-client` to `civiclens-web`. Nothing else changes.

## 2. Vetting notes

**ThreeUI.** The GitHub repo is the free Community edition of a commercial product: React, Three.js, WebGL shaders, Vite;
141 free variants plus 23 singletons; MIT for component code; Pro and Beta components are not included. The MIT Community package
`@designcodeio/threeui` v1.2.0 is installed in `civiclens-client`. Import the smallest possible component subpath and its shared
styles only in the selected surface; adapt its semantic copy, fallback and tokens before shipping. Caveats: WebGL shader components are the heaviest thing
that can go on a page. Rules: at most one WebGL canvas per page; lazy-load; disable below a viewport width and under reduced motion;
static poster fallback; must pass the performance budget in `05-architecture-and-roadmap.md`. Use it for at most one or two
signature moments, only where the story needs it.

**Motion Primitives.** React + Tailwind + Motion, MIT, actively developed but self-described beta, "expect significant updates".
Copy-in code becomes ours; pin what we take, restyle to our tokens, and re-check accessibility (focus, reduced motion). Tailwind v4
support is not stated `[VERIFY when scaffolding]`.

**Animate UI.** shadcn-style registry by Skyleen, docs updated Dec 2025. License not confirmed `[VERIFY before copying]`.

**Refero.** MIT. Its free `refero-design` methodology and bundled craft references are installed. It connects to
`https://api.refero.design/mcp` only when explicitly configured; that live research requires a paid account and OAuth, so it remains
disabled. At M1, use the installed research-first workflow with public, source-cited references and the claims ledger. Do not send
confidential material through any third-party research service.

**Supply-chain note.** A skill is instructions the agent follows, so it is code-adjacent. `skills-lock.json` pins content hashes for
installed skills, which is good. New skills and registries get read before they are added, and `shadcn add` output gets diff-reviewed.

## 3. Recommendations

1. **Do not install the "10 skills" list.** Most overlap what is installed (Impeccable and Taste cover anti-slop and audit; Emil and
   transitions.dev cover motion; UI/UX Pro Max covers palettes and type). Extra skills add competing opinions and load more instructions
   into every session. Revisit one at a time only if a gap appears at M3 (for example scroll-story tooling).
2. **Give each skill one job** so they don't fight:

   | Stage | Use |
   |---|---|
   | Strategy and specs | These docs; `spec-driven-development`, `planning-and-task-breakdown` |
   | Design direction (M1) | `ui-ux-pro-max` (palettes, type pairs, UX rules), `design-taste-frontend` (anti-generic check), Refero (optional references) |
   | Build (M2-M5) | `impeccable` (craft, audit), `emil-design-eng` (philosophy), `animate` (per-animation decisions), `transitions-dev` and `transitions-polish` (token scale), Motion MCP (API accuracy), shadcn MCP (components) |
   | Review | `review-animations`, `improve-animations`, `web-design-guidelines`, `web-perf`, `impeccable` audit |
3. **Do not invoke the competing-aesthetic skills** on this project: `industrial-brutalist-ui`, `minimalist-ui`, `stitch-design-taste`,
   `gpt-taste`. They push a different visual world than the one we choose at M1. They are installed in `.claude/skills`; you may want to remove them to reduce clutter (your call, I have not touched them).
4. **Pick the design "world" at M1 before any skill generates visuals.** Skills follow the direction they are given. Without one, output drifts.
5. **Component sourcing rule:** every copied component records its source and date in a header comment or `src/components/SOURCES.md`, is restyled
   to tokens, and passes axe and reduced-motion checks before use. Inspect with `npx shadcn@latest view` before `add`, and review the diff after.
6. **Registry components are a starting point, not the design.** Componentry, KokonutUI and Animate UI ship distinctive looks; dropping many of them in
   would recreate the "puzzle of parts" problem. Budget: only components the page spec (M3+) calls for; WebGL/canvas items (for example
   liquid, particle, fluid, 3D slider) count against the one-canvas-per-page rule and the performance budget.
7. **Free and open source only (D-12).** No paid memberships, no Pro tiers.
8. **Adopt, then adapt.** Do not recreate a library component that is a proven fit; install or copy it, then align its content, semantic markup,
   accessibility behavior, tokens and motion to the chosen CivicLens direction. Do not import components merely to decorate a section.

## 4. One blocker: `PRODUCT.md` is wrong

Impeccable and the taste and UI skills read `PRODUCT.md` and `DESIGN.md` as ground truth. Today `PRODUCT.md` states capabilities that
do not exist (computer vision, cryptographic verification, ward-level telemetry claims) and `DESIGN.md` lists four type families. Any design work started now
would reproduce those claims and that sprawl. **Rewrite `PRODUCT.md` (strategy, from the ledger) before any design generation.** `DESIGN.md` v2 follows at M1.

## 5. Library baseline for `civiclens-web` (M2)

| Package | Version checked | Note |
|---|---|---|
| `next` | 16.3.5 | Same major as admin |
| `react`, `react-dom` | 19.x | Required by R3F 9 and drei 10 |
| `tailwindcss` | v4 | New app, so no v3 constraint; client and admin stay on v3.4 |
| `motion` | 13.4.0 | `motion/react` |
| `gsap`, `@gsap/react` | 3.15.0, 2.1.2 | Free including ScrollTrigger; scroll story |
| `three`, `@react-three/fiber`, `@react-three/drei` | 0.186.0, 9.7.0 (needs React >=19 <19.3), 10.7.8 | Only if a 3D moment is approved. Existing client uses R3F 8 / three 0.160 on React 18, so do not copy 3D code across |
| `pagefind` | 1.5.2 | Docs search |
| `lenis` | 1.3.26 | Not adopted by default (accessibility and scroll cost); adopt only after a measured comparison |

Registries in the new `components.json`: copy the block from `civiclens-client/components.json` (`@animate-ui`, `@kokonutui`, `@componentry`, `@motion-primitives`).
After scaffolding, change the `cd /d` path in the `.mcp.json` shadcn entry from `civiclens-client` to `civiclens-web`.

## 6. What still needs you

| Item | Action |
|---|---|
| Load the shadcn MCP | Restart the Claude Code session |
| Refero live MCP | Optional. Keep disabled unless a paid plan and OAuth are deliberately approved; the free methodology is already installed. |
| `PRODUCT.md` rewrite | Approve so it can be rewritten from the ledger (first step of the build) |
