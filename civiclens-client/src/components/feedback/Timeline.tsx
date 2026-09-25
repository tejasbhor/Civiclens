import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: React.ReactNode;
  /** Pre-formatted time string. */
  time?: string;
  /** done = past, current = where the report is now, upcoming = expected next. */
  state?: "done" | "current" | "upcoming";
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, i) => {
        const state = item.state ?? "done";
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0" aria-current={state === "current" ? "step" : undefined}>
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px",
                  state === "upcoming" ? "border-l border-dashed border-border" : "bg-border",
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                state === "done" && "border-status-completed bg-status-completed text-success-foreground",
                state === "current" && "border-primary bg-background",
                state === "upcoming" && "border-border bg-background",
              )}
            >
              {state === "done" && <Check className="size-3.5" strokeWidth={3} />}
              {state === "current" && <span className="size-2 rounded-full bg-primary" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={cn("text-h4", state === "upcoming" && "text-muted-foreground")}>{item.title}</p>
                {item.time && <time className="text-caption tabular-nums text-muted-foreground">{item.time}</time>}
              </div>
              {item.description && <div className="mt-0.5 text-body-sm text-muted-foreground">{item.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
