import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/appConfig";

/** Map-pin mark: a pin whose hole is a lens. Emerald & amber precision brand mark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", className)} aria-hidden="true">
      <path
        d="M16 2.5c-5.8 0-10.5 4.5-10.5 10.2 0 7.3 8.1 14.6 9.6 15.9a1.4 1.4 0 0 0 1.8 0c1.5-1.3 9.6-8.6 9.6-15.9C26.5 7 21.8 2.5 16 2.5Z"
        fill="#10b981"
      />
      <circle cx="16" cy="12.6" r="5.2" fill="#ffffff" />
      <circle cx="16" cy="12.6" r="2.8" fill="#f59e0b" />
    </svg>
  );
}

export function Logo({ className, subtle = false, name = APP_CONFIG.appName }: { className?: string; subtle?: boolean; name?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <LogoMark />
      <span className="text-[20px] font-black tracking-tight text-slate-950 font-display">
        Civic<span className="text-emerald-600">Lens</span>
      </span>
    </span>
  );
}
