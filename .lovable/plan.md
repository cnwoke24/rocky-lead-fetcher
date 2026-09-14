# Mike’s Motor Zone Retention Demo

Rebuild `/auto-demo` as a polished, fully unlocked Rocky Voice AI sales demo focused on moving automotive customers through Visit 1 → Visit 4+ using customer data, AI calls, email follow-up, and outcome tracking. Everything remains realistic but demo-safe: mock data and local state power the experience, with no SMS and no live external calls.

## 1. New dashboard shell and navigation

- Replace the current card-style navigation with a fixed dark navy sidebar and light workspace.
- Brand the product as **Rocky Voice AI** and the account as **Mike’s Motor Zone**.
- Add working views for Overview, Customers, Campaigns, Calls, Integrations, Analytics, and Settings.
- Add the requested top bar with page title, subtitle, search, notifications, client identity, and avatar.
- Keep the layout desktop-first for screen sharing, with a usable collapsible mobile navigation.

## 2. Centralized automotive demo model

- Create one local mock-data module for customers, campaigns, calls, activity, analytics, integration mappings, and KPI values.
- Model customer lifecycle state explicitly: Visit 1, Visit 2, Visit 3, and Visit 4+.
- Make Visit 3 the orange priority-retention stage throughout the UI.
- Maintain one shared interactive state for Mike Prouse so stage simulations, outreach results, and completed visits update every relevant view.
- Add a separate mock service layer with replaceable functions for file import, syncing, Retell call triggering, call outcomes, email sending, customer write-back, and completed-visit simulation.

## 3. Overview sales-demo experience

- Add the six requested KPI cards using the provided demo values.
- Build the customer journey funnel with counts and a clear Visit 3 retention opportunity.
- Add a compact Customers At Risk table with clickable rows.
- Add Recent Activity and Last Call Outcome panels.
- Keep all figures visibly coherent with the demo story and label the environment as demo data without cluttering the presentation.

## 4. Customer list and customer detail

- Build a searchable Customers view containing the requested customer, vehicle, visit, loyalty, service, status, and next-action fields.
- Open each row into a detailed panel rather than navigating away, preserving the live-demo flow.
- Make Mike Prouse’s demo phone and email editable.
- Include Rocky’s retention insight and the orange **Start Outreach** action.
- Add Live Demo Controls for Visit 1, Visit 2, Visit 3, Visit 4+, and Simulate Completed Visit.
- Update completed visits, retention stage, campaign goal, last visit, loyalty credit, status, and recommended action together when the scenario changes.

## 5. Interactive outreach sequence

- Clicking **Start Outreach** opens a seven-step progress experience: load customer, identify stage, select campaign, trigger demo Retell call, receive outcome, prepare email, and update dashboard.
- Simulate the sequence with clear progress states and a completed result; never place a real call.
- After completion, populate Mike’s Last Call Outcome, transcript summary, sentiment, appointment result, and recent activity.
- Add a full transcript dialog and a follow-up email preview using the supplied copy.
- Make **Send Demo Email** functional as a simulation with confirmation and activity updates; no SMS controls, labels, or workflow steps will appear.

## 6. Excel and CSV customer upload

- Add an **Upload Customers** entry within the Customers area.
- Support drag-and-drop or file selection for `.xlsx` and `.csv` files.
- Parse the expected columns locally, show an import preview, validation feedback, and imported row count.
- Add **Analyze Customers** to assign visit stage, risk status, campaign goal, and next best action with deterministic demo logic.
- Include a bundled sample-data path so the full flow can always be demonstrated without preparing a file.

## 7. Campaigns, calls, integrations, and analytics

- Build Campaigns cards/table for all six requested campaigns and their customer, call, conversation, appointment, and status metrics.
- Build Calls history with outcomes, sentiment, appointment state, email state, and clickable transcript details.
- Build Integrations cards for Shop Management System / CRM, Retell Voice AI, Email, and Slack only.
- Add both directions of the requested Data Sync mapping and the source-of-truth/write-back notes.
- Build Analytics with a visit conversion funnel, conversion rates, bookings, recovered customers, estimated recovered revenue, and campaign performance using the existing chart library.
- Add a restrained Settings view for demo account preferences; it will not imply live integrations are configurable.

## 8. Visual system and quality checks

- Extend semantic design tokens for the navy sidebar and orange retention priority while preserving Rocky’s blue accent.
- Use compact cards, subtle shadows, clear table density, and stable desktop proportions suitable for a live prospect presentation.
- Verify sidebar navigation, customer drill-in, outreach simulation, email simulation, upload/analyze flow, transcript dialog, stage controls, and cross-view state updates.
- Check desktop and mobile layouts, confirm no overflow, and ensure the browser console is clean.

## Technical details

- Replace the oversized current `AutoDemo.tsx` with a small page coordinator plus focused components under `src/components/auto-demo/`.
- Add centralized types/data and a mock integration service under the same feature area.
- Reuse the existing UI primitives, toast system, icons, and Recharts components.
- Add a browser-side XLSX parser dependency for real `.xlsx` previews; CSV parsing remains local.
- Keep `/auto-demo` fully unlocked and frontend-only. No database tables, authentication, edge functions, Retell calls, or email provider connections are added in this phase.
- Existing calendar and workflow-request components can remain elsewhere in the project, but they will no longer drive this rebuilt demo.
