import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Check, MapPin, Leaf, ChevronDown, AlertTriangle, Wrench } from "lucide-react";
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
    top: "46%",
    left: "55%",
    color: "#f59e0b",
    type: "cone",
  },
  {
    id: "pin-user",
    label: "Pothole Inspection",
    category: "Road Safety",
    top: "52%",
    left: "67%",
    color: "#f97316",
    type: "user",
  },
  {
    id: "pin-main",
    label: "Waterfront Monitoring",
    category: "Civic Safety",
    top: "62%",
    left: "74%",
    color: "#06b6d4",
    type: "main",
  },
  {
    id: "pin-leaf",
    label: "Eco-Park Initiative",
    category: "Greener Cities",
    top: "39%",
    left: "73%",
    color: "#10b981",
    type: "leaf",
  },
];

export function PanoramicHero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [activePin, setActivePin] = useState<GlowingPin>(PINS[2]);
  const rootRef = useRef<HTMLElement>(null);

  // Headline line reveal, background parallax and a magnetic primary CTA.
  // matchMedia keeps all of it off for reduced-motion users and off touch screens where it applies (hover/pointer).
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

  const scrollToNext = () => {
    const el = document.getElementById("metrics-strip") || document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={rootRef} className="relative w-full min-h-[90dvh] lg:min-h-[96dvh] overflow-hidden flex flex-col justify-between select-none bg-slate-50">
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Full-Bleed Panoramic Background Image
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute inset-0 z-0">
        <img
          data-hero-bg
          src="/images/panoramic-hero-city.jpg"
          alt="Panoramic CivicLens city diorama landscape"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          className="w-full h-full object-cover object-[center_right] lg:object-center"
        />

        {/* Dusk grade: cool tint multiplies the daytime photo so dark mode reads as evening, not a dimmed noon */}
        <div className="absolute inset-0 hidden bg-[#0b1f3a]/45 mix-blend-multiply pointer-events-none" />

        {/* Left side text readability scrim */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Top fade from nav */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/60 to-transparent z-10 pointer-events-none" />

        {/* Bottom fade, tall enough to hand off to the page background under the stats card */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent z-10 pointer-events-none" />
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Main Content Container
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="container !px-5 max-w-7xl mx-auto relative z-20 flex-1 flex flex-col justify-center pt-8 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          {/* â”€â”€â”€â”€ LEFT COLUMN: Typography & Actions â”€â”€â”€â”€ */}
          <div className="space-y-6 max-w-xl">
            {/* Eyebrow */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600">
                CLEANER CITIES. BRIGHTER TOMORROWS.
              </span>
            </motion.div>

            {/* Display Headline with custom dual-color "fixed." */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-950 font-display leading-[1.02]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">See it. Report it.</span>
              </span>
              <span className="block overflow-hidden pb-4">
                <span data-hero-line className="block">
                  Get it{" "}
                  <span className="relative inline-block">
                <span className="text-emerald-500 font-extrabold">fi</span>
                <span className="text-amber-500 font-extrabold">xed.</span>
                {/* Organic curved green underline stroke */}
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

            {/* Subhead */}
            <motion.p
              className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
            >
              Residents report issues with photos and location. AI suggests a category and department from the text, staff decide, and officers close each one with before and after photos.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-4 pt-2"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
            >
              <ParticleButton
                onClick={() => navigate("/citizen/login")}
                className="group inline-flex items-center gap-2 px-7 py-3.5 h-auto rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-bold text-sm shadow-xl shadow-slate-900/15 transition-[background-color,box-shadow] duration-[var(--duration-quick)] border-none"
              >
                <span>Report an issue</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </ParticleButton>

              <button
                onClick={scrollToNext}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-slate-900 font-bold text-sm shadow-md shadow-slate-900/5 border border-slate-200/80 backdrop-blur-md transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.97]"
              >
                <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>How it works</span>
              </button>
            </motion.div>
          </div>

          {/* â”€â”€â”€â”€ RIGHT COLUMN: Interactive Floating Cards on Cityscape â”€â”€â”€â”€ */}
          <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px]">
            {/* Modern Glassmorphic 3D Location Pins on the city diorama */}
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
                      className="absolute bottom-full mb-3 whitespace-nowrap rounded-2xl bg-white/85 backdrop-blur-2xl border border-white/60 px-3.5 py-2 text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pin.color }} />
                        <span className="block text-xs font-black text-slate-900 leading-tight">{pin.label}</span>
                      </div>
                      <span className="block text-[11px] font-medium text-slate-500 leading-tight mt-0.5">{pin.category}</span>
                    </motion.div>
                  )}

                  {/* Modern Glassmorphic Pin Capsule */}
                  <motion.div
                    whileHover={{ scale: 1.15, y: -2 }}
                    className={cn(
                      "relative flex items-center justify-center p-1 rounded-2xl backdrop-blur-2xl transition-all duration-300",
                      "bg-white/80 border border-white/70 shadow-[0_10px_25px_-3px_rgba(0,0,0,0.22)]",
                      activePin.id === pin.id && "ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.45)]"
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

                  {/* Ground contact ring: soft elliptical pulse */}
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

            {/* Floating Card 1: Frosted Glass Pothole Report Card (Top-Left/Center) */}
            <motion.div
              className="absolute top-2 left-0 sm:left-4 z-30 w-[260px] sm:w-[290px] p-3.5 rounded-3xl bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-white/70 ring-1 ring-white/30"
              initial={reduce ? false : { opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/images/pothole-road.jpg"
                  alt="Pothole thumbnail"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200/60 shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    Pothole
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">Riverside Ave & 3rd St</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50/90 text-emerald-800 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In progress
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Stage Stepper: Reported -> Routed -> In progress -> Resolved */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-medium text-slate-600">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-1.5 h-1.5" />
                  </span>
                  <span>Reported</span>
                </div>
                <div className="h-[2px] flex-1 bg-emerald-500 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-1.5 h-1.5" />
                  </span>
                  <span>Routed</span>
                </div>
                <div className="h-[2px] flex-1 bg-amber-400 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                  <span className="text-amber-800 font-bold">In progress</span>
                </div>
                <div className="h-[2px] flex-1 bg-slate-200 mx-1 mb-3" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-400" />
                  <span>Resolved</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: Frosted Glass Live Stats Card (Top-Right) */}
            <motion.div
              className="absolute top-0 right-0 z-30 p-3.5 rounded-3xl bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-white/70 ring-1 ring-white/30 hidden sm:flex flex-col gap-2.5 min-w-[170px]"
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
                  <div className="text-[11px] text-slate-600">Awaiting triage</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">Active</div>
                  <div className="text-[11px] text-slate-600">Officer on site</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none">Closed</div>
                  <div className="text-[11px] text-slate-600">With photo evidence</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Frosted Glass Real Solutions Pill (Bottom-Right) */}
            <motion.div
              className="absolute bottom-6 right-0 z-30 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-2xl shadow-xl border border-white/70 ring-1 ring-white/30 flex items-center gap-3"
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
                  for real people.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Bottom Center: SCROLL Indicator
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative z-20 pb-4 flex flex-col items-center justify-center">
        <button
          onClick={scrollToNext}
          className="group flex flex-col items-center gap-1 text-[11px] font-mono tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Scroll down to explore"
        >
          <span>SCROLL</span>
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center group-hover:translate-y-0.5 transition-transform">
            <ChevronDown className="w-3 h-3" />
          </div>
        </button>
      </div>
    </section>
  );
}
