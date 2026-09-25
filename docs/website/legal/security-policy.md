---
title: Security
description: The security controls CivicLens implements, the limits, and how to report a vulnerability.
lastUpdated: "[DECIDE: publication date]"
---

# Security

*Last updated: [DECIDE: publication date]*

This page lists the security controls CivicLens has in place, and the limits. It describes only what is implemented.
CivicLens is a demonstration product, not a certified or independently audited service.

## What is in place

Each row is verified against the code (ledger item T6/T9) unless marked.

| Area | Control |
|---|---|
| **Transport** | HTTPS with automatically managed certificates on all public hosts |
| **Authentication** | Residents sign in with a one-time code sent to their phone. Officers and administrators sign in with a password and an email one-time code `[VERIFY: which roles]`. Access and refresh tokens (JWT) with expiry |
| **Two-factor** | Authenticator-app (TOTP) two-factor authentication for administrators `[VERIFY: which roles are required]` |
| **Passwords** | Stored hashed, never in plain text; complexity rules enforced; a list of common passwords is rejected |
| **Abuse protection** | Rate limiting on sign-in and one-time-code requests; temporary account lockout after repeated failures |
| **Sessions** | Sessions are tracked per device with a fingerprint; you can review and end them `[VERIFY: UI]` |
| **Access control** | Role-based access with seven levels, from resident to super administrator; each API action checks the role |
| **Audit** | Sensitive actions are recorded with user, role, time, IP address and user agent |
| **Uploads** | Files are checked for type, size and dimensions, then re-encoded before storage |
| **Storage** | Object storage (MinIO) is not exposed publicly; media is served through the API proxy |
| **Web protections** | Security headers, cross-site request forgery tokens `[VERIFY: scope]` |
| **Availability** | Nightly backups with rolling retention `[VERIFY schedule]` |

## What is not in place

- No independent security audit or penetration test has been done.
- No security certification (such as ISO 27001 or SOC 2).
- No claim of compliance with any specific standard.
- It is a small project run by one person, with no 24-hour monitoring or guaranteed response times.
- Data-at-rest encryption is provided by the hosting provider's storage where enabled `[VERIFY Q-03]`; CivicLens does not add
  its own application-level encryption.

## Demo notice

The demo host may display one-time codes in the interface so visitors can try the app without a phone. This is a demonstration
feature limited to demo accounts and is not used for real accounts `[VERIFY after F1 is fixed]`.

## Reporting a vulnerability

Please report security issues privately to `[DECIDE Q-01: security email]`. Include what you found, where, and steps to reproduce.

We ask that you:
- give us reasonable time to fix the issue before sharing it publicly;
- avoid accessing other people's data, degrading the service, or using social engineering;
- test only against the demo, using demo accounts.

We will acknowledge within `[DECIDE: e.g. 5 days]` and keep you informed. We do not run a paid bounty program. We are glad to
credit reporters who wish it.

A machine-readable version is at `/.well-known/security.txt`.

## Related

[Privacy policy](/privacy) · [Cookie policy](/cookies) · [Status](/status)
