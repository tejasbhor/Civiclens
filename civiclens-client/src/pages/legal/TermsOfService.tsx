import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { Scale, AlertTriangle, FileCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/config/appConfig";

export default function TermsOfService() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Terms of Service - ${APP_CONFIG.appName}`}
        description={`Official Terms of Service governing the use of ${APP_CONFIG.appName} for citizen reporting and officer task execution.`}
        keywords="terms of service, civic terms, municipal report agreement, citizen reporting rules"
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
              <span className="text-slate-900 font-semibold">Terms of Service</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LEGAL OPERATING FRAMEWORK</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">UPDATED {lastUpdated.toUpperCase()}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Terms of <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">service.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Rules and expectations governing the use of the CivicLens demonstration software platform for citizens, officers, and administrators.
            </p>
          </div>
        </section>

        {/* ── Terms Content Body ── */}
        <section className="py-14 md:py-20 max-w-4xl mx-auto px-5 sm:px-8 space-y-8">
          {/* Emergency Notice Banner */}
          <div className="p-6 rounded-3xl border border-amber-300 bg-amber-50/60 text-amber-950 flex items-start gap-4 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm">
              <p className="font-bold text-amber-950 font-display">Not for Life-Threatening Emergencies</p>
              <p className="text-amber-800 leading-relaxed">
                CivicLens is an asynchronous municipal infrastructure maintenance software system. For active structure fires, violent crime, or life-threatening medical crises, dial your local emergency services (e.g. <a href="tel:112" className="underline font-bold text-amber-950">112</a> / <a href="tel:911" className="underline font-bold text-amber-950">911</a>) immediately.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-10 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Section 01</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or testing {APP_CONFIG.appName}, you agree to abide by these Terms of Service. If you do not agree to these terms, do not submit reports or upload media to the platform.
              </p>
            </div>

            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Section 02</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                2. Acceptable Use Policy
              </h2>
              <p>Users agree that all submissions must reflect genuine physical civic defects:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li><strong>No Fraudulent Uploads:</strong> Do not upload staged or unrelated imagery to create synthetic backlogs.</li>
                <li><strong>Respectful Communication:</strong> Abusive or harassing descriptions directed at municipal workers will be flagged and removed.</li>
                <li><strong>No Commercial Solicitation:</strong> Do not submit marketing or promotional materials through report forms.</li>
              </ul>
            </div>

            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Section 03</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                3. Independent Demonstration Disclaimer
              </h2>
              <p>
                CivicLens is an independent demonstration software platform created by Tejas Bhor to demonstrate modern technical architecture and photographic verification in civic tech. It is not an officially commissioned service of any local municipal corporation. Submissions made within this demo environment do not generate real municipal dispatch workorders.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Section 04</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                4. Modifications to Service
              </h2>
              <p>
                We reserve the right to modify, reset, or upgrade the demonstration database and API endpoints as development and performance benchmarking continue.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                Questions? Contact legal inquiries at: <a href="mailto:contact@civiclens.space" className="text-emerald-700 underline font-bold">contact@civiclens.space</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
