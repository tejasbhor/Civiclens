# Design Directions (Milestone M1)

Status: Draft v0.1 | Date: 2026-09-21 | Decision needed: choose one direction (D-14)
Once chosen, this becomes `DESIGN.md` v2. Nothing here changes content, sitemap or budgets; only the visual and motion world.

## What the direction must do

1. Make the true story visible: one shared record from report to closure, AI that suggests and people decide, evidence at closure.
2. Look like one designed system, not parts from different sites: one concept, two type families at most, tokens as the only source.
3. Be ownable. The current site (dark teal, glass, glow, 3D) is the default look of AI and govtech landing pages. A visitor should remember this one.
4. Be honest by construction: layout and motion never imply data or capability that does not exist.
5. Pass the budgets in `01-prd.md`: contrast, reduced motion, performance, one canvas per page at most.

## The three directions

### A. The Record (editorial ledger)

**Concept.** The product's core is an immutable record, so the design is a case file. Warm paper, ink, timestamps and reference numbers in monospace, entries that "stamp in" line by line.
**Signature moment.** The lifecycle scroll story is one case file: each scroll beat writes the next ledger line (Reported 09:14, Triaged: Roads / High, Assigned, Fixed, Evidence attached, Closed). The status history is the visual.
**Type (free, OFL).** Newsreader (display and text) + JetBrains Mono (records, IDs, timestamps).
**Palette (contrast on background).**

| Role | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| Surface | `#F6F2E9` | | `#14120F` | |
| Text | `#16130F` | 16.6 | `#EFE9DC` | 15.5 |
| Muted | `#5B554B` | 6.6 | `#A8A092` | 7.2 |
| Accent (stamp red) | `#B3261E` | 5.9 | `#F0776F` | 6.7 |
| Resolved | `#1F6F4A` | 5.5 | `#5CC593` | 8.8 |
| Pending | `#8A5A00` | 5.3 | `#E0A93B` | 8.8 |

**Motion.** Calm and literal: text writes in, rules draw, a stamp lands. Uses `t-rise-in` and short fades; nothing bounces.
**Strengths.** Most credible and distinctive for "accountability"; very readable; cheap on performance.
**Risks.** Quiet; can feel like a newspaper rather than software unless product screens carry weight. Serif display may feel less "tech" to some hiring managers.

### B. Field Instrument (dark technical console)

**Concept.** A precise control-room look: dark surface, thin grid, map-like graphics, teal and amber signals.
**Signature moment.** A map panel where reports appear, get triaged and route to officers (sample data).
**Type (free, OFL).** Geist + Geist Mono.
**Palette.** Dark surface `#0B1214`, text `#E6EEF0` (16.1), teal accent `#2DD4BF` (10.2), amber `#F5A524` (9.3); light surface `#F4F7F7`, text `#0B1416` (17.3), accent `#0B6E66` (5.7).
**Motion.** Precise and fast: data draws, panels slide.
**Strengths.** Familiar to engineers; flatters the product screens; easy to build.
**Risks.** This is the default look of AI and dashboard sites, and close to the current site. Hardest to make memorable. Highest chance of drifting back into glow and glass.

### C. Public Notice (civic wayfinding)

**Concept.** Civic problems live on streets, and streets have a visual language: road signs, wayfinding, notices. Big confident type, black, white and one sign yellow, sign-green for "resolved", arrows and numbered steps.
**Signature moment.** The lifecycle as a route: six sign-like panels along a path, and scrolling moves you along it from Report to Closed. The three roles are direction signs pointing to their screens.
**Type (free, OFL).** Archivo (variable width and weight, for display through text) + JetBrains Mono (reference numbers, timestamps).
**Palette.**

| Role | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| Surface | `#F7F6F1` | | `#0B0B0B` | |
| Text | `#0B0B0B` | 18.2 | `#F7F6F1` | 18.2 |
| Muted | `#4D4D48` | 7.9 | `#A3A39B` | 7.8 |
| Signal yellow (surface only, black text on it 12.7) | `#FFC800` | | `#FFC800` | 12.7 as text |
| Resolved (sign green, white on it 6.8) | `#00693E` | 6.3 | `#3DBE84` | 8.3 |

Yellow is never used as text on light surfaces (it fails contrast); it is a surface and marker colour.
**Motion.** Direct and physical: panels slide into place like signs, arrows nudge. Uses the transitions.dev scale; no glow, no blur.
**Strengths.** Ownable and instantly linked to the real subject (potholes, streetlights, signage); the highest contrast of the three, so accessibility becomes part of the look; the route metaphor makes the scroll story natural.
**Risks.** Loud yellow and black can read as construction or warning if overused. Needs restraint (yellow in small, deliberate doses) to stay trustworthy. Any road-sign styling must not imitate real regulatory signs or imply an official authority (independence rule).

## Comparison

| | A. Record | B. Instrument | C. Notice |
|---|---|---|---|
| Ownable | High | Low | High |
| Fits the true story | High (record) | Medium | High (route + signs) |
| Accessibility built in | Good | Good | Best |
| Performance cost | Lowest | Medium | Low |
| Build risk | Medium (serif, editorial layout) | Low | Medium (needs restraint) |
| Chance it drifts to the old look | Low | High | Low |

## Recommendation

**C, Public Notice, borrowing A's monospaced "record line"** for status history and reference numbers. It is the most memorable, ties directly to what CivicLens does,
makes accessibility visible, and is the furthest from the current site. Second choice: A. Avoid B for the reason above.

## Rules that apply to whichever is chosen

- Two type families, self-hosted, one scale; no third font.
- Color as roles (surface, text, muted, accent, resolved, pending); every text pairing at least 4.5:1, UI at least 3:1, verified in light and dark.
- One motif, used consistently. Any effect that does not serve the scroll story or a state change is cut.
- Product visuals are real captured screens from the demo, framed consistently; no invented UI.
- Motion uses the existing transitions.dev tokens; each animation states its purpose, its interruption behavior and its reduced-motion alternative.
- Registry components (Componentry, KokonutUI, Animate UI, Motion Primitives) are used only where a page spec calls for them, and restyled to the chosen tokens.

## Next steps once a direction is chosen

1. Record the decision as D-14 and archive `DESIGN.md` v1.
2. Build static comps for the hero and two sections (lifecycle, AI triage explainer) at desktop and 390 px, light and dark, as prototypes with real product screenshots.
3. Review the comps against the budgets and the "Rules" above. Approve or revise once.
4. Write `DESIGN.md` v2 (tokens, type scale, spacing, radius, motion, component inventory with keep, kill, merge for the 29 landing components).
5. Proceed to M2 (shell).
