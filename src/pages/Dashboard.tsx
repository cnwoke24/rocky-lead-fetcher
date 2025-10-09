import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bell,
  Bot,
  ClipboardCheck,
  FileSignature,
  Lock,
  Play,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import rockyLogo from "@/assets/rocky-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [agreement, setAgreement] = useState<any>(null);
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailySummaries, setDailySummaries] = useState<Record<string, string>>({});

  const summaryText = dailySummaries[selectedDate] || 'No summary available for this day.';

  useEffect(() => {
    loadUserData();
    
    // Check for payment success/cancel
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast({ title: "Payment Successful", description: "Your setup fee has been processed!" });
    } else if (payment === "canceled") {
      toast({ title: "Payment Canceled", description: "You can try again anytime.", variant: "destructive" });
    }
  }, [searchParams]);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signup");
      return;
    }

    setUserId(session.user.id);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // Load agreement
    const { data: agreementData } = await supabase
      .from("agreements")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    // Load agent status
    const { data: agentData } = await supabase
      .from("agent_status")
      .select("is_enabled")
      .eq("user_id", session.user.id)
      .single();

    // Load summaries
    const { data: summariesData } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", session.user.id);

    const summariesMap: Record<string, string> = {};
    summariesData?.forEach((s) => {
      summariesMap[s.summary_date] = s.content;
    });

    setProfile(profileData);
    setAgreement(agreementData);
    setAgentEnabled(agentData?.is_enabled || false);
    setDailySummaries(summariesMap);
    setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/signup");
      }
    });

    return () => subscription.unsubscribe();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSignAgreement = async () => {
    if (!agreement) return;

    const { error } = await supabase
      .from("agreements")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", agreement.id);

    if (error) {
      toast({ title: "Error", description: "Failed to sign agreement", variant: "destructive" });
      return;
    }

    toast({ title: "Agreement Signed", description: "Redirecting to payment..." });
    setShowAgreementModal(false);

    // Call payment function
    const { data, error: paymentError } = await supabase.functions.invoke("create-payment");

    if (paymentError || !data?.url) {
      toast({
        title: "Error",
        description: "Failed to create payment session",
        variant: "destructive",
      });
      return;
    }

    window.open(data.url, "_blank");
  };

  const onboardingDone = profile?.onboarding_completed || false;
  const agreementSigned = agreement?.status === "signed" || agreement?.status === "paid";
  const allPrereqsDone = onboardingDone && agreementSigned;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center">
              <img src={rockyLogo} alt="Rocky AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground leading-none">Rocky AI</div>
              <div className="text-base font-semibold leading-none">Customer Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 xl:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Navigation</CardTitle>
              <CardDescription>Manage your account and agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <SidebarLink icon={<Bot className="h-4 w-4" />} label="Dashboard" active={true} />
              <SidebarLink icon={<Play className="h-4 w-4" />} label="Agent" disabled={!allPrereqsDone} />
              <SidebarLink icon={<User className="h-4 w-4" />} label="Profile" />
              <SidebarLink icon={<Settings className="h-4 w-4" />} label="Settings" />
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-9 xl:col-span-10 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to activate your AI voice agent.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <StepPill 
                done={onboardingDone} 
                current={!onboardingDone} 
                icon={<ClipboardCheck className="h-5 w-5" />} 
                label="Onboarding Call" 
                actionLabel={onboardingDone ? undefined : 'Pending'} 
              />
              <StepPill 
                done={agreementSigned} 
                current={onboardingDone && !agreementSigned} 
                icon={<FileSignature className="h-5 w-5" />} 
                label="Sign Agreement" 
                onAction={agreement && agreement.status === "pending" ? () => setShowAgreementModal(true) : undefined} 
                disabled={!onboardingDone || !agreement} 
                actionLabel={agreement && agreement.status === "pending" ? "Open Agreement" : onboardingDone && !agreement ? "Waiting for Admin" : undefined} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Your AI Voice Agent</h2>
                  <p className="text-sm text-muted-foreground mt-1">View your agent's workflow and performance.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!allPrereqsDone ? (
                <BlockedOverlay title="Agent Locked" subtitle="Complete onboarding and sign the agreement to unlock your agent." />
              ) : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=RockyAgent" alt="Agent" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold">Rocky Voice Agent</div>
                    <p className="text-sm text-muted-foreground">Automates customer outreach and qualification workflows.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Summary of the Day</h2>
                  <p className="text-sm text-muted-foreground mt-1">See what your AI agent accomplished.</p>
                </div>
                <Input type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} className="w-44" />
              </div>
            </CardHeader>
            <CardContent>
              {!allPrereqsDone ? (
                <BlockedOverlay title="Summary Locked" subtitle="Finish setup to start seeing daily summaries." />
              ) : (
                <div className="border rounded-xl p-4 bg-muted/20 min-h-[200px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <footer className="py-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Rocky AI. All rights reserved.</footer>
      
      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Agreement</DialogTitle>
            <DialogDescription>Please review and accept the agreement to proceed</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-muted/20">
            <pre className="text-sm whitespace-pre-wrap">{agreement?.content}</pre>
          </div>
          <div className="text-sm font-semibold">
            Total Amount: ${(agreement?.amount_cents / 100).toFixed(2)} USD
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgreementModal(false)}>Cancel</Button>
            <Button onClick={handleSignAgreement}>Accept & Pay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StepPill = ({ done, current, icon, label, onAction, actionLabel, disabled }: any) => (
  <div className={`flex items-center gap-3 rounded-2xl border ${done ? 'border-green-200 bg-green-50' : current ? 'border-blue-200 bg-blue-50' : 'border-border bg-muted/30'} p-3`}>
    <div className={`h-9 w-9 grid place-items-center rounded-xl ${done ? 'bg-green-100' : current ? 'bg-blue-100' : 'bg-muted'}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-sm font-medium flex items-center gap-2">{label}{done && <Badge className="bg-green-600 hover:bg-green-600">Done</Badge>}{!done && current && <Badge variant="secondary">Next</Badge>}</div>
      <p className="text-xs text-muted-foreground mt-0.5">{done ? 'Completed' : current ? 'Action required' : 'Locked until previous step'}</p>
    </div>
    {onAction && !done && (<Button size="sm" onClick={onAction} disabled={disabled}>{actionLabel || 'Open'}</Button>)}
  </div>
);

const SidebarLink = ({ icon, label, active, disabled }: any) => (
  <button disabled={disabled} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border ${active ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted border-transparent'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <span className="h-8 w-8 grid place-items-center rounded-lg bg-muted">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const BlockedOverlay = ({ title, subtitle }: any) => (
  <div className="relative">
    <div className="absolute inset-0 grid place-items-center rounded-xl border border-dashed bg-muted/30">
      <div className="text-center px-6">
        <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
      </div>
    </div>
    <div className="opacity-0 pointer-events-none select-none h-56" />
  </div>
);

export default Dashboard;