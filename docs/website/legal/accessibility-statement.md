---
title: Accessibility statement
description: CivicLens's accessibility standard, current status and how to report a barrier.
lastUpdated: "[DECIDE: publication date]"
---

# Accessibility statement

*Last updated: [DECIDE: publication date]*

CivicLens is built to be usable by everyone, including people who use screen readers, keyboards, voice control, magnification
or reduced motion settings.

## Standard we aim for

We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA on the marketing site. This is in line with
the accessibility level that India's GIGW 3.0 guidelines expect of government websites, although CivicLens is not a government
website and has not been assessed against GIGW.

## Current status

`[VERIFY: choose one after the QA pass]`
- **Tested:** automated checks (axe-core) on every page template in continuous integration; manual keyboard testing; screen
  reader testing with NVDA and VoiceOver on key pages.
- **Not yet done:** a third-party accessibility audit. The web app, admin dashboard and Android app have not been fully tested and may not
  meet this standard.

We describe the status as "aims to meet", not "conforms", until an independent audit says otherwise.

## What we do

- Semantic structure, landmarks, a skip link and a logical heading order
- Visible keyboard focus and full keyboard operation
- Text contrast of at least 4.5:1, and 3:1 for interface elements, in light and dark themes
- Text can be enlarged to 200% without loss of content
- Animation respects your "reduce motion" setting, and nothing essential depends on motion
- Text alternatives for images, charts and maps
- Labels and clear error messages on forms
- Pages readable without JavaScript

## Known limitations

`[FILL from the QA pass. Example format:]`
- The interactive product explorer on the home page offers a text alternative but the animated sequence is not screen-reader described.
- Some sample-data charts provide a data table instead of full chart interaction.

## Feedback and help

If you hit a barrier, email `[DECIDE Q-01: email]` with the page address, what you tried, and the assistive technology you use.
We aim to reply within `[DECIDE: e.g. 5 working days]` and to fix confirmed issues promptly.

## Technical notes

Measured against WCAG 2.1 Level AA using: axe-core, Lighthouse, manual keyboard testing, NVDA and VoiceOver.
Compatible browsers: latest two versions of Chrome, Edge, Firefox and Safari.
