import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  /** What is empty. */
  title: string;
  /** Why, and what to do next. */
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-card bg-muted text-muted-foreground">
          <Icon aria-hidden className="size-5" />
        </div>
      )}
      <h3 className="text-h3">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
