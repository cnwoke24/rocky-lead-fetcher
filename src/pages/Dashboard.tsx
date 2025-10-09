import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [agreementSigned, setAgreementSigned] = useState(false);
  const allPrereqsDone = onboardingDone && agreementSigned;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailySummaries] = useState<Record<string, string>>({
    '2025-10-08': 'Today your AI agent completed its first workflow cycle, responding to customer inquiries and logging actions.',
    '2025-10-07': 'Agent initiated automated outreach and handled test calls successfully.',
  });

  const summaryText = dailySummaries[selectedDate] || 'No summary available for this day.';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signup");
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/signup");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10">
              <Bot className="h-5 w-5" />
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSignOut}>
              <User className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=RA" alt="User" />
              <AvatarFallback>RA</AvatarFallback>
            </Avatar>
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
              <StepPill done={onboardingDone} current={!onboardingDone} icon={<ClipboardCheck className="h-5 w-5" />} label="Onboarding Call" onAction={() => setOnboardingDone(true)} actionLabel={onboardingDone ? undefined : 'Mark Complete'} />
              <StepPill done={agreementSigned} current={onboardingDone && !agreementSigned} icon={<FileSignature className="h-5 w-5" />} label="Sign Agreement" onAction={() => setAgreementSigned(true)} disabled={!onboardingDone} actionLabel="Open Agreement" />
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
    </div>
  );
};

const StepPill = ({ done, current, icon, label, onAction, actionLabel, disabled }: any) => (
  <div className={`flex items-center gap-3 rounded-2xl border ${done ? 'border-green-200 bg-green-50' : current ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'} p-3`}>
    <div className={`h-9 w-9 grid place-items-center rounded-xl ${done ? 'bg-green-100' : current ? 'bg-primary/10' : 'bg-muted'}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-sm font-medium flex items-center gap-2">{label}{done && <Badge className="bg-green-600 hover:bg-green-600">Done</Badge>}{!done && current && <Badge variant="secondary">Next</Badge>}</div>
      <p className="text-xs text-muted-foreground mt-0.5">{done ? 'Completed' : current ? 'Action required' : 'Locked until previous step'}</p>
    </div>
    {onAction && !done && (<Button size="sm" onClick={onAction} disabled={disabled}>{actionLabel || 'Open'}</Button>)}
  </div>
);

const SidebarLink = ({ icon, label, active, disabled }: any) => (
  <button disabled={disabled} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border ${active ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted border-transparent'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
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