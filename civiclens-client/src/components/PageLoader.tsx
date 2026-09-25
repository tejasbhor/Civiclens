import { Loader2 } from "lucide-react";

export const PageLoader = () => (
  <div role="status" aria-live="polite" className="flex min-h-dvh items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 aria-hidden className="size-6 animate-spin text-primary" />
      <p className="text-body-sm">Loading…</p>
    </div>
  </div>
);
