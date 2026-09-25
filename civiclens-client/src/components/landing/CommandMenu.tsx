import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Shield,
  Search,
  Sparkles,
  Calculator,
  Sun,
  Moon,
  Home,
  CheckCircle2,
  PhoneCall,
  PlusCircle,
  Clock,
  Bell,
  User,
  LogOut,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isCitizen, isOfficer } from "@/utils/authHelpers";

interface CommandMenuProps {
  compact?: boolean;
}

export function CommandMenu({ compact = false }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      {compact ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-xs transition-all active:scale-[0.98]"
          aria-label="Open command palette (Ctrl+K)"
          title="Command Palette (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="hidden lg:flex items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Open command palette"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search platform...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-background px-1.5 font-mono text-meta font-medium text-muted-foreground">
            <span className="text-xs">âŒ˜</span>K
          </kbd>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command, search portal, or jump to section..." />
        <CommandList>
          <CommandEmpty>No matching actions found.</CommandEmpty>

          {/* Authenticated Citizen Commands */}
          {user && isCitizen(user.role) && (
            <CommandGroup heading="Resident Portal Actions">
              <CommandItem onSelect={() => runCommand(() => navigate("/citizen/submit-report"))}>
                <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                <span>Submit New Civic Issue</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/citizen/reports"))}>
                <FileText className="mr-2 h-4 w-4 text-primary" />
                <span>My Reported Issues</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/citizen/track-report"))}>
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span>Track Issue by Ticket ID</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/citizen/notifications"))}>
                <Bell className="mr-2 h-4 w-4 text-primary" />
                <span>View Notifications</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/citizen/profile"))}>
                <User className="mr-2 h-4 w-4 text-primary" />
                <span>Citizen Profile & Preferences</span>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Authenticated Officer Commands */}
          {user && isOfficer(user.role) && (
            <CommandGroup heading="Officer Field Operations">
              <CommandItem onSelect={() => runCommand(() => navigate("/officer/tasks"))}>
                <Clock className="mr-2 h-4 w-4 text-signal" />
                <span>My Assigned SLA Tasks</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/officer/dashboard"))}>
                <Shield className="mr-2 h-4 w-4 text-signal" />
                <span>Officer Ops Dashboard & Map</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/officer/notifications"))}>
                <Bell className="mr-2 h-4 w-4 text-signal" />
                <span>Officer Alerts & Escalations</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/officer/profile"))}>
                <User className="mr-2 h-4 w-4 text-signal" />
                <span>Officer Profile & Ward Assignment</span>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Public / Quick Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Platform Homepage</span>
            </CommandItem>
            {!user && (
              <>
                <CommandItem onSelect={() => runCommand(() => navigate("/citizen/login"))}>
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>Resident Portal: sign in or report</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate("/officer/login"))}>
                  <Shield className="mr-2 h-4 w-4 text-signal" />
                  <span>Officer Portal: field login</span>
                </CommandItem>
              </>
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* Showcase Jump Targets (for Landing) */}
          <CommandGroup heading="Platform Showcase">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (window.location.pathname !== "/") {
                    navigate("/#ai-dispatch");
                  } else {
                    document.getElementById("ai-dispatch")?.scrollIntoView({ behavior: "smooth" });
                  }
                })
              }
            >
              <Sparkles className="mr-2 h-4 w-4 text-success" />
              <span>AI Dispatch Engine Simulator</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (window.location.pathname !== "/") {
                    navigate("/#roi-calculator");
                  } else {
                    document.getElementById("roi-calculator")?.scrollIntoView({ behavior: "smooth" });
                  }
                })
              }
            >
              <Calculator className="mr-2 h-4 w-4 text-primary" />
              <span>Municipal ROI & Turnaround Calculator</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (window.location.pathname !== "/") {
                    navigate("/#proof-verification");
                  } else {
                    document.getElementById("proof-verification")?.scrollIntoView({ behavior: "smooth" });
                  }
                })
              }
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-info" />
              <span>Before & After Fix Verification Slider</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            {user ? (
              <CommandItem onSelect={() => runCommand(handleLogout)}>
                <LogOut className="mr-2 h-4 w-4 text-destructive" />
                <span>Log Out of CivicLens</span>
              </CommandItem>
            ) : (
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    window.location.href =
                      "mailto:support@civiclens.space?subject=CivicLens%20Council%20Demo%20Request";
                  })
                }
              >
                <PhoneCall className="mr-2 h-4 w-4 text-signal" />
                <span>Request Municipal Walkthrough</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
