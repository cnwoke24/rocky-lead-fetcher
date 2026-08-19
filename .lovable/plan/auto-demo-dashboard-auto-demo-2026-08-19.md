# Auto Demo Dashboard (/auto-demo)

A standalone, fully unlocked demo dashboard for "Mike's Motor Zone" that mirrors the existing Rocky AI customer dashboard styling (light background, sticky top bar with logo, sidebar nav card, rounded cards with subtle shadows). All data is hard-coded mock data — no login, no backend calls, so it always renders instantly for demos.

## Layout

**Top header** — same sticky bar as the current dashboard: Rocky AI logo, "Customer Dashboard" label, notification bell, and a right-side control. Below it, a page title "Welcome back, Mike's Motor Zone" with a green pill reading "AI Agent Status: Active & Taking Calls" (pulsing dot).

**Sidebar** — same navigation card pattern (Dashboard, Agent, Profile, Settings), all enabled, Dashboard active.

**KPI row** — 4 metric cards with icons:
- Missed Calls Handled — 142 — "After-hours & overflow" (PhoneMissed)
- Inspection Renewals Booked — 28 — "Outbound PA inspection campaigns" (ClipboardCheck)
- Service Appointments Scheduled — 54 — "Total booked this week" (CalendarCheck)
- Estimated Revenue Recovered — $8,450 — "From reactivated routine maintenance" (TrendingUp)

**Main split (2/3 + 1/3 on desktop, stacked on mobile)**

Left: "Recent AI Conversations" table — Date/Time, Customer Name, Intent, Outcome (colored badge), Action ("View Transcript" button). Four rows: John Smith / PA State Inspection Renewal / Booked (Tomorrow, 9 AM); Sarah Davis / Overdue Oil Change Reactivation / Booked (Friday, 2 PM); Mike Johnson / Inquiry on Used 2018 Subaru / Test Drive Scheduled; Amanda Lee / After-hours Towing Question / Routed to Emergency Line. Clicking "View Transcript" opens a dialog with a short mock transcript for that caller.

Right column, stacked:
1. "Active Automations & Workflows" — a clean vertical node diagram: Shop Management System / CRM → Identify Expiring PA Inspections → Rocky AI Outbound Call → Customer Books Service → Automated SMS Confirmation. Each node is a bordered card with an icon, title, and one-line description, joined by connector lines with small chevrons. Vertical stack keeps it readable on mobile.
2. "Quick Actions" — card with three labeled toggle switches: Enable After-Hours Answering (on), Run Daily Maintenance Reactivation Calls (on), Send Status Update Texts (off). Toggles hold local state only.

## Technical notes

- New file `src/pages/GymPage3`-style standalone page at `src/pages/AutoDemo.tsx`; route `/auto-demo` registered in `src/App.tsx` above the catch-all.
- Uses existing shadcn primitives: Card, Badge, Button, Table, Switch, Dialog, plus lucide icons and the `rocky-logo` asset.
- Semantic tokens only for colors; the green status pill uses an emerald token-based utility consistent with the rest of the app.
- No Supabase calls, no auth guard — the page is fully unlocked.
