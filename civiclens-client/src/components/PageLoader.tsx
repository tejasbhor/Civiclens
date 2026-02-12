import { Loader2 } from "lucide-react";

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);
