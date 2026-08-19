import { useState } from "react";
import {
  Bell,
  Bot,
  CalendarCheck,
  CalendarDays,
  Car,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Database,
  Mail,
  MessageSquare,
  PhoneCall,
  PhoneMissed,
  Phone,
  Play,
  Search,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import rockyLogo from "@/assets/rocky-logo.png";


type Conversation = {
  id: string;
  datetime: string;
  name: string;
  intent: string;
  outcome: string;
  tone: "success" | "info" | "warning";
  transcript: { speaker: "Rocky AI" | "Customer"; text: string }[];
};

const conversations: Conversation[] = [
  {
    id: "1",
    datetime: "Today, 8:42 PM",
    name: "John Smith",
    intent: "PA State Inspection Renewal",
    outcome: "Booked (Tomorrow, 9 AM)",
    tone: "success",
    transcript: [
      { speaker: "Rocky AI", text: "Hi John, this is Rocky calling from Mike's Motor Zone. Our records show your PA state inspection expires at the end of this month." },
      { speaker: "Customer", text: "Oh wow, I completely forgot about that." },
      { speaker: "Rocky AI", text: "No problem at all. I have an opening tomorrow at 9 AM or Thursday at 1 PM. Which works better?" },
      { speaker: "Customer", text: "Tomorrow morning works." },
      { speaker: "Rocky AI", text: "You're all set for 9 AM tomorrow. I'll text you a confirmation right now." },
    ],
  },
  {
    id: "2",
    datetime: "Today, 6:15 PM",
    name: "Sarah Davis",
    intent: "Overdue Oil Change Reactivation",
    outcome: "Booked (Friday, 2 PM)",
    tone: "success",
    transcript: [
      { speaker: "Rocky AI", text: "Hi Sarah, it's Rocky from Mike's Motor Zone. It's been about seven months since your last oil change." },
      { speaker: "Customer", text: "Yeah, I've been putting it off." },
      { speaker: "Rocky AI", text: "Totally understand. We can get you in and out in about 30 minutes. Friday at 2 PM?" },
      { speaker: "Customer", text: "Friday at 2 is good." },
      { speaker: "Rocky AI", text: "Booked. Confirmation text is on the way." },
    ],
  },
  {
    id: "3",
    datetime: "Yesterday, 7:58 PM",
    name: "Mike Johnson",
    intent: "Inquiry on Used 2018 Subaru",
    outcome: "Test Drive Scheduled",
    tone: "info",
    transcript: [
      { speaker: "Customer", text: "Hi, is the 2018 Subaru Outback still available?" },
      { speaker: "Rocky AI", text: "It is — 62,000 miles, clean history report, listed at $17,900." },
      { speaker: "Customer", text: "Can I come see it?" },
      { speaker: "Rocky AI", text: "Absolutely. I have Saturday at 11 AM open for a test drive. Shall I lock that in?" },
      { speaker: "Customer", text: "Yes please." },
    ],
  },
  {
    id: "4",
    datetime: "Yesterday, 11:24 PM",
    name: "Amanda Lee",
    intent: "After-hours Towing Question",
    outcome: "Routed to Emergency Line",
    tone: "warning",
    transcript: [
      { speaker: "Customer", text: "My car broke down on Route 30, do you guys tow?" },
      { speaker: "Rocky AI", text: "I'm sorry to hear that. The shop is closed, but I can connect you to our 24/7 emergency towing partner right now." },
      { speaker: "Customer", text: "Yes, please do." },
      { speaker: "Rocky AI", text: "Connecting you now. I've also logged this so the service team follows up first thing in the morning." },
    ],
  },
];

const kpis = [
  {
    label: "Missed Calls Handled",
    value: "142",
    subtitle: "After-hours & overflow",
    icon: PhoneMissed,
    accent: "bg-blue-100 text-blue-700",
  },
  {
    label: "Inspection Renewals Booked",
    value: "28",
    subtitle: "Outbound PA inspection campaigns",
    icon: ClipboardCheck,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Service Appointments Scheduled",
    value: "54",
    subtitle: "Total booked this week",
    icon: CalendarCheck,
    accent: "bg-purple-100 text-purple-700",
  },
  {
    label: "Estimated Revenue Recovered",
    value: "$8,450",
    subtitle: "From reactivated routine maintenance",
    icon: TrendingUp,
    accent: "bg-amber-100 text-amber-700",
  },
];

const workflowNodes = [
  { icon: Database, title: "Shop Management System / CRM", desc: "Synced nightly with customer & vehicle records" },
  { icon: Search, title: "Identify Expiring PA Inspections", desc: "Flags vehicles due in the next 30 days" },
  { icon: PhoneCall, title: "Rocky AI Outbound Call", desc: "Natural voice agent dials during business hours" },
  { icon: CalendarCheck, title: "Customer Books Service", desc: "Slot written straight into the shop calendar" },
  { icon: MessageSquare, title: "Automated SMS Confirmation", desc: "Reminder sent 24 hours before the appointment" },
];

type Booking = {
  id: string;
  day: string;
  date: string;
  time: string;
  service: string;
  customer: string;
  phone: string;
  email: string;
  vehicle: string;
  status: "Confirmed" | "Pending Confirmation";
  nextSteps: string[];
  summary: string;
};

const bookings: Booking[] = [
  {
    id: "b1",
    day: "Thursday",
    date: "Aug 20, 2026",
    time: "9:00 AM",
    service: "PA State Inspection + Emissions",
    customer: "John Smith",
    phone: "(717) 555-0142",
    email: "j.smith@email.com",
    vehicle: "2019 Ford F-150 · 84,300 mi",
    status: "Confirmed",
    nextSteps: [
      "Pull inspection sticker inventory before 8 AM",
      "Confirm emissions bay availability",
      "SMS reminder auto-sends tonight at 6 PM",
    ],
    summary:
      "Rocky called John about his expiring PA inspection. He forgot the deadline, accepted the first available slot and asked how long the visit takes (~45 min). Booked for Thursday 9 AM and confirmation text sent.",
  },
  {
    id: "b2",
    day: "Friday",
    date: "Aug 21, 2026",
    time: "2:00 PM",
    service: "Full Synthetic Oil Change",
    customer: "Sarah Davis",
    phone: "(717) 555-0193",
    email: "sarah.davis@email.com",
    vehicle: "2021 Honda CR-V · 41,120 mi",
    status: "Confirmed",
    nextSteps: [
      "Quote tire rotation add-on at check-in",
      "Flag 7-month service gap in customer record",
    ],
    summary:
      "Reactivation call for an overdue oil change (last visit 7 months ago). Sarah admitted she'd been putting it off; Rocky offered a 30-minute in-and-out slot and booked Friday at 2 PM.",
  },
  {
    id: "b3",
    day: "Saturday",
    date: "Aug 22, 2026",
    time: "11:00 AM",
    service: "Test Drive · Used 2018 Subaru Outback",
    customer: "Mike Johnson",
    phone: "(717) 555-0288",
    email: "mjohnson@email.com",
    vehicle: "Interested in 2018 Subaru Outback · $17,900",
    status: "Confirmed",
    nextSteps: [
      "Have the Outback detailed and pulled up front",
      "Print the clean history report",
      "Sales rep to prep financing options",
    ],
    summary:
      "Inbound inquiry on the used 2018 Outback. Rocky confirmed availability, mileage (62k) and price, then scheduled a Saturday 11 AM test drive.",
  },
  {
    id: "b4",
    day: "Monday",
    date: "Aug 24, 2026",
    time: "8:30 AM",
    service: "Post-Tow Diagnostic Inspection",
    customer: "Amanda Lee",
    phone: "(717) 555-0311",
    email: "amanda.lee@email.com",
    vehicle: "2016 Toyota Camry · Towed from Route 30",
    status: "Pending Confirmation",
    nextSteps: [
      "Service manager to call Amanda first thing Monday",
      "Confirm the tow partner delivered the vehicle",
      "Send diagnostic estimate before starting work",
    ],
    summary:
      "After-hours breakdown call. Rocky routed her to the 24/7 towing partner and logged a follow-up diagnostic appointment for Monday morning pending vehicle drop-off.",
  },
];

const bookingStatusClass = (status: Booking["status"]) =>
  status === "Confirmed"
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    : "bg-amber-100 text-amber-800 hover:bg-amber-100";


const outcomeClass = (tone: Conversation["tone"]) =>
  tone === "success"
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    : tone === "info"
    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
    : "bg-amber-100 text-amber-800 hover:bg-amber-100";

const SidebarLink = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60"
    }`}
  >
    {icon}
    {label}
  </button>
);

const AutoDemo = () => {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [view, setView] = useState<"dashboard" | "calendar" | "workflows">("dashboard");
  const [toggles, setToggles] = useState({
    afterHours: true,
    reactivation: true,
    statusTexts: false,
  });


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 backdrop-blur border-b bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center">
              <img src={rockyLogo} alt="Rocky AI logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground leading-none">Rocky AI</div>
              <div className="text-base font-semibold leading-none">Customer Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm">
              Account
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 xl:col-span-2">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-base">Navigation</CardTitle>
              <CardDescription>Manage your account and agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <SidebarLink
                icon={<Bot className="h-4 w-4" />}
                label="Dashboard"
                active={view === "dashboard"}
                onClick={() => setView("dashboard")}
              />
              <SidebarLink
                icon={<CalendarDays className="h-4 w-4" />}
                label="Calendar"
                active={view === "calendar"}
                onClick={() => setView("calendar")}
              />
              <SidebarLink
                icon={<Workflow className="h-4 w-4" />}
                label="Workflows"
                active={view === "workflows"}
                onClick={() => setView("workflows")}
              />
              <SidebarLink icon={<Play className="h-4 w-4" />} label="Agent" />
              <SidebarLink icon={<User className="h-4 w-4" />} label="Profile" />
              <SidebarLink icon={<Settings className="h-4 w-4" />} label="Settings" />
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-9 xl:col-span-10 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, Mike's Motor Zone
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {view === "dashboard"
                  ? "Here's how your AI voice agent performed this week."
                  : "Appointments your AI agent booked, with call context and next steps."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              AI Agent Status: Active &amp; Taking Calls
            </div>
          </div>

          {view === "dashboard" && (
          <>


          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${kpi.accent}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                  <p className="text-sm font-medium mt-1">{kpi.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Recent AI Conversations</CardTitle>
                <CardDescription>Calls handled automatically by your agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Date/Time</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversations.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{c.datetime}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{c.name}</TableCell>
                          <TableCell className="text-sm">{c.intent}</TableCell>
                          <TableCell>
                            <Badge className={outcomeClass(c.tone)} variant="secondary">
                              {c.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                              View Transcript
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Automations &amp; Workflows</CardTitle>
                  <CardDescription>PA inspection reactivation campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {workflowNodes.map((node, i) => (
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
                        {i < workflowNodes.length - 1 && (
                          <div className="flex flex-col items-center py-1">
                            <span className="h-3 w-px bg-border" />
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="h-3 w-px bg-border" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Last run</span>
                    <span className="text-xs font-medium">Today, 5:00 PM · 37 contacts</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                  <CardDescription>Control your agent in one tap</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "afterHours" as const, label: "Enable After-Hours Answering" },
                    { key: "reactivation" as const, label: "Run Daily Maintenance Reactivation Calls" },
                    { key: "statusTexts" as const, label: "Send Status Update Texts" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <span className="text-sm">{item.label}</span>
                      <Switch
                        checked={toggles[item.key]}
                        onCheckedChange={(v) => setToggles((t) => ({ ...t, [item.key]: v }))}
                        aria-label={item.label}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          </>
          )}

          {view === "calendar" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold">{bookings.length}</p>
                    <p className="text-sm font-medium mt-1">Upcoming Bookings</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Booked by Rocky AI</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold">
                      {bookings.filter((b) => b.status === "Confirmed").length}
                    </p>
                    <p className="text-sm font-medium mt-1">Confirmed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">SMS confirmation sent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold">
                      {bookings.filter((b) => b.status === "Pending Confirmation").length}
                    </p>
                    <p className="text-sm font-medium mt-1">Needs Follow-Up</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Awaiting customer reply</p>
                  </CardContent>
                </Card>
              </div>

              {bookings.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <CardContent className="p-0 grid grid-cols-1 md:grid-cols-[160px_1fr]">
                    <div className="bg-muted/50 border-b md:border-b-0 md:border-r p-5 flex md:flex-col items-center md:items-start gap-3 md:gap-1">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{b.day}</p>
                        <p className="text-xs text-muted-foreground">{b.date}</p>
                        <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {b.time}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{b.service}</p>
                          <p className="text-sm text-muted-foreground">{b.customer}</p>
                        </div>
                        <Badge className={bookingStatusClass(b.status)} variant="secondary">
                          {b.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span className="truncate">{b.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{b.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="h-4 w-4 shrink-0" />
                          <span className="truncate">{b.vehicle}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                            Call Summary
                          </p>
                          <p className="text-sm leading-relaxed">{b.summary}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                            Next Steps
                          </p>
                          <ul className="space-y-1.5">
                            {b.nextSteps.map((step) => (
                              <li key={step} className="text-sm flex items-start gap-2">
                                <CalendarCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </main>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name} · Call Transcript</DialogTitle>
            <DialogDescription>
              {selected?.datetime} · {selected?.intent}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selected?.transcript.map((line, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm ${
                  line.speaker === "Rocky AI" ? "bg-primary/5 border border-primary/10" : "bg-muted/50"
                }`}
              >
                <p className="text-xs font-semibold text-muted-foreground mb-1">{line.speaker}</p>
                <p className="leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoDemo;
