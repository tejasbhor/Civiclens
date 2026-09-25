import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { Eye, CheckCircle2, ShieldCheck, Laptop, Sun, Keyboard, Mail, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/config/appConfig";

export default function AccessibilityStatement() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Accessibility Statement - ${APP_CONFIG.appName}`}
        description={`Our commitment to digital inclusion and WCAG 2.1 AA accessibility across the ${APP_CONFIG.appName} civic platform.`}
        keywords="accessibility statement, WCAG 2.1 AA, digital inclusion, civic tech accessibility, keyboard navigation"
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
              <span className="text-slate-900 font-semibold">Accessibility Statement</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DIGITAL INCLUSION & WCAG 2.1 AA</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">COMMITMENT</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Civic software for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">every citizen.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Public services must be accessible to everyone, regardless of hardware limitations, physical ability, or lighting conditions.
            </p>
          </div>
        </section>

        {/* ── Statement Body ── */}
        <section className="py-14 md:py-20 max-w-4xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-10 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Our Standard</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                WCAG 2.1 Level AA Compliance Target
              </h2>
              <p>
                CivicLens is designed and audited against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA criteria. We integrate automated axe-core scanning and manual keyboard accessibility audits into our development workflow.
              </p>
            </div>

            <div className="space-y-4 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>Accessibility Guarantees</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                Implemented Capabilities
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>Strict Contrast Ratios</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All primary body text maintains at least a 7:1 contrast ratio against background surfaces, exceeding the standard 4.5:1 requirement for outdoor readability.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-emerald-600" />
                    <span>Full Keyboard Navigation</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every interactive element (modal dismissals, tabs, form inputs, sliders) is fully reachable via standard Tab and Shift+Tab navigation with visible focus rings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Respect Reduced Motion</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All 3D perspective transforms and scroll animations automatically disable when your operating system's `prefers-reduced-motion` flag is set.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>ARIA Semantics & Labels</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Screen reader labels and `aria-live` regions communicate ticket status updates, upload states, and modal viewports unambiguously.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Feedback & Barrier Reporting</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                Reporting an Accessibility Barrier
              </h2>
              <p>
                If you encounter any difficulty navigating or reading content on CivicLens with assistive technology, please email us directly with the page URL and browser/screen-reader version:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:accessibility@civiclens.space"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-xs font-bold text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Report Barrier: accessibility@civiclens.space</span>
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
