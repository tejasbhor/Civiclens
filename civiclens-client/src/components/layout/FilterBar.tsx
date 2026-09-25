import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string };
  /** Selects/toggles. Each child sizes itself; the bar wraps on narrow screens. */
  children?: React.ReactNode;
  className?: string;
}

/** Search + filters that wrap instead of overflowing. */
export function FilterBar({ search, children, className }: FilterBarProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {search && (
        <div className="relative min-w-0 flex-1 sm:min-w-[14rem]">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={search.label ?? "Search"}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Search"}
            className="pl-9 pr-9"
          />
          {search.value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => search.onChange("")}
              className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-control text-muted-foreground hover:text-foreground"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
      )}
      {children && <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">{children}</div>}
    </div>
  );
}
