# Auto Demo Dashboard: Voice Picker, Workflow Requests, Calendar

Bring the `/auto-demo` demo dashboard in line with the Gym AI Connect look and shift the workflow area from "build a new one" to "request changes to yours".

## 1. Voice & script with real voice cards

- Copy the three voice avatar images and audio previews from the Gym AI Connect project into this project's assets.
- Extend the voice list so each voice has an avatar image, audio preview, and age descriptor.
- Add a `VoicePicker` component matching Gym AI Connect: selectable cards with a round photo, play/pause preview button, style/accent/age labels, tagline, "best for", and an animated waveform.
- Replace the plain voice dropdown in the agent setup step with this picker; keep the rest of the Voice & Script fields.

## 2. Workflows tab becomes a request center

Replaces the "create a new workflow" wizard flow as the default view:

- **Your workflow** — a read-only summary card for Mike's Motor Zone: the "Overdue Service Reactivation" campaign, its assigned voice (with photo), script, offer, calling window, plus the visual node diagram of the live sequence.
- **Request an edit** — a form on the existing workflow (what to change, urgency, notes). Submitting shows a confirmation: our team has received it and will be in contact soon.
- **Request a new workflow** — a short form (goal, who to call, offer, timing). Submitting shows the same "we'll be in touch shortly" confirmation state.
- Both forms are demo-only: no data is saved, confirmation is shown in-page plus a toast.
- The full builder stays available behind a secondary "Preview the builder" toggle so it can still be demoed.

## 3. Calendar tab styled like Gym AI Connect

- Rebuild the calendar view with the reference layout: a stats bar (Total / Confirmed / Pending / Completed), a month grid with prev/next month navigation, booking dots per day, today highlight and day selection, and a side panel listing bookings for the selected day.
- Keep the automotive mock data (service appointments, customer details, call summary, next steps) and show those details in the side panel entries.

## 4. Main dashboard leads with a calendar

- Keep the four KPI cards at the top.
- Directly below, a large month calendar block showing which days have appointments, with an "Upcoming appointments" side list.
- Move the Recent AI Conversations table (with transcript modal) below the calendar; keep Active Automations and Quick Controls alongside it.

## Technical notes

- Files touched: `src/pages/AutoDemo.tsx`, `src/lib/voices.ts`, `src/components/workflow-builder/AgentSetup.tsx`, `src/components/workflow-builder/DemoWorkflowStudio.tsx`; new `src/components/wizard/voice-picker.tsx`, a shared `BookingsCalendar` component reused by the dashboard and calendar tab, and new assets under `src/assets/voices/`.
- All mock data stays local to the demo page; no database or edge function changes.
- Styling uses existing semantic tokens (card, border, primary, muted) and stays responsive on mobile.
