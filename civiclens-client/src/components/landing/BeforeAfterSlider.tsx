import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofStory {
  site: string;
  ward: string;
  aerialImg: string;
  aerialAlt: string;
  beforeImg: string;
  afterImg: string;
  quote: string;
  author: string;
  role: string;
  coords: string;
}

const STORIES: ProofStory[] = [
  {
    site: "Riverside Central Corridor",
    ward: "Ward 4 Infrastructure Overhaul",
    aerialImg: "/images/aerial-city-park.jpg",
    aerialAlt: "Aerial view of clean city park and roads",
    beforeImg: "/images/pothole-road.jpg",
    afterImg: "/images/repaired-road.jpg",
    quote: "I reported this hazardous road pothole on my commute last Tuesday. Within three days, the crew finished it and uploaded full photos. This actually works.",
    author: "Priya S.",
    role: "Riverside Community Resident",
    coords: "GPS: 37.7749° N, 122.4194° W",
  },
  {
    site: "Oakridge Pedestrian Crossing",
    ward: "Ward 7 Safe Routes Project",
    aerialImg: "/images/road-crew-repair.jpg",
    aerialAlt: "Municipal road crew performing curb repair",
    beforeImg: "/images/pothole-before.webp",
    afterImg: "/images/pothole-after.webp",
    quote: "The crosswalk had severe asphalt cracking that made pushing a stroller dangerous. The before-and-after photo audit gave our neighborhood total peace of mind.",
    author: "Marcus L.",
    role: "Oakridge Neighborhood Council",
    coords: "GPS: 37.7833° N, 122.4167° W",
  },
];

interface BeforeAfterSliderProps {
  className?: string;
}

export function BeforeAfterSlider({ className }: BeforeAfterSliderProps) {
  const reduce = useReducedMotion();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  const story = STORIES[currentStoryIndex];

  const handleNextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % STORIES.length);
    setSliderPosition(50);
  };

  const handlePrevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + STORIES.length) % STORIES.length);
    setSliderPosition(50);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleInteractionEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleInteractionEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);

  useEffect(() => {
    if (isInView && !reduce) {
      const timeout = setTimeout(() => {
        setSliderPosition(50);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isInView, reduce]);

  return (
    <section 
      id="proof-verification" 
      className={cn("relative py-16 sm:py-20 lg:py-24 bg-[#fbfcfd] border-b border-slate-200/80 select-none overflow-hidden", className)}
      aria-label="Verified photographic proof"
    >
      {/* ── Soft Ambient Radial Lighting ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 h-[550px] w-[550px] rounded-full bg-emerald-500/08 blur-[130px]" />
        <div className="absolute bottom-10 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/08 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Bespoke Forensic Optical Calibration & Viewfinder Reticles ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-6 right-12 w-72 h-36 opacity-30 hidden md:block" viewBox="0 0 280 140" fill="none">
          <path d="M10 30 V10 H30" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <path d="M270 30 V10 H250" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 110 V130 H30" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <path d="M270 110 V130 H250" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <circle cx="140" cy="70" r="32" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
          <circle cx="140" cy="70" r="4" fill="#059669" />
          <line x1="140" y1="26" x2="140" y2="46" stroke="#0f172a" strokeWidth="1.2" opacity="0.5" />
          <line x1="140" y1="94" x2="140" y2="114" stroke="#0f172a" strokeWidth="1.2" opacity="0.5" />
          <line x1="96" y1="70" x2="116" y2="70" stroke="#0f172a" strokeWidth="1.2" opacity="0.5" />
          <line x1="164" y1="70" x2="184" y2="70" stroke="#0f172a" strokeWidth="1.2" opacity="0.5" />
          <text x="140" y="125" textAnchor="middle" fill="#059669" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
            FORENSIC AUDIT // SHA-256 VERIFIED
          </text>
        </svg>
      </div>

      <div className="container !px-5 max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#0d5c4d] bg-white/80 backdrop-blur-md border border-emerald-500/20 shadow-xs mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>VERIFIED EVIDENCE</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">100% PHOTO PROOF</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 font-display">
              Proof you can see. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-[#0d5c4d]">Accountability you can trust.</span>
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
              No repair is closed with a simple checkbox. Field teams must upload before-and-after photographic evidence showing the finished fix before closing out any ticket.
            </p>
          </div>

          {/* Forensic Audit Telemetry & Carousel Controls */}
          <div className="flex flex-wrap items-center gap-3 lg:self-end">
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/90 border border-slate-200/90 text-xs font-mono text-slate-600 shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-slate-700 font-bold">{story.coords}</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-bold">EXIF VERIFIED</span>
            </div>

            {/* Carousel arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStory}
                aria-label="Previous proof story"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white/90 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-xs active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextStory}
                aria-label="Next proof story"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white/90 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-xs active:scale-90 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Layout: Left Aerial Card | Center Before/After Slider | Right Resident Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_1fr] gap-6 items-stretch">
          {/* Left: Aerial Landscape Photography Card */}
          <motion.div
            key={`aerial-${currentStoryIndex}`}
            className="rounded-3xl border border-white/80 overflow-hidden bg-slate-100 relative group aspect-[4/3] lg:aspect-auto flex flex-col justify-end shadow-md"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <img
              src={story.aerialImg}
              alt={story.aerialAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="relative z-10 p-6 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 backdrop-blur-md text-slate-950 mb-2.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                Verified Municipal Site
              </span>
              <h4 className="text-base font-bold text-white font-display">{story.site}</h4>
              <p className="text-xs text-white/80 mt-1">{story.ward}</p>
            </div>
          </motion.div>

          {/* Center: Interactive Before/After Split Slider */}
          <motion.div
            className="rounded-3xl border border-slate-200/80 overflow-hidden bg-white/90 backdrop-blur-2xl p-2.5 shadow-lg flex flex-col justify-center"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              ref={containerRef}
              role="slider"
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Before and after road repair comparison slider. Use left and right arrow keys to adjust view."
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-900 shadow-inner"
            >
              {/* AFTER Layer (Repaired smooth road) */}
              <img
                key={`after-${currentStoryIndex}`}
                src={story.afterImg}
                alt="Repaved smooth asphalt road after repair"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              />
              {/* After Pill */}
              <div className="absolute top-3.5 right-3.5 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white shadow-md border border-white/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>After Fix (Photo Proof)</span>
              </div>

              {/* BEFORE Layer (Damaged road) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  key={`before-${currentStoryIndex}`}
                  src={story.beforeImg}
                  alt="Damaged road surface before repair"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover max-w-none pointer-events-none"
                  style={{
                    width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
                  }}
                />
                {/* Before Pill */}
                <div className="absolute top-3.5 left-3.5 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white shadow-md border border-white/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Before Report</span>
                </div>
              </div>

              {/* Vertical Divider Line & Draggable Handle */}
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="h-full w-0.5 -ml-[1px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)]" />

                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center pointer-events-auto cursor-grab border border-slate-200/80 transition-transform duration-100",
                    isDragging ? "scale-110 cursor-grabbing shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400" : "hover:scale-105 active:scale-95"
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Resident Testimonial Card */}
          <motion.div
            key={`quote-${currentStoryIndex}`}
            className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-2xl p-7 flex flex-col justify-between shadow-md relative"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <Quote className="w-8 h-8 text-teal-600/30" />
              <blockquote className="text-base md:text-lg font-medium text-slate-800 leading-relaxed italic font-display">
                "{story.quote}"
              </blockquote>
            </div>

            <div className="pt-5 border-t border-slate-200/80 mt-6 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {story.author}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {story.role}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
