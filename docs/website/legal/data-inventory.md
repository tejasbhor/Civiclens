# Data Inventory

Status: Draft v0.1 | Date: 2026-09-21
Source of truth for the privacy policy. If the system's data handling changes, change this file first, then the policy.
Derived from `civiclens-backend/app/models/*`, `config.py`, `.env.production.example` and the web/mobile clients.
`[VERIFY]` and `[DECIDE]` items need your input.

## 1. Data the system handles

| Category | Fields (from code) | Whose | Purpose | Stored in | Retention |
|---|---|---|---|---|---|
| Account identity | phone, email, first/last/full name, avatar URL, bio, preferred language | Users | Sign-in, contact, personalization | PostgreSQL | Until account deletion `[DECIDE Q-05]` |
| Credentials | hashed password, TOTP secret (2FA), 2FA status | Officers, admins | Authentication | PostgreSQL | Until account deletion |
| Verification | phone_verified, email_verified; OTP codes | Users | Confirm ownership of phone/email | PostgreSQL flags; OTP in Redis with short expiry | OTP: short TTL `[VERIFY: TTL]` |
| Profile stats | reputation score, report and validation counts, role, profile completion | Users | Access levels, quality signals | PostgreSQL | Until account deletion |
| Saved location | primary latitude/longitude/address | Users (optional) | Local relevance | PostgreSQL | Until account deletion |
| Officer location | current latitude/longitude, last update time | Officers | Field coordination | PostgreSQL | Overwritten on update `[VERIFY: is history kept]` |
| Staff details | department, employee ID, moderation areas | Staff | Assignment and routing | PostgreSQL | Until account deletion |
| Report content | title, description, category, severity, status, timestamps | Reporters | Handle the issue | PostgreSQL | `[DECIDE Q-05]` |
| Report location | latitude/longitude, address, landmark, area type, ward, district, state, pincode | Reporters | Dispatch to the right place | PostgreSQL (PostGIS) | `[DECIDE Q-05]` |
| Media | photos (and audio type exists `[VERIFY C12]`), file size, MIME type, caption, upload source, SHA-256 hash | Reporters, officers | Evidence of issue and fix | MinIO object storage; metadata in PostgreSQL | `[DECIDE Q-05]` |
| AI outputs | ai_category, ai_confidence, model version, duplicate cluster and embeddings | Reports | Triage | PostgreSQL | With the report |
| Workflow records | status history, tasks, appeals, feedback, escalations, hold requests, rejection and hold reasons | Users, staff | Accountability | PostgreSQL | With the report |
| Notifications | type, title, message, read state, links | Users | Status updates | PostgreSQL | `[DECIDE Q-05]` |
| Notification prefs | push / SMS / email toggles, device push token | Users | Deliver notifications | PostgreSQL | Until changed or deleted |
| Sessions | JWT IDs, device info, IP address, user agent, fingerprint, last activity, login method, expiry | Users | Security, session management | PostgreSQL / Redis | Until session expiry `[VERIFY: cleanup]` |
| Audit log | user ID and role, action, status, timestamp, IP, user agent, resource, extra data | Users, staff | Security and accountability | PostgreSQL | 365 days (`AUDIT_LOG_RETENTION_DAYS`) `[VERIFY: enforced]` |
| Backups | Database dumps and Redis snapshots | All | Recovery | Server disk `[DECIDE: off-site?]` | Rolling, `RETENTION_DAYS` in `scripts/backup.sh` `[VERIFY value]` |
| Error telemetry | Exceptions and request context | Users | Fix bugs | Sentry, if `SENTRY_DSN` is set | `[VERIFY Q-04]` |

## 2. Data the system does not collect

Aadhaar numbers, DigiLocker data (columns `aadhaar_hash`, `digilocker_linked` exist but are never populated; remove, see F2),
payment data, government IDs, advertising identifiers, contacts, precise location outside reports and officer duty,
biometric templates (the mobile app uses the OS biometric prompt, which does not share biometric data with the app).

## 3. Recipients and processors

| Recipient | Role | Data | Status |
|---|---|---|---|
| Oracle Cloud Infrastructure | Hosting (VM, storage) | All server-side data | Region `[DECIDE Q-03]` |
| Email provider via SMTP | Sends verification and notification emails | Email address, message | `smtp.gmail.com` in the env example `[VERIFY Q-04]` |
| SMS provider | Sends OTP | Phone number, message | Not configured in code defaults `[VERIFY Q-04]`; demo shows OTP in-app |
| Expo push notification service | Delivers mobile push | Device token, notification text | Used by the mobile app `[VERIFY]` |
| OpenStreetMap Nominatim | Reverse geocoding | Coordinates sent from the client | Found in client code (F5) |
| Sentry | Error monitoring | Error context | Only if enabled `[VERIFY Q-04]` |
| Municipal staff / departments in the platform | Handle the report | Report content, location, media, reporter contact as needed | By design |
| Marketing site host | Serves static site | Visitor IP in host logs only | `[DECIDE T-01]` |

No data is sold. No advertising or data-broker recipients exist.

## 4. Browser storage

| Where | Key | Purpose | Type |
|---|---|---|---|
| Web app | `access_token`, `refresh_token` | Keep the user signed in | Essential (localStorage; move to cookies, F3) |
| Web app | `user`, `remember_me` | Remember profile and sign-in preference | Essential |
| Web app | `theme` | Light/dark preference | Preference |
| Web app | `civiclens_cookie_consent` | Remember cookie choice | Essential |
| Marketing site (planned) | consent choice, theme | Remember choices | Essential / preference |

## 5. Data subject requests (process today)

No self-service export or deletion exists (F6). Requests are handled by email to `[DECIDE Q-01]`; the owner will verify identity
by the registered phone/email, then export or delete the account and its reports. Target response time: `[DECIDE: e.g. 30 days]`.
Deleting a report that has been assigned may need anonymization of the workflow record instead of removal, to keep the audit trail intact.

## 6. Open items

| ID | Item |
|---|---|
| I-1 | Decide retention periods (Q-05) and build a retention job, or state honestly that none is enforced |
| I-2 | Build export and delete endpoints (F6) |
| I-3 | Confirm processors and region (Q-03, Q-04) |
| I-4 | Verify EXIF stripping with a test (C11) |
| I-5 | Drop unused Aadhaar/DigiLocker columns (F2) |
