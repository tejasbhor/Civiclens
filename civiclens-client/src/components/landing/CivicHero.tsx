import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Play, 
  Check, 
  MapPin, 
  Leaf, 
  ChevronDown, 
  AlertTriangle, 
  Wrench,
  HardHat,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ParticleButton } from "@/components/kokonutui/particle-button";

gsap.registerPlugin(ScrollTrigger);

interface GlowingPin {
  id: string;
  label: string;
  category: string;
  top: string;
  left: string;
  color: string;
  type: "cone" | "user" | "main" | "leaf";
}

const PINS: GlowingPin[] = [
  {
    id: "pin-cone",
    label: "Bridge Maintenance",
    category: "Traffic & Works",
    top: "28%",
    left: "58%",
    color: "#f59e0b",
    type: "cone",
  },
  {
    id: "pin-user",
    label: "Pothole Inspection",
    category: "Road Safety",
    top: "56%",
    left: "48%",
    color: "#f97316",
    type: "user",
  },
  {
    id: "pin-main",
    label: "Waterfront Monitoring",
    category: "Civic Safety",
    top: "70%",
    left: "80%",
    color: "#06b6d4",
    type: "main",
  },
  {
    id: "pin-leaf",
    label: "Eco-Park Initiative",
    category: "Greener Cities",
    top: "24%",
    left: "86%",
    color: "#10b981",
    type: "leaf",
  },
];

export function CivicHero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [activePin, setActivePin] = useState<GlowingPin>(PINS[1]);
  const rootRef = useRef<HTMLElement>(null);

  // Parallax and headline reveal
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-line]", { yPercent: 115, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.1 });
      gsap.fromTo(
        "[data-hero-bg]",
        { scale: 1.12, yPercent: 0 },
        { scale: 1.12, yPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } },
      );
    });
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const btn = root.querySelector<HTMLElement>("[data-magnetic]");
      if (!btn) return;
      const x = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      const y = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.25);
        y((e.clientY - (r.top + r.height / 2)) * 0.25);
      };
      const leave = () => { x(0); y(0); };
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerleave", leave);
      return () => {
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  }, []);

  const scrollToMetrics = () => {
    const el = document.getElementById("metrics-strip");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
      ref={rootRef} 
      id="overview"
      className="relative w-full min-h-[90dvh] lg:min-h-[96dvh] overflow-hidden flex flex-col justify-between select-none bg-slate-50"
      aria-label="CivicLens platform overview"
    >
      {/* ─────────────────────────────────────────────────────────────
          Full-Bleed Panoramic Background Image with Natural Feathered Scrim
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          data-hero-bg
          src="/images/panoramic-hero-city.jpg"
          alt="Panoramic CivicLens city diorama landscape"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          className="w-full h-full object-cover object-[center_right] lg:object-center"
        />

        {/* Feathered soft white gradient positioned only where needed behind the text */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[60%] lg:w-[52%] bg-gradient-to-r from-white/95 via-white/75 to-transparent z-10 pointer-events-none" />

        {/* Soft radial white light behind text to ensure crisp contrast without any harsh borders */}
        <div className="absolute top-1/4 left-0 w-[540px] h-[540px] bg-white/70 rounded-full blur-[70px] pointer-events-none z-10" />

        {/* Top fade from nav */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/80 to-transparent z-10 pointer-events-none" />

        {/* Bottom fade into standalone metrics section */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Main Hero Grid Container — Fluid, Unboxed & Natural
          ───────────────────────────────────────────────────────────── */}
      <div className="container !px-5 max-w-7xl mx-auto relative z-20 flex-1 flex flex-col justify-center pt-8 pb-10 lg:pt-12 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 items-center">
          
          {/* ──── LEFT COLUMN: Clean, Unboxed Narrative ──── */}
          <div className="space-y-6 max-w-xl">
            
            {/* Live Status Eyebrow Pill */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-800 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Civic Accountability Platform</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">Live Interactive Demo</span>
              </div>
            </motion.div>

            {/* Display Headline with Signature Dual-Color Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-slate-950 font-display leading-[1.04]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">Every civic complaint,</span>
              </span>
              <span className="block overflow-hidden pb-4">
                <span data-hero-line className="block">
                  tracked to{" "}
                  <span className="relative inline-block">
                    <span className="text-emerald-600 font-extrabold">clo</span>
                    <span className="text-amber-500 font-extrabold">sure.</span>
                    <svg
                      viewBox="0 0 140 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute -bottom-1.5 left-0 w-full h-3 text-emerald-500/90"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 13 C35 3, 95 3, 137 11"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </span>
            </h1>

            {/* Apple-style Outcome-First Paragraph */}
            <motion.p
              className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
            >
              Spot a problem on your street and report it in seconds. CivicLens automatically routes the issue to the right field crew, keeps you updated at every stage, and confirms every resolution with verified photo proof.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-3.5 pt-1"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
            >
              <ParticleButton
                onClick={() => navigate("/citizen/login")}
                className="group inline-flex items-center gap-2 px-6 py-3.5 h-auto rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-bold text-sm shadow-xl shadow-slate-900/15 transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.98] border-none"
              >
                <span>Launch Resident Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </ParticleButton>

              <button
                onClick={() => navigate("/officer/login")}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-sm shadow-sm border border-slate-200/90 backdrop-blur-md transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.98]"
              >
                <HardHat className="w-4 h-4 text-amber-500" />
                <span>Officer View</span>
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-full hover:bg-slate-100/90 text-slate-700 font-semibold text-sm transition-colors active:scale-[0.98]"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Play className="w-2 h-2 fill-current ml-0.5" />
                </div>
                <span>How it works</span>
              </button>
            </motion.div>

            {/* Transparent Disclaimer */}
            <motion.div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 border border-slate-200/70 text-xs text-slate-600 shadow-2xs backdrop-blur-sm"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Independent demo using simulated civic data. No government affiliation.</span>
            </motion.div>

            {/* Apple Outcome Highlights */}
            <motion.div 
              className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-3 w-full max-w-lg"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
            >
              <div>
                <span className="block text-sm font-black font-display text-slate-950">Instant Triage</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-snug">Routes to the right crew automatically</span>
              </div>
              <div>
                <span className="block text-sm font-black font-display text-slate-950">Zero Duplicates</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-snug">Clusters nearby reports to prevent repeat trips</span>
              </div>
              <div>
                <span className="block text-sm font-black font-display text-slate-950">Photo Verified</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-snug">Every repair proven with before & after photos</span>
              </div>
            </motion.div>

          </div>

          {/* ──── RIGHT COLUMN: Interactive Cityscape with Well-Spaced Pins & Cards ──── */}
          <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px]">
            {/* Modern Glassmorphic 3D Location Pins - Spaced Across the Diorama */}
            {PINS.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setActivePin(pin)}
                className="absolute z-20 group -translate-x-1/2 -translate-y-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={{ top: pin.top, left: pin.left }}
                aria-label={pin.label}
                aria-pressed={activePin.id === pin.id}
              >
                <div className="relative flex flex-col items-center">
                  {/* Callout for the active pin */}
                  {activePin.id === pin.id && (
                    <motion.div
                      key={pin.id}
                      initial={reduce ? false : { opacity: 0, y: 6, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute bottom-full mb-3 whitespace-nowrap rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 px-3.5 py-2 text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/50 z-30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pin.color }} />
                        <span className="block text-xs font-black text-slate-900 leading-tight">{pin.label}</span>
                      </div>
                      <span className="block text-[11px] font-medium text-slate-600 leading-tight mt-0.5">{pin.category}</span>
                    </motion.div>
                  )}

                  {/* Glassmorphic Pin Capsule */}
                  <motion.div
                    whileHover={{ scale: 1.15, y: -2 }}
                    className={cn(
                      "relative flex items-center justify-center p-1 rounded-2xl backdrop-blur-2xl transition-all duration-300",
                      "bg-white/90 border border-white/80 shadow-[0_10px_25px_-3px_rgba(0,0,0,0.22)]",
                      activePin.id === pin.id && "ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                    )}
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-white shadow-md transition-transform"
                      style={{
                        backgroundColor: pin.color,
                        boxShadow: `0 0 16px ${pin.color}99`,
                      }}
                    >
                      {pin.type === "cone" && <AlertTriangle className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />}
                      {pin.type === "user" && <Wrench className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />}
                      {pin.type === "main" && <MapPin className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />}
                      {pin.type === "leaf" && <Leaf className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />}
                    </span>
                  </motion.div>

                  {/* Ground contact ring */}
                  <motion.span
                    aria-hidden="true"
                    className="mt-1 h-2 w-7 rounded-[50%] border-2"
                    style={{ borderColor: pin.color, backgroundColor: `${pin.color}33` }}
                    animate={reduce ? undefined : { scale: [1, 1.8], opacity: [0.85, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: "easeOut" }}
                  />
                </div>
              </button>
            ))}

            {/* Floating Card 1: Frosted Glass Ticket Lifecycle Card (Top-Left) */}
            <motion.div
              className="absolute -top-2 left-0 sm:left-2 z-30 w-[270px] sm:w-[300px] p-4 rounded-3xl bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-white/80 ring-1 ring-white/40"
              initial={reduce ? false : { opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/images/pothole-road.jpg"
                  alt="Pothole verification thumbnail"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-950 truncate">Pothole Repair</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">#CIV-8492</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">MG Road & 4th Cross</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In progress
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Stage Stepper: Reported -> Routed -> In progress -> Resolved */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-600">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-1.5 h-1.5" />
                  </span>
                  <span className="text-[10px]">Reported</span>
                </div>
                <div className="h-[2px] flex-1 bg-emerald-500 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-1.5 h-1.5" />
                  </span>
                  <span className="text-[10px]">Routed</span>
                </div>
                <div className="h-[2px] flex-1 bg-amber-400 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                  <span className="text-amber-800 font-bold text-[10px]">In progress</span>
                </div>
                <div className="h-[2px] flex-1 bg-slate-200 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-400" />
                  <span className="text-[10px]">Resolved</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: Frosted Glass Live Triage Card (Top-Right) */}
            <motion.div
              className="absolute top-4 right-0 z-30 p-3.5 rounded-3xl bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-white/80 ring-1 ring-white/40 hidden sm:flex flex-col gap-2.5 min-w-[170px]"
              initial={reduce ? false : { opacity: 0, x: 16, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">New</div>
                  <div className="text-[11px] text-slate-600">Assigned in seconds</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">Active</div>
                  <div className="text-[11px] text-slate-600">Crew on site</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">Closed</div>
                  <div className="text-[11px] text-slate-600">Photo-verified</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Frosted Glass Verified Solutions Pill (Bottom-Right) */}
            <motion.div
              className="absolute bottom-6 right-2 z-30 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-2xl shadow-xl border border-white/80 ring-1 ring-white/40 flex items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-none">
                  Real solutions
                </div>
                <div className="text-[11px] text-slate-600 leading-none mt-1">
                  for real communities.
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Bottom Center: SCROLL Indicator to Architecture Section
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 pb-4 flex flex-col items-center justify-center">
        <button
          onClick={scrollToMetrics}
          className="group flex flex-col items-center gap-1 text-[11px] font-mono tracking-widest text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
          aria-label="Scroll down to architecture metrics"
        >
          <span>EXPLORE ARCHITECTURE</span>
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center group-hover:translate-y-0.5 transition-transform bg-white/80 shadow-2xs">
            <ChevronDown className="w-3 h-3" />
          </div>
        </button>
      </div>
    </section>
  );
}
