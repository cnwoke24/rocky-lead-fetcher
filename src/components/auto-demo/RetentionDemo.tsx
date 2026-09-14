import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon, BarChart3, Bot, Building2, Check, CheckCircle2, ChevronRight,
  CircleDollarSign, Database, FileSpreadsheet, History, Inbox, LayoutDashboard,
  Mail, Menu, PhoneCall, Repeat2, Search, Settings, ShieldCheck, Sparkles, Target, Upload, UserRound, Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import rockyLogo from "@/assets/rocky-logo.png";
import {
  analyticsData, campaigns, createCustomer, importFields, initialActivity, initialCalls, initialCustomers,
  journey, type Activity, type CallRecord, type Customer, type DemoView,
} from "./retention-data";
import {
  getCallOutcome, sampleImportRows, sendEmail, simulateCompletedVisit, syncCustomerData,
  triggerRetellCall, updateCustomerRecord, uploadCustomerFile, type ImportedRow,
} from "./mock-services";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "customers", label: "Customers", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: Target }, { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "integrations", label: "Integrations", icon: Database }, { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const kpis = [
  { label: "Customers At Risk", value: "142", icon: Users, note: "Need proactive outreach", priority: true },
  { label: "Calls Completed", value: "325", icon: PhoneCall, note: "Across active campaigns" },
  { label: "Conversations", value: "287", icon: ActivityIcon, note: "88% connection rate" },
  { label: "Appointments Booked", value: "86", icon: CheckCircle2, note: "30% of conversations" },
  { label: "Customers Recovered", value: "51", icon: UserRound, note: "Returned to the shop" },
  { label: "Revenue Recovered", value: "$32,450", icon: CircleDollarSign, note: "Estimated service value" },
];

const automations = [
  { id: "mike", title: "Bring Mike back for visit 4", detail: "Mike Prouse · 92 days since visit · $31.60 loyalty credit", time: "Today, 10:30 AM", type: "Personalized AI call", icon: PhoneCall },
  { id: "sarah", title: "Send Sarah a service reminder", detail: "Sarah Johnson · Visit 2 → 3 · Oil change reminder", time: "Today, 11:00 AM", type: "Follow-up email", icon: Mail },
  { id: "robert", title: "Reconnect with Robert", detail: "Robert Miller · Visit 3 → 4 · 119 days since visit", time: "Today, 1:00 PM", type: "Personalized AI call", icon: PhoneCall },
];

const journeyDisplay = [
  { icon: Users, title: "First impressions", action: "Earn the second visit" },
  { icon: Repeat2, title: "Building trust", action: "Keep momentum" },
  { icon: Target, title: "The turning point", action: "Bring them back" },
  { icon: ShieldCheck, title: "Loyal customers", action: "Reward their loyalty" },
];

const outreachSteps = ["Customer data loaded", "Visit stage identified", "Campaign selected", "Retell voice call triggered", "Waiting for call outcome", "Follow-up email prepared", "Dashboard updated"];

const fullName = (customer: Customer) => `${customer.firstName} ${customer.lastName}`;
const stageClass = (stage: Customer["visitStage"]) => stage === "Visit 3" ? "bg-retention-soft text-retention-soft-foreground border-retention/30" : stage === "Visit 4+" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20";
const statusClass = (status: Customer["status"]) => status === "At Risk" ? "bg-retention-soft text-retention-soft-foreground" : status === "Loyal Customer" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground";

export function RetentionDemo() {
  const { toast } = useToast();
  const [view, setView] = useState<DemoView>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [activities, setActivities] = useState<Activity[]>(initialActivity);
  const [calls, setCalls] = useState(initialCalls);
  const [query, setQuery] = useState("");
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachStep, setOutreachStep] = useState(-1);
  const [outreachRunning, setOutreachRunning] = useState(false);
  const [importRows, setImportRows] = useState<ImportedRow[]>([]);
  const [analyzedRows, setAnalyzedRows] = useState<ImportedRow[]>([]);
  const [importName, setImportName] = useState("");
  const [dragging, setDragging] = useState(false);

  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? null;
  const filteredCustomers = useMemo(() => customers.filter((customer) => `${fullName(customer)} ${customer.vehicle}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  const updateSelected = (patch: Partial<Customer>) => {
    if (!selectedId) return;
    setCustomers((current) => current.map((customer) => customer.id === selectedId ? { ...customer, ...patch } : customer));
  };

  const chooseScenario = (visits: number) => {
    const scenario = createCustomer(visits);
    setCustomers((current) => current.map((customer) => customer.id === "cust-mike" ? { ...scenario, phone: customer.phone, email: customer.email } : customer));
    toast({ title: `${scenario.visitStage} scenario loaded`, description: `Mike's goal is now: ${scenario.campaignGoal}.` });
  };

  const completeVisit = async () => {
    const mike = customers.find((customer) => customer.id === "cust-mike");
    if (!mike) return;
    const next = await simulateCompletedVisit(mike);
    chooseScenario(next);
    setActivities((current) => [
      { id: `sync-${Date.now()}`, title: `Mike Prouse moved from ${mike.visitStage} → ${next >= 4 ? "Visit 4+" : `Visit ${next}`}`, time: "Just now", kind: "stage" },
      { id: `visit-${Date.now()}`, title: "New completed visit received from Mike's existing shop system", time: "Just now", kind: "sync" },
      ...current,
    ]);
    toast({ title: "New completed visit received", description: "Rocky automatically updated the customer lifecycle." });
  };

  const startOutreach = async () => {
    const mike = customers.find((customer) => customer.id === "cust-mike");
    if (!mike || outreachRunning) return;
    setOutreachOpen(true); setOutreachRunning(true); setOutreachStep(0);
    for (let index = 0; index < outreachSteps.length; index += 1) {
      setOutreachStep(index);
      if (index === 3) await triggerRetellCall(mike);
      else if (index === 4) await getCallOutcome(mike);
      else if (index === 6) await updateCustomerRecord(mike);
      else await new Promise((resolve) => window.setTimeout(resolve, 420));
    }
    setCalls((current) => [{ ...initialCalls[0], id: `call-${Date.now()}`, date: "Just now", emailSent: false }, ...current]);
    setActivities((current) => [{ id: `call-${Date.now()}`, title: "Call completed with Mike Prouse", time: "Just now", kind: "call" }, ...current]);
    setOutreachRunning(false);
  };

  const sendDemoEmail = async () => {
    const mike = customers.find((customer) => customer.id === "cust-mike");
    if (!mike) return;
    await sendEmail(mike);
    setActivities((current) => [{ id: `email-${Date.now()}`, title: "Follow-up email sent to Mike Prouse", time: "Just now", kind: "email" }, ...current]);
    toast({ title: "Demo email sent", description: "The follow-up is now recorded in recent activity." });
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const rows = await uploadCustomerFile(file);
      setImportRows(rows); setAnalyzedRows([]); setImportName(file.name);
      toast({ title: `${rows.length} customers imported successfully` });
    } catch {
      toast({ title: "We couldn't read that file", description: "Use an XLSX or CSV file with a header row.", variant: "destructive" });
    }
  };

  const analyze = async () => {
    const rows = await syncCustomerData(importRows);
    setAnalyzedRows(rows);
    toast({ title: "Customer analysis complete", description: "Visit stages and next actions are ready." });
  };

  const navigate = (next: DemoView) => { setView(next); setMobileNav(false); };

  return (
    <div className="auto-demo-shell min-h-screen bg-app text-foreground lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col bg-demo-navy text-demo-navy-foreground lg:flex">
        <Sidebar view={view} navigate={navigate} />
      </aside>
      {mobileNav && <div className="fixed inset-0 z-50 lg:hidden"><Button aria-label="Close navigation" variant="ghost" className="absolute inset-0 h-full w-full rounded-none bg-demo-navy/60" onClick={() => setMobileNav(false)} /><aside className="relative h-full w-[72px] bg-demo-navy text-demo-navy-foreground"><Sidebar view={view} navigate={navigate} /></aside></div>}

      <div className="min-w-0 flex-1 lg:ml-[72px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-app-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground"><span className="truncate">Mike’s Motor Zone</span><span>/</span><span className="font-semibold text-foreground">{navItems.find((item) => item.id === view)?.label}</span></div>
          <Badge variant="outline" className="hidden font-normal text-muted-foreground sm:inline-flex">Demo data</Badge>
        </header>

        <main className="mx-auto max-w-[1180px] space-y-7 p-4 sm:p-6 lg:px-9 lg:py-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[clamp(1.55rem,3vw,2rem)] font-bold tracking-normal">{view === "overview" ? "Your customer journey, at a glance." : navItems.find((item) => item.id === view)?.label}</h1><p className="mt-1 text-sm text-muted-foreground">{view === "overview" ? "Build the next visit. Let Rocky handle the follow-up." : pageSubtitle[view]}</p></div>{view === "customers" && <Button className="bg-retention text-retention-foreground hover:bg-retention/90" onClick={() => setSelectedId("cust-mike")}><Sparkles /> Open Mike Prouse</Button>}</div>

          {view === "overview" && <Overview customers={customers} activities={activities} calls={calls} onCustomer={setSelectedId} onCall={setSelectedCall} onNavigate={navigate} onSendEmail={sendDemoEmail} />}
          {view === "customers" && <CustomersView customers={filteredCustomers} query={query} setQuery={setQuery} onCustomer={setSelectedId} importRows={importRows} analyzedRows={analyzedRows} importName={importName} dragging={dragging} setDragging={setDragging} handleFile={handleFile} loadSample={() => { setImportRows(sampleImportRows); setAnalyzedRows([]); setImportName("mikes-motor-zone-sample.xlsx"); }} analyze={analyze} />}
          {view === "campaigns" && <CampaignsView />}
          {view === "calls" && <CallsView calls={calls} onCall={setSelectedCall} />}
          {view === "integrations" && <IntegrationsView />}
          {view === "analytics" && <AnalyticsView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedId(null)}><SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl"><CustomerDetail customer={selectedCustomer} update={updateSelected} chooseScenario={chooseScenario} completeVisit={completeVisit} startOutreach={startOutreach} sendDemoEmail={sendDemoEmail} lastCall={calls[0]} onTranscript={() => setSelectedCall(calls[0])} /></SheetContent></Sheet>
      <Dialog open={outreachOpen} onOpenChange={(open) => !outreachRunning && setOutreachOpen(open)}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Rocky Outreach Workflow</DialogTitle><DialogDescription>Simulating the full retention workflow for Mike Prouse.</DialogDescription></DialogHeader><div className="space-y-2 py-2">{outreachSteps.map((step, index) => <div key={step} className={cn("flex items-center gap-3 rounded-md border p-3 text-sm", index === outreachStep && outreachRunning && "border-primary bg-primary/5", index <= outreachStep && "text-foreground")}><span className={cn("grid size-6 place-items-center rounded-full bg-muted text-xs", index < outreachStep || (!outreachRunning && index <= outreachStep) ? "bg-success text-success-foreground" : index === outreachStep ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{index < outreachStep || (!outreachRunning && index <= outreachStep) ? <Check className="size-3.5" /> : index + 1}</span><span className={index > outreachStep ? "text-muted-foreground" : "font-medium"}>{step}</span>{index === outreachStep && outreachRunning && <span className="ml-auto size-2 animate-pulse rounded-full bg-primary" />}</div>)}</div>{!outreachRunning && outreachStep >= 0 && <div className="flex items-center justify-between rounded-md bg-success/10 p-3 text-sm text-success"><span className="font-medium">Demo call completed successfully</span><Button size="sm" variant="outline" onClick={() => setOutreachOpen(false)}>View results</Button></div>}</DialogContent></Dialog>
      <TranscriptDialog call={selectedCall} close={() => setSelectedCall(null)} />
    </div>
  );
}

const pageSubtitle: Record<DemoView, string> = { overview: "", customers: "Track every customer’s visit stage and next best action.", campaigns: "Monitor Rocky’s retention outreach programs.", calls: "Review calls, outcomes, sentiment, and transcripts.", integrations: "See how shop data flows into and out of Rocky.", analytics: "Measure conversion, bookings, recovery, and revenue.", settings: "Review preferences for this demonstration account." };

function Sidebar({ view, navigate }: { view: DemoView; navigate: (view: DemoView) => void }) {
  return <TooltipProvider delayDuration={150}><div className="flex h-[76px] items-center justify-center"><div className="grid size-10 place-items-center rounded-lg bg-primary"><img src={rockyLogo} alt="Rocky Voice AI" className="size-7 object-contain" /></div></div><nav className="flex flex-1 flex-col items-center gap-3 px-3 pt-4">{navItems.map((item) => <UiTooltip key={item.id}><TooltipTrigger asChild><Button aria-label={item.label} variant="ghost" size="icon" onClick={() => navigate(item.id)} className={cn("size-11 text-demo-navy-muted hover:bg-demo-navy-accent hover:text-demo-navy-foreground", view === item.id && "bg-demo-navy-accent text-primary hover:bg-demo-navy-accent hover:text-primary")}><item.icon className="size-[18px]" /></Button></TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></UiTooltip>)}</nav><div className="pb-5"><UiTooltip><TooltipTrigger asChild><div tabIndex={0} className="grid size-10 place-items-center rounded-lg bg-retention text-sm font-bold text-retention-foreground">M</div></TooltipTrigger><TooltipContent side="right">Mike’s Motor Zone</TooltipContent></UiTooltip></div></TooltipProvider>;
}

function Overview({ customers, activities, calls, onCustomer, onCall, onNavigate, onSendEmail }: { customers: Customer[]; activities: Activity[]; calls: CallRecord[]; onCustomer: (id: string) => void; onCall: (call: CallRecord) => void; onNavigate: (view: DemoView) => void; onSendEmail: () => void }) {
  return <div className="space-y-8"><JourneyPanel /><div className="grid gap-6 xl:grid-cols-12"><div className="xl:col-span-7"><AutomationQueue /></div><div className="xl:col-span-5"><PerformanceOverview /></div></div><div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><Card data-dashboard-card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Customers At Risk</CardTitle><CardDescription>Highest-value retention opportunities</CardDescription></div><Button variant="outline" size="sm" onClick={() => onNavigate("customers")}>View all</Button></CardHeader><CardContent className="overflow-x-auto p-0"><CustomerTable customers={customers.slice(0, 4)} onCustomer={onCustomer} compact /></CardContent></Card><ActivityFeed activities={activities} /></div><div className="grid gap-6 xl:grid-cols-2"><LastCall call={calls[0]} onTranscript={() => onCall(calls[0])} /><EmailPreview onSend={onSendEmail} /></div></div>;
}

function JourneyPanel() {
  return <Card data-dashboard-card className="overflow-hidden border-t-[3px] border-t-primary"><CardHeader className="pb-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Retention starts here</p><CardTitle className="text-xl">Customer journey</CardTitle><CardDescription>From a first visit to a lasting relationship.</CardDescription></CardHeader><CardContent className="p-3 pt-0 sm:p-5 sm:pt-0"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{journey.map((item, index) => { const display = journeyDisplay[index]; const Icon = display.icon; const priority = item.stage === "Visit 3"; return <div key={item.stage} className={cn("flex min-h-48 flex-col rounded-lg border border-transparent bg-app p-4", priority && "border-retention bg-retention-soft")}><div className={cn("grid size-9 place-items-center rounded-lg bg-card text-primary", priority && "text-retention-soft-foreground")}><Icon className="size-4" /></div><p className={cn("mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground", priority && "text-retention-soft-foreground")}>{item.stage.replace("Visit ", "Visit 0")} {priority && "· Priority"}</p><p className="mt-1 text-sm font-semibold">{display.title}</p><p className="mt-4 text-3xl font-bold">{item.count.toLocaleString()}</p><p className="text-xs text-muted-foreground">customers</p><p className={cn("mt-auto pt-4 text-xs font-medium text-primary", priority && "text-retention-soft-foreground")}>{display.action} →</p></div>; })}</div></CardContent><div className="flex items-start gap-3 border-t border-retention/15 bg-retention-soft px-5 py-4"><Target className="mt-0.5 size-4 shrink-0 text-retention-soft-foreground" /><div><p className="text-xs font-semibold">Priority: turn the third visit into the fourth.</p><p className="mt-0.5 text-xs text-muted-foreground">Personalized calls and loyalty-credit reminders help bring these customers back.</p></div></div></Card>;
}

function AutomationQueue() {
  const [paused, setPaused] = useState<string[]>([]);
  return <Card data-dashboard-card className="h-full"><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-lg">Automations up next</CardTitle><CardDescription>The next steps Rocky will take for your customers.</CardDescription></div><Badge className="bg-primary/10 text-primary hover:bg-primary/10">3 queued</Badge></CardHeader><CardContent className="divide-y p-0 px-5">{automations.map((item) => { const Icon = item.icon; const isPaused = paused.includes(item.id); return <div key={item.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-primary"><Icon className="size-4" /></div><div className="min-w-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p></div></div><div className="flex items-center justify-between gap-4 pl-[52px] sm:pl-0"><div><p className="text-xs font-semibold">{item.time}</p><p className="text-[11px] text-muted-foreground">{item.type}</p></div><Button variant="outline" size="sm" onClick={() => setPaused((current) => isPaused ? current.filter((id) => id !== item.id) : [...current, item.id])}>{isPaused ? "Resume" : "Pause"}</Button></div></div>; })}</CardContent></Card>;
}

function PerformanceOverview() {
  return <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold">Performance overview</h2><p className="text-xs text-muted-foreground">Sample results across your retention program.</p></div><span className="text-[10px] text-muted-foreground">Demo totals</span></div><div className="grid grid-cols-2 gap-3">{kpis.map((kpi, index) => <Card key={kpi.label} data-dashboard-card className={cn(index === kpis.length - 1 && "bg-app-accent")}><CardContent className="relative p-4"><kpi.icon className="absolute right-4 top-4 size-4 text-muted-foreground" /><p className="pr-6 text-[11px] text-muted-foreground">{kpi.label}</p><p className="mt-3 text-2xl font-bold">{kpi.value}</p><p className="mt-1 text-[10px] text-muted-foreground">{kpi.note}</p></CardContent></Card>)}</div></section>;
}

function CustomerTable({ customers, onCustomer, compact = false }: { customers: Customer[]; onCustomer: (id: string) => void; compact?: boolean }) {
  return <Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Vehicle</TableHead><TableHead>Stage</TableHead>{!compact && <><TableHead>Last Visit</TableHead><TableHead>Credit</TableHead><TableHead>Service</TableHead></>}<TableHead>Status</TableHead><TableHead>Next Best Action</TableHead></TableRow></TableHeader><TableBody>{customers.map((customer) => <TableRow key={customer.id} role="button" tabIndex={0} className="cursor-pointer" onClick={() => onCustomer(customer.id)} onKeyDown={(event) => event.key === "Enter" && onCustomer(customer.id)}><TableCell><p className="font-semibold">{fullName(customer)}</p><p className="text-xs text-muted-foreground">{customer.daysSinceVisit} days since visit</p></TableCell><TableCell className="whitespace-nowrap">{customer.vehicle}</TableCell><TableCell><Badge variant="outline" className={stageClass(customer.visitStage)}>{customer.visitStage}</Badge></TableCell>{!compact && <><TableCell className="whitespace-nowrap">{customer.lastVisit}</TableCell><TableCell>${customer.loyaltyCredit.toFixed(2)}</TableCell><TableCell>{customer.recommendedService}</TableCell></>}<TableCell><Badge className={statusClass(customer.status)}>{customer.status}</Badge></TableCell><TableCell><span className="flex items-center gap-1 font-medium text-primary">{customer.nextAction}<ChevronRight className="size-3.5" /></span></TableCell></TableRow>)}</TableBody></Table>;
}

function ActivityFeed({ activities }: { activities: Activity[] }) { const icons = { call: PhoneCall, email: Mail, appointment: CheckCircle2, stage: Target, sync: Database }; return <Card data-dashboard-card><CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest automated actions and outcomes</CardDescription></CardHeader><CardContent className="space-y-4">{activities.slice(0, 6).map((activity) => { const Icon = icons[activity.kind]; return <div key={activity.id} className="flex gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-3.5" /></div><div><p className="text-sm font-medium leading-tight">{activity.title}</p><p className="mt-1 text-xs text-muted-foreground">{activity.time}</p></div></div>; })}</CardContent></Card>; }

function CustomersView(props: { customers: Customer[]; query: string; setQuery: (value: string) => void; onCustomer: (id: string) => void; importRows: ImportedRow[]; analyzedRows: ImportedRow[]; importName: string; dragging: boolean; setDragging: (value: boolean) => void; handleFile: (file?: File) => void; loadSample: () => void; analyze: () => void }) {
  return <Tabs defaultValue="customers"><TabsList><TabsTrigger value="customers">Customer tracking</TabsTrigger><TabsTrigger value="upload">Upload customers</TabsTrigger></TabsList><TabsContent value="customers" className="mt-5"><Card className="border-app-border shadow-card"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Customer Lifecycle</CardTitle><CardDescription>Click a row to inspect context and begin outreach.</CardDescription></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="pl-9" placeholder="Search customers" /></div></div></CardHeader><CardContent className="p-0"><CustomerTable customers={props.customers} onCustomer={props.onCustomer} /></CardContent></Card></TabsContent><TabsContent value="upload" className="mt-5"><Card className="border-app-border shadow-card"><CardHeader><CardTitle>Upload Customers</CardTitle><CardDescription>Import an XLSX or CSV export from Mike’s existing shop system.</CardDescription></CardHeader><CardContent className="space-y-5"><label onDragOver={(event) => { event.preventDefault(); props.setDragging(true); }} onDragLeave={() => props.setDragging(false)} onDrop={(event) => { event.preventDefault(); props.setDragging(false); props.handleFile(event.dataTransfer.files[0]); }} className={cn("flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition", props.dragging ? "border-primary bg-primary/5" : "border-app-border bg-muted/20 hover:border-primary/40")}><input type="file" className="sr-only" accept=".xlsx,.xls,.csv" onChange={(event) => props.handleFile(event.target.files?.[0])} /><div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Upload /></div><p className="mt-3 font-semibold">Drop an Excel or CSV file here</p><p className="mt-1 text-sm text-muted-foreground">Expected columns include customer, vehicle, visit, service, and loyalty data.</p></label><div className="flex flex-wrap items-center gap-3"><Button variant="outline" onClick={props.loadSample}><FileSpreadsheet /> Load 30-customer sample</Button>{props.importName && <span className="text-sm text-muted-foreground">Loaded: {props.importName}</span>}</div>{props.importRows.length > 0 && <ImportPreview rows={props.analyzedRows.length ? props.analyzedRows : props.importRows} analyzed={props.analyzedRows.length > 0} onAnalyze={props.analyze} />}</CardContent></Card></TabsContent></Tabs>;
}

function ImportPreview({ rows, analyzed, onAnalyze }: { rows: ImportedRow[]; analyzed: boolean; onAnalyze: () => void }) { const columns = analyzed ? ["first_name", "last_name", "vehicle_make", "lifetime_visits", "visit_stage", "risk_status", "next_best_action"] : importFields.slice(0, 7); return <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{rows.length} customers imported successfully.</p><p className="text-sm text-muted-foreground">{analyzed ? "Rocky assigned lifecycle stages and next actions." : "Review the first records, then analyze the list."}</p></div>{!analyzed && <Button onClick={onAnalyze}><Sparkles /> Analyze Customers</Button>}</div><div className="rounded-md border"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column} className="whitespace-nowrap text-xs">{column.replace(/_/g, " ")}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.slice(0, 6).map((row, index) => <TableRow key={index}>{columns.map((column) => <TableCell key={column} className="whitespace-nowrap text-xs">{String(row[column] ?? "—")}</TableCell>)}</TableRow>)}</TableBody></Table></div><p className="text-xs text-muted-foreground">Previewing 6 of {rows.length} imported customers.</p></div>; }

function CustomerDetail({ customer, update, chooseScenario, completeVisit, startOutreach, sendDemoEmail, lastCall, onTranscript }: { customer: Customer | null; update: (patch: Partial<Customer>) => void; chooseScenario: (visits: number) => void; completeVisit: () => void; startOutreach: () => void; sendDemoEmail: () => void; lastCall: CallRecord; onTranscript: () => void }) { if (!customer) return null; const isMike = customer.id === "cust-mike"; return <div><SheetHeader className="border-b p-6 pr-12"><div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">{customer.firstName[0]}{customer.lastName[0]}</div><div><SheetTitle className="text-xl">{fullName(customer)}</SheetTitle><SheetDescription>{customer.vehicle} · {customer.visitStage}</SheetDescription></div></div></SheetHeader><div className="space-y-6 p-6"><div className="grid grid-cols-2 gap-4"><EditableField label="Phone" value={customer.phone} onChange={(phone) => update({ phone })} /><EditableField label="Email" value={customer.email} onChange={(email) => update({ email })} /><Detail label="Completed Visits" value={String(customer.completedVisits)} /><Detail label="Last Visit" value={customer.lastVisit} /><Detail label="Last Service" value={customer.lastService} /><Detail label="Recommended Service" value={customer.recommendedService} /><Detail label="Loyalty Credit" value={`$${customer.loyaltyCredit.toFixed(2)}`} /><Detail label="Retention Stage" value={`${customer.visitStage} ${customer.completedVisits < 4 ? `→ Visit ${customer.completedVisits + 1}` : "· Long-term customer"}`} /></div><div className="rounded-md border border-primary/20 bg-primary/5 p-4"><div className="flex items-center gap-2 font-semibold text-primary"><Bot className="size-4" /> Rocky AI Insight</div><p className="mt-2 text-sm leading-relaxed">{customer.firstName} has completed {customer.completedVisits} visit{customer.completedVisits === 1 ? "" : "s"} and {customer.visitStage === "Visit 3" ? "is entering a high-value retention stage" : `is currently in the ${customer.visitStage} lifecycle stage`}. Recommended action: contact {customer.firstName.toLowerCase() === "mike" ? "him" : "them"} about {customer.recommendedService.toLowerCase()} and ${customer.loyaltyCredit.toFixed(2)} in available loyalty credit.</p></div><Button className="h-12 w-full bg-retention text-retention-foreground hover:bg-retention/90" onClick={startOutreach}><PhoneCall /> START OUTREACH</Button>{isMike && <><div><div className="mb-3"><h3 className="font-semibold">Live Demo Controls</h3><p className="text-sm text-muted-foreground">Change Mike’s lifecycle position during the presentation.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[1,2,3,4].map((visits) => <Button key={visits} variant={customer.completedVisits === visits ? "default" : "outline"} className={customer.completedVisits === visits && visits === 3 ? "bg-retention text-retention-foreground hover:bg-retention/90" : ""} onClick={() => chooseScenario(visits)}>Visit {visits === 4 ? "4+" : visits}</Button>)}</div><Button variant="outline" className="mt-2 w-full" onClick={completeVisit}><Database /> Simulate Completed Visit</Button></div><LastCall call={lastCall} onTranscript={onTranscript} compact /><EmailPreview onSend={sendDemoEmail} /></>}</div></div>; }

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div className="col-span-2 sm:col-span-1"><Label className="text-xs text-muted-foreground">{label}</Label><Input className="mt-1 h-9" value={value} onChange={(event) => onChange(event.target.value)} /></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>; }

function LastCall({ call, onTranscript, compact = false }: { call: CallRecord; onTranscript: () => void; compact?: boolean }) { return <Card className="border-app-border shadow-card"><CardHeader className={compact ? "p-4" : undefined}><CardTitle className={compact ? "text-base" : undefined}>Last Call Outcome</CardTitle><CardDescription>{call.customer} · {call.duration}</CardDescription></CardHeader><CardContent className={cn("space-y-4", compact && "p-4 pt-0")}><div className="grid grid-cols-2 gap-3 text-sm"><Detail label="Sentiment" value={call.sentiment} /><Detail label="Call Outcome" value={call.outcome} /><Detail label="Appointment" value={call.appointment} /><Detail label="Service Discussed" value={call.service} /><Detail label="Loyalty Credit" value={call.loyaltyCredit} /><Detail label="Follow-Up Email" value={call.emailSent ? "Sent" : "Prepared"} /></div><div className="rounded-md bg-muted/50 p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Transcript Summary</p><p className="mt-1 text-sm leading-relaxed">{call.summary}</p></div><Button variant="outline" size="sm" onClick={onTranscript}><History /> View Full Transcript</Button></CardContent></Card>; }

function EmailPreview({ onSend }: { onSend: () => void }) { return <Card className="border-app-border shadow-card"><CardHeader><CardTitle>Follow-Up Email Preview</CardTitle><CardDescription>Prepared from call context and customer data</CardDescription></CardHeader><CardContent><div className="rounded-md border bg-card p-4 text-sm"><p><strong>Subject:</strong> Following up from Mike’s Motor Zone</p><div className="mt-4 space-y-3 text-muted-foreground"><p>Hi Mike,</p><p>Great speaking with you.</p><p>As discussed, you’re coming up on your next maintenance visit for your Accord and currently have $31.60 in loyalty credit available.</p><p>When you’re ready, reply here or contact the shop to schedule.</p><p>Mike’s Motor Zone</p></div></div><Button className="mt-4" onClick={onSend}><Mail /> Send Demo Email</Button></CardContent></Card>; }

function CampaignsView() { return <Card className="border-app-border shadow-card"><CardHeader><CardTitle>Retention Campaigns</CardTitle><CardDescription>Performance across the customer lifecycle.</CardDescription></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Customers</TableHead><TableHead>Calls</TableHead><TableHead>Conversations</TableHead><TableHead>Appointments</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{campaigns.map((campaign) => <TableRow key={campaign.name}><TableCell className="font-semibold">{campaign.name}</TableCell><TableCell>{campaign.customers}</TableCell><TableCell>{campaign.calls}</TableCell><TableCell>{campaign.conversations}</TableCell><TableCell>{campaign.appointments}</TableCell><TableCell><Badge className={campaign.status === "Priority" ? "bg-retention text-retention-foreground" : campaign.status === "Paused" ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}>{campaign.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>; }

function CallsView({ calls, onCall }: { calls: CallRecord[]; onCall: (call: CallRecord) => void }) { return <Card className="border-app-border shadow-card"><CardHeader><CardTitle>Call History</CardTitle><CardDescription>Every outreach attempt and post-call result.</CardDescription></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Campaign</TableHead><TableHead>Call Date</TableHead><TableHead>Duration</TableHead><TableHead>Outcome</TableHead><TableHead>Sentiment</TableHead><TableHead>Appointment</TableHead><TableHead>Email</TableHead><TableHead>Transcript</TableHead></TableRow></TableHeader><TableBody>{calls.map((call) => <TableRow key={call.id}><TableCell className="font-semibold">{call.customer}</TableCell><TableCell className="max-w-56 truncate">{call.campaign}</TableCell><TableCell className="whitespace-nowrap">{call.date}</TableCell><TableCell>{call.duration}</TableCell><TableCell>{call.outcome}</TableCell><TableCell><Badge className={call.sentiment === "Positive" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{call.sentiment}</Badge></TableCell><TableCell>{call.appointment}</TableCell><TableCell>{call.emailSent ? "Sent" : "Prepared"}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => onCall(call)}>View</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>; }

function IntegrationsView() { const integrations = [{ icon: Building2, name: "Shop Management System / CRM", status: "Demo Sync", desc: "Reads customer, vehicle, visit, service, and loyalty data." }, { icon: PhoneCall, name: "Retell Voice AI", status: "Connected", desc: "Handles outbound AI voice calls." }, { icon: Mail, name: "Email", status: "Connected", desc: "Sends personalized follow-up emails after calls." }, { icon: Inbox, name: "Slack", status: "Available", desc: "Can be used as an optional campaign trigger." }]; const intoRocky = [["Customer Name","Customer Name"],["Vehicle","Vehicle"],["Visit Count","Retention Stage"],["Last Visit","Outreach Timing"],["Service History","Conversation Context"],["Loyalty Credit","Offer Context"],["Recommended Service","Campaign Message"]]; const back = ["Call Outcome","Appointment Result","Callback Request","Conversation Summary","Last Contact Date"]; return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{integrations.map((item) => <Card key={item.name} className="border-app-border shadow-card"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><item.icon className="size-5" /></div><Badge className={item.status === "Demo Sync" ? "bg-retention-soft text-retention-soft-foreground" : "bg-success/10 text-success"}>{item.status}</Badge></div><h3 className="mt-4 font-semibold">{item.name}</h3><p className="mt-2 text-sm text-muted-foreground">{item.desc}</p></CardContent></Card>)}</div><div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm"><strong>Mike’s existing system remains the source of truth.</strong> Rocky uses synchronized customer context to run retention outreach.</div><Card className="border-app-border shadow-card"><CardHeader><CardTitle>Data Sync</CardTitle><CardDescription>Example field mapping for the proposed integration.</CardDescription></CardHeader><CardContent className="grid gap-8 lg:grid-cols-2"><div><h3 className="mb-3 font-semibold">Mike’s Shop System → Rocky</h3><div className="space-y-2">{intoRocky.map(([from,to]) => <div key={from} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border p-2 text-sm"><span>{from}</span><ChevronRight className="size-4 text-muted-foreground" /><span className="font-medium text-primary">{to}</span></div>)}</div></div><div><h3 className="mb-3 font-semibold">Rocky → Shop System</h3><div className="grid gap-2 sm:grid-cols-2">{back.map((item) => <div key={item} className="flex items-center gap-2 rounded-md border p-3 text-sm"><CheckCircle2 className="size-4 text-success" />{item}</div>)}</div><p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">Write-back capability depends on the API capabilities of the existing shop system.</p></div></CardContent></Card></div>; }

function AnalyticsView() { const chartData = campaigns.map((campaign) => ({ name: campaign.name.split(" ").slice(0,3).join(" "), appointments: campaign.appointments, conversations: campaign.conversations })); return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-3">{analyticsData.map((item, index) => <Card key={item.name} className={cn("border-app-border shadow-card", index === 2 && "border-retention/30")}><CardContent className="p-5"><p className="text-sm font-medium text-muted-foreground">{item.name} conversion</p><p className="mt-2 text-3xl font-bold">{item.conversion}%</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full bg-primary", index === 2 && "bg-retention")} style={{ width: `${item.conversion}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{item.customers} customers reached this stage</p></CardContent></Card>)}</div><div className="grid gap-6 xl:grid-cols-3"><Card className="border-app-border shadow-card xl:col-span-2"><CardHeader><CardTitle>Campaign Performance</CardTitle><CardDescription>Conversations compared with appointments booked</CardDescription></CardHeader><CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="conversations" fill="hsl(var(--primary))" radius={[4,4,0,0]} /><Bar dataKey="appointments" fill="hsl(var(--retention))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></CardContent></Card><Card className="border-app-border shadow-card"><CardHeader><CardTitle>Recovered Value</CardTitle><CardDescription>Demo impact this quarter</CardDescription></CardHeader><CardContent className="space-y-5"><Metric label="Appointments booked" value="86" /><Metric label="Customers recovered" value="51" /><Metric label="Estimated revenue recovered" value="$32,450" /><Metric label="Average recovered service" value="$636" /></CardContent></Card></div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="flex items-end justify-between border-b pb-3"><span className="text-sm text-muted-foreground">{label}</span><strong className="text-xl">{value}</strong></div>; }

function SettingsView() { const [settings, setSettings] = useState({ email: true, daily: true, priority: true }); return <div className="grid gap-6 xl:grid-cols-2"><Card className="border-app-border shadow-card"><CardHeader><CardTitle>Demo Account</CardTitle><CardDescription>Presentation-safe information for Mike’s Motor Zone.</CardDescription></CardHeader><CardContent className="space-y-4"><Detail label="Business" value="Mike’s Motor Zone" /><Detail label="Workspace" value="Automotive Customer Retention" /><Detail label="Data mode" value="Interactive sample data" /><Detail label="Primary campaign" value="Visit 3 → Visit 4 Priority Retention" /></CardContent></Card><Card className="border-app-border shadow-card"><CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Local demo preferences only.</CardDescription></CardHeader><CardContent className="space-y-5">{[{ key: "email" as const, label: "Email outcome alerts" }, { key: "daily" as const, label: "Daily retention summary" }, { key: "priority" as const, label: "Visit 3 priority alerts" }].map((item) => <div key={item.key} className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{item.label}</span><Switch checked={settings[item.key]} onCheckedChange={(checked) => setSettings((current) => ({ ...current, [item.key]: checked }))} /></div>)}</CardContent></Card></div>; }

function TranscriptDialog({ call, close }: { call: CallRecord | null; close: () => void }) { return <Dialog open={!!call} onOpenChange={(open) => !open && close()}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{call?.customer} · Call Transcript</DialogTitle><DialogDescription>{call?.campaign} · {call?.date} · {call?.duration}</DialogDescription></DialogHeader><div className="max-h-[65vh] space-y-4 overflow-y-auto"><div className="rounded-md bg-muted p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">AI Summary</p><p className="mt-2 text-sm leading-relaxed">{call?.summary}</p></div><div className="space-y-2">{call?.transcript.map((line, index) => <div key={index} className={cn("max-w-[88%] rounded-md p-3 text-sm", line.speaker === "Rocky AI" ? "bg-primary/10" : "ml-auto bg-muted")}><p className="mb-1 text-xs font-semibold text-muted-foreground">{line.speaker}</p><p>{line.text}</p></div>)}</div></div></DialogContent></Dialog>; }