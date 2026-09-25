import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { ShieldCheck, Lock, Key, Server, FileCheck, CheckCircle2, ShieldAlert, History, UserCheck, Mail, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/config/appConfig";

export default function SecurityPolicy() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Security Architecture & Controls - ${APP_CONFIG.appName}`}
        description={`Technical security overview for ${APP_CONFIG.appName}: 7-tier RBAC, TOTP two-factor authentication, immutable audit trails, and rate limiting controls.`}
        keywords="security architecture, RBAC, TOTP authentication, audit logs, rate limiting, civic tech security, demonstration platform"
      />
      <MarketingNav />

      <main className="flex-1">
        {/* ── Page Hero Header ── */}
        <section className="relative overflow-hidden pt-12 pb-14 md:pt-16 md:pb-20 border-b border-slate-200/80">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 right-[10%] h-[450px] w-[650px] rounded-full bg-emerald-500/10 blur-[130px]" />
            <div className="absolute top-1/2 left-[-5%] h-[400px] w-[500px] rounded-full bg-teal-500/08 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500">
              <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Security Architecture</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TECHNICAL DEFENSE & AUDIT TRAILS</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">UPDATED {lastUpdated.toUpperCase()}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Security engineered for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">public trust.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Technical security controls protecting municipal infrastructure records: 7-tier role-based access control, cryptographic status audit trails, and strict metadata sanitization.
            </p>
          </div>
        </section>

        {/* ── Security Pillars & Policy Body ── */}
        <section className="py-14 md:py-20 max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
          {/* 3 Pillar Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-3">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-slate-950 text-sm">TOTP & Rate Limiting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                RFC 6238 time-based 2FA, password complexity enforcement, and exponential backoff lockout.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-slate-950 text-sm">7-Tier RBAC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict compartmentalization: Citizen, Officer, Supervisor, Moderator, Auditor, and Superadmin.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60 mb-3">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-slate-950 text-sm">Immutable Audit Logs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Append-only report state history recording every status transition, dispatcher note, and closure photo.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-10 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Section 01</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                1. Authentication & Session Hygiene
              </h2>
              <p>
                All API requests are authenticated using short-lived JSON Web Tokens (JWT) signed with HMAC-SHA256. For administrative roles, multi-factor authentication (MFA) via RFC 6238 time-based one-time passwords (TOTP) is enforced.
              </p>
            </div>

            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Section 02</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                2. Input Sanitization & Media Scrubbing
              </h2>
              <p>
                Uploaded citizen evidence undergoes strict multi-pass processing:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li><strong>Magic Byte Verification:</strong> File types are validated using binary headers, rejecting disguised executables or scripts.</li>
                <li><strong>Pillow Re-Encoding:</strong> Images are decoded to raw bitmaps and re-saved, stripping all EXIF camera metadata and potential payload steganography.</li>
                <li><strong>Size & Ratio Enforced:</strong> Strict 10MB payload thresholds prevent memory exhaustion denial-of-service.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Section 03</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                3. Responsible Vulnerability Disclosure
              </h2>
              <p>
                We welcome independent security reviews. If you discover a vulnerability or security flaw, please report it privately:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:security@civiclens.space"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-xs font-bold text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Report to security@civiclens.space</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
