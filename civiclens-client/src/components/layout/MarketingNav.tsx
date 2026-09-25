import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, ArrowRight, UserCheck, HardHat, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { CommandMenu } from "@/components/landing/CommandMenu";

const BRAND = "CivicLens";

const LINKS: [string, string][] = [
  ["/#overview", "Overview"],
  ["/#metrics-strip", "Architecture"],
  ["/#how-it-works", "How It Works"],
  ["/#ai-engine", "Intelligent Triage"],
  ["/#proof-verification", "Photo Proof"],
  ["/#faqs", "FAQ"],
  ["/docs", "Docs"],
];

export function MarketingNav() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/95 border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors">
      <div className="container !px-5 max-w-7xl mx-auto flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" aria-label={`${BRAND} home`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0">
          <Logo name={BRAND} />
        </Link>

        {/* Center Desktop Navigation - High contrast, non-washed-out styling */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {LINKS.map(([href, label]) => (
            href.startsWith("/") && !href.startsWith("/#") ? (
              <Link
                key={href}
                to={href}
                className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:text-slate-950 hover:bg-slate-100/90 active:scale-[0.98]"
              >
                {label}
              </Link>
            ) : (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:text-slate-950 hover:bg-slate-100/90 active:scale-[0.98]"
              >
                {label}
              </a>
            )
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <CommandMenu compact />

          {/* Role Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:inline-flex text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/90 active:scale-[0.98] rounded-full bg-slate-50/80 shadow-xs px-3.5"
              >
                <span>Live Portals</span>
                <ChevronDown aria-hidden className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-900 shadow-xl shadow-slate-900/10">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1">
                Select Demo Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem 
                onSelect={() => navigate("/citizen/login")}
                className="flex items-center gap-2.5 py-2 px-2 rounded-lg cursor-pointer hover:bg-slate-100 text-xs font-medium"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="block font-bold text-slate-900">Resident Portal</span>
                  <span className="block text-[11px] text-slate-500">File & track civic issues</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onSelect={() => navigate("/officer/login")}
                className="flex items-center gap-2.5 py-2 px-2 rounded-lg cursor-pointer hover:bg-slate-100 text-xs font-medium"
              >
                <HardHat className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="block font-bold text-slate-900">Field Officer</span>
                  <span className="block text-[11px] text-slate-500">Task queue & photo upload</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onSelect={() => navigate("/admin/login")}
                className="flex items-center gap-2.5 py-2 px-2 rounded-lg cursor-pointer hover:bg-slate-100 text-xs font-medium"
              >
                <Building2 className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="block font-bold text-slate-900">City Administrator</span>
                  <span className="block text-[11px] text-slate-500">Triage override & SLAs</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Quick CTA */}
          <button
            onClick={() => navigate("/citizen/login")}
            className="group hidden min-[440px]:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white text-xs font-bold shadow-sm transition-[background-color,transform,box-shadow] duration-150 active:scale-[0.98]"
          >
            <span>Open Demo</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          {/* Mobile Sheet Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation" className="text-slate-800 hover:text-slate-950 hover:bg-slate-100">
                  <Menu aria-hidden className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[300px] flex-col justify-between p-6 bg-white border-slate-200 text-slate-900">
                <div className="space-y-6">
                  <SheetHeader className="text-left">
                    <SheetTitle><Logo name={BRAND} /></SheetTitle>
                  </SheetHeader>
                  <nav aria-label="Mobile" className="flex flex-col gap-1">
                    {LINKS.map(([href, label]) => (
                      href.startsWith("/") && !href.startsWith("/#") ? (
                        <Link
                          key={href}
                          to={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                        >
                          {label}
                        </Link>
                      ) : (
                        <a
                          key={href}
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                        >
                          {label}
                        </a>
                      )
                    ))}
                  </nav>
                </div>

                <div className="space-y-2 pt-6 border-t border-slate-100">
                  <Button
                    onClick={() => { setMobileOpen(false); navigate("/citizen/login"); }}
                    className="w-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-bold rounded-full text-xs"
                  >
                    Open Resident Demo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setMobileOpen(false); navigate("/officer/login"); }}
                    className="w-full border-slate-200 text-slate-800 hover:bg-slate-100 rounded-full text-xs font-semibold"
                  >
                    Officer Login
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
