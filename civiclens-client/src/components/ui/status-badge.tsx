import { getStatusMeta, SEVERITY_CLASSES, TONE_CLASSES, TONE_ICON } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string | null | undefined;
  /** Override the default label. */
  label?: string;
  hideIcon?: boolean;
}

/** The only way a report/task status is drawn. Carries glyph + text so colour is never the sole signal. */
export function StatusBadge({ status, label, hideIcon, className, ...props }: StatusBadgeProps) {
  const { tone, label: defaultLabel } = getStatusMeta(status);
  const Icon = TONE_ICON[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-control px-2 py-1 text-label",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {!hideIcon && <Icon aria-hidden className="size-3.5 shrink-0" />}
      {label ?? defaultLabel}
    </span>
  );
}

export function SeverityBadge({ severity, className }: { severity: string | null | undefined; className?: string }) {
  const key = (severity ?? "").toLowerCase();
  if (!key) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-control px-2 py-1 text-label capitalize",
        SEVERITY_CLASSES[key] ?? SEVERITY_CLASSES.low,
        className,
      )}
    >
      {key}
    </span>
  );
}
