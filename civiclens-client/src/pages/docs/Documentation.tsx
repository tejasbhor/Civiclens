import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Copy, 
  BookOpen, 
  User, 
  Wrench, 
  Clock, 
  Terminal, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Search,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Laptop
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";
import { cn } from "@/lib/utils";

const API_HOST = "https://api.civiclens.space";

const SECTIONS = [
  { id: "overview", label: "System Overview", icon: BookOpen, tag: "Architecture" },
  { id: "resident", label: "Reporting an Issue", icon: User, tag: "Citizen Guide" },
  { id: "officer", label: "Field Operations & Offline", icon: Wrench, tag: "Officer Guide" },
  { id: "escalation", label: "Deadlines & Escalations", icon: Clock, tag: "SLA Policy" },
  { id: "api", label: "REST API Reference", icon: Terminal, tag: "Developers" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 text-slate-100 shadow-md">
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
        <span className="font-mono text-xs text-emerald-400 font-bold">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre tabIndex={0} className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

const CREATE_EXAMPLE = `curl -X POST ${API_HOST}/api/v1/reports/ \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Deep pothole causing vehicle damage",
    "description": "About 15 cm deep, middle lane near City Hospital",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "category": "roads"
  }'`;

const STATS_EXAMPLE = `curl ${API_HOST}/api/v1/analytics/public/stats`;

export default function Documentation() {
  const [active, setActive] = useState<SectionId>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const id = window.location.hash.replace("#", "") as SectionId;
    if (SECTIONS.some((s) => s.id === id)) setActive(id);
  }, []);

  const select = (id: SectionId) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  };

  const filteredSections = SECTIONS.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Documentation - ${APP_CONFIG.appName}`}
        description={`Comprehensive documentation for residents, field crews, and developers using ${APP_CONFIG.appName}.`}
        keywords="civiclens docs, citizen reporting guide, municipal officer instructions, civic tech API"
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

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-500">
              <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Documentation</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>KNOWLEDGE BASE & GUIDES</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">V1 SPECIFICATION</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.1] text-balance">
                  The documentation <br className="hidden sm:inline" />
                  for <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">CivicLens.</span>
                </h1>
                <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  Clear specifications for residents filing reports, field officers recording repairs, and developers integrating with our REST API.
                </p>
              </div>

              {/* Quick Search */}
              <div className="w-full md:w-72">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search docs..."
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Documentation Layout ── */}
        <section className="py-12 md:py-16 max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-10 items-start">
            {/* Left Sticky Navigation */}
            <nav aria-label="Documentation sections" className="lg:sticky lg:top-24 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Table of Contents
              </div>
              <ul className="space-y-1 text-xs">
                {filteredSections.length === 0 ? (
                  <li className="px-3 py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="font-semibold text-slate-700">No matching sections</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-1.5 text-[11px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </li>
                ) : (
                  filteredSections.map((s) => {
                    const Icon = s.icon;
                    const isCurrent = active === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => select(s.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-semibold transition-all cursor-pointer",
                            isCurrent
                              ? "bg-[#0a2e2a] text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <Icon className={cn("w-4 h-4 shrink-0", isCurrent ? "text-emerald-400" : "text-slate-400")} />
                          <span className="truncate">{s.label}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>

              <div className="pt-6 mt-6 border-t border-slate-200/80 space-y-2 px-3">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Quick Links
                </div>
                <Link to="/api" className="flex items-center justify-between text-xs text-slate-600 hover:text-emerald-700 py-1">
                  <span>API Interactive Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link to="/guides" className="flex items-center justify-between text-xs text-slate-600 hover:text-emerald-700 py-1">
                  <span>Step-by-Step Playbooks</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link to="/status" className="flex items-center justify-between text-xs text-slate-600 hover:text-emerald-700 py-1">
                  <span>Live System Status</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </nav>

            {/* Right: Content Article */}
            <article className="min-w-0 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
              {active === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    Architecture & Flow
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-950">
                    How CivicLens Works
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    CivicLens coordinates the entire lifecycle of a municipal complaint through an automated, audit-logged pipeline. By decoupling citizen reporting from department assignment via machine learning triage, complaints bypass traditional bureaucratic backlogs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose pt-2">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>1. Resident Submission</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Resident uploads report with text, landmark, and GPS coordinates. Images have camera hardware tags removed server-side.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>2. Zero-Shot Triage</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Local BART-MNLI model scores urgency and routes ticket to the appropriate department with an SLA target time.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>3. Ground Dispatch & Sync</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Field officer acknowledges assignment on mobile tablet. Works offline in cellular dead zones with SQLite caching.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>4. Dual-Photo Closure</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Officer uploads verified completion photo. Resident is alerted and prompted to verify the resolved condition.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {active === "resident" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    Citizen Reporting Guide
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-950">
                    Submitting & Tracking a Report
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Filing a report takes under 60 seconds. Follow these guidelines to ensure the fastest field response from municipal teams:
                  </p>

                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
                        <span>Frame Surrounding Landmarks</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Step back 5–10 paces when photographing potholes or leaks. Capturing street signs, building numbers, or distinctive curbs allows field officers to locate the problem quickly without searching.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
                        <span>Grant Accurate GPS Permission</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        CivicLens queries OpenStreetMap Nominatim strictly to reverse-geocode your coordinates into street names. We never track your personal live location.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
                        <span>Track Live Status via Dashboard</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Once submitted, your ticket enters the immutable record. You can watch timestamped status changes from "Under Review" to "In Progress" with the assigned crew ID.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {active === "officer" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    Field Team Guide
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-950">
                    Field Operations & Offline Synchronization
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The CivicLens field portal is engineered for high-glare sunlight and intermittent mobile coverage.
                  </p>

                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-950">Acknowledge → Start Work → Complete</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Upon receiving a dispatch, tap "Acknowledge" to confirm receipt. When arriving at the site, tap "Start Work" to record your on-site arrival timestamp. Once the repair is done, take a verified resolution photo to mark closure.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-950">Cellular Dead Zone Caching</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        If working in a tunnel, underpass, or basement with zero reception, your tablet automatically saves all actions to local SQLite. A persistent offline badge informs you of queued sync operations.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <h3 className="font-bold text-slate-950">Holds and Department Escalations</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        If a repair requires specialized equipment (e.g., asphalt steamroller or high-voltage linesman), officers can submit a "Put on Hold" request with reason notes for administrative review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {active === "escalation" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    SLA Guarantee Policy
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-950">
                    Deadlines & Escalation Protocols
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To prevent tickets from stalling indefinitely, CivicLens enforces tiered resolution windows based on the AI-determined severity classification:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-100 font-mono text-slate-700 font-bold uppercase">
                        <tr>
                          <th className="p-3 border-b">Severity Tier</th>
                          <th className="p-3 border-b">Target SLA</th>
                          <th className="p-3 border-b">Escalation Trigger</th>
                          <th className="p-3 border-b">Action Taken</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr>
                          <td className="p-3 font-bold text-rose-700">Critical Emergency</td>
                          <td className="p-3 font-mono">12 Hours</td>
                          <td className="p-3 font-mono">8 Hours Idle</td>
                          <td className="p-3">Automated SMS to Ward Supervisor</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-amber-700">High Priority</td>
                          <td className="p-3 font-mono">24 Hours</td>
                          <td className="p-3 font-mono">18 Hours Idle</td>
                          <td className="p-3">Re-assignment alert on Nodal Dashboard</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-800">Medium Routine</td>
                          <td className="p-3 font-mono">48 Hours</td>
                          <td className="p-3 font-mono">36 Hours Idle</td>
                          <td className="p-3">Queue reprioritization</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-600">Low Scheduled</td>
                          <td className="p-3 font-mono">7 Days</td>
                          <td className="p-3 font-mono">5 Days Idle</td>
                          <td className="p-3">Weekly dispatch review</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {active === "api" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    REST API Reference
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-950">
                    Developer API Integration
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The CivicLens REST API is JSON over HTTPS located at <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-emerald-800 font-bold">{API_HOST}/api/v1</code>.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 mb-2">1. Submit Civic Issue Report</h3>
                      <CodeBlock label="POST /api/v1/reports/" code={CREATE_EXAMPLE} />
                      <p className="text-xs text-slate-500 mt-2 font-mono">
                        Accepts JSON payload with latitude, longitude, description, and optional photo file.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 mb-2">2. Query Public City Analytics</h3>
                      <CodeBlock label="GET /api/v1/analytics/public/stats" code={STATS_EXAMPLE} />
                      <p className="text-xs text-slate-500 mt-2 font-mono">
                        Public endpoint requiring zero authentication. Returns resolution ratios and SLA stats.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Need full OpenAPI interactive schema?</span>
                      <Link
                        to="/api"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        <span>Open Interactive API Playground</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
