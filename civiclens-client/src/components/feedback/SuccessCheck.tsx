import { cn } from "@/lib/utils";

/** Confirmation mark: fades in, rotates upright, settles with a small bob, then draws its check (transitions.dev "success check"). */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <span className={cn("t-success-check inline-flex", className)} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="size-full">
        <circle cx="24" cy="24" r="19" pathLength={1} />
        <path d="M15 25l7 7 12-14" pathLength={1} />
      </svg>
    </span>
  );
}
