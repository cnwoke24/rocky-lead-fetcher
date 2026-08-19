import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Workflow as WorkflowIcon, ArrowRight, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusDot } from "@/components/stat-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type WorkflowRow = {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  graph: { nodes?: unknown[] } | null;
};

export default function Workflows() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    const { data } = await supabase
      .from("workflows")
      .select("id,name,status,updated_at,graph")
      .order("updated_at", { ascending: false });
    setRows((data as unknown as WorkflowRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("workflows").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <AppShell
      title="Workflows"
      subtitle="Design the call, text, and follow-up sequences your AI agent runs."
      actions={
        <Button asChild>
          <Link to="/workflows/new">
            <Plus className="size-4" /> New workflow
          </Link>
        </Button>
      }
    >
      {loading ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="max-w-2xl mx-auto py-12">
          <div className="rounded-2xl border border-app-border bg-card shadow-card p-8 text-center space-y-6">
            <div className="size-16 rounded-2xl gradient-primary grid place-items-center shadow-glow-sm mx-auto">
              <WorkflowIcon className="size-7 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Build your first AI workflow</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Configure your agent, drag in the calls, texts, and delays you want, and send it to our team
                to go live. Takes about 10 minutes.
              </p>
            </div>
            <Button asChild>
              <Link to="/workflows/new">
                Start building <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-app-border bg-card shadow-card overflow-hidden">
          <div className="divide-y divide-app-border">
            {rows.map((w) => (
              <div key={w.id} className="flex items-center gap-3 px-5 py-4">
                <StatusDot status={w.status} />
                <Link to={`/workflows/${w.id}`} className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate hover:underline">{w.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(w.graph?.nodes?.length ?? 1) - 1} steps · updated{" "}
                    {new Date(w.updated_at).toLocaleDateString()}
                  </div>
                </Link>
                <StatusBadge status={w.status} />
                <button
                  onClick={() => remove(w.id)}
                  className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition"
                  aria-label="Delete workflow"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
