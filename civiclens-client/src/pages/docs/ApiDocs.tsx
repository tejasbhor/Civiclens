import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Key, 
  Server, 
  Code2, 
  Layers, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";
import { cn } from "@/lib/utils";

const API_BASE = "https://api.civiclens.space/api/v1";

interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  authRequired: boolean;
  requestSnippet: string;
  responseSnippet: string;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/reports/",
    summary: "Submit a new citizen civic issue report with coordinates and optional photo",
    authRequired: true,
    requestSnippet: `curl -X POST ${API_BASE}/reports/ \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Severe road defect in left lane",
    "description": "Deep asphalt fracture creating a hazard for 2-wheelers near Metro Pillar 42.",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "category": "roads"
  }'`,
    responseSnippet: `{
  "id": "rep_948a2bc1",
  "ticket_number": "CIV-8492",
  "title": "Severe road defect in left lane",
  "category": "roads",
  "urgency_score": 0.89,
  "department_id": "dept_public_works",
  "status": "triaged",
  "created_at": "2026-09-21T05:20:00Z"
}`
  },
  {
    method: "GET",
    path: "/reports/{id}",
    summary: "Retrieve immutable report history, current dispatch crew, and photographic audit",
    authRequired: false,
    requestSnippet: `curl -X GET ${API_BASE}/reports/rep_948a2bc1`,
    responseSnippet: `{
  "ticket_number": "CIV-8492",
  "status": "in_progress",
  "department": "Public Works & Transportation",
  "assigned_officer_id": "off_441",
  "sla_deadline": "2026-09-22T05:20:00Z",
  "timeline": [
    { "status": "submitted", "timestamp": "2026-09-21T05:20:00Z" },
    { "status": "triaged", "timestamp": "2026-09-21T05:20:01Z", "ai_score": 0.89 },
    { "status": "dispatched", "timestamp": "2026-09-21T05:32:15Z" }
  ]
}`
  },
  {
    method: "GET",
    path: "/analytics/public/stats",
    summary: "Public city-wide telemetry: resolution rates, average SLA latency, and active reports",
    authRequired: false,
    requestSnippet: `curl -X GET ${API_BASE}/analytics/public/stats`,
    responseSnippet: `{
  "total_reports": 1420,
  "resolved_reports": 1340,
  "resolution_rate_percentage": 94.4,
  "avg_resolution_hours": 18.2,
  "active_field_crews": 38,
  "system_status": "operational"
}`
  }
];

export default function ApiDocs() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`REST API Documentation - ${APP_CONFIG.appName}`}
        description="Integrate with CivicLens via our public REST API. Endpoints, authentication, and JSON schema."
        keywords="civiclens API, civic REST API, municipal reporting API, civic tech developers"
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
              <span className="text-slate-900 font-semibold">API Documentation</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DEVELOPER REST API</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">V1 ENDPOINTS</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Programmatic access to <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">civic records.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Integrate external 311 systems, mobile dispatch tools, and civic analytics dashboards directly with the CivicLens FastAPI backend.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500">
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                Base URL: <strong className="text-emerald-700">{API_BASE}</strong>
              </span>
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                Format: <strong className="text-slate-800">JSON over HTTPS</strong>
              </span>
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                Auth: <strong className="text-slate-800">Bearer JWT</strong>
              </span>
            </div>
          </div>
        </section>

        {/* ── Endpoints List ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="space-y-10">
            {ENDPOINTS.map((ep, idx) => (
              <div
                key={ep.path + ep.method}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6"
              >
                {/* Method & Path Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider",
                        ep.method === "POST" && "bg-emerald-100 text-emerald-800 border border-emerald-300",
                        ep.method === "GET" && "bg-sky-100 text-sky-800 border border-sky-300"
                      )}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-900">
                      {ep.path}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {ep.authRequired ? "Bearer JWT Required" : "Public Endpoint"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {ep.summary}
                </p>

                {/* Request Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Example Request:</span>
                    <button
                      type="button"
                      onClick={() => copyCode(ep.requestSnippet, idx)}
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 cursor-pointer font-bold"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? "Copied" : "Copy cURL"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{ep.requestSnippet}</code>
                  </pre>
                </div>

                {/* Response Snippet */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-500">
                    Response JSON (200 OK):
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-50 text-slate-800 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-200">
                    <code>{ep.responseSnippet}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Sandbox Link */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/30 p-8 text-center space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-950">
              Test Live Endpoints Against the Backend
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Verify live latency and API responses directly from your browser via our System Status telemetry page.
            </p>
            <div>
              <Link
                to="/status"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <span>Check Live API Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
