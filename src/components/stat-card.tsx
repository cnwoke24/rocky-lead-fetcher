import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  muted: "bg-secondary text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <span className={cn("size-8 rounded-lg grid place-items-center shrink-0", tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-success",
    confirmed: "bg-success",
    active: "bg-success",
    pending: "bg-warning",
    draft: "bg-muted-foreground",
    completed: "bg-muted-foreground",
  };
  return (
    <span className="relative flex size-2 shrink-0">
      {(status === "running" || status === "active") && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-50 animate-pulse-dot" />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", map[status] ?? "bg-muted-foreground")} />
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-success/15 text-success",
    active: "bg-success/15 text-success",
    confirmed: "bg-success/15 text-success",
    pending: "bg-warning/20 text-warning-foreground",
    submitted: "bg-primary/15 text-primary",
    draft: "bg-secondary text-muted-foreground",
    completed: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
        map[status] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
