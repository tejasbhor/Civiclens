import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  Camera, 
  Server, 
  MapPin, 
  CheckCircle2, 
  Github, 
  FileText,
  Clock,
  Layers
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";

export default function About() {
  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`About - ${APP_CONFIG.appName}`}
        description="Learn why CivicLens was created, our philosophy of civic transparency, and how we eliminate phantom complaint closures."
        keywords="about civiclens, civic transparency, public complaint management, municipal accountability, civic tech"
      />
      <MarketingNav />

      <main className="flex-1">
        {/* ── Page Hero Header ── */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          {/* Ambient Lighting Blooms */}
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

          <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500">
              <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">About</span>
            </nav>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>THE CIVICLENS MISSION</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">ACCOUNTABILITY BY DESIGN</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Public infrastructure should not <br className="hidden sm:inline" />
              rely on <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">phantom closures.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Every day, citizens report broken streetlights, water leaks, and potholes. Too often, tickets sit unattended in bureaucratic silos or get marked "Resolved" without a single tool touching the street. CivicLens creates a single, immutable record shared across residents, field crews, and municipal leadership.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/citizen/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-[box-shadow,transform] duration-150 active:scale-[0.98]"
              >
                <span>Launch Resident Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-colors"
              >
                <Github className="h-4 w-4 text-slate-600" />
                <span>View Architecture</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Problem & Solution Grid ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="rounded-3xl border border-rose-200/80 bg-rose-50/30 p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-100/70 px-3 py-1 rounded-full">
                The Status Quo Problem
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                The Black Hole of Civic Reporting
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Opaque Statuses:</strong> Tickets sit for weeks in ambiguous "Under Review" states with zero ETA.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Phantom Closures:</strong> Tasks marked closed by desk administrators without ground verification.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <span><strong>Duplicate Clutter:</strong> 40 residents reporting the same broken pipe clog department inboxes.</span>
                </li>
              </ul>
            </div>

            {/* The CivicLens Way */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/30 p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                The CivicLens Standard
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Verifiable Public Record
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span><strong>BART Zero-Shot Triage:</strong> Automated categorization in milliseconds without keyword bias.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span><strong>Dual Photographic Proof:</strong> Officers must submit verified before-and-after photos to complete a ticket.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span><strong>Field-First Mobile Sync:</strong> Reliable offline SQLite caching for field crews operating in cellular shadows.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Architecture Pillars ── */}
          <div className="space-y-8 pt-6 border-t border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Core Architectural Principles
              </div>
              <h2 className="font-display text-3xl font-extrabold text-slate-950">
                Engineered for honesty and operational resilience.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">Evidence Before Checkboxes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A checkbox is cheap; asphalt is physical. Tickets cannot be closed without dual photos taken on site by assigned personnel.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">AI Suggests, Humans Decide</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Machine learning accelerates classification and filters duplicates, but municipal officers and residents retain full control and review rights.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">Privacy by Construction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  EXIF metadata is sanitized on the server before storage. GPS coordinates place the issue on the city map without tracking personal citizen identifiers.
                </p>
              </div>
            </div>
          </div>

          {/* ── Builder Note & Independence Statement ── */}
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-8 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                TB
              </div>
              <div>
                <div className="font-display font-bold text-slate-950 text-base">Independent Demonstration Platform</div>
                <div className="text-xs font-mono text-slate-500">Built by Tejas Bhor · Civic Tech Showcase</div>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              CivicLens is an independent open demonstration software project developed to showcase how modern web architecture, local machine learning models, and uncompromising UX can transform civic grievance redressal. It is not affiliated with or commissioned by any governmental authority.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>FastAPI + PostgreSQL</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>React 19 + TypeScript</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Shot Inference</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
