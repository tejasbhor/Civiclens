import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Leaf,
  Shield,
  Sparkles,
  MapPin,
  Radio,
  Clock,
  CheckCircle2,
  Wrench,
  Navigation,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/animate-ui/primitives/effects/tilt";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";

gsap.registerPlugin(ScrollTrigger);

interface StepMeta {
  step: number;
  label: string;
  tagline: string;
  desc: string;
  color: string;
  accentHex: string;
  glowClass: string;
  badgeBg: string;
  activeBorder: string;
}

const STEPS_META: StepMeta[] = [
  {
    step: 1,
    label: "Report",
    tagline: "Point & Snap",
    desc: "Take a photo, add location and a quick description.",
    color: "emerald",
    accentHex: "#10b981",
    glowClass: "from-emerald-500/20 via-teal-500/10 to-transparent",
    badgeBg: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
    activeBorder: "border-emerald-500 shadow-[0_16px_36px_-8px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/40",
  },
  {
    step: 2,
    label: "Auto-route",
    tagline: "Smart Dispatch",
    desc: "Intelligent triage directs your issue to the right municipal department in seconds.",
    color: "sky",
    accentHex: "#0284c7",
    glowClass: "from-sky-500/20 via-cyan-500/10 to-transparent",
    badgeBg: "bg-sky-500/15 text-sky-800 border-sky-500/30",
    activeBorder: "border-sky-500 shadow-[0_16px_36px_-8px_rgba(2,132,199,0.35)] ring-2 ring-sky-400/40",
  },
  {
    step: 3,
    label: "Track",
    tagline: "Live Telemetry",
    desc: "Follow status changes and notifications, with SLA deadlines tracked by staff.",
    color: "amber",
    accentHex: "#f59e0b",
    glowClass: "from-amber-500/20 via-orange-500/10 to-transparent",
    badgeBg: "bg-amber-500/15 text-amber-800 border-amber-500/30",
    activeBorder: "border-amber-500 shadow-[0_16px_36px_-8px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/40",
  },
  {
    step: 4,
    label: "Get it fixed",
    tagline: "Crew on Site",
    desc: "An officer acknowledges the task, starts work and posts updates.",
    color: "indigo",
    accentHex: "#6366f1",
    glowClass: "from-indigo-500/20 via-purple-500/10 to-transparent",
    badgeBg: "bg-indigo-500/15 text-indigo-800 border-indigo-500/30",
    activeBorder: "border-indigo-500 shadow-[0_16px_36px_-8px_rgba(99,102,241,0.35)] ring-2 ring-indigo-400/40",
  },
  {
    step: 5,
    label: "See impact",
    tagline: "Verified Proof",
    desc: "Officers attach before and after photos to the closure.",
    color: "jade",
    accentHex: "#059669",
    glowClass: "from-emerald-500/25 via-teal-500/15 to-transparent",
    badgeBg: "bg-emerald-500/20 text-emerald-900 border-emerald-500/40",
    activeBorder: "border-emerald-500 shadow-[0_16px_36px_-8px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/50",
  },
];

export function StepJourney() {
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger: locks section and steps 1 -> 2 -> 3 -> 4 -> 5 on scroll
  useEffect(() => {
    if (reduce || !sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        const step = Math.min(5, Math.max(1, Math.floor(self.progress * 5) + 1));
        setActiveStep(step);
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [reduce]);

  const handleStepClick = (step: number) => {
    setActiveStep(step);
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetProgress = (step - 0.5) / 5;
      const totalDistance = rect.height - window.innerHeight;
      if (totalDistance > 0) {
        const targetScroll = scrollTop + rect.top + targetProgress * totalDistance;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  const currentMeta = STEPS_META[activeStep - 1] || STEPS_META[0];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative bg-[#fbfcfd] select-none border-b border-slate-200/80 h-[280vh] lg:h-[300vh]"
    >
      {/* â”€â”€ Dynamic Frosted Ambient Glow responding to active step â”€â”€ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className={cn(
            "absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full blur-[140px] opacity-35 transition-all duration-700 bg-gradient-to-r",
            currentMeta.glowClass
          )}
        />
      </div>

      {/* â”€â”€ Pinned Viewport Container (CSS Sticky â€” no DOM pin-spacer glitches) â”€â”€ */}
      <div className="sticky top-0 h-screen min-h-[640px] max-h-[1080px] flex flex-col justify-center overflow-hidden py-4 sm:py-6 lg:py-8">
        {/* â”€â”€ Soft Panoramic Skyline Background â”€â”€ */}
        <div className="pointer-events-none absolute top-4 right-0 w-[55%] max-w-[720px] h-[380px] z-0 opacity-70 hidden md:block">
          <img
            src="/images/sunrise-skyline.jpg"
            alt="Sunlit city skyline background"
            className="w-full h-full object-cover object-bottom [mask-image:linear-gradient(to_left,black_60%,transparent)]"
          />

          {/* Floating Pill on Skyline */}
          <div className="absolute top-8 right-20 hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-bold text-slate-900">Cleaner cities</div>
              <div className="text-slate-500 text-[10px]">Happier communities</div>
            </div>
          </div>
        </div>

        <div className="container !px-5 max-w-7xl mx-auto relative z-10">
          {/* â”€â”€ Section Header â”€â”€ */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#0d5c4d] bg-white/75 backdrop-blur-md border border-emerald-500/20 shadow-xs mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>HOW IT WORKS</span>
                <span className="ml-1 text-[10px] font-bold text-emerald-700">
                  <ShimmeringText text="Continuous Step-by-Step Flow" className="font-semibold" />
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-950 font-display leading-[1.06]">
                One report. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d]">
                  A cleaner tomorrow.
                </span>
              </h2>
              <p className="mt-2.5 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                From a street photo to a documented fix, every step is written to one status history.
              </p>
            </div>

            {/* Carousel Controls < 1/5 > + Step Tabs */}
            <div className="flex flex-wrap items-center gap-3 lg:self-start lg:mt-6">
              {/* Responsive Quick Navigation Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs">
                {STEPS_META.map((meta) => {
                  const isActive = activeStep === meta.step;
                  return (
                    <button
                      key={meta.step}
                      type="button"
                      onClick={() => handleStepClick(meta.step)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-95 flex items-center gap-1.5",
                        isActive
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-950"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive ? "bg-emerald-400" : "bg-slate-300"
                        )}
                      />
                      <span className="hidden sm:inline">{meta.label}</span>
                      <span className="sm:hidden">{meta.step}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStepClick(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  aria-label="Previous step"
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 transition-colors shadow-xs active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepClick(Math.min(5, activeStep + 1))}
                  disabled={activeStep === 5}
                  aria-label="Next step"
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white/90 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 transition-colors shadow-xs active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* â”€â”€ 5-Step Cards Grid with Animate-UI Tilt & Frosted Glass â”€â”€ */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4 items-stretch relative z-10">
              {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 1: REPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className={cn(
                  "transition-opacity duration-300",
                  activeStep === 1 ? "block" : "hidden lg:block opacity-75 hover:opacity-100"
                )}
              >
                <Tilt maxTilt={8} perspective={900} className="h-full">
                  <div
                    onClick={() => handleStepClick(1)}
                    className={cn(
                      "group relative h-full flex flex-col justify-between rounded-3xl p-5 cursor-pointer backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.99]",
                      "bg-white/80 border border-white/80",
                      activeStep === 1
                        ? "border-emerald-500 shadow-[0_20px_45px_-10px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/40 -translate-y-1.5"
                        : "shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:border-emerald-300/60"
                    )}
                  >
                    {/* Top Step Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              activeStep === 1
                                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            1
                          </span>
                          <div>
                            <h3 className="font-black text-base text-slate-950 font-display leading-none">
                              Report
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                              Point & Snap
                            </span>
                          </div>
                        </div>
                        {activeStep > 1 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-4">
                        Snap a photo. CivicLens automatically captures GPS and telemetry.
                      </p>
                    </div>

                    {/* Smartphone Mockup Frame with Live Scanner Animation */}
                    <div className="relative mx-auto w-full max-w-[170px] h-[195px] rounded-2xl bg-[#09101d] p-1.5 shadow-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
                      {/* Notch */}
                      <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-800 z-20" />

                      {/* Screen with Scanning Beam */}
                      <div className="relative flex-1 rounded-xl overflow-hidden mt-1 bg-slate-950 flex flex-col justify-between p-2">
                        <img
                          src="/images/pothole-road.jpg"
                          alt="Pothole photo on mobile camera"
                          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                        {/* Animated Laser Scanning Line */}
                        {!reduce && activeStep === 1 && (
                          <motion.div
                            animate={{ y: [0, 140, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,1)] z-10"
                          />
                        )}

                        {/* Top HUD: Camera Aperture & GPS */}
                        <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-emerald-300/90 px-1">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            GPS LOCKED
                          </span>
                          <span>1080p</span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold border border-emerald-500/40 shadow-md">
                          <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate">5th Ave & Pine St</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>

              {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 2: AUTO-ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className={cn(
                  "transition-opacity duration-300",
                  activeStep === 2 ? "block" : "hidden lg:block opacity-75 hover:opacity-100"
                )}
              >
                <Tilt maxTilt={8} perspective={900} className="h-full">
                  <div
                    onClick={() => handleStepClick(2)}
                    className={cn(
                      "group relative h-full flex flex-col justify-between rounded-3xl p-5 cursor-pointer backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.99]",
                      "bg-white/80 border border-white/80",
                      activeStep === 2
                        ? "border-sky-500 shadow-[0_20px_45px_-10px_rgba(2,132,199,0.3)] ring-2 ring-sky-400/40 -translate-y-1.5"
                        : "shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:border-sky-300/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              activeStep === 2
                                ? "bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.6)]"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            2
                          </span>
                          <div>
                            <h3 className="font-black text-base text-slate-950 font-display leading-none">
                              Auto-route
                            </h3>
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">
                              AI Dispatch
                            </span>
                          </div>
                        </div>
                        {activeStep > 2 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-4">
                        AI models analyze category, severity, and jurisdiction instantly.
                      </p>
                    </div>

                    {/* Frosted Neural Routing Terminal */}
                    <div className="rounded-2xl border border-sky-200/70 bg-gradient-to-b from-sky-50/80 via-white/80 to-sky-100/60 p-3.5 h-[195px] flex flex-col justify-between shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center shadow-xs border border-sky-500/20">
                          <Shield className="w-4 h-4 fill-current/20" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/15 text-sky-700 border border-sky-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                          98.8% Match
                        </span>
                      </div>

                      {/* Animated Routing Node Flow */}
                      <div className="my-1.5 p-2 rounded-xl bg-white/70 border border-sky-200/50 backdrop-blur-xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium">Target Dept</span>
                          <span className="font-mono text-[9px] text-sky-600 font-bold">#PW-409</span>
                        </div>
                        <div className="text-xs font-black text-slate-950 mt-0.5 truncate">
                          Public Works & Roads
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-sky-200/40">
                        <span className="flex items-center gap-1 font-bold text-sky-600">
                          <Navigation className="w-3 h-3" />
                          Priority Tier 1
                        </span>
                        <span>120ms Latency</span>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>

              {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 3: TRACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className={cn(
                  "transition-opacity duration-300",
                  activeStep === 3 ? "block" : "hidden lg:block opacity-75 hover:opacity-100"
                )}
              >
                <Tilt maxTilt={8} perspective={900} className="h-full">
                  <div
                    onClick={() => handleStepClick(3)}
                    className={cn(
                      "group relative h-full flex flex-col justify-between rounded-3xl p-5 cursor-pointer backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.99]",
                      "bg-white/80 border border-white/80",
                      activeStep === 3
                        ? "border-amber-500 shadow-[0_20px_45px_-10px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/40 -translate-y-1.5"
                        : "shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:border-amber-300/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              activeStep === 3
                                ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            3
                          </span>
                          <div>
                            <h3 className="font-black text-base text-slate-950 font-display leading-none">
                              Track
                            </h3>
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                              Live Status
                            </span>
                          </div>
                        </div>
                        {activeStep > 3 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-4">
                        SLA deadline and assignment checkpoints.
                      </p>
                    </div>

                    {/* Vertical Frosted Glass Telemetry Stepper */}
                    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/70 via-white/80 to-amber-100/50 p-3.5 h-[195px] flex flex-col justify-center shadow-inner">
                      {/* Sub-step 1: Submitted */}
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-extrabold text-slate-950 leading-tight">
                            Logged & Audited
                          </div>
                          <div className="text-[8px] text-slate-500">Today, 10:14 AM</div>
                        </div>
                      </div>

                      {/* Connecting gradient bar */}
                      <div className="w-0.5 h-3.5 bg-gradient-to-b from-emerald-500 to-amber-500 ml-2 my-0.5" />

                      {/* Sub-step 2: In Progress Active */}
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                          <span className="animate-ping absolute h-3.5 w-3.5 rounded-full bg-amber-400/60" />
                          <span className="relative w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-extrabold text-amber-700 leading-tight">
                            In Progress (SLA: 4h)
                          </div>
                          <div className="text-[8px] text-slate-500">Crew en route</div>
                        </div>
                      </div>

                      {/* Connecting inactive bar */}
                      <div className="w-0.5 h-3.5 bg-slate-200 ml-2 my-0.5" />

                      {/* Sub-step 3: Resolution */}
                      <div className="flex items-center gap-2.5 opacity-55">
                        <span className="w-4 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-slate-700 leading-tight">
                            Fix Verified
                          </div>
                          <div className="text-[8px] text-slate-400">Pending photo audit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>

              {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 4: GET IT FIXED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className={cn(
                  "transition-opacity duration-300",
                  activeStep === 4 ? "block" : "hidden lg:block opacity-75 hover:opacity-100"
                )}
              >
                <Tilt maxTilt={8} perspective={900} className="h-full">
                  <div
                    onClick={() => handleStepClick(4)}
                    className={cn(
                      "group relative h-full flex flex-col justify-between rounded-3xl p-5 cursor-pointer backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.99]",
                      "bg-white/80 border border-white/80",
                      activeStep === 4
                        ? "border-indigo-500 shadow-[0_20px_45px_-10px_rgba(99,102,241,0.3)] ring-2 ring-indigo-400/40 -translate-y-1.5"
                        : "shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:border-indigo-300/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              activeStep === 4
                                ? "bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            4
                          </span>
                          <div>
                            <h3 className="font-black text-base text-slate-950 font-display leading-none">
                              Get it fixed
                            </h3>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                              Crew On Site
                            </span>
                          </div>
                        </div>
                        {activeStep > 4 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-4">
                        Officers post progress updates and materials used.
                      </p>
                    </div>

                    {/* Repair Crew Photo Frame with Frosted Badge */}
                    <div className="relative w-full h-[195px] rounded-2xl overflow-hidden shadow-lg group border border-slate-200/80">
                      <img
                        src="/images/road-crew-repair.jpg"
                        alt="Road crew fixing pavement"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-950/80 backdrop-blur-md text-indigo-200 border border-indigo-400/40 shadow-md">
                          <Radio className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                          Unit #14 Active
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                        <span className="font-bold flex items-center gap-1 text-amber-300">
                          <Wrench className="w-3 h-3" />
                          Hot-mix asphalt
                        </span>
                        <span className="font-mono text-[9px] text-slate-300">ETA 35m</span>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>

              {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 5: SEE THE IMPACT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div
                className={cn(
                  "transition-opacity duration-300",
                  activeStep === 5 ? "block" : "hidden lg:block opacity-75 hover:opacity-100"
                )}
              >
                <Tilt maxTilt={8} perspective={900} className="h-full">
                  <div
                    onClick={() => handleStepClick(5)}
                    className={cn(
                      "group relative h-full flex flex-col justify-between rounded-3xl p-5 cursor-pointer backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.99]",
                      "bg-white/80 border border-white/80",
                      activeStep === 5
                        ? "border-emerald-500 shadow-[0_20px_45px_-10px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50 -translate-y-1.5"
                        : "shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:border-emerald-300/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 transition-colors shadow-sm",
                              activeStep === 5
                                ? "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            5
                          </span>
                          <div>
                            <h3 className="font-black text-base text-slate-950 font-display leading-none">
                              See impact
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                              Verified Proof
                            </span>
                          </div>
                        </div>
                        {activeStep === 5 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            <Sparkles className="w-3 h-3 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-4">
                        Before-and-after proof photo posted for neighborhood audit.
                      </p>
                    </div>

                    {/* Resolution Seal Card with Shimmer & Verification Badge */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 via-white/80 to-teal-100/60 p-4 h-[195px] flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                      {/* Ambient corner highlight */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

                      <div className="relative">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/40">
                          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                        </div>
                      </div>

                      <div className="text-xs font-black text-emerald-950 mt-1">
                        Issue Resolved & Verified
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                        Road pavement restored
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                        <span>Proof Hash: #VF-9041</span>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>
            </div>

            {/* Handwritten Note: People Power Progress */}
            <div className="hidden 2xl:block absolute -right-28 top-1/2 -translate-y-1/2 select-none pointer-events-none">
              <div className="font-handwriting text-xl font-bold leading-tight text-emerald-600 rotate-[-2deg]">
                <span>People</span>
                <span className="block">Power</span>
                <span className="block">Progress.</span>
              </div>
              <svg
                viewBox="0 0 60 16"
                fill="none"
                className="w-16 h-4 text-emerald-600 stroke-current stroke-[2] mt-0.5 -rotate-2"
              >
                <path d="M4 6 C20 12, 40 10, 56 4" strokeLinecap="round" />
                <path d="M48 10 L56 4 L50 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* â”€â”€ Bottom Bar: CivicLens branding + 5-step progress bar â”€â”€ */}
          <div className="mt-8 lg:mt-10 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-[#0d5c4d] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="font-black text-sm text-slate-950 font-display">CivicLens</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                CLEANER CITIES. BRIGHTER TOMORROWS.
              </span>
            </div>

            {/* 5-Step Interactive Progress Bar */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((step) => {
                const isCurrent = activeStep === step;
                const isPassed = activeStep > step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleStepClick(step)}
                    aria-label={`Go to step ${step}`}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      isCurrent
                        ? "w-10 bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                        : isPassed
                        ? "w-6 bg-emerald-400/60"
                        : "w-6 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
