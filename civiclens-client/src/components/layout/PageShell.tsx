import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page body container for the authenticated portals with ambient civic dot texture. */
export function PageShell({
  children,
  className,
  width = "default",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#fbfcfd] text-slate-900 selection:bg-emerald-500/20">
      {/* Ambient subtle radial dot grid background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 right-10 h-96 w-96 rounded-full bg-emerald-500/05 blur-[120px]" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-teal-500/05 blur-[100px]" />
      </div>

      <main
        id="main"
        className={cn(
          "relative z-10 mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-8",
          width === "narrow" && "max-w-3xl",
          width === "default" && "max-w-5xl",
          width === "wide" && "max-w-7xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  /** Primary contextual action(s), right-aligned on wide screens. */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-500">
            {breadcrumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link to={c.to} className="rounded-sm hover:text-emerald-700 transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-slate-900 font-semibold">
                    {c.label}
                  </span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight aria-hidden className="w-3 h-3 text-slate-400" />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-prose text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </header>
  );
}

/** A titled group of content using crisp white cards with subtle borders. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || actions) && (
        <div className="mb-3.5 flex items-end justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
