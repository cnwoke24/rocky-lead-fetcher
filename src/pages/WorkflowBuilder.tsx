import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bot, ClipboardCheck, Loader2, Workflow as WorkflowIcon, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorkflowCanvas } from "@/components/workflow-builder/WorkflowCanvas";
import { AgentSetup, EMPTY_SIMPLE_AGENT, type SimpleAgentConfig } from "@/components/workflow-builder/AgentSetup";
import { ReviewSubmit } from "@/components/workflow-builder/ReviewSubmit";
import { EMPTY_WORKFLOW, type WorkflowGraph } from "@/components/workflow-builder/types";

type TabId = "agent" | "workflow" | "review";

const TABS: { id: TabId; label: string; sub: string; icon: typeof Bot }[] = [
  { id: "agent", label: "Configure AI Agent", sub: "Tell the AI who it's calling, what to say, and how to handle the conversation.", icon: Bot },
  { id: "workflow", label: "Build Workflow", sub: "Choose when calls, texts, emails, delays, and follow-ups should happen.", icon: WorkflowIcon },
  { id: "review", label: "Review & Submit", sub: "Confirm everything and send it to the team for review.", icon: ClipboardCheck },
];

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(id ?? null);
  const [name, setName] = useState("Untitled workflow");
  const [status, setStatus] = useState("draft");
  const [tab, setTab] = useState<TabId>("agent");
  const [agent, setAgent] = useState<SimpleAgentConfig>(EMPTY_SIMPLE_AGENT);
  const [graph, setGraph] = useState<WorkflowGraph>(EMPTY_WORKFLOW);
  const [consent, setConsent] = useState({ compliance: false, review: false });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      if (id) {
        const { data } = await supabase.from("workflows").select("*").eq("id", id).maybeSingle();
        if (data) {
          setName(data.name);
          setStatus(data.status);
          setAgent({ ...EMPTY_SIMPLE_AGENT, ...((data.agent_config as object) ?? {}) } as SimpleAgentConfig);
          const g = data.graph as unknown as WorkflowGraph;
          if (g?.nodes?.length) setGraph(g);
        }
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  const persist = async (extra: Record<string, unknown> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const payload = {
      user_id: session.user.id,
      name,
      agent_config: agent as unknown as Record<string, unknown>,
      graph: graph as unknown as Record<string, unknown>,
      ...extra,
    };
    if (workflowId) {
      const { error } = await supabase.from("workflows").update(payload).eq("id", workflowId);
      if (error) throw error;
      return workflowId;
    }
    const { data, error } = await supabase.from("workflows").insert(payload).select("id").single();
    if (error) throw error;
    setWorkflowId(data.id);
    return data.id;
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      await persist();
      if (!silent) toast({ title: "Draft saved", description: "Your workflow has been saved." });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!consent.compliance || !consent.review) {
      toast({ title: "Confirm the checkboxes", description: "Both confirmations are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await persist({ status: "submitted" });
      setStatus("submitted");
      toast({ title: "Workflow submitted", description: "Our team will review it and get it live." });
      navigate("/workflows");
    } catch (e) {
      toast({
        title: "Could not submit",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Loading…">
        <div className="grid place-items-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const activeTab = TABS[tabIndex];

  return (
    <AppShell
      title={id ? "Edit workflow" : "Create workflow"}
      subtitle="Set up your AI agent, map the sequence, then send it for review."
      actions={
        <>
          <Button variant="outline" onClick={() => navigate("/workflows")}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save draft
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-app-border bg-card p-2 shadow-card mb-5">
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
                    active ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
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

      <p className="text-sm text-muted-foreground mb-4">{activeTab.sub}</p>

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
        <div className="rounded-2xl border border-app-border bg-card shadow-card overflow-hidden h-[640px]">
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

      <div className="flex items-center justify-between gap-3 mt-6">
        <Button
          variant="outline"
          disabled={tabIndex === 0}
          onClick={() => setTab(TABS[Math.max(0, tabIndex - 1)].id)}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        {tab === "review" ? (
          <Button onClick={handleSubmit} disabled={saving || status === "submitted"}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <ClipboardCheck className="size-4" />}
            Submit for review
          </Button>
        ) : (
          <Button
            onClick={async () => {
              await handleSave(true);
              setTab(TABS[Math.min(TABS.length - 1, tabIndex + 1)].id);
            }}
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </AppShell>
  );
}
