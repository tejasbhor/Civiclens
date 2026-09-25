# Launch and QA Checklist

Status: Draft v0.1 | Date: 2026-09-21
Every box needs evidence (report, screenshot or CI link) stored in `docs/website/evidence/`.

## Content and honesty
- [ ] Every claim maps to a True row in `00-claims-ledger.md`
- [ ] No fake numbers, logos, testimonials, ratings, certifications
- [ ] "Sample data" label on every non-live chart, map, number
- [ ] Independence sentence in footer and hero note
- [ ] All `[DECIDE]` and `[VERIFY]` placeholders resolved
- [ ] Real "Last updated" dates on all legal pages
- [ ] Copy reviewed by a second person for tone and accuracy

## Accessibility
- [ ] axe-core: 0 serious/critical on every template (CI)
- [ ] Keyboard-only pass: home, demo, docs, consent manager, menu
- [ ] Screen-reader pass (NVDA + VoiceOver) on home, docs, consent manager
- [ ] Focus visible and never trapped (except modals, which restore focus)
- [ ] Contrast 4.5:1 text, 3:1 UI, light and dark
- [ ] Reduced motion honored; no essential info only in motion
- [ ] 200% zoom and 320 px width without horizontal scroll
- [ ] Charts and maps have text or table alternatives
- [ ] Skip link, landmarks, heading order, form labels
- [ ] Accessibility statement matches tested reality

## Performance
- [ ] Lighthouse mobile (throttled) on every template: Perf >= 90, A11y 100, BP >= 95, SEO 100
- [ ] LCP <= 2.0 s, CLS <= 0.05, INP <= 200 ms
- [ ] Initial JS home <= 170 KB gz
- [ ] Tested on a mid-range Android phone, not only desktop
- [ ] Heavy effects lazy-loaded, disabled on small viewports and under reduced motion
- [ ] Images sized, modern formats, `priority` only on LCP

## SEO / AEO
- [ ] Unique title, description, canonical per page
- [ ] `sitemap.xml`, `robots.txt`, `llms.txt` valid and live
- [ ] JSON-LD validates; matches visible content; no offers/ratings
- [ ] OG images render; social preview checked
- [ ] Old routes 301 to new destinations, no chains
- [ ] 404 returns status 404; 500 page works
- [ ] Search Console and Bing verified, sitemap submitted
- [ ] No broken internal or external links

## Privacy and security
- [ ] Zero third-party requests on load (network tab check)
- [ ] Fonts self-hosted
- [ ] Consent manager: reject as easy as accept; choice persisted; revocable; analytics blocked until opt-in
- [ ] Cookie policy lists exactly what is set, verified in devtools
- [ ] Security headers and CSP verified (securityheaders.com style check)
- [ ] `security.txt` present with contact and expiry
- [ ] Demo: no real OTP or reset token returned outside demo accounts (F1 fixed)
- [ ] Aadhaar/DigiLocker columns removed (F2)
- [ ] Privacy policy matches `legal/data-inventory.md`

## Compatibility
- [ ] Chrome, Edge, Firefox, Safari (latest two)
- [ ] iOS Safari 16+, Android Chrome
- [ ] Works with JavaScript disabled for reading content
- [ ] 320 px to 2560 px layouts checked

## Demo
- [ ] One demo account per role, documented on `/demo`
- [ ] Sample data seeded; reset job runs; reset schedule stated
- [ ] Rate limits on demo endpoints
- [ ] Demo banner visible in app and admin
- [ ] Status page reads live health

## Launch
- [ ] Redirect map tested on staging
- [ ] DNS cutover plan and rollback written
- [ ] Old landing and legal pages removed from `civiclens-client`
- [ ] README and repository descriptions updated with the accurate story (fix "on-device AI", C8)
- [ ] Post-launch: monitor Search Console and errors for two weeks
