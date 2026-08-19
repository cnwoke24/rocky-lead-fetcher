import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Database,
  MessageSquare,
  PencilLine,
  PhoneCall,
  Play,
  Plus,
  Search,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getVoice } from "@/lib/voices";
import { DemoWorkflowStudio } from "./DemoWorkflowStudio";

const LIVE_WORKFLOW = {
  name: "Overdue Service Reactivation",
  status: "Live",
  goal: "Book overdue customers in for an oil change or multi-point inspection.",
  audience: "Customers who haven't been in for service in 6+ months.",
  offer: "$29 oil change + free 21-point inspection this month only.",
  voiceId: "katie",
  tone: "Friendly, local, no pressure",
  intro: "Hi, this is Rocky calling from Mike's Motor Zone — is this {{first_name}}?",
  script:
    "Let them know their vehicle is due for service, mention the $29 oil change special, and offer two appointment times. If they're busy, offer to text the booking link.",
  avoid: "Never quote repair prices, never promise same-day availability, never call before 9 AM.",
  callWindow: "9:00 AM – 6:00 PM",
  lastRun: "Today, 5:00 PM · 37 contacts",
};

const STEPS = [
  { icon: Database, title: "Shop Management System / CRM", desc: "Synced nightly with customer & vehicle records" },
  { icon: Search, title: "Identify Overdue Customers", desc: "Flags anyone 6+ months without a service visit" },
  { icon: PhoneCall, title: "Rocky AI Outbound Call", desc: "Natural voice agent dials during your call window" },
  { icon: CalendarCheck, title: "Customer Books Service", desc: "Slot written straight into the shop calendar" },
  { icon: MessageSquare, title: "Automated SMS Confirmation", desc: "Reminder sent 24 hours before the appointment" },
];

type TabId = "overview" | "edit" | "new" | "builder";

const TABS: { id: TabId; label: string; icon: typeof PencilLine }[] = [
  { id: "overview", label: "Your workflow", icon: ClipboardCheck },
  { id: "edit", label: "Request an edit", icon: PencilLine },
  { id: "new", label: "Request a new workflow", icon: Plus },
  { id: "builder", label: "Preview the builder", icon: Play },
];

export function WorkflowRequestCenter() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [newSubmitted, setNewSubmitted] = useState(false);

  const [editForm, setEditForm] = useState({ area: "", urgency: "", details: "" });
  const [newForm, setNewForm] = useState({ name: "", goal: "", audience: "", offer: "", timing: "" });

  const voice = getVoice(LIVE_WORKFLOW.voiceId);

  const submit = (kind: "edit" | "new") => {
    if (kind === "edit") setEditSubmitted(true);
    else setNewSubmitted(true);
    toast({
      title: "Request received",
      description: "Our team will review this and be in contact with you shortly.",
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  active ? "bg-muted shadow-sm" : "hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "size-8 rounded-lg grid place-items-center shrink-0",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{LIVE_WORKFLOW.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{LIVE_WORKFLOW.goal}</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {LIVE_WORKFLOW.status}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Detail label="Who we call" value={LIVE_WORKFLOW.audience} />
                <Detail label="Offer" value={LIVE_WORKFLOW.offer} />
                <Detail label="Calling window" value={LIVE_WORKFLOW.callWindow} />
                <Detail label="Tone" value={LIVE_WORKFLOW.tone} />
              </dl>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">Last run</span>
                <span className="text-xs font-medium">{LIVE_WORKFLOW.lastRun}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setTab("edit")}>
                  <PencilLine className="size-4" /> Request an edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTab("new")}>
                  <Plus className="size-4" /> Request a new workflow
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h4 className="font-semibold tracking-tight">Live sequence</h4>
              <p className="text-sm text-muted-foreground mb-4">The exact steps we built and run for you.</p>
              {STEPS.map((node, i) => (
                <div key={node.title}>
                  <div className="flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <node.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{node.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.desc}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <span className="h-3 w-px bg-border" />
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="h-3 w-px bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h4 className="font-semibold tracking-tight mb-3">Assigned voice</h4>
              {voice && (
                <div className="flex items-center gap-3">
                  <img
                    src={voice.avatar}
                    alt={`${voice.name} — ${voice.style} AI voice`}
                    className="size-16 rounded-full object-cover ring-2 ring-border"
                    width={64}
                    height={64}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.style}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {voice.accent} · {voice.age}
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-3">
                <Detail label="Opening line" value={LIVE_WORKFLOW.intro} />
                <Detail label="Script" value={LIVE_WORKFLOW.script} />
                <Detail label="Things to avoid" value={LIVE_WORKFLOW.avoid} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "edit" && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm max-w-2xl">
          {editSubmitted ? (
            <Submitted
              title="Edit request sent"
              body="Thanks — our team has your changes for the Overdue Service Reactivation workflow. We'll be in contact soon to confirm and push them live."
              onReset={() => setEditSubmitted(false)}
              resetLabel="Submit another request"
            />
          ) : (
            <>
              <h3 className="text-lg font-semibold tracking-tight">Request an edit</h3>
              <p className="text-sm text-muted-foreground">
                Tell us what to change on your live workflow — we handle the rest and confirm before anything goes live.
              </p>
              <div className="mt-4 space-y-4">
                <Field label="What should we change?">
                  <Select value={editForm.area} onValueChange={(v) => setEditForm((f) => ({ ...f, area: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick an area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="script">Script or talking points</SelectItem>
                      <SelectItem value="voice">Voice or tone</SelectItem>
                      <SelectItem value="offer">Offer or pricing</SelectItem>
                      <SelectItem value="audience">Who we call</SelectItem>
                      <SelectItem value="timing">Call window or timing</SelectItem>
                      <SelectItem value="sequence">Sequence steps (calls, texts, follow-ups)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="How soon do you need it?">
                  <Select value={editForm.urgency} onValueChange={(v) => setEditForm((f) => ({ ...f, urgency: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP — today if possible</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="whenever">No rush</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Details">
                  <Textarea
                    rows={5}
                    value={editForm.details}
                    onChange={(e) => setEditForm((f) => ({ ...f, details: e.target.value }))}
                    placeholder="e.g. Change the offer to $39 oil change and stop calling on Saturdays."
                  />
                </Field>
                <Button onClick={() => submit("edit")} disabled={!editForm.details.trim()}>
                  <Sparkles className="size-4" /> Send request
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "new" && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm max-w-2xl">
          {newSubmitted ? (
            <Submitted
              title="New workflow request sent"
              body="Thanks — we've got your brief. Our team will map the sequence, write the script, and be in contact soon to review it with you."
              onReset={() => setNewSubmitted(false)}
              resetLabel="Request another workflow"
            />
          ) : (
            <>
              <h3 className="text-lg font-semibold tracking-tight">Request a new workflow</h3>
              <p className="text-sm text-muted-foreground">
                Give us the basics and we'll build the whole campaign for you — script, voice, and sequence included.
              </p>
              <div className="mt-4 space-y-4">
                <Field label="Campaign name">
                  <Input
                    value={newForm.name}
                    onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Winter tire changeover push"
                  />
                </Field>
                <Field label="Goal of the calls">
                  <Input
                    value={newForm.goal}
                    onChange={(e) => setNewForm((f) => ({ ...f, goal: e.target.value }))}
                    placeholder="Book tire changeover appointments"
                  />
                </Field>
                <Field label="Who should we call?">
                  <Textarea
                    rows={3}
                    value={newForm.audience}
                    onChange={(e) => setNewForm((f) => ({ ...f, audience: e.target.value }))}
                    placeholder="Customers who bought winter tires from us in the last 3 years"
                  />
                </Field>
                <Field label="Offer or hook">
                  <Textarea
                    rows={2}
                    value={newForm.offer}
                    onChange={(e) => setNewForm((f) => ({ ...f, offer: e.target.value }))}
                    placeholder="Free tire storage with every changeover booked before November"
                  />
                </Field>
                <Field label="When should it run?">
                  <Input
                    value={newForm.timing}
                    onChange={(e) => setNewForm((f) => ({ ...f, timing: e.target.value }))}
                    placeholder="Weekdays, 9 AM – 6 PM, starting October 1"
                  />
                </Field>
                <Button onClick={() => submit("new")} disabled={!newForm.goal.trim()}>
                  <Sparkles className="size-4" /> Send request
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "builder" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Optional preview of the full builder. You never have to touch this — we configure everything for you.
          </p>
          <DemoWorkflowStudio />
        </div>
      )}
    </div>
  );
}

function Submitted({
  title,
  body,
  onReset,
  resetLabel,
}: {
  title: string;
  body: string;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto size-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
        <CheckCircle2 className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        {resetLabel}
      </Button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-0.5 leading-relaxed">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
