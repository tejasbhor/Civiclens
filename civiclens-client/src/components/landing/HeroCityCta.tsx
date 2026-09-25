import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin, Sparkles, CheckCircle2, Play, HardHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HandwrittenAnnotation } from "./HandwrittenDoodle";
import { APP_CONFIG } from "@/config/appConfig";
import { ParticleButton } from "@/components/kokonutui/particle-button";

export function HeroCityCta() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="cta" className="relative bg-[#f8fafc] py-16 sm:py-24 lg:py-28 border-t border-slate-200/80">
      <div className="container !px-4 sm:!px-6 max-w-7xl mx-auto">
        
        {/* ── High-End Contained Dark Bento CTA Console ── */}
        <div className="relative rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-[#021814] text-white border border-emerald-500/25 shadow-[0_25px_60px_-15px_rgba(2,24,20,0.35)] ring-1 ring-white/10 p-8 sm:p-12 lg:p-16">
          
          {/* Background Night Skyline with Curated Radiance */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/images/night-city-skyline.jpg"
              alt="Illuminated night city skyline with glowing cable bridge"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-[center_35%] opacity-40 transition-transform duration-1000 scale-[1.03]"
            />
            {/* Directional scrims: deep contrast on left for copy, subtle bridge glow on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#021814] via-[#021814]/90 sm:via-[#021814]/80 to-[#021814]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021814] via-transparent to-[#021814]/60" />

            {/* Ambient emerald & amber radiance */}
            <div
              className="absolute inset-0 mix-blend-screen opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 45%, rgba(16, 185, 129, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
              }}
            />

            {/* Subtle civic blueprint coordinate grid */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #34d399 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* ── Main 2-Column Conversion Layout ── */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
            
            {/* ──── LEFT COLUMN: Compelling CTA Narrative ──── */}
            <div className="space-y-6 max-w-xl">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>READY TO TRANSFORM YOUR CITY?</span>
                <span className="text-emerald-700">•</span>
                <span className="text-white font-mono text-[10px] font-bold">PUBLIC DEMO</span>
              </div>

              {/* Headline with Signature Gradient */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white font-display leading-[1.04]">
                  Be the change <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                    in your neighborhood.
                  </span>
                </h2>
                
                {/* Handwritten annotation */}
                <div className="pt-1">
                  <HandwrittenAnnotation
                    text="Zero friction."
                    subtext="Instant interactive access."
                    color="text-amber-300"
                    arrowDirection="down-right"
                    className="rotate-[1deg] drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
                  />
                </div>
              </div>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                From broken streetlights to dangerous road defects — experience how automated AI triage and mandatory photo proof deliver verified civic accountability.
              </p>

              {/* Trust & Transparency Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Photo Proof</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Automated Triage</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Live GPS Tracking</span>
                </div>
              </div>

            </div>

            {/* ──── RIGHT COLUMN: Dual-Portal Launchpad Cards ──── */}
            <div className="flex flex-col gap-4">
              
              {/* Portal Card 1: Resident / Citizen Experience */}
              <div className="group relative rounded-2xl border border-emerald-500/35 bg-gradient-to-b from-emerald-950/60 to-[#021e19]/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl transition-all duration-200 hover:border-emerald-400/70 hover:shadow-emerald-950/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">RESIDENT PORTAL</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">Report & Track an Issue</h3>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/50 border border-emerald-500/30">
                    Live Demo
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Submit an issue in plain English, preview instant NLP classification, and watch the verified progress timeline.
                </p>

                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">No sign-up required</span>
                  <ParticleButton
                    onClick={() => navigate("/citizen/login")}
                    className="group/btn inline-flex items-center gap-2 px-5 py-2.5 h-auto rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-900/40 transition-[background-color,transform] active:scale-[0.98]"
                  >
                    <span>Launch Resident View</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </ParticleButton>
                </div>
              </div>

              {/* Portal Card 2: Field Operations & Officer Console */}
              <div className="group relative rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-6 shadow-xl transition-all duration-200 hover:border-amber-400/40 hover:bg-white/[0.09]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">OFFICER CONSOLE</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">Field Crew & Dispatch</h3>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/50 border border-amber-500/30">
                    Operations
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Review assigned department queues, inspect road defects, and upload before/after photos to complete tickets.
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Dual-photo enforcement</span>
                  <button
                    onClick={() => navigate("/officer/login")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-md transition-[background-color,transform] active:scale-[0.98]"
                  >
                    <HardHat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Launch Officer View</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* ── Bottom Reassurance & Navigation Strip ── */}
          <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Demonstration project with preloaded mock municipal tickets and active GPS map.</span>
            </div>
            
            <button
              onClick={scrollToHowItWorks}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors group cursor-pointer"
            >
              <span>Review Step-by-Step Lifecycle</span>
              <Play className="w-3 h-3 fill-current ml-0.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
