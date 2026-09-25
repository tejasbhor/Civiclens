import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  User, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  Camera, 
  Smartphone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileCheck,
  Building2
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";
import { cn } from "@/lib/utils";

const GUIDES = [
  {
    id: "resident-quickstart",
    title: "Citizen 2-Minute Reporting Playbook",
    role: "For Residents",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "How to photograph and submit civic defects for immediate municipal triage.",
    steps: [
      {
        title: "Step 1: Frame the Defect with Surrounding Context",
        detail: "Avoid extreme close-ups of a crack. Take two steps back so nearby curbs, shopfronts, or lamp posts are visible. This helps ground teams pinpoint the location without asking for clarification."
      },
      {
        title: "Step 2: Permit GPS Location Capture",
        detail: "Allow browser geolocation when prompted. CivicLens automatically matches coordinates with OpenStreetMap street boundaries to ensure accurate ward assignment."
      },
      {
        title: "Step 3: Track Real-Time Status in the Portal",
        detail: "Your report creates a permanent ticket with a tracking ID. You will receive progress notifications when the task is acknowledged, work commences, and closure photos are posted."
      }
    ]
  },
  {
    id: "officer-field-ops",
    title: "Field Officer Task Resolution & Offline Playbook",
    role: "For Field Crews",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Step-by-step field execution guidelines from dispatch acknowledgment to verified closure.",
    steps: [
      {
        title: "Step 1: Acknowledge Assignment",
        detail: "Upon receiving a work ticket, tap 'Acknowledge' in the officer mobile portal. This updates the citizen tracking timeline and confirms the issue is scheduled."
      },
      {
        title: "Step 2: On-Site Arrival & 'Start Work'",
        detail: "When you arrive at the incident location, tap 'Start Work'. The system logs your arrival timestamp and locks the ticket into active repair status."
      },
      {
        title: "Step 3: Capture Dual-Photo Verification",
        detail: "After completing the physical repair, capture a clear resolution photo from the same perspective as the original report. Tickets cannot be closed without verified photographic proof."
      }
    ]
  },
  {
    id: "admin-triage-sop",
    title: "Municipal Administrator SLA & Triage Playbook",
    role: "For City Administrators",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Guidelines for supervising automated triage, handling hold requests, and monitoring ward SLAs.",
    steps: [
      {
        title: "Step 1: Supervise BART-MNLI Zero-Shot Suggestions",
        detail: "Review AI classification confidence scores on the Admin Dashboard. Human dispatchers retain 100% authority to override department routing or adjust severity tiers."
      },
      {
        title: "Step 2: Manage Equipment Hold Requests",
        detail: "When an officer flags a repair for missing heavy machinery, review the 'Put on Hold' petition and allocate appropriate contractors or materials."
      },
      {
        title: "Step 3: Review Audit Trail & Escalations",
        detail: "Monitor automated escalation queues for tickets nearing SLA deadlines. All status edits, re-assignments, and closures are permanently logged in the audit ledger."
      }
    ]
  }
];

export default function Guides() {
  const [activeGuide, setActiveGuide] = useState(0);

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Guides & Playbooks - ${APP_CONFIG.appName}`}
        description="Comprehensive operational guides for citizens, field officers, and city administrators using CivicLens."
        keywords="civiclens guides, citizen reporting playbook, field officer tutorial, municipal SLA management"
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

          <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500">
              <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Guides & Playbooks</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OPERATIONAL PLAYBOOKS</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">BEST PRACTICES</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Practical guides for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">every stakeholder.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Step-by-step playbooks detailing how citizens submit unambiguous reports, how field crews resolve tickets offline, and how municipal leadership maintains accountability.
            </p>
          </div>
        </section>

        {/* ── Guides Interactive Switcher & Content ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
          {/* Guide Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GUIDES.map((g, idx) => {
              const isSelected = activeGuide === idx;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGuide(idx)}
                  className={cn(
                    "p-5 rounded-2xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-white shadow-md ring-1 ring-emerald-500/30"
                      : "border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300"
                  )}
                >
                  <span className={cn("text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border", g.badgeColor)}>
                    {g.role}
                  </span>
                  <div className="font-display text-sm font-bold text-slate-950 mt-2.5 leading-snug">
                    {g.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Guide Content */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <span className={cn("text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border", GUIDES[activeGuide].badgeColor)}>
                {GUIDES[activeGuide].role}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3">
                {GUIDES[activeGuide].title}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {GUIDES[activeGuide].description}
              </p>
            </div>

            <div className="space-y-6">
              {GUIDES[activeGuide].steps.map((step, idx) => (
                <div key={step.title} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <span className="w-8 h-8 rounded-xl bg-[#0a2e2a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Guide Footer Callout */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Want to test these workflows in the live sandbox environment?
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/citizen/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-5 py-2 text-xs font-bold text-white transition-colors"
                >
                  <span>Launch Live Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition-colors"
                >
                  <span>Documentation</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
