import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home, FileText, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { APP_CONFIG } from "@/config/appConfig";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`404 - Record Not Located | ${APP_CONFIG.appName}`}
        description="The requested route or record could not be found on the CivicLens civic infrastructure network."
        noindex={true}
      />
      <MarketingNav />

      <main className="flex-1 flex items-center justify-center py-20 px-5 sm:px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/08 blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-mono font-semibold text-slate-600 shadow-xs mb-6">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>HTTP 404</span>
            <span className="text-slate-300">•</span>
            <span>UNRESOLVED_ROUTE</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Record not located.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            The path <code className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">{location.pathname}</code> does not exist on this municipal node or has been relocated.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-2.5 text-xs font-bold text-white transition-[background-color,transform] active:scale-[0.98] shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
            <Link
              to="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-700 transition-[background-color,transform] active:scale-[0.98] shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Knowledge Base</span>
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/80 flex items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <Link to="/status" className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>System Status</span>
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-emerald-700 transition-colors">
              Report Broken Route
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default NotFound;
