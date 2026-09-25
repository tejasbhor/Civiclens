import {
  CheckCircle2, CircleDashed, FileText, Inbox, Search, ShieldAlert, UserCheck, Wrench, XCircle,
  type LucideIcon,
} from "lucide-react";

/** The nine lifecycle tones defined in DESIGN.md. Colours come from the `status-*` tokens. */
export type StatusTone =
  | "submitted" | "received" | "review" | "assigned" | "progress"
  | "completed" | "rejected" | "escalated" | "pending";

export interface StatusMeta {
  tone: StatusTone;
  label: string;
}

// Static class strings so Tailwind can see them. Text and tint share one hue token.
export const TONE_CLASSES: Record<StatusTone, string> = {
  submitted: "bg-status-submitted/12 text-status-submitted",
  received: "bg-status-received/12 text-status-received",
  review: "bg-status-review/12 text-status-review",
  assigned: "bg-status-assigned/12 text-status-assigned",
  progress: "bg-status-progress/14 text-status-progress",
  completed: "bg-status-completed/12 text-status-completed",
  rejected: "bg-status-rejected/12 text-status-rejected",
  escalated: "bg-status-escalated/12 text-status-escalated",
  pending: "bg-status-pending/10 text-status-pending border border-dashed border-status-pending/40",
};

export const TONE_DOT: Record<StatusTone, string> = {
  submitted: "bg-status-submitted", received: "bg-status-received", review: "bg-status-review",
  assigned: "bg-status-assigned", progress: "bg-status-progress", completed: "bg-status-completed",
  rejected: "bg-status-rejected", escalated: "bg-status-escalated", pending: "bg-status-pending",
};

export const TONE_ICON: Record<StatusTone, LucideIcon> = {
  submitted: FileText, received: Inbox, review: Search, assigned: UserCheck, progress: Wrench,
  completed: CheckCircle2, rejected: XCircle, escalated: ShieldAlert, pending: CircleDashed,
};

// Backend report + task statuses -> tone and citizen-facing label.
const STATUS_MAP: Record<string, StatusMeta> = {
  received: { tone: "received", label: "Received" },
  pending_classification: { tone: "review", label: "Being classified" },
  classified: { tone: "review", label: "Classified" },
  assigned_to_department: { tone: "assigned", label: "With department" },
  assigned_to_officer: { tone: "assigned", label: "Assigned" },
  assigned: { tone: "assigned", label: "Assigned" },
  assignment_rejected: { tone: "pending", label: "Awaiting reassignment" },
  acknowledged: { tone: "assigned", label: "Acknowledged" },
  in_progress: { tone: "progress", label: "In progress" },
  pending_verification: { tone: "review", label: "Pending verification" },
  resolved: { tone: "completed", label: "Resolved" },
  closed: { tone: "completed", label: "Closed" },
  rejected: { tone: "rejected", label: "Rejected" },
  duplicate: { tone: "pending", label: "Duplicate" },
  on_hold: { tone: "pending", label: "On hold" },
  reopened: { tone: "escalated", label: "Reopened" },
  escalated: { tone: "escalated", label: "Escalated" },
  submitted: { tone: "submitted", label: "Submitted" },
  pending: { tone: "pending", label: "Pending" },
};

const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  const key = (status ?? "").toLowerCase();
  return STATUS_MAP[key] ?? { tone: "pending", label: key ? titleCase(key) : "Unknown" };
}

/** Priority uses the semantic tokens, not the lifecycle ones. */
export const SEVERITY_CLASSES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/12 text-info",
  high: "bg-warning/14 text-warning",
  critical: "bg-danger/12 text-danger",
};
