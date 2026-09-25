import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogOut, Menu, RefreshCw, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CommandMenu } from "@/components/landing/CommandMenu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  to: string;
  label: string;
}

interface PortalHeaderProps {
  portal: "Citizen" | "Officer";
  home: string;
  nav: PortalNavItem[];
  notificationsRoute: string;
  profileRoute: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Unified top navigation bar for the citizen and officer portals matching frozen CivicLens design. */
export const PortalHeader = ({
  portal,
  home,
  nav,
  notificationsRoute,
  profileRoute,
  onRefresh,
  refreshing = false,
}: PortalHeaderProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass =
    "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-slate-700 transition-colors hover:text-slate-950 hover:bg-slate-100 active:scale-[0.98]";
  const activeClass = ({ isActive }: { isActive: boolean }) =>
    cn(linkClass, isActive && "bg-[#0a2e2a] text-white hover:bg-[#072421] hover:text-white");

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container !px-5 max-w-7xl mx-auto flex h-16 items-center justify-between gap-6">
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={home}
            aria-label={`CivicLens ${portal} portal home`}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Logo name="CivicLens" />
          </Link>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 hidden sm:inline-flex">
            {portal} Portal
          </span>
        </div>

        {/* Center Desktop Navigation Pills */}
        <nav aria-label="Primary" className="hidden items-center gap-1.5 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative rounded-full px-4 py-1.5 text-xs font-bold transition-all outline-none",
                  isActive
                    ? "bg-[#0a2e2a] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/90"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex shrink-0">
          <CommandMenu compact />

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh data"
              className="text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-emerald-600")} />
            </Button>
          )}

          <NotificationBell notificationsRoute={notificationsRoute} />

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => navigate(profileRoute)}
            aria-label="View user profile"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/90 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
          >
            <User className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span className="max-w-[8.5rem] truncate font-medium">
              {user?.full_name || user?.phone || "Profile"}
            </span>
          </button>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="rounded-full text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Log out
          </Button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <CommandMenu compact />
          <NotificationBell notificationsRoute={notificationsRoute} />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="portal-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="portal-menu"
            className="border-t border-slate-200/80 bg-white md:hidden shadow-lg"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            <nav aria-label="Mobile" className="container !px-5 py-4 flex flex-col gap-1.5">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} className={activeClass}>
                  {item.label}
                </NavLink>
              ))}
              <NavLink to={profileRoute} className={activeClass}>
                <User className="h-4 w-4" /> Profile ({user?.full_name || "Citizen"})
              </NavLink>
              {onRefresh && (
                <button
                  type="button"
                  className={cn(linkClass, "w-full text-left")}
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-emerald-600")} /> Refresh data
                </button>
              )}
              <button
                type="button"
                className={cn(linkClass, "w-full text-left text-rose-600 hover:bg-rose-50")}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PortalHeader;
