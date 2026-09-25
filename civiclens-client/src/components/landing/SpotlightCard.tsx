import React, { useRef, useState, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "hsl(var(--primary) / 0.12)",
  borderColor = "hsl(var(--primary) / 0.35)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [reduceMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (!reduceMotion) setOpacity(1);
  }, [reduceMotion]);

  const handleMouseLeave = useCallback(() => {
    if (!reduceMotion) setOpacity(0);
  }, [reduceMotion]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-border/80 bg-card p-6 md:p-8 transition-shadow duration-[var(--duration-fast)] hover:shadow-lg overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background ambient radial highlight */}
      {!reduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-[var(--duration-fast)]"
          style={{
            opacity,
            background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Border glow shine */}
      {!reduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-[var(--duration-fast)]"
          style={{
            opacity,
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 60%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
