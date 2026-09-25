import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { ShieldCheck, Lock, Eye, FileText, Database, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/config/appConfig";

export default function PrivacyPolicy() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Privacy Policy - ${APP_CONFIG.appName}`}
        description={`Learn how ${APP_CONFIG.appName} handles citizen reports, sanitizes photographic metadata, and protects user privacy.`}
        keywords="privacy policy, civic data protection, municipal reporting privacy, GPS metadata, citizen privacy"
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
              <span className="text-slate-900 font-semibold">Privacy Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DATA PROTECTION & PRIVACY</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">UPDATED {lastUpdated.toUpperCase()}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Privacy by <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">construction.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Public infrastructure tracking does not require citizen surveillance. We collect the minimum data necessary to dispatch repairs and verify road and water fixes.
            </p>
          </div>
        </section>

        {/* ── Policy Content Body ── */}
        <section className="py-14 md:py-20 max-w-4xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-10 text-sm text-slate-700 leading-relaxed">
            {/* Section 1 */}
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Section 01</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                1. Our Civic Privacy Commitment
              </h2>
              <p>
                {APP_CONFIG.appName} is an open demonstration platform for civic defect reporting, automated triage, and photographic closure verification. We believe that public infrastructure records belong to the community, but personal citizen identities must be zealously protected.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Section 02</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                2. Information We Collect & Why
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">Report Details & Photos</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Text descriptions of defects (potholes, drainage, waste) and user-supplied photos uploaded to demonstrate the physical issue.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">GPS Coordinates</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Latitude and longitude captured during submission. We query OpenStreetMap Nominatim solely to resolve coordinates to street and ward boundaries.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">Contact Phone / Email</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Required solely to deliver notification updates when an officer starts work or posts proof of fix. Never shared with advertisers or third parties.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">Field Crew Verification</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Municipal worker department ID, dispatch timestamp, and completion photographs required to maintain public accountability.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Section 03</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                3. Photographic Sanitization & EXIF Stripping
              </h2>
              <p>
                When a photograph is uploaded to CivicLens:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li><strong>EXIF Data Stripped:</strong> Images are re-encoded server-side via Pillow, permanently removing camera serial numbers, lens info, and device hardware hashes.</li>
                <li><strong>No Facial Recognition:</strong> CivicLens does not perform biometrics or face detection on uploaded media.</li>
                <li><strong>Public Anonymity:</strong> Public ticket views display only the defect description, ward name, and photo. Citizen telephone numbers are never published.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Section 04</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                4. Data Retention & Citizen Rights
              </h2>
              <p>
                Since CivicLens is an open demonstration platform, demo data is periodically reset. In production deployments, citizens hold the right to request deletion of their contact records while preserving the anonymized repair history on the civic audit trail.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                For privacy inquiries or deletion requests, contact: <a href="mailto:privacy@civiclens.space" className="text-emerald-700 underline font-bold">privacy@civiclens.space</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
