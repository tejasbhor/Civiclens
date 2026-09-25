import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/brand/Logo";

// Only preload immediately visible above-the-fold assets during splash
const CRITICAL_IMAGES = [
  "/images/panoramic-hero-city.jpg",
  "/images/pothole-road.jpg",
  "/images/repaired-road.jpg",
];

interface LandingPreloaderProps {
  onComplete?: () => void;
}

export function LandingPreloader({ onComplete }: LandingPreloaderProps) {
  const reduce = useReducedMotion();
  const [loadedCount, setLoadedCount] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [statusText, setStatusText] = useState("Initializing civic platform...");
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // If user prefers reduced motion or already loaded in session, finish immediately
    if (reduce) {
      setIsFinished(true);
      onComplete?.();
      return;
    }

    let isMounted = true;
    let loaded = 0;
    const total = CRITICAL_IMAGES.length + 1; // +1 for fonts

    const updateProgress = () => {
      if (!isMounted) return;
      loaded++;
      setLoadedCount(loaded);

      const ratio = loaded / total;
      if (ratio > 0.6) {
        setStatusText("Synchronizing municipal routing layers...");
      } else if (ratio > 0.3) {
        setStatusText("Preloading verified geospatial imagery...");
      }
    };

    // Preload fonts
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => updateProgress())
        .catch(() => updateProgress());
    } else {
      updateProgress();
    }

    // Preload above-the-fold critical images
    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = () => updateProgress();
      img.onerror = () => updateProgress(); // Don't block on image failure
      img.src = src;
    });

    // Fast safety timeout (max 750ms so LCP is under 1s)
    const maxTimeout = setTimeout(() => {
      if (isMounted) {
        setDisplayProgress(100);
        setStatusText("Ready.");
        setTimeout(() => {
          if (isMounted) {
            setIsFinished(true);
            onComplete?.();
          }
        }, 100);
      }
    }, 750);

    return () => {
      isMounted = false;
      clearTimeout(maxTimeout);
    };
  }, [reduce, onComplete]);

  // Smooth progress animation ticker
  useEffect(() => {
    if (reduce || isFinished) return;

    const total = CRITICAL_IMAGES.length + 1;
    const targetProgress = Math.min(100, Math.round((loadedCount / total) * 100));

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev < targetProgress) {
          return Math.min(targetProgress, prev + 8);
        }
        return prev;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [loadedCount, reduce, isFinished]);

  // Handle completion when display reaches 100% and minimum time (280ms) has elapsed
  useEffect(() => {
    if (displayProgress >= 100 && !isFinished) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingMinTime = Math.max(0, 280 - elapsed);

      setStatusText("Ready.");

      const timer = setTimeout(() => {
        setIsFinished(true);
        onComplete?.();
      }, remainingMinTime + 60);

      return () => clearTimeout(timer);
    }
  }, [displayProgress, isFinished, onComplete]);

  if (reduce || isFinished) return null;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="landing-splash-preloader"
          role="status"
          aria-label="Loading CivicLens platform"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -14,
            scale: 0.985,
            filter: "blur(6px)",
            transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fbfcfd] select-none pointer-events-none"
        >
          {/* Subtle ambient emerald & teal radiance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-emerald-500/08 blur-[130px]" />
            <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] rounded-full bg-teal-500/06 blur-[110px]" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Centerpiece Container */}
          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            {/* Logo Emblem with Glow */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="relative mb-5"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-emerald-950/10 ring-1 ring-slate-900/5 border border-slate-100">
                <LogoMark className="h-10 w-10" />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-1 rounded-2xl bg-emerald-500/15 -z-10 blur-sm"
                />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-1 font-display text-2xl font-black tracking-tight text-slate-950"
            >
              <span>Civic</span>
              <span className="text-emerald-600">Lens</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="mt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-widest"
            >
              Civic Accountability Platform
            </motion.p>

            {/* Progress Bar Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mt-8 w-64 space-y-3"
            >
              {/* Sleek track */}
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-75"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>

              {/* Progress & Micro-status */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="truncate pr-2">{statusText}</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums shrink-0">
                  {displayProgress}%
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
