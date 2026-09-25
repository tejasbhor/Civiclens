import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/services/notificationService";

interface NotificationListProps {
  notifications: Notification[];
  getIcon: (type: string) => React.ReactNode;
  /** Row body was activated: mark read and navigate. */
  onOpen: (n: Notification) => void;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  /** Optional explicit shortcut button, e.g. "View report". */
  shortcut?: (n: Notification) => { label: string; onClick: () => void } | null;
}

/** Shared by the citizen and officer notification pages. The row body is a real button; actions are siblings, never nested. */
export function NotificationList({ notifications, getIcon, onOpen, onMarkRead, onDelete, shortcut }: NotificationListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-card border bg-card" aria-label="Notifications">
      {notifications.map((n) => {
        const action = shortcut?.(n);
        return (
          <li key={n.id} className={cn("px-4 py-4", !n.is_read && "bg-primary/5")}>
            <button
              type="button"
              onClick={() => onOpen(n)}
              className="flex w-full gap-3 rounded-control text-left"
            >
              <span className="mt-0.5 shrink-0" aria-hidden>{getIcon(n.type)}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-h4">{n.title}</span>
                  {!n.is_read && (
                    <span className="mt-1 flex shrink-0 items-center gap-1.5 text-label text-primary">
                      <span aria-hidden className="size-2 rounded-full bg-primary" /> New
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-body-sm text-muted-foreground">{n.message}</span>
                <span className="mt-1.5 block text-caption text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </span>
            </button>
            <div className="mt-2 flex flex-wrap justify-end gap-1 pl-8">
              {action && (
                <Button size="sm" variant="outline" onClick={action.onClick}>{action.label}</Button>
              )}
              {!n.is_read && (
                <Button size="sm" variant="ghost" onClick={() => onMarkRead(n.id)}>Mark read</Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onDelete(n.id)} aria-label={`Delete notification: ${n.title}`}>
                <Trash2 aria-hidden />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
