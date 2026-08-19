import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Phone, MessageSquare, Mail, Clock, Mic, Bell, Calendar, Square, Play, Trash2 } from "lucide-react";
import type { StepNodeData, StepType } from "./types";
import { STEP_META } from "./types";
import { cn } from "@/lib/utils";

const ICONS: Record<StepType, any> = {
  start: Play,
  call: Phone,
  sms: MessageSquare,
  email: Mail,
  wait: Clock,
  voicemail: Mic,
  notify: Bell,
  book: Calendar,
  stop: Square,
};

function summary(type: StepType, d: StepNodeData): string {
  switch (type) {
    case "call":  return `Day ${d.dayOffset ?? 1}${d.leaveVoicemail ? " · VM on" : ""}`;
    case "sms":   return d.message ? `"${d.message.slice(0, 40)}${d.message.length > 40 ? "…" : ""}"` : `Day ${d.dayOffset ?? 1}`;
    case "email": return d.subject ? `Subj: ${d.subject.slice(0, 32)}` : `Day ${d.dayOffset ?? 1}`;
    case "wait":  return `${d.waitAmount ?? 1} ${d.waitUnit ?? "days"}`;
    case "voicemail": return d.voicemailScript ? `"${d.voicemailScript.slice(0, 36)}…"` : "Leave voicemail";
    case "notify": return `${d.notifyChannel ?? "email"} → ${d.notifyRecipient || "team"}`;
    case "book":   return d.bookingLink || "Send booking link";
    case "stop":   return "End sequence";
    case "start":  return "Workflow begins here";
  }
}

type Props = NodeProps & { data: StepNodeData & { __type?: StepType; __onDelete?: () => void } };

export function StepNode({ data, selected, type }: Props) {
  const stepType = (data.__type ?? (type as StepType)) as StepType;
  const meta = STEP_META[stepType];
  const Icon = ICONS[stepType];
  const isStart = stepType === "start";
  const isStop = stepType === "stop";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card shadow-sm transition-all min-w-[200px]",
        selected ? "border-primary ring-2 ring-primary/30 shadow-elevated" : "border-border",
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: meta.color }}
    >
      {!isStart && <Handle id="input" type="target" position={Position.Top} isConnectableStart={false} className="!size-3 !bg-muted-foreground !border-2 !border-card !z-50" />}

      <div className="p-3">
        <div className="flex items-center gap-2">
          <span
            className="size-7 rounded-lg grid place-items-center text-white shrink-0"
            style={{ backgroundColor: meta.color }}
          >
            <Icon className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-tight truncate">{data.label || meta.label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{summary(stepType, data)}</p>
          </div>
          {!isStart && data.__onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); data.__onDelete?.(); }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
              aria-label="Delete step"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isStop && stepType !== "call" && stepType !== "sms" && (
        <Handle id="out" type="source" position={Position.Bottom} isConnectableEnd={false} className="!size-3 !bg-primary !border-2 !border-card !z-50" />
      )}
      {stepType === "call" && (
        <>
          <BranchHandle id="answered" label="Answered" left="15%" color="#10b981" />
          <BranchHandle id="no_answer" label="No answer" left="40%" color="#94a3b8" />
          <BranchHandle id="interested" label="Interested" left="65%" color="#6366f1" />
          <BranchHandle id="opted_out" label="Opted out" left="90%" color="#ef4444" />
        </>
      )}
      {stepType === "sms" && (
        <>
          <BranchHandle id="replied" label="Replied" left="30%" color="#10b981" />
          <BranchHandle id="no_reply" label="No reply" left="70%" color="#94a3b8" />
        </>
      )}
    </div>
  );
}

function BranchHandle({ id, label, left, color }: { id: string; label: string; left: string; color: string }) {
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        id={id}
        isConnectableEnd={false}
        className="!size-3 !border-2 !border-card !z-50"
        style={{ background: color, left }}
      />
      <span
        className="absolute text-[9px] uppercase tracking-wider text-muted-foreground bg-card border border-border rounded px-1 py-0.5 whitespace-nowrap pointer-events-none"
        style={{ left, bottom: -22, transform: "translateX(-50%)" }}
      >
        {label}
      </span>
    </>
  );
}
