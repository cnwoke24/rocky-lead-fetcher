import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, CheckCircle, DollarSign, FileText, Power, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [agreement, setAgreement] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState(false);
  const [agreementContent, setAgreementContent] = useState("");
  const [amount, setAmount] = useState("");
  const [summaries, setSummaries] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: agreementData } = await supabase
      .from("agreements")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: agentData } = await supabase
      .from("agent_status")
      .select("is_enabled")
      .eq("user_id", userId)
      .single();

    const { data: summariesData } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("summary_date", { ascending: false })
      .limit(5);

    setProfile(profileData);
    setAgreement(agreementData);
    setAgentStatus(agentData?.is_enabled || false);
    setSummaries(summariesData || []);
    setLoading(false);
  };

  const markOnboardingComplete = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update onboarding status",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Onboarding marked as complete" });
    loadUserData();
  };

  const createAgreement = async () => {
    if (!agreementContent || !amount) {
      toast({
        title: "Error",
        description: "Please fill in both agreement content and amount",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("agreements")
      .insert({
        user_id: userId,
        content: agreementContent,
        amount_cents: parseInt(amount) * 100,
        status: "pending",
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create agreement",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Agreement created successfully" });
    setAgreementContent("");
    setAmount("");
    loadUserData();
  };

  const toggleAgent = async () => {
    const { error } = await supabase
      .from("agent_status")
      .update({ is_enabled: !agentStatus })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Agent ${!agentStatus ? "enabled" : "disabled"}`,
    });
    setAgentStatus(!agentStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Profile</CardTitle>
            <CardDescription>Basic information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm text-muted-foreground">{profile?.full_name || "N/A"}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm text-muted-foreground">{profile?.phone || "N/A"}</p>
            </div>
            <div>
              <Label>Company</Label>
              <p className="text-sm text-muted-foreground">{profile?.company_name || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Onboarding Status
                </CardTitle>
                <CardDescription>Mark when onboarding call is completed</CardDescription>
              </div>
              {profile?.onboarding_completed ? (
                <Badge className="bg-green-600">Complete</Badge>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!profile?.onboarding_completed && (
              <Button onClick={markOnboardingComplete}>Mark as Complete</Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agreement Management
            </CardTitle>
            <CardDescription>Create and manage customer agreements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agreement ? (
              <div className="space-y-2">
                <Label>Current Agreement Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      agreement.status === "paid"
                        ? "bg-green-600"
                        : agreement.status === "signed"
                        ? "bg-blue-600"
                        : ""
                    }
                    variant={agreement.status === "pending" ? "secondary" : "default"}
                  >
                    {agreement.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Amount: ${(agreement.amount_cents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agreement">Agreement Content</Label>
                  <Textarea
                    id="agreement"
                    value={agreementContent}
                    onChange={(e) => setAgreementContent(e.target.value)}
                    placeholder="Enter agreement terms..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={createAgreement}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Create Agreement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Power className="h-5 w-5" />
                  Agent Control
                </CardTitle>
                <CardDescription>Enable or disable the AI agent for this customer</CardDescription>
              </div>
              <Switch checked={agentStatus} onCheckedChange={toggleAgent} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Agent is currently {agentStatus ? "enabled" : "disabled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Summaries</CardTitle>
            <CardDescription>View recent AI agent activity summaries</CardDescription>
          </CardHeader>
          <CardContent>
            {summaries.length > 0 ? (
              <div className="space-y-3">
                {summaries.map((summary) => (
                  <div key={summary.id} className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-1">
                      {new Date(summary.summary_date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-muted-foreground">{summary.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No summaries available yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserDetails;
