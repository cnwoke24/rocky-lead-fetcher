# Fix post-call results and redesign the call outcome

## What is wrong today

Bob's last call was stored with outcome "Interested" and Appointment "No", even though the agent reported the visit was booked. The agent's analysis arrives with the field names `Visit Booked: true` and `Scheduled Visit Day: next Wednesday`, but the results endpoint only looks for fields named `appointment_booked` / `booked`, so the booking is ignored and the dashboard falls back to "No". The call ended with `in_voicemail: false` and `agent_hangup`, which is the "spoke with customer" case.

## What you'll see after

**Last Call Outcome card (Overview and Bob's detail panel)**
- Call Outcome: Spoke with customer / Voicemail / No answer
- Next Visit: "Confirmed · next Wednesday" (green) or "Not confirmed"
- Next Follow-Up: date plus reason (e.g. "Sep 25 · Confirm the visit happened")
- What Was Discussed: the agent's call summary
- Follow-Up Email: Prepared / Sent
- Sentiment, Loyalty Credit and Service Discussed are removed.

**Calls view**: columns become Customer, Campaign, Date, Duration, Outcome, Next Visit, Next Follow-Up, Transcript (Sentiment and Appointment columns removed).

**Follow-up rules (automatic)**
- Voicemail or no answer: follow-up call in 3 days.
- Spoke, visit not confirmed: follow-up in 3 days.
- Spoke, visit confirmed: follow-up the day after the promised visit day, to confirm they showed up. If the promised day passes without the visit being marked completed, the customer is flagged "Missed visit · follow up" in amber.

**Celebration when a customer confirms their next visit**
- Confetti burst plus a toast: "Bob confirmed his next visit · next Wednesday".
- Bob's status flips from orange "At Risk" to green "Visit Confirmed" with a pulsing dot, in the Customers At Risk table, the Customers view, and his detail panel; the Last Call card gets a green border and soft glow.
- Recent Activity gets a green "Bob confirmed Visit 4 · next Wednesday" entry.
- The "Call Bob for Visit 3 campaign" automation row becomes "Follow up with Bob · confirm visit next Wednesday".
- Stage stays Visit 3 for now. A "Mark visit completed" button appears in Bob's detail panel; pressing it bumps completed visits, advances the stage to Visit 4+, clears the confirmed badge and saves it to his record.

**Existing stored call**: Bob's call from today is re-processed with the new rules so it shows Spoke with customer / Confirmed · next Wednesday immediately.

## Technical detail

**Migration**
- `demo_call_results`: add `visit_confirmed boolean`, `scheduled_visit text`, `next_follow_up_at timestamptz`, `follow_up_reason text`, `in_voicemail boolean`.
- `demo_customers`: add `confirmed_visit_day text`, `confirmed_visit_at timestamptz`, `confirmed_follow_up_at timestamptz` (cleared when the visit is marked completed).
- Then a one-off data update re-deriving Bob's existing row from its stored `raw` payload and setting his confirmed-visit fields.

**Edge function `auto-demo-call-webhook`**
- Normalize `custom_analysis_data` keys (lowercase, spaces to underscores) so `Visit Booked` matches `visit_booked`; also accept `appointment_booked`, `booked`, `visit_confirmed`.
- Outcome: `in_voicemail === true` or a voicemail disconnect reason → "Voicemail"; `dial_no_answer` / `dial_busy` / `dial_failed` → "No answer"; otherwise "Spoke with customer".
- Read `scheduled_visit_day` and compute `next_follow_up_at`: parse weekday names, "tomorrow", "today" and ISO dates relative to the call end time; unparseable → visit day unknown, follow-up in 7 days. Voicemail / no answer / not confirmed → end time + 3 days. Store `follow_up_reason`.
- When `visit_confirmed` is true, also update the matching `demo_customers` row's `confirmed_visit_day`, `confirmed_visit_at`, `confirmed_follow_up_at`.
- Redeploy.

**Edge function `auto-demo-retell-call`**
- Add `completed_visits`, `current_visit_stage`, `last_visit_date`, `confirmed_visit_day`, `confirmed_visit_at`, `confirmed_follow_up_at` to the editable-field whitelist so "Mark visit completed" can persist.

**Client**
- `retention-data.ts`: `CallRecord` gains `outcome: "Spoke with customer" | "Voicemail" | "No answer"`, `visitConfirmed`, `scheduledVisit`, `nextFollowUp`, `followUpReason`; drop `sentiment`, `appointment`, `service`, `loyaltyCredit`. `Customer` gains optional `confirmedVisit: { day, followUpAt }` and a new `"Visit Confirmed"` status. Update the three mock calls to the new shape.
- `demo-call.ts`: select the new columns; `DemoCustomerRecord` gains the confirmed-visit fields.
- `RetentionDemo.tsx`: new `resultToCallRecord` mapping; load confirmed-visit fields into customers on mount; on a live result with `visit_confirmed`, fire confetti (`canvas-confetti`), toast, activity entry, and set the customer's `confirmedVisit`; `statusClass` gets a green "Visit Confirmed" variant with a pulsing dot; `LastCall` and `CallsView` rebuilt around the new fields; `CustomerDetail` shows the confirmed badge, missed-visit amber state when `followUpAt` is past, and a "Mark visit completed" button that calls `saveDemoCustomer`; Automations row text switches for a confirmed customer.
- Add dependency `canvas-confetti` (+ types).

**Verification**: replay Bob's stored payload against the redeployed endpoint and confirm the row reads Spoke with customer / confirmed / next Wednesday; Playwright check of Overview, Calls and Bob's detail panel at desktop and mobile with no console errors.

## Not changing

Agent ID, from-number, outreach simulation for Mike, the results endpoint URL, or anything outside `/auto-demo`. No SMS.
