import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Github, 
  ArrowRight, 
  FileText, 
  Clock, 
  HelpCircle,
  Activity
} from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SEO } from "@/components/SEO";
import { APP_CONFIG } from "@/config/appConfig";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "evaluation",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 600);
    }
  };

  return (
    <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20">
      <SEO
        title={`Contact & Feedback - ${APP_CONFIG.appName}`}
        description="Get in touch with the CivicLens team for demonstration feedback, deployment inquiries, or technical questions."
        keywords="contact civiclens, municipal demo inquiry, civic tech feedback, report issue"
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
              <span className="text-slate-900 font-semibold">Contact</span>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>COMMUNICATION & INQUIRIES</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">DIRECT OUTREACH</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08] text-balance">
              We welcome <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">feedback & inquiries.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Evaluating CivicLens for municipal infrastructure, curious about our local AI classification pipeline, or found a bug in the demo sandbox? Send us a message below.
            </p>
          </div>
        </section>

        {/* ── Contact Body ── */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            {/* Left: Form */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-slate-950 mb-2">
                Send a Message
              </h2>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                Fill out the form below. We typically respond within 24–48 hours.
              </p>

              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-950">Thank you for reaching out!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    Your message has been received. If your request is regarding a demonstration sandbox or civic deployment evaluation, our team will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs font-bold text-emerald-700 underline"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                      Work / Personal Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@citygov.org"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all bg-white"
                    >
                      <option value="evaluation">Municipal Pilot & Demonstration Inquiry</option>
                      <option value="technical">Architecture & Machine Learning Question</option>
                      <option value="bug">Demo Platform Bug Report</option>
                      <option value="other">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your question or feedback..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] disabled:opacity-70 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Transmit Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Direct Information & Links */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="font-display text-lg font-bold text-slate-950">
                  Direct Communication
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For formal security disclosures, code repository audits, or municipal research queries:
                </p>

                <div className="space-y-3 pt-2 text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <a href="mailto:contact@civiclens.space" className="underline hover:text-emerald-700">
                      contact@civiclens.space
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Github className="w-4 h-4 text-emerald-700" />
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="underline hover:text-emerald-700">
                      github.com/tejasbhor/civiclens
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <Link to="/status" className="underline hover:text-emerald-700">
                      Live Telemetry & Status
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/30 p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-900 uppercase">
                  <HelpCircle className="w-4 h-4" />
                  <span>Evaluation FAQ</span>
                </div>
                <h4 className="font-display text-sm font-bold text-slate-900">
                  Is CivicLens an official municipal portal?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. CivicLens is an independent demonstration product created to demonstrate modern civic architecture and photographic verification. It is not affiliated with any city council.
                </p>
                <div className="pt-2">
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Read Help Center Documentation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
