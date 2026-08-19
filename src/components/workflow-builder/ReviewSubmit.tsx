import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { STEP_META, type WorkflowGraph } from "./types";
import type { SimpleAgentConfig } from "./AgentSetup";
import { getVoice } from "@/lib/voices";

export function ReviewSubmit({
  agent,
  workflow,
  consent,
  onConsentChange,
}: {
  agent: SimpleAgentConfig;
  workflow: WorkflowGraph;
  consent: { compliance: boolean; review: boolean };
  onConsentChange: (patch: Partial<{ compliance: boolean; review: boolean }>) => void;
}) {
  const steps = workflow.nodes.filter((n) => n.type !== "start");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card space-y-3">
        <h3 className="font-semibold tracking-tight">Agent configuration</h3>
        <dl className="divide-y divide-app-border text-sm">
          <Row label="Business" value={agent.business_name} />
          <Row label="Campaign" value={agent.campaign_name} />
          <Row label="Goal" value={agent.campaign_goal.replace(/_/g, " ")} />
          <Row label="Audience" value={agent.target_audience} />
          <Row label="Offer" value={agent.offer_details} />
          <Row label="Voice" value={getVoice(agent.voice_id)?.name ?? ""} />
          <Row label="Tone" value={agent.tone} />
          <Row label="Calling window" value={agent.call_window} />
          <Row label="Booking link" value={agent.booking_link} />
        </dl>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card">
          <h3 className="font-semibold tracking-tight mb-3">Workflow steps ({steps.length})</h3>
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No steps added yet. Go back to the builder and drag in a few steps.
            </p>
          ) : (
            <ol className="space-y-2">
              {steps.map((n, i) => {
                const meta = STEP_META[n.type];
                return (
                  <li
                    key={n.id}
                    className="flex items-center gap-3 rounded-xl border border-app-border bg-secondary/40 px-3 py-2"
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground tabular-nums w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-sm font-medium">{n.data.label || meta.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{meta.description}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-app-border bg-card p-5 shadow-card space-y-4">
          <h3 className="font-semibold tracking-tight">Before you submit</h3>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={consent.compliance}
              onCheckedChange={(v) => onConsentChange({ compliance: !!v })}
            />
            <span className="text-muted-foreground">
              I confirm I have permission to contact everyone on this list and will honor opt-out requests.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={consent.review}
              onCheckedChange={(v) => onConsentChange({ review: !!v })}
            />
            <span className="text-muted-foreground">
              I understand the Rocky team reviews this workflow before it goes live.
            </span>
          </label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <CheckCircle2 className="size-4 text-success" />
            Your draft is saved automatically as you build.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium break-words">{value || "—"}</dd>
    </div>
  );
}
