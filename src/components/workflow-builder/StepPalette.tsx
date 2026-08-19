import { Phone, MessageSquare, Mail, Clock, Mic, Bell, Calendar, Square } from "lucide-react";
import type { StepType } from "./types";
import { STEP_META } from "./types";

const ITEMS: { type: StepType; Icon: any }[] = [
  { type: "call",      Icon: Phone },
  { type: "sms",       Icon: MessageSquare },
  { type: "email",     Icon: Mail },
  { type: "wait",      Icon: Clock },
  { type: "voicemail", Icon: Mic },
  { type: "notify",    Icon: Bell },
  { type: "book",      Icon: Calendar },
  { type: "stop",      Icon: Square },
];

export function StepPalette() {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Drag steps onto canvas</p>
      </div>
      {ITEMS.map(({ type, Icon }) => {
        const meta = STEP_META[type];
        return (
          <div
            key={type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-step-type", type);
              e.dataTransfer.setData("text/plain", type);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-sm transition"
          >
            <span
              className="size-7 rounded-md grid place-items-center text-white shrink-0"
              style={{ backgroundColor: meta.color }}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
