# Rocky Customer Dashboard — Gym Connect Style

Bring the Gym Connect look and feel to Rocky's customer dashboard, and add two new pages in the same style: a drag-and-drop workflow builder and a calendar of AI-booked appointments.

## 1. Shared design system

Add the Gym Connect palette and surface styling to Rocky's theme: indigo/blue primary with a lighter "glow" tone, soft near-white background, white cards with subtle layered shadows, success/warning tones, and sidebar tokens. Values are converted to HSL to match Rocky's existing token format, so every existing page keeps working.

New reusable pieces:
- A shared app shell: fixed left sidebar (logo + workspace nav + "AI Agent Online" status card), sticky top bar (search, notifications bell, primary action button, user menu), page title/subtitle block, and content area with a slide-up fade-in.
- Sidebar collapses to an icon rail on desktop and slides over on mobile, with a trigger always visible in the header.
- A KPI card and status dot/badge component matching Gym Connect.

Nav items: Dashboard, Workflows, Calendar, Call Recordings, Settings.

## 2. Dashboard restyle (`/dashboard`)

Keep all current data loading and logic (profile, agreement, subscription, agent toggle, daily summaries, recent calls) — only the presentation changes:
- Wrap in the new app shell with title "Dashboard" and a welcome subtitle.
- Four KPI cards across the top using existing call stats.
- Two-column section below: recent calls/activity in a bordered card list, and the daily summary + agent controls in a matching card.
- Existing modals (agreement, etc.) restyled to the new card language.

## 3. Workflow builder (`/workflows`, `/workflows/new`)

Three-tab builder mirroring Gym Connect:
1. **Configure AI Agent** — form for who it's calling, goal, script/prompt, voice, and call window.
2. **Build Workflow** — full drag-and-drop node canvas: a palette of step types (Call, SMS, Email, Delay, Condition, End), draggable nodes with connectable handles, deletable edges, and a right-hand inspector to edit the selected node.
3. **Review & Submit** — summary of the agent config and step sequence, with confirmation checkboxes and submit.

Persistence: new `workflows` table storing the agent config and workflow graph per user, with row-level security so each user only sees their own, plus a list page showing saved workflows with status badges.

## 4. Calendar (`/calendar`)

Bookings view in the Gym Connect style, using realistic demo data for now:
- Month grid with prev/next navigation and dots on days that have bookings.
- Summary KPI row (upcoming, confirmed, needs follow-up).
- Selected-day detail list: customer, appointment type, time, source campaign, agent, and status badge, with a call summary and next steps for each.

## Technical notes

- Add `@xyflow/react` for the workflow canvas (same library Gym Connect uses).
- New components: `src/components/app-shell.tsx`, `src/components/stat-card.tsx`, `src/components/workflow-builder/*` (canvas, node types, palette, inspector, agent setup, review).
- New pages: `src/pages/Workflows.tsx`, `src/pages/WorkflowBuilder.tsx`, `src/pages/CalendarPage.tsx`; routes registered in `src/App.tsx` behind the existing auth flow.
- Database migration creates `workflows` with owner-scoped RLS policies and the required table grants.
- Colors stay as semantic tokens in `index.css` / `tailwind.config.ts` — no hardcoded color classes in components.
