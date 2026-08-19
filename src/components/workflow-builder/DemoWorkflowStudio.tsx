import { useState } from "react";
import { ArrowLeft, ArrowRight, Bot, ClipboardCheck, Workflow as WorkflowIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { AgentSetup, EMPTY_SIMPLE_AGENT, type SimpleAgentConfig } from "./AgentSetup";
import { ReviewSubmit } from "./ReviewSubmit";
import { TEMPLATES } from "./templates";
import type { WorkflowGraph } from "./types";

const DEMO_AGENT: SimpleAgentConfig = {
  ...EMPTY_SIMPLE_AGENT,
  business_name: "Mike's Motor Zone",
  campaign_name: "Overdue Service Reactivation",
  campaign_goal: "Book overdue customers in for an oil change or multi-point inspection.",
  target_audience: "Customers who haven't been in for service in 6+ months.",
  offer_details: "$29 oil change + free 21-point inspection this month only.",
  voice_id: "katie",
  tone: "Friendly, local, no pressure",
  ai_intro: "Hi, this is Rocky calling from Mike's Motor Zone — is this {{first_name}}?",
  script_text:
    "Let them know their vehicle is due for service, mention the $29 oil change special, and offer two appointment times. If they're busy, offer to text the booking link.",
  things_to_avoid: "Never quote repair prices, never promise same-day availability, never call before 9 AM.",
  booking_link: "mikesmotorzone.com/book",
  call_window: "9:00 AM – 6:00 PM",
};

const TABS = [
  { id: "agent", label: "Configure AI Agent", sub: "Tell the AI who it's calling, what to say, and how to handle the conversation.", icon: Bot },
  { id: "workflow", label: "Build Workflow", sub: "Choose when calls, texts, emails, delays, and follow-ups should happen.", icon: WorkflowIcon },
  { id: "review", label: "Review & Submit", sub: "Confirm everything and send it to the team to go live.", icon: ClipboardCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DemoWorkflowStudio() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("agent");
  const [name, setName] = useState("Overdue Service Reactivation");
  const [agent, setAgent] = useState<SimpleAgentConfig>(DEMO_AGENT);
  const [graph, setGraph] = useState<WorkflowGraph>(TEMPLATES.standard.graph);
  const [consent, setConsent] = useState({ compliance: false, review: false });

  const tabIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-app-border bg-card p-2 shadow-card">
        <div className="grid gap-2 sm:grid-cols-3">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  active ? "bg-app-accent text-app-accent-foreground shadow-card" : "hover:bg-secondary/70",
                )}
              >
                <span
                  className={cn(
                    "size-8 rounded-lg grid place-items-center shrink-0",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </span>
                  <span className="block text-sm font-semibold truncate">{t.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{TABS[tabIndex].sub}</p>

      {tab === "agent" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card max-w-md">
            <label className="text-xs font-medium text-muted-foreground">Workflow name</label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <AgentSetup value={agent} onChange={(patch) => setAgent((a) => ({ ...a, ...patch }))} />
        </div>
      )}

      {tab === "workflow" && (
        <div className="rounded-2xl border border-app-border bg-card shadow-card overflow-hidden h-[620px]">
          <WorkflowCanvas value={graph} onChange={setGraph} />
        </div>
      )}

      {tab === "review" && (
        <ReviewSubmit
          agent={agent}
          workflow={graph}
          consent={consent}
          onConsentChange={(patch) => setConsent((c) => ({ ...c, ...patch }))}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={tabIndex === 0} onClick={() => setTab(TABS[Math.max(0, tabIndex - 1)].id)}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        {tab === "review" ? (
          <Button
            onClick={() =>
              toast({
                title: "Workflow submitted",
                description: "Demo mode — nothing was saved. Our team would review this and take it live.",
              })
            }
          >
            <Sparkles className="size-4" /> Submit for review
          </Button>
        ) : (
          <Button onClick={() => setTab(TABS[Math.min(TABS.length - 1, tabIndex + 1)].id)}>
            Continue <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
