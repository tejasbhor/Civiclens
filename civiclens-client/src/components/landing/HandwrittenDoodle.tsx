import { cn } from "@/lib/utils";

interface HandwrittenAnnotationProps {
  text: string;
  subtext?: string;
  className?: string;
  color?: string;
  arrowDirection?: "up-right" | "up-left" | "down-right" | "down-left" | "curved-right" | "curved-left" | "straight-right" | "none";
  arrowClassName?: string;
}

export function HandwrittenAnnotation({
  text,
  subtext,
  className,
  color = "text-amber-600",
  arrowDirection = "curved-right",
  arrowClassName,
}: HandwrittenAnnotationProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 select-none pointer-events-none", className)}>
      <div className={cn("font-handwriting text-xl md:text-2xl font-bold leading-tight tracking-wide rotate-[-3deg]", color)}>
        <span>{text}</span>
        {subtext && <span className="block text-lg font-semibold opacity-90">{subtext}</span>}
      </div>

      {arrowDirection !== "none" && (
        <svg
          viewBox="0 0 64 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("w-10 h-7 stroke-current shrink-0 -mt-1", color, arrowClassName)}
          aria-hidden="true"
        >
          {arrowDirection === "curved-right" && (
            <>
              <path
                d="M4 28 C18 12, 38 10, 56 22"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M44 14 L56 22 L46 30"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {arrowDirection === "curved-left" && (
            <>
              <path
                d="M60 28 C46 12, 26 10, 8 22"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 14 L8 22 L18 30"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {arrowDirection === "up-right" && (
            <>
              <path
                d="M8 40 C16 28, 32 18, 52 10"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M38 8 L52 10 L48 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {arrowDirection === "down-right" && (
            <>
              <path
                d="M8 8 C20 18, 36 32, 54 38"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M40 38 L54 38 L48 26"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {arrowDirection === "straight-right" && (
            <>
              <path
                d="M6 24 C24 23, 42 25, 56 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M46 16 L56 24 L46 32"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
