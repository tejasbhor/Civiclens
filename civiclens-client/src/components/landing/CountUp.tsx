import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts up once when scrolled into view. Writes to the DOM directly, no React state per frame. */
export function CountUp({ to, decimals = 0, className }: { to: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = fmt(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, reduce, decimals]);

  return (
    <span ref={ref} className={className}>
      {fmt(0)}
    </span>
  );
}
