import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Tag, 
  ShieldCheck,
  CheckCircle2,
  Share2
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  highlight: string;
}

const ARTICLES: Article[] = [
  {
    id: "eliminating-phantom-closures",
    title: "Eliminating Phantom Closures: Why Dual Photographic Proof Replaces Checkbox Governance",
    excerpt: "Why traditional 311 systems fail when closure requires only a manager's click. How mandating before-and-after photographic evidence creates trust between residents and municipal field crews.",
    date: "Sep 18, 2026",
    readTime: "6 min read",
    category: "Civic Accountability",
    author: "Tejas Bhor",
    highlight: "Field Verification Standard"
  },
  {
    id: "zero-shot-nlp-in-civic-triage",
    title: "Zero-Shot NLP in the Field: Routing 24 Municipal Categories Without Keyword Drift",
    excerpt: "How CivicLens implements local HuggingFace BART-MNLI zero-shot inference to classify conversational citizen complaint descriptions into exact departmental queues in under 120ms.",
    date: "Sep 12, 2026",
    readTime: "8 min read",
    category: "Machine Learning",
    author: "Tejas Bhor",
    highlight: "BART Zero-Shot Pipeline"
  },
  {
    id: "offline-first-sqlite-field-crews",
    title: "Designing for Sunlight & Dead Zones: Offline-First Architecture for City Crews",
    excerpt: "Maintenance teams work in underpasses and storm drains where mobile reception drops. An architectural deep-dive into local SQLite mutation queues, optimistic updates, and clean sync reconciliation.",
    date: "Sep 04, 2026",
    readTime: "5 min read",
    category: "Engineering",
    author: "Tejas Bhor",
    highlight: "Field Sync Protocol"
  },
  {
    id: "immutable-audit-trails-in-urban-infra",
    title: "The Case for Immutable Public Audit Trails in Urban Infrastructure",
    excerpt: "When municipal budgets and contractor SLAs rely on repair records, ticket history must be tamper-evident. Why every transition in CivicLens is timestamped and cryptographically auditable.",
    date: "Aug 28, 2026",
    readTime: "7 min read",
    category: "System Design",
    author: "Tejas Bhor",
    highlight: "Audit Trails"
  }
];

export default function Blog() {
  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`CivicLens Dispatch & Blog - ${APP_CONFIG.appName}`}
        description="Engineering essays, architectural deep-dives, and civic tech insights from the CivicLens team."
        keywords="civic tech blog, zero-shot triage, offline sync, municipal reporting, photographic audit"
      />
      <MarketingNav />

      <main className="flex-1">
        {/* ── Page Hero Header ── */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
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
              <span className="text-slate-900 font-semibold">Blog & Dispatch</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>THE CIVICLENS DISPATCH</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">ENGINEERING & ESSAYS</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Inside the technology of <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">public accountability.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Technical essays, architectural decisions, and field notes exploring how machine learning, offline data reconciliation, and radical transparency transform civic systems.
            </p>
          </div>
        </section>

        {/* ── Articles Grid ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8 space-y-10">
          {/* Featured Top Article */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/20 to-white p-8 sm:p-10 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Featured Article
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{ARTICLES[0].date}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{ARTICLES[0].readTime}</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight hover:text-emerald-800 transition-colors">
              {ARTICLES[0].title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {ARTICLES[0].excerpt}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs font-mono text-slate-500">
                By {ARTICLES[0].author} · {ARTICLES[0].category}
              </div>
              <Link
                to={`/docs`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <span>Read in documentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Remaining Articles List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.slice(1).map((art) => (
              <article
                key={art.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-4 shadow-xs hover:border-emerald-400/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{art.category}</span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-950 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">{art.date}</span>
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter / RSS Box */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 text-center space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-950">
              Subscribe to Civic Tech Updates
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              We publish deep dives on civic software, API updates, and machine learning triage benchmarks once a month. No spam.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <span>Get In Touch</span>
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
