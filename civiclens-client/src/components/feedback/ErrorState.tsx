import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  /** Already-extracted, user-safe message. Pass the page's existing error string. */
  message?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export function ErrorState({ title = "Something went wrong", message, onRetry, retrying, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex size-11 items-center justify-center rounded-card bg-danger/12 text-danger">
        <AlertCircle aria-hidden className="size-5" />
      </div>
      <h3 className="text-h3">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-body-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry} loading={retrying}>
          <RefreshCw aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}
