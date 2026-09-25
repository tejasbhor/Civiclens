import { motion } from "motion/react";
import { ArrowRight, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HandwrittenAnnotation } from "./HandwrittenDoodle";

const FAQS = [
  {
    q: "Is CivicLens free to use?",
    a: "Yes, for residents reporting community issues, CivicLens is completely free to use via web or mobile browser with no account fee or subscription required.",
  },
  {
    q: "What types of issues can I report?",
    a: "You can report potholes, road fractures, streetlighting outages, broken water mains, trash overflow, park damage, traffic signal faults, and other public infrastructure hazards.",
  },
  {
    q: "How long does resolution take?",
    a: "CivicLens is a demonstration project with no live city behind it, so there are no real resolution times. In the product, each category and severity carries an SLA deadline that staff can see and that escalates when missed.",
  },
  {
    q: "Will I get updates on my report?",
    a: "Yes. Notifications tell you when your report changes status, and the status history shows every step, including the before and after photos attached at closure.",
  },
  {
    q: "How do you work with city governments?",
    a: "It does not. CivicLens is an independent project by one developer and has no government partners or customers. The admin side shows how a department could review, assign and escalate work.",
  },
];

export function FAQ() {
  return (
    <section id="faqs" className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-[#fbfcfd] border-b border-slate-200/80">
      {/* ── Soft Ambient Knowledge Network & Conversational Geometry (Unique to FAQ) ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute top-1/4 left-10 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(2,132,199,0.12) 0%, transparent 70%)" }}
        />

        {/* Subtle geometric conversational network lines on top-right (NO repeated city skyline) */}
        <svg className="absolute top-8 right-12 w-80 h-44 opacity-25 hidden md:block" viewBox="0 0 320 180" fill="none">
          <circle cx="160" cy="90" r="64" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="160" cy="90" r="100" stroke="#0284c7" strokeWidth="1" strokeDasharray="6 6" opacity="0.6" />
          <circle cx="160" cy="90" r="3.5" fill="#059669" />
          <circle cx="224" cy="90" r="4" fill="#0284c7" />
          <circle cx="96" cy="90" r="3" fill="#059669" />
          <circle cx="160" cy="26" r="3" fill="#10b981" />
          <path d="M96 90 H224" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M160 26 V154" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="container !px-5 max-w-7xl mx-auto relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16 items-start">
          {/* Left Column: Heading & Comprehensive Support / Transparency Card */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#0d5c4d] bg-white/90 backdrop-blur-md border border-emerald-500/20 shadow-xs mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>HELP & TRANSPARENCY</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-mono text-[10px] font-bold">FAQ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
                Common questions.
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-md">
                Everything you need to know about reporting, tracking, and resolution accountability on CivicLens.
              </p>
            </div>

            {/* Quick-Help Support Card with Zero Dead Whitespace */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-sm space-y-5 max-w-md">
              <div className="flex items-center gap-2.5 text-slate-900 font-display font-bold text-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>Need deeper technical details?</span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                CivicLens is a fully verifiable civic tech demonstration. Inspect our open-source codebase, architecture specs, or test the interactive resident simulation.
              </p>

              {/* Guarantees list filling vertical space with high-value proof */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Open-source architecture & transparent SLA rules</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Zero personal telemetry tracked or commercialized</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Cryptographic before & after photographic audit trail</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href="/documentation"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <span>Architecture Docs</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
                <a
                  href="#overview"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span>Interactive Demo</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clean Accordion + Handwritten Scribble */}
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl px-6 py-1 shadow-xs transition-[border-color,box-shadow,background-color] duration-200 hover:border-emerald-500/30 data-[state=open]:border-emerald-500/50 data-[state=open]:bg-white data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left font-bold text-sm sm:text-base hover:no-underline py-4 text-slate-900 font-display">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pb-4 pt-1">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Handwritten scribble on bottom-right */}
            <div className="flex justify-end pt-2 pr-2">
              <HandwrittenAnnotation
                text="Better cities"
                subtext="are possible."
                color="text-amber-500"
                arrowDirection="curved-left"
                className="rotate-[-2deg] drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
