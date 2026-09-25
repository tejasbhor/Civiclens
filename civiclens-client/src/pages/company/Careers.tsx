import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Terminal, 
  Code2, 
  Cpu, 
  WifiOff, 
  ShieldCheck, 
  ArrowRight, 
  Github, 
  Mail, 
  Sparkles,
  GitBranch,
  Laptop
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";

export default function Careers() {
  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Careers & Contributors - ${APP_CONFIG.appName}`}
        description="Contribute to CivicLens. We are building open, verifiable civic infrastructure software for real communities."
        keywords="civic tech careers, open source civic software, municipal engineering, fastAPI, react 19, civic engineering"
      />
      <MarketingNav />

      <main className="flex-1">
        {/* ── Page Hero Header ── */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 right-[15%] h-[450px] w-[600px] rounded-full bg-emerald-500/10 blur-[130px]" />
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
              <span className="text-slate-900 font-semibold">Careers & Contributors</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CIVIC ENGINEERING & OPEN SOURCE</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">CONTRIBUTOR NETWORK</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              Build software that impacts <br className="hidden sm:inline" />
              the <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">physical world.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Civic technology is often held back by legacy procurement, sluggish interfaces, and low expectations. We believe public infrastructure deserves the same speed, beauty, and technical rigor as top-tier developer platforms.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="mailto:contact@civiclens.space"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-colors active:scale-[0.98]"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Engineering Team</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-colors"
              >
                <Github className="h-4 w-4 text-slate-600" />
                <span>Browse Repository</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Engineering Challenges Section ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8 space-y-16">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
              Our Hardest Engineering Problems
            </div>
            <h2 className="font-display text-3xl font-extrabold text-slate-950">
              Problems worth solving.
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              We tackle real-world constraints that most consumer web apps never face: intermittent field connectivity, high-volume emergency triage, and strict public accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenge 1 */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950">Offline-First Mobile Sync</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Municipal maintenance crews work in underpasses, rural roads, and storm cellars where 4G/5G drops out. Our SQLite sync layer queues mutations locally and resolves conflicts cleanly once reconnected.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Stack: SQLite · Web Locks API · IndexedDB</span>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950">Zero-Shot Emergency Classification</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Residents describe issues informally ("water spraying near tree"). We leverage local HuggingFace BART-MNLI zero-shot inference to instantly map colloquial sentences to 24 exact municipal departments.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Stack: PyTorch · Transformers · FastAPI</span>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950">Dual Photographic Audit Trails</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Preventing municipal ticket fraud requires enforced dual photographic evidence. We process, hash, and strip EXIF data on ingress while keeping a tamper-evident audit record of work done.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Stack: Pillow · SHA-256 · PostgreSQL</span>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950">High-Craft Accessible UI</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designing for everyone means strict WCAG 2.1 AA contrast, complete keyboard operability, seamless light and dark mode, and high-visibility outdoors in harsh sunlight.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Stack: React 19 · Tailwind CSS · Motion</span>
              </div>
            </div>
          </div>

          {/* ── How to Contribute ── */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/20 p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-950">Get Involved in CivicLens</h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Whether you are an engineer interested in local AI inference, a designer passionate about civic accessibility, or a policy researcher studying municipal grievance redressal, we welcome discussions, issues, and contributions.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-5 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <span>View Good First Issues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-800 transition-colors"
              >
                <span>Submit Evaluation Feedback</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
