import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  Plus,
  Search,
  Settings,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import rockyLogo from "@/assets/rocky-logo.png";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/dashboard#calls", label: "Call Recordings", icon: PhoneCall },
  { to: "/subscription-payment", label: "Billing", icon: CreditCard },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-app">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 flex flex-col border-r border-sidebar-border bg-sidebar animate-slide-up-fade">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 size-8 grid place-items-center rounded-lg hover:bg-secondary"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-app-border bg-card/70 backdrop-blur sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden size-9 rounded-lg hover:bg-secondary grid place-items-center"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search calls, bookings, workflows…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-secondary/70 border border-transparent focus:bg-card focus:border-input outline-none transition"
            />
          </div>

          <div className="flex-1 sm:hidden" />

          <button className="size-9 rounded-lg hover:bg-secondary grid place-items-center relative">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </button>

          <Link
            to="/workflows/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow-sm hover:opacity-95 transition"
          >
            <Plus className="size-4" />
            New Workflow
          </Link>

          <UserMenu />
        </header>

        <div className="px-4 lg:px-8 py-6 lg:py-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <main className="px-4 lg:px-8 pb-12 flex-1 animate-slide-up-fade">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-sidebar-border">
        <img src={rockyLogo} alt="Rocky AI" className="size-9 rounded-xl object-contain" />
        <div className="leading-tight">
          <div className="font-bold text-base tracking-tight">Rocky AI</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">AI Voice Workspace</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive && !item.to.includes("#")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("size-4", isActive && !item.to.includes("#") && "text-primary")} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </div>
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-all"
        >
          <Settings className="size-4" />
          Settings
        </NavLink>
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-app-accent p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="size-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-xs font-semibold">AI Agent Online</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Your agent is monitoring calls and booking appointments around the clock.
        </p>
      </div>
    </>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold hover:opacity-90"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-56 rounded-xl border border-app-border bg-card shadow-elevated overflow-hidden z-40 animate-slide-up-fade">
          {email && (
            <div className="px-4 py-3 border-b border-app-border">
              <div className="text-xs text-muted-foreground">Signed in as</div>
              <div className="text-sm font-medium truncate">{email}</div>
            </div>
          )}
          <Link
            to="/subscription-payment"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary"
          >
            <CreditCard className="size-4" /> Billing
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary text-destructive"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
