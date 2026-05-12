import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, Eye, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  business_name: string | null;
  source: string | null;
  created_at: string;
}

interface VisitStats {
  uniqueVisitors: number;
  totalSeconds: number;
  avgSeconds: number;
}

const formatDuration = (totalSeconds: number) => {
  if (!totalSeconds) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h ? `${h}h` : null, m ? `${m}m` : null, `${s}s`].filter(Boolean).join(" ");
};

const GymLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<VisitStats>({ uniqueVisitors: 0, totalSeconds: 0, avgSeconds: 0 });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      toast({ title: "Access Denied", description: "Admin access required", variant: "destructive" });
      navigate("/dashboard");
      return;
    }
    await loadAll();
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{ data: leadsData, error: leadsErr }, { data: visits, error: visitsErr }] = await Promise.all([
        supabase.from("gym_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("page_visits").select("visitor_id,total_time_seconds").eq("page_path", "/gym"),
      ]);
      if (leadsErr) throw leadsErr;
      if (visitsErr) throw visitsErr;

      setLeads((leadsData as Lead[]) || []);

      const v = visits || [];
      const unique = v.length;
      const total = v.reduce((sum, row: any) => sum + (row.total_time_seconds || 0), 0);
      setStats({
        uniqueVisitors: unique,
        totalSeconds: total,
        avgSeconds: unique ? Math.round(total / unique) : 0,
      });
    } catch (err: any) {
      toast({ title: "Failed to load", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Admin</Link>
            </Button>
            <h1 className="text-2xl font-bold">Gym Funnel Leads</h1>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{leads.length}</div>
              <CardDescription>Form submissions on /gym</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uniqueVisitors}</div>
              <CardDescription>Distinct browsers on /gym</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatDuration(stats.avgSeconds)}</div>
              <CardDescription>Total: {formatDuration(stats.totalSeconds)}</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Captured Leads</CardTitle>
            <CardDescription>Most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : leads.length === 0 ? (
              <p className="text-muted-foreground text-sm">No leads yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => {
                      const d = new Date(lead.created_at);
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.business_name || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{lead.source || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymLeads;
