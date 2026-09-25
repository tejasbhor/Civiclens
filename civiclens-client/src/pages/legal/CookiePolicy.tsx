import { useState } from "react";
import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { Cookie, Settings, ShieldCheck, Check, Trash2, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/config/appConfig";

export default function CookiePolicy() {
  const lastUpdated = "September 21, 2026";
  const [cleared, setCleared] = useState(false);

  const clearPreferences = () => {
    localStorage.removeItem("civiclens_cookie_consent");
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Cookie Policy - ${APP_CONFIG.appName}`}
        description={`Learn about the minimal storage tokens used by ${APP_CONFIG.appName} for authentication and session preferences.`}
        keywords="cookie policy, local storage, session tokens, civic web storage, privacy settings"
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
              <span className="text-slate-900 font-semibold">Cookie Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>STORAGE & TRACKING TRANSPARENCY</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">UPDATED {lastUpdated.toUpperCase()}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Zero third-party <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">advertising cookies.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              We use minimal browser storage strictly necessary to maintain your login session and preserve theme preferences.
            </p>
          </div>
        </section>

        {/* ── Cookie Policy Body ── */}
        <section className="py-14 md:py-20 max-w-4xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-10 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-3 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Cookie className="w-4 h-4 text-emerald-600" />
                <span>Section 01</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                1. What Storage Technologies We Use
              </h2>
              <p>
                CivicLens uses HTML5 `localStorage` and `sessionStorage` rather than traditional invasive tracking cookies. We do not load third-party ad pixels, cross-site trackers, or commercial profiling cookies.
              </p>
            </div>

            <div className="space-y-4 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Section 02</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                2. Storage Item Inventory
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 font-mono text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3 border-b">Key Name</th>
                      <th className="p-3 border-b">Purpose</th>
                      <th className="p-3 border-b">Type</th>
                      <th className="p-3 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-900">token</td>
                      <td className="p-3">JWT bearer token for authenticated citizen/officer requests</td>
                      <td className="p-3 font-mono">localStorage</td>
                      <td className="p-3">Session validity (7 days)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-900">theme</td>
                      <td className="p-3">Remembers light/dark visual mode preference</td>
                      <td className="p-3 font-mono">localStorage</td>
                      <td className="p-3">Persistent until cleared</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-900">civiclens_cookie_consent</td>
                      <td className="p-3">Records that you have acknowledged storage usage</td>
                      <td className="p-3 font-mono">localStorage</td>
                      <td className="p-3">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Section 03</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                3. Manage Your Local Storage
              </h2>
              <p>
                You can reset your consent preference at any time with the button below:
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearPreferences}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs transition-colors cursor-pointer"
                >
                  {cleared ? <Check className="w-4 h-4 text-emerald-600" /> : <Trash2 className="w-4 h-4 text-rose-500" />}
                  <span>{cleared ? "Consent Cleared!" : "Reset Storage Preferences"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
