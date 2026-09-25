# Claims Ledger

Status: Draft v0.1 | Date: 2026-09-21
Every public statement is checked against the code. Verdicts: **True**, **Partly**, **False**, **Unverified**.
Nothing marked False or Unverified may ship on the new site until fixed or verified.

## A. Claims on the current site and docs

| ID | Claim | Where | Verdict | Evidence | Action |
|---|---|---|---|---|---|
| C1 | "250,000+ residents", "120+ cities" | `civiclens-client/src/pages/Landing.tsx:119-121` | **False** | No such usage exists; demo product | Delete. No user or city counts. |
| C2 | "Computer vision" layer | `AiExplodedLayers.tsx` (lines 41, 78, 231, 586, 680, 817), `PRODUCT.md` | **False** | AI is text-only: BART zero-shot classification, MiniLM embeddings, HDBSCAN clustering (`civiclens-backend/app/services/ai/`). Images are only validated and re-encoded with Pillow. | Remove. Optional labeled roadmap item. |
| C3 | "Cryptographic before/after verification", "SHA-256 hash chaining", "tamper-evident", "dual-angle photo comparison" | Security, Privacy, Terms, Cookie pages, `PRODUCT.md` | **False** | Only a per-file SHA-256 exists, used for deduplication (`file_upload_service.py:197-198`). No chain, no signing, no comparison of before/after images. | Reword to "before/after photo evidence attached to each closure." |
| C4 | "AES-256 at rest ... hardware security modules" | `SecurityPolicy.tsx` | **False** | No application-level encryption code found. No HSM. | Remove. Say "encrypted at rest by the hosting provider" only after Q-03 is verified. |
| C5 | "Officers cannot upload gallery photos; hardware-level geolocation confirmation" | `SecurityPolicy.tsx` | **False** | `capture="environment"` is only a mobile browser hint (`CompleteWork.tsx:611`); `PhotoUpload.tsx` accepts any image. | Remove. |
| C6 | "Last Audited", "Municipal Hardened Specification", "Architecture Version 3.1", "Version 2.4 (Enterprise Civic Edition)" | Legal pages | **False** | No audit exists. Version labels are invented. | Remove. Use a real "Last updated" date. |
| C7 | "Official civic issue reporting and resolution portal" | `index.html` (title, meta, OG) | **False / misleading** | Implies a government service. It is an independent demo. | Reword: "independent civic issue platform (demo)". |
| C8 | "On-device AI engine" | Root `README.md` | **False** | Models run server-side in the AI worker. | Fix README. |
| C9 | "Real-time" (about 10 places) | `Landing.tsx:50`, `StepJourney.tsx`, `StakeholderGrid.tsx`, `FAQ.tsx`, etc. | **Unverified** | No WebSocket/SSE in the backend. Push notifications exist. Status page polls every minute. | Use "instant notifications" or "live status" only where true. |
| C10 | "Zero-Trust RBAC; Citizen, Field Officer, Department Head, Super Admin" | `SecurityPolicy.tsx` | **Partly** | RBAC is real, with 7 tiers (`models/user.py:20-27`). The listed roles are wrong. "Zero-trust" is unsupported. | Describe the 7 tiers. Drop "zero-trust". |
| C11 | "EXIF metadata stripped on ingest" | `PrivacyPolicy.tsx` | **Likely true** | Uploads are decoded and re-saved with Pillow without passing EXIF (`file_upload_service.py:252-265`), which drops it by default. | Add a test, confirm all upload paths, then claim. |
| C12 | "Audio/notes" collected | `PrivacyPolicy.tsx` | **Unverified** | `AUDIO` media type and limits exist in models/schemas. Not confirmed in any UI. | Verify in UI. Drop from policy if unused. |
| C13 | "Public transparency boards"; "cryptographic tracking tokens" for anonymous tracking | `PrivacyPolicy.tsx` | **Unverified** | `is_public` flag exists on reports. No token mechanism found. | Verify or remove. |
| C14 | Interactive "AI Triage Simulator" | `AiTriageSimulator.tsx` | **Unverified** | May be scripted rather than calling the real model. | Call the real model, or label "illustrative example". |
| C15 | Heatmap / telemetry charts | `CivicHeatmap.tsx`, `MunicipalTelemetryChart.tsx` | **Unverified** | Likely sample data. | Label "sample data" in the UI. |
| C16 | Data stored in India / specific region | Not stated, do not add | **Unverified** | Region unknown (Q-03). | Do not claim until confirmed. |
| C17 | "GDPR / DPDP compliant" | Not currently stated, do not add | **False if claimed** | No audit, no consent manager, no erasure endpoint. | Use "designed with DPDP principles in mind." |
| C18 | Public API docs at `api.civiclens.space/docs` | Root `README.md` | **Unverified** | `main.py` leaves docs URLs at defaults, comments imply enabled. | Confirm live, then link from the docs section. |

## B. Claims that are true and can be used

| ID | Claim | Evidence |
|---|---|---|
| T1 | AI reads the report text, classifies it into a category, scores severity, and suggests a department | `category_classifier.py`, `urgency_scorer.py`, `department_router.py` (BART-MNLI zero-shot) |
| T2 | Similar reports are clustered to flag duplicates, with thresholds (0.75 similar, 0.90 high confidence) | `enhanced_duplicate_detector.py`, `ai/config.py` |
| T3 | Immutable status history records every state change | `models/report_status_history.py` |
| T4 | Appeals, feedback, escalation and officer hold-approval workflows | `models/appeal.py`, `feedback.py`, `escalation.py`, `HoldApproval` |
| T5 | Seven-tier role-based access control | `models/user.py:20-27` |
| T6 | Two-factor authentication (TOTP), password complexity, rate limiting, account lockout, session tracking, audit log | `core/enhanced_security.py`, `core/account_security.py`, `models/session.py`, `models/audit_log.py` |
| T7 | Officer actions queue offline and sync on reconnect (mobile) | Mobile architecture (`SyncManager`, `sync_queue`); confirm in demo |
| T8 | System status page shows live checks and admits it keeps no history | `SystemStatus.tsx:20,109` (good copy, keep) |
| T9 | Uploads validated for type, size and dimensions, and re-encoded | `file_upload_service.py` |
| T10 | Web, admin, Android app (one APK, two roles) and REST API | Repo structure |

## C. Related findings to fix (not claims, but they affect the site's honesty)

| ID | Finding | Location | Fix |
|---|---|---|---|
| F1 | OTP and password-reset token returned in API responses when `DEBUG` or `ENABLE_DEMO_OTP` is set | `auth.py:86,260,422`, `auth_extended.py:215`, `users.py:906` | Remove from production builds. Use a labeled demo mode with separate demo accounts. |
| F2 | `aadhaar_hash` and `digilocker_linked` columns exist but nothing populates them | `models/user.py:111-113` | Drop the columns. The privacy policy states no Aadhaar/DigiLocker data is collected. |
| F3 | Web client stores access and refresh tokens in `localStorage` | `AuthContext.tsx`, `apiClient.ts` | Move to httpOnly cookies when the app is separated. |
| F4 | Google Fonts requested from the client | `index.html` | Self-host on the marketing site (D-08). |
| F5 | Coordinates sent to `nominatim.openstreetmap.org` for reverse geocoding | Client source | Disclose in the privacy policy (done in L2). |
| F6 | No account deletion or data export endpoint | Backend | Build before the policy promises self-service. The policy currently offers request-by-email. |
| F7 | `ENABLE_DEMO_OTP=true` in the production env example | `.env.production.example:81` | Fine for the demo host, but must be shown in the UI as a demo notice. |
