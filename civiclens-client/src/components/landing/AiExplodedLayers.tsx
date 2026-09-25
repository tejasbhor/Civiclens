import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  Layers,
  Leaf,
  MapPin,
  Play,
  Route,
  Sparkles,
  Zap,
  X,
  ShieldCheck,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";

gsap.registerPlugin(ScrollTrigger);

interface FeatureCard {
  id: number;
  icon: typeof Eye;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: 0,
    icon: Eye,
    title: "Understands the issue",
    subtitle: "Plain text · Natural triage",
    badge: "Layer 01 • Smart Triage",
    description: "Residents describe the problem in their own words. CivicLens interprets the text to instantly assign the right category and municipal department without cumbersome menus.",
  },
  {
    id: 1,
    icon: Layers,
    title: "Maps context & coordinates",
    subtitle: "GPS location · Duplicate guard",
    badge: "Layer 02 • Context Awareness",
    description: "Pinpoints exact coordinates and automatically groups matching reports nearby, saving municipal crews from redundant trips to the same issue.",
  },
  {
    id: 2,
    icon: Route,
    title: "Dispatches to the ground",
    subtitle: "Assigned crew · Mobile queue",
    badge: "Layer 03 • Direct Routing",
    description: "Sends the work order directly to the assigned beat officer's mobile queue with offline support, ensuring zero downtime in cellular dead zones.",
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Guarantees verified proof",
    subtitle: "Photo evidence · Citizen trust",
    badge: "Layer 04 • Verified Outcome",
    description: "Tickets cannot be closed with a mere checkbox. Officers must upload timestamped before-and-after photos, notifying the resident the moment it is fixed.",
  },
];

const STATS = [
  { icon: Zap, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/80", value: "Instant", label: "Automated triage & routing" },
  { icon: Sparkles, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200/80", value: "Zero", label: "Lost or unassigned reports" },
  { icon: CheckCircle2, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200/80", value: "100%", label: "Photo-verified closures" },
  { icon: Smartphone, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200/80", value: "Offline", label: "Reliable field sync" },
];

const LAYER_LABELS = [
  { id: 0, title: "Intelligent Triage", tag: "Layer 01" },
  { id: 1, title: "Context & Duplicates", tag: "Layer 02" },
  { id: 2, title: "Field Dispatch", tag: "Layer 03" },
  { id: 3, title: "Verified Proof", tag: "Layer 04" },
];

export function AiExplodedLayers() {
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVideoModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVideoModalOpen]);

  // Mouse tilt physics for spatial depth
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 12);
    mouseY.set(y * -12);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Explosion state: true once the section reaches the top of the viewport
  const [isExploded, setIsExploded] = useState(false);

  // ScrollTrigger: locks section at top of viewport and scrubs layers 0 -> 1 -> 2 -> 3
  useEffect(() => {
    if (reduceMotion || !sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onEnter: () => {
        setIsExploded(true);
      },
      onLeaveBack: () => {
        setIsExploded(false);
        setActiveLayer(0);
      },
      onUpdate: (self) => {
        if (self.progress > 0.02) {
          setIsExploded(true);
          const step = Math.min(3, Math.max(0, Math.floor(self.progress * 4)));
          setActiveLayer(step);
        } else {
          setIsExploded(false);
          setActiveLayer(0);
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [reduceMotion]);

  const handleLayerSelect = (id: number) => {
    setActiveLayer(id);
    setIsExploded(true);
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetProgress = (id + 0.5) / 4;
      const totalDistance = rect.height - window.innerHeight;
      if (totalDistance > 0) {
        const targetScroll = scrollTop + rect.top + targetProgress * totalDistance;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  // ── Complete Interactive Simulation Scenarios ──
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const SIMULATION_SCENARIOS = [
    {
      title: "Road Defect / Pothole",
      icon: Route,
      image: "/images/pothole-road.jpg",
      text: "Deep hazardous pothole right in the middle lane of Oak Avenue causing vehicles to swerve dangerously into oncoming traffic.",
      dept: "Public Works & Transportation",
      category: "Road Infrastructure · High Severity",
      confidence: "97.4%",
      sla: "24 Hours (Tier 1 Priority)",
      dispatch: "Unit #14 Rapid Asphalt Crew · Beat 4",
      verification: "Mandatory Before & After Dual Photographic Audit",
      reticle: "ASPHALT_FRACTURE_180mm",
      coords: "37.7749° N, 122.4194° W",
    },
    {
      title: "Streetlight Outage",
      icon: Zap,
      image: "/images/night-city-skyline.jpg",
      text: "Streetlight pole #88 outside the community center has been dark for 3 nights, creating severe visibility risks for pedestrians.",
      dept: "Municipal Electrical Services",
      category: "Public Lighting · Medium Severity",
      confidence: "96.2%",
      sla: "48 Hours (Tier 2 Priority)",
      dispatch: "Electrical Maintenance Unit B · Ward 2",
      verification: "Night Illumination LUX Verification Photo",
      reticle: "LUMINAIRE_CIRCUIT_FAILURE",
      coords: "37.7833° N, 122.4167° W",
    },
    {
      title: "Water Main Sidewalk Leak",
      icon: Sparkles,
      image: "/images/repaired-road.jpg",
      text: "Clean pressurized water bubbling through sidewalk curb seam on Elm St, flooding walkway and causing pressure drop in buildings.",
      dept: "Water & Sewage Authority",
      category: "Hydraulic Utilities · Emergency",
      confidence: "98.9%",
      sla: "12 Hours (Emergency Dispatch)",
      dispatch: "Emergency Hydraulic Fleet · Ward 4",
      verification: "Pressure Valve Seal & Repaving Verification",
      reticle: "HYDRAULIC_SURFACE_SURGE",
      coords: "37.7690° N, 122.4467° W",
    },
  ];

  const currentScenario = SIMULATION_SCENARIOS[activeScenarioIndex];

  const handleScenarioSwitch = (index: number) => {
    setIsSimulating(true);
    setActiveScenarioIndex(index);
    setTimeout(() => {
      setIsSimulating(false);
    }, 320);
  };

  return (
    <section
      ref={sectionRef}
      id="ai-engine"
      className="relative bg-[#fbfcfd] text-slate-900 select-none border-b border-slate-200/80 h-[260vh] lg:h-[280vh]"
    >
      {/* ── Light Atmospheric Background Blooms matching StepJourney ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-[-5%] h-[600px] w-[800px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute top-1/2 left-[-10%] h-[550px] w-[700px] rounded-full bg-teal-500/08 blur-[150px]" />
        <div className="absolute bottom-10 right-[15%] h-[400px] w-[500px] rounded-full bg-sky-500/08 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* ── Pinned Viewport Container (Locks section at top of viewport) ── */}
      <div className="sticky top-0 h-screen min-h-[640px] max-h-[1080px] flex flex-col justify-center overflow-hidden py-4 sm:py-6 lg:py-8">
        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-12">
          {/* ── Main 3-Column Tightened Layout ── */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.25fr_1.2fr] lg:gap-8 xl:gap-10">
            
            {/* ══════════════════════════════════════════════════════
                01 LEFT COLUMN — Story, Actions & Capability Matrix
                ══════════════════════════════════════════════════════ */}
            <div className="space-y-6 xl:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>INTELLIGENT CIVIC TRIAGE</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-emerald-700 font-bold">AUTOMATED WORKFLOW</span>
              </div>

              {/* Headline */}
              <h2 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-slate-950 text-balance sm:text-5xl lg:text-5xl xl:text-6xl">
                The intelligence <br />
                behind <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d] bg-clip-text text-transparent">every resolution.</span>
              </h2>

              {/* Subhead paragraph */}
              <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                From the moment a resident spots an issue, CivicLens understands the context, alerts the right municipal crew, and follows through until the fix is proven with photos.
              </p>

              {/* Interactive CTA buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#stakeholders"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-[#0a2e2a] hover:bg-[#072421] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-[box-shadow,transform] duration-150 active:scale-[0.98]"
                >
                  <span>See the workflow</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-full border border-slate-200/90 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white transition-transform duration-200 group-hover:scale-105 shadow-xs">
                    <Play className="ml-0.5 h-3 w-3 fill-current" aria-hidden="true" />
                  </span>
                  <span>Interactive preview</span>
                </button>
              </div>

              {/* ── System Capability Matrix (Sleek Horizontal Badges) ── */}
              <div className="border-t border-slate-200/80 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Core Triage Guarantees
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full font-bold">
                    SYSTEM SLA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STATS.map(({ icon: Icon, color, bg, border, value, label }) => (
                    <div
                      key={label}
                      className="group relative flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2.5 shadow-xs transition-all duration-200 hover:border-emerald-400/60 hover:bg-white hover:shadow-sm"
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105", bg, border)}>
                        <Icon className={cn("h-4 w-4", color)} strokeWidth={2.2} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                          {value}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium leading-snug truncate mt-0.5">
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                02 CENTER COLUMN — 3D Exploded Isometric Stack
                ══════════════════════════════════════════════════════ */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] w-full"
            >
              {/* Mobile Tab Switcher (< 1024px) */}
              <div className="flex lg:hidden items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 p-1.5 shadow-sm mb-6 z-30">
                {LAYER_LABELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLayerSelect(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                      activeLayer === item.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* ── 3D Spatial Canvas Stage ── */}
              <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[560px] aspect-square flex items-center justify-center">
                {/* Floating HUD Card Above Top Layer */}
                <motion.div
                  initial={false}
                  animate={{
                    y: !isExploded ? 12 : (activeLayer === 0 ? -8 : 0),
                    scale: !isExploded ? 0.95 : (activeLayer === 0 ? 1.04 : 0.98),
                    opacity: !isExploded ? 0 : (activeLayer === 0 ? 1 : 0.9),
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="absolute top-2 sm:top-4 z-40 flex flex-col items-center"
                >
                  <div className="group relative flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 sm:p-3 pr-5 shadow-[0_20px_45px_-10px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300">
                    <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src="/images/pothole-road.jpg"
                        alt="Detected road defect"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Smart Ingest</span>
                      </div>
                      <div className="font-display text-sm font-bold text-slate-950">Road Defect Classified</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="text-emerald-700 font-semibold">High Priority</span>
                        <span>·</span>
                        <span>Ward 4 Beat</span>
                      </div>
                    </div>

                    <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="relative h-14 sm:h-18 w-px bg-gradient-to-b from-emerald-500 to-transparent">
                    <motion.div
                      animate={{ y: [0, 50, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-[-2px] top-0 h-2 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    />
                  </div>
                </motion.div>

                {/* 3D Transform Container with Mouse Tilt */}
                <motion.div
                  style={{
                    perspective: 1400,
                    rotateX: springY,
                    rotateY: springX,
                  }}
                  className="relative h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] lg:h-[420px] lg:w-[420px] flex items-center justify-center"
                >
                  <div
                    className="relative h-full w-full [transform-style:preserve-3d] [transform:rotateX(56deg)_rotateZ(-36deg)] transition-transform duration-500"
                  >
                    {/* LAYER 04 (BOTTOM): Verified Outcome Foundation */}
                    <motion.div
                      animate={{
                        z: !isExploded ? -18 : (activeLayer === 3 ? -95 : -115),
                        scale: !isExploded ? 0.97 : (activeLayer === 3 ? 1.05 : 1),
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 24 }}
                      onClick={() => handleLayerSelect(3)}
                      className={cn(
                        "absolute inset-0 cursor-pointer rounded-[2.5rem] border-2 transition-all duration-300",
                        activeLayer === 3 && isExploded
                          ? "border-amber-400 shadow-[0_20px_45px_rgba(245,158,11,0.25)] ring-2 ring-amber-300/60"
                          : "border-slate-200 shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:border-amber-400/60"
                      )}
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                      }}
                    >
                      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full p-4" aria-hidden="true">
                        <circle cx="150" cy="150" r="100" fill="rgba(245,158,11,0.08)" />
                        <circle cx="150" cy="150" r="70" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
                        <circle cx="150" cy="150" r="40" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.9" />
                        <path d="M50 150 H250 M150 50 V250" stroke="#f59e0b" strokeWidth="1" opacity="0.2" />
                      </svg>
                      <div className="absolute bottom-4 left-5 text-[10px] font-mono tracking-widest text-amber-800 font-bold">
                        LAYER 04 // VERIFIED OUTCOME
                      </div>
                    </motion.div>

                    {/* LAYER 03: Field Dispatch */}
                    <motion.div
                      animate={{
                        z: !isExploded ? -6 : (activeLayer === 2 ? -25 : -45),
                        scale: !isExploded ? 0.98 : (activeLayer === 2 ? 1.05 : 1),
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 24 }}
                      onClick={() => handleLayerSelect(2)}
                      className={cn(
                        "absolute inset-0 cursor-pointer rounded-[2.5rem] border-2 transition-all duration-300",
                        activeLayer === 2 && isExploded
                          ? "border-indigo-400 shadow-[0_20px_45px_rgba(99,102,241,0.25)] ring-2 ring-indigo-300/60"
                          : "border-slate-200 shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:border-indigo-400/60"
                      )}
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)",
                      }}
                    >
                      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full p-4" aria-hidden="true">
                        <path d="M40 220 C100 120, 200 240, 260 80" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />
                        <circle cx="260" cy="80" r="7" fill="#4f46e5" />
                        <circle cx="40" cy="220" r="5" fill="#6366f1" />
                      </svg>
                      <div className="absolute bottom-4 left-5 text-[10px] font-mono tracking-widest text-indigo-800 font-bold">
                        LAYER 03 // FIELD DISPATCH
                      </div>
                    </motion.div>

                    {/* LAYER 02: Context & Duplicates */}
                    <motion.div
                      animate={{
                        z: !isExploded ? 6 : (activeLayer === 1 ? 45 : 25),
                        scale: !isExploded ? 0.99 : (activeLayer === 1 ? 1.05 : 1),
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 24 }}
                      onClick={() => handleLayerSelect(1)}
                      className={cn(
                        "absolute inset-0 cursor-pointer rounded-[2.5rem] border-2 transition-all duration-300",
                        activeLayer === 1 && isExploded
                          ? "border-teal-500 shadow-[0_20px_45px_rgba(20,184,166,0.25)] ring-2 ring-teal-300/60"
                          : "border-slate-200 shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:border-teal-500/60"
                      )}
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
                      }}
                    >
                      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full p-4" aria-hidden="true">
                        <circle cx="150" cy="150" r="80" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.5" />
                        <circle cx="150" cy="150" r="45" fill="rgba(20,184,166,0.12)" stroke="#14b8a6" strokeWidth="2" />
                        <circle cx="150" cy="150" r="6" fill="#0d9488" />
                      </svg>
                      <div className="absolute bottom-4 left-5 text-[10px] font-mono tracking-widest text-teal-800 font-bold">
                        LAYER 02 // CONTEXT & DUPLICATES
                      </div>
                    </motion.div>

                    {/* LAYER 01 (TOP): Intelligent Triage Scanner */}
                    <motion.div
                      animate={{
                        z: !isExploded ? 18 : (activeLayer === 0 ? 115 : 95),
                        scale: !isExploded ? 1 : (activeLayer === 0 ? 1.05 : 1),
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 24 }}
                      onClick={() => handleLayerSelect(0)}
                      className={cn(
                        "absolute inset-0 cursor-pointer rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden",
                        activeLayer === 0 && isExploded
                          ? "border-emerald-500 shadow-[0_25px_50px_rgba(16,185,129,0.3)] ring-2 ring-emerald-300/60"
                          : "border-slate-200 shadow-[0_20px_45px_rgba(15,23,42,0.1)] hover:border-emerald-500/60"
                      )}
                      style={{
                        background: "#ffffff",
                      }}
                    >
                      <div className="absolute inset-0 bg-[#f8fafc]">
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)`,
                            backgroundSize: "8px 8px",
                          }}
                        />

                        {/* Photorealistic Pothole Cutout Embedded in Center */}
                        <div className="absolute left-1/2 top-1/2 h-24 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-slate-300 shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
                          <img
                            src="/images/pothole-road.jpg"
                            alt="Road defect"
                            className="h-full w-full object-cover brightness-95 contrast-110"
                          />
                        </div>

                        {/* Cyan Hexagonal Reticle Targeting the Defect */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg viewBox="0 0 160 160" className="h-44 w-44">
                            <motion.circle
                              r={35}
                              animate={{ r: [35, 60], opacity: [0.8, 0] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                              cx="80"
                              cy="80"
                              fill="none"
                              stroke="#059669"
                              strokeWidth="1.5"
                            />
                            <polygon
                              points="80,25 125,50 125,110 80,135 35,110 35,50"
                              fill="rgba(16, 185, 129, 0.1)"
                              stroke="#059669"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>

                        <div className="absolute bottom-4 left-5 text-[10px] font-mono tracking-widest text-emerald-800 font-bold">
                          LAYER 01 // INTELLIGENT ISSUE TRIAGE
                        </div>
                      </div>

                      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-emerald-500/10 via-transparent to-white/40 pointer-events-none" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                03 RIGHT COLUMN — 4 Outcome Cards with Aligned Layer Pointers
                ══════════════════════════════════════════════════════ */}
            <div className="relative flex flex-col gap-3.5">
              <div className="pointer-events-none mb-1 self-start lg:self-end select-none">
                <div className="font-handwriting text-2xl font-bold leading-tight text-emerald-700 -rotate-3 sm:text-3xl">
                  <span>From</span>
                  <span className="block">Report</span>
                  <span className="block">to Resolution.</span>
                </div>
              </div>

              {/* 4 Interactive Feature Cards with Perfectly Aligned Layer Pointers */}
              <div className="relative flex flex-col gap-3.5">
                {/* Continuous glowing vertical rail line connecting all 4 node circles */}
                <div className="absolute left-[7px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-emerald-500 via-teal-500 to-amber-500/50 hidden lg:block pointer-events-none z-0" />

                {FEATURES.map(({ id, icon: Icon, title, subtitle, badge, description }) => {
                  const isActive = activeLayer === id;
                  const layerLabel = LAYER_LABELS[id];
                  return (
                    <div key={title} className="relative flex items-center group/row">
                      {/* Integrated Pointer Node (Always 100% vertically aligned with this card) */}
                      <button
                        type="button"
                        onClick={() => handleLayerSelect(id)}
                        onMouseEnter={() => handleLayerSelect(id)}
                        className="hidden lg:flex items-center gap-2 pr-3 z-10 cursor-pointer select-none shrink-0"
                        aria-label={`Select ${layerLabel.title}`}
                      >
                        {/* Node circle on the vertical rail */}
                        <span
                          className={cn(
                            "relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0 bg-white",
                            isActive
                              ? "border-emerald-500 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] ring-2 ring-emerald-300/50"
                              : "border-slate-300 hover:border-emerald-400"
                          )}
                        >
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>

                        {/* Tag */}
                        <span
                          className={cn(
                            "text-[10px] uppercase font-mono font-bold tracking-wider transition-colors whitespace-nowrap",
                            isActive ? "text-emerald-800 font-extrabold" : "text-slate-400 group-hover/row:text-slate-700"
                          )}
                        >
                          {layerLabel.tag}
                        </span>

                        {/* Horizontal pointer line pointing directly into the card */}
                        <div
                          className={cn(
                            "h-[2px] w-3.5 xl:w-5 rounded-full transition-all duration-300",
                            isActive
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                              : "bg-slate-200 group-hover/row:bg-slate-300"
                          )}
                        />
                      </button>

                      {/* Individual Feature Card (Unmerged, independent, interactive) */}
                      <motion.div
                        onClick={() => handleLayerSelect(id)}
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={cn(
                          "flex-1 cursor-pointer rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 relative",
                          isActive
                            ? "border-emerald-500 bg-white shadow-[0_12px_32px_-8px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/30"
                            : "border-slate-200/80 bg-white/80 shadow-xs hover:border-emerald-400 hover:bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3.5">
                          <span
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 mt-0.5",
                              isActive
                                ? "border-emerald-300 bg-emerald-500/15 text-emerald-700 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-emerald-400/40 group-hover:text-emerald-700"
                            )}
                          >
                            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3
                                className={cn(
                                  "font-display text-sm sm:text-[15px] font-bold transition-colors truncate",
                                  isActive ? "text-slate-950 font-extrabold" : "text-slate-800 group-hover:text-slate-950"
                                )}
                              >
                                {title}
                              </h3>
                              {isActive && (
                                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300/80 shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium truncate">{subtitle}</p>
                            {isActive && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2"
                              >
                                {description}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Complete Interactive AI Triage & Routing Simulator Modal ── */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="simulator-modal-title"
              className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl text-slate-900 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">AI TRIAGE ENGINE</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">BART-Large Zero-Shot</span>
                    </div>
                    <h3 id="simulator-modal-title" className="font-display text-lg sm:text-xl font-bold text-slate-950">
                      Live Incident Triage & Automated Routing Simulator
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scenario Switcher Tabs */}
              <div className="mt-5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Select A Verified Real-World Incident Scenario:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SIMULATION_SCENARIOS.map((scen, idx) => {
                    const isSelected = activeScenarioIndex === idx;
                    const ScenIcon = scen.icon;
                    return (
                      <button
                        key={scen.title}
                        type="button"
                        onClick={() => handleScenarioSwitch(idx)}
                        className={cn(
                          "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-xs ring-1 ring-emerald-400/40"
                            : "border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-white hover:border-slate-300"
                        )}
                      >
                        <ScenIcon className={cn("h-4 w-4 shrink-0", isSelected ? "text-emerald-700" : "text-slate-400")} />
                        <span className="truncate">{scen.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Simulation Body: Left Telemetry Output | Right Computer Vision Camera Preview */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
                {/* Left: Input Text & Live Classification Telemetry */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Citizen Input Box */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Resident Report Text:</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                        Natural Language Input
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 shadow-inner">
                      "{currentScenario.text}"
                    </p>
                  </div>

                  {/* AI Classification Pipeline Telemetry */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/20">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Automated AI Inference Result:
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                        {currentScenario.confidence} Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Assigned Department</div>
                        <div className="font-bold text-slate-900 mt-0.5 leading-snug">{currentScenario.dept}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Classification & Tier</div>
                        <div className="font-bold text-slate-900 mt-0.5 leading-snug">{currentScenario.category}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">SLA Resolution Time</div>
                        <div className="font-bold text-emerald-700 mt-0.5 leading-snug">{currentScenario.sla}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Target Mobile Queue</div>
                        <div className="font-bold text-slate-900 mt-0.5 leading-snug">{currentScenario.dispatch}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-600 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{currentScenario.verification}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Computer Vision Reticle Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3] lg:aspect-auto flex flex-col justify-end shadow-md group">
                  <img
                    src={currentScenario.image}
                    alt={currentScenario.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Optical HUD overlay */}
                  <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md self-start border border-emerald-500/30">
                      <span>CV_TAG: [{currentScenario.reticle}]</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20">
                      <span>GPS: {currentScenario.coords}</span>
                      <span className="text-emerald-400 font-bold">AUTHENTICATED</span>
                    </div>
                  </div>

                  {/* Defect Bounding Reticle Box */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-28 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-start justify-end p-1">
                      <span className="text-[9px] font-mono bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-bold">
                        97.4% CONF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  CivicLens routes issues directly to field teams with zero lost tickets or duplicate confusion.
                </span>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href="/citizen/login"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Test in Citizen Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

