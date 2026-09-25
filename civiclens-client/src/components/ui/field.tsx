import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  /** Receives id + aria wiring; spread it onto the control. */
  children: (controlProps: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
  }) => React.ReactNode;
}

/** Label + control + hint + error, with the ids wired for assistive tech. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-label">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, "aria-required": required || undefined })}
      {hint && !error && <p id={hintId} className="text-caption text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-caption font-medium text-danger">{error}</p>}
    </div>
  );
}
