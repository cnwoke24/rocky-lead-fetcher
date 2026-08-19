import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { VOICES } from "@/lib/voices";
import type { StepNodeData, StepType, WorkflowNode } from "./types";
import { STEP_META } from "./types";

type Props = {
  node: WorkflowNode | null;
  onChange: (id: string, patch: Partial<StepNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function NodeInspector({ node, onChange, onDelete, onClose }: Props) {
  if (!node) {
    return (
      <div className="text-xs text-muted-foreground p-4">
        Select a step on the canvas to edit it, or drag a new one from the left.
      </div>
    );
  }

  const t = node.type as StepType;
  const d = node.data;
  const meta = STEP_META[t];
  const set = (patch: Partial<StepNodeData>) => onChange(node.id, patch);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step</p>
          <h3 className="font-semibold tracking-tight" style={{ color: meta.color }}>{meta.label}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>

      <Row label="Label">
        <Input value={d.label ?? ""} onChange={(e) => set({ label: e.target.value })} placeholder={meta.label} />
      </Row>

      {t !== "start" && t !== "stop" && t !== "wait" && (
        <Row label="When (day offset)">
          <Input type="number" min={0} value={d.dayOffset ?? ""} onChange={(e) => set({ dayOffset: Number(e.target.value) || 0 })} />
        </Row>
      )}

      {t === "call" && (
        <>
          <Row label="Time window">
            <Select value={d.timeWindow ?? ""} onValueChange={(v) => set({ timeWindow: v })}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                {["8am–12pm", "12pm–5pm", "5pm–8pm", "Any"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Row label="AI voice">
            <Select value={d.voiceId ?? ""} onValueChange={(v) => set({ voiceId: v })}>
              <SelectTrigger><SelectValue placeholder="Use campaign default" /></SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
          <Toggle label="Leave voicemail if no answer" value={!!d.leaveVoicemail} onChange={(v) => set({ leaveVoicemail: v })} />
        </>
      )}

      {t === "sms" && (
        <>
          <Row label="Message">
            <Textarea rows={4} value={d.message ?? ""} onChange={(e) => set({ message: e.target.value })} placeholder="Hi {{first_name}}…" />
          </Row>
          <Toggle label="Include booking link" value={!!d.includeBookingLink} onChange={(v) => set({ includeBookingLink: v })} />
          <Toggle label="Stop sequence on reply" value={!!d.stopOnReply} onChange={(v) => set({ stopOnReply: v })} />
        </>
      )}

      {t === "email" && (
        <>
          <Row label="Subject">
            <Input value={d.subject ?? ""} onChange={(e) => set({ subject: e.target.value })} />
          </Row>
          <Row label="Body">
            <Textarea rows={6} value={d.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
          </Row>
          <Toggle label="Include offer / booking link" value={!!d.includeOffer} onChange={(v) => set({ includeOffer: v })} />
        </>
      )}

      {t === "wait" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Amount">
              <Input type="number" min={1} value={d.waitAmount ?? ""} onChange={(e) => set({ waitAmount: Number(e.target.value) || 1 })} />
            </Row>
            <Row label="Unit">
              <Select value={d.waitUnit ?? "days"} onValueChange={(v) => set({ waitUnit: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </div>
          <Toggle label="Continue only if no response" value={!!d.continueOnlyIfNoResponse} onChange={(v) => set({ continueOnlyIfNoResponse: v })} />
        </>
      )}

      {t === "voicemail" && (
        <Row label="Voicemail script">
          <Textarea rows={4} value={d.voicemailScript ?? ""} onChange={(e) => set({ voicemailScript: e.target.value })} />
        </Row>
      )}

      {t === "notify" && (
        <>
          <Row label="Channel">
            <Select value={d.notifyChannel ?? "email"} onValueChange={(v) => set({ notifyChannel: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Recipient">
            <Input value={d.notifyRecipient ?? ""} onChange={(e) => set({ notifyRecipient: e.target.value })} placeholder="name@example.com" />
          </Row>
        </>
      )}

      {t === "book" && (
        <Row label="Booking link">
          <Input value={d.bookingLink ?? ""} onChange={(e) => set({ bookingLink: e.target.value })} placeholder="https://calendly.com/…" />
        </Row>
      )}

      {t !== "start" && (
        <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => onDelete(node.id)}>
          <Trash2 className="size-4" /> Delete step
        </Button>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-2.5 cursor-pointer">
      <span className="text-xs">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
