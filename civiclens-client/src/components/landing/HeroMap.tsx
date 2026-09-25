import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STAGES = [
  { label: "Received", note: "Logged and tagged with GPS", color: "var(--status-received)" },
  { label: "In progress", note: "Assigned to Roads Department", color: "var(--status-progress)" },
  { label: "Resolved", note: "Repair photo uploaded", color: "var(--status-resolved)" },
] as const;

const PINS = [
  { x: 112, y: 128, stage: 2 },
  { x: 396, y: 92, stage: 1 },
  { x: 452, y: 300, stage: 0 },
  { x: 196, y: 352, stage: 2 },
];
const FOCUS = { x: 288, y: 232 };

function Pin({ x, y, color, active = false }: { x: number; y: number; color: string; active?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {active && <circle r="22" fill={`hsl(${color} / 0.18)`} className="hero-pulse" />}
      <path
        d="M0 -26c-9.4 0-17 7.2-17 16.4 0 11.8 13.1 23.6 15.5 25.7a2 2 0 0 0 3 0C4 14 17 2.2 17 -9.6 17 -18.8 9.4 -26 0 -26Z"
        fill={`hsl(${color})`}
        stroke="hsl(var(--card))"
        strokeWidth="2.5"
      />
      <circle cy="-10" r="5.5" fill="hsl(var(--card))" />
    </g>
  );
}

export function HeroMap() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? 2 : 0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  const current = STAGES[stage];

  return (
    <div className="relative">
      <style>{`
        @keyframes hero-pulse { 0% { transform: scale(.6); opacity: .9 } 100% { transform: scale(1.9); opacity: 0 } }
        .hero-pulse { transform-origin: center; animation: hero-pulse 2.2s ease-out infinite }
      `}</style>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-lg)]">
        <svg viewBox="0 0 560 480" className="block h-auto w-full" role="img" aria-label="Illustrated street map showing reports at different stages of resolution">
          <rect width="560" height="480" fill="hsl(var(--muted))" />
          {/* park + water */}
          <rect x="300" y="286" width="150" height="120" rx="14" fill="hsl(var(--civic-green) / 0.16)" />
          <path d="M-10 402 C 90 372, 170 430, 280 400 S 470 372, 580 410 L 580 490 L -10 490 Z" fill="hsl(var(--civic-blue) / 0.16)" />
          {/* blocks */}
          {[
            [24, 24, 150, 100], [196, 24, 130, 100], [348, 24, 190, 100],
            [24, 146, 110, 118], [156, 146, 110, 118], [24, 286, 132, 86],
            [178, 286, 108, 66], [468, 146, 70, 118], [348, 146, 100, 118],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          ))}
          {/* main avenue */}
          <path d="M-10 268 L 570 208" stroke="hsl(var(--card))" strokeWidth="18" />
          <path d="M-10 268 L 570 208" stroke="hsl(var(--signal))" strokeWidth="2" strokeDasharray="10 10" opacity="0.9" />

          {PINS.map((p, i) => (
            <Pin key={i} x={p.x} y={p.y} color={STAGES[p.stage].color} />
          ))}
          <motion.g
            key="focus"
            initial={false}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformBox: "fill-box" }}
          >
            <Pin x={FOCUS.x} y={FOCUS.y} color={current.color} active />
          </motion.g>
        </svg>
      </div>

      {/* Example ticket */}
      <div className="relative -mt-12 ml-4 mr-4 rounded-xl border bg-card p-4 shadow-[var(--shadow-lg)] sm:absolute sm:-bottom-7 sm:-left-8 sm:mt-0 sm:ml-0 sm:mr-0 sm:w-[19rem]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold tracking-tight">Pothole, MG Road</p>
          <p className="text-xs text-muted-foreground tabular-nums">CL-04817</p>
        </div>

        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {STAGES.map((s, i) => (
            <div key={s.label} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `hsl(${STAGES[Math.min(stage, i)].color})` }}
                initial={false}
                animate={{ width: i <= stage ? "100%" : "0%" }}
                transition={{ duration: reduce ? 0 : 0.6, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 min-h-[2.5rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${current.color})` }} />
                {current.label}
              </p>
              <p className="text-xs text-muted-foreground">{current.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-2 border-t pt-2 text-meta text-muted-foreground">Example report</p>
      </div>
    </div>
  );
}
