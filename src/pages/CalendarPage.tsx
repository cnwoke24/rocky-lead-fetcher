import { useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard, StatusBadge } from "@/components/stat-card";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  name: string;
  type: string;
  date: Date;
  time: string;
  phone: string;
  email: string;
  campaign: string;
  agent: string;
  status: "confirmed" | "pending" | "completed";
  summary: string;
  nextSteps: string[];
};

const today = new Date();
const d = (offset: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

const bookings: Booking[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    type: "Free intro session",
    date: d(0),
    time: "4:30 PM",
    phone: "(215) 555-0182",
    email: "sarah.mitchell@email.com",
    campaign: "Spring Win-Back",
    agent: "Rocky",
    status: "confirmed",
    summary:
      "Former member who cancelled in January. Said she stopped coming because of her work schedule. Agreed to a free intro session after hearing about the new 6 AM classes.",
    nextSteps: ["Send confirmation text", "Assign an intro coach", "Pull her old membership history"],
  },
  {
    id: "2",
    name: "Jamal Carter",
    type: "Membership tour",
    date: d(1),
    time: "10:00 AM",
    phone: "(215) 555-0117",
    email: "jcarter@email.com",
    campaign: "New Lead Outreach",
    agent: "Rocky",
    status: "confirmed",
    summary:
      "Filled out a web form last week. Comparing two gyms nearby, mainly cares about free weights and parking. Booked a walkthrough for tomorrow morning.",
    nextSteps: ["Have the front desk greet him by name", "Prepare the 12-month pricing sheet"],
  },
  {
    id: "3",
    name: "Priya Shah",
    type: "Personal training consult",
    date: d(2),
    time: "6:15 PM",
    phone: "(267) 555-0143",
    email: "priya.shah@email.com",
    campaign: "PT Upsell",
    agent: "Rocky",
    status: "pending",
    summary:
      "Active member for 8 months. Interested in personal training twice a week but wants to confirm pricing before committing. Tentatively booked a consult.",
    nextSteps: ["Confirm the slot by text", "Send the PT package options"],
  },
  {
    id: "4",
    name: "Marcus Johnson",
    type: "Free intro session",
    date: d(4),
    time: "2:00 PM",
    phone: "(215) 555-0166",
    email: "marcus.j@email.com",
    campaign: "Spring Win-Back",
    agent: "Rocky",
    status: "confirmed",
    summary:
      "Dormant lead from last fall. Recently started training again and asked about class schedules. Booked without hesitation.",
    nextSteps: ["Add to the Saturday class waitlist", "Send parking directions"],
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    type: "Group class trial",
    date: d(-1),
    time: "9:00 AM",
    phone: "(484) 555-0129",
    email: "elena.r@email.com",
    campaign: "Group Class Push",
    agent: "Rocky",
    status: "completed",
    summary:
      "Attended her trial class and told the coach she is likely to join on the monthly plan.",
    nextSteps: ["Follow up with a membership offer within 48 hours"],
  },
  {
    id: "6",
    name: "Olivia Chen",
    type: "Personal training consult",
    date: d(5),
    time: "5:00 PM",
    phone: "(610) 555-0198",
    email: "olivia.chen@email.com",
    campaign: "PT Upsell",
    agent: "Rocky",
    status: "confirmed",
    summary:
      "Asked specifically about post-injury training. Wants a coach with rehab experience. Consult confirmed for next week.",
    nextSteps: ["Assign a rehab-certified trainer", "Collect her intake form before the session"],
  },
  {
    id: "7",
    name: "James Wilson",
    type: "Membership tour",
    date: d(7),
    time: "3:45 PM",
    phone: "(215) 555-0104",
    email: "jwilson@email.com",
    campaign: "Spring Win-Back",
    agent: "Rocky",
    status: "pending",
    summary:
      "Cancelled two years ago over pricing. Curious about the new off-peak rate but wants to see the space first.",
    nextSteps: ["Send the off-peak rate details", "Call to confirm the day before"],
  },
];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const selectedBookings = selectedDate
    ? bookings.filter((b) => isSameDay(b.date, selectedDate))
    : bookings.filter((b) => b.date >= d(0));

  const upcoming = bookings.filter((b) => b.date >= d(0)).length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  return (
    <AppShell
      title="Calendar"
      subtitle="Every appointment your AI agent booked, with call context and next steps."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Upcoming" value={upcoming} hint="scheduled from here on" icon={CalendarIcon} tone="primary" />
        <StatCard label="Confirmed" value={confirmed} hint="customer said yes" icon={CheckCircle2} tone="success" />
        <StatCard label="Needs Follow-Up" value={pending} hint="awaiting confirmation" icon={Clock} tone="warning" />
        <StatCard label="Completed" value={completed} hint="already attended" icon={Phone} tone="muted" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-app-border bg-card p-5 shadow-card h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="size-8 rounded-lg border border-app-border hover:bg-secondary grid place-items-center transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="size-8 rounded-lg border border-app-border hover:bg-secondary grid place-items-center transition"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((n) => (
              <div
                key={n}
                className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-2"
              >
                {n}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
              const dayBookings = bookings.filter((b) => isSameDay(b.date, date));

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className={cn(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 transition-all",
                    isSelected
                      ? "bg-primary/10 ring-2 ring-primary"
                      : isToday
                        ? "bg-app-accent font-bold"
                        : "hover:bg-secondary/70",
                  )}
                >
                  <span className={cn("text-sm", isToday && !isSelected && "text-primary")}>{day}</span>
                  {dayBookings.length > 0 && (
                    <span className="flex gap-0.5 mt-auto mb-1.5">
                      {dayBookings.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "size-1.5 rounded-full",
                            b.status === "confirmed"
                              ? "bg-success"
                              : b.status === "pending"
                                ? "bg-warning"
                                : "bg-muted-foreground",
                          )}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-app-border">
            <span className="text-xs text-muted-foreground">Legend:</span>
            {[
              ["bg-success", "Confirmed"],
              ["bg-warning", "Needs follow-up"],
              ["bg-muted-foreground", "Completed"],
            ].map(([dot, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", dot)} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-app-border bg-card p-5 shadow-card h-fit">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {selectedDate
                ? `Bookings for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Upcoming bookings"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedBookings.length} appointment{selectedBookings.length === 1 ? "" : "s"}
            </p>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-app-border p-6 text-center">
              <CalendarIcon className="size-7 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm font-medium">No bookings</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pick another date or wait for your agent to book more calls.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBookings
                .slice()
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((b) => (
                  <article
                    key={b.id}
                    className="rounded-xl border border-app-border bg-secondary/40 p-4 transition-all hover:shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="font-semibold text-sm truncate">{b.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.type}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {b.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                        {b.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {b.phone}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3.5 shrink-0" />
                        {b.email}
                      </span>
                    </div>

                    <div className="mt-3 rounded-lg bg-card border border-app-border p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Call summary
                      </div>
                      <p className="text-xs leading-relaxed">{b.summary}</p>
                    </div>

                    <div className="mt-2.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Next steps
                      </div>
                      <ul className="space-y-1">
                        {b.nextSteps.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-app-border text-[11px] text-muted-foreground">
                      Booked by {b.agent} · {b.campaign}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
