# Demo call for Bob (Visit 3 campaign)

Add a new demo customer, Bob, store his full call details in the database, and put a one-click demo call button at the top of "Automations up next" that dials a real cell phone through your Retell agent.

## 1. Bob becomes the first automation

- Add Bob as a new Visit 3 customer alongside Mike Prouse (Mike stays as-is).
- The first item in "Automations up next" becomes "Call Bob for Visit 3 campaign", with a prominent orange **Run demo call** button.
- Pressing it shows a live status (dialing, call placed, or a clear error) and adds an entry to Recent Activity.
- Bob also appears in the Customers list and detail panel, where his phone number, email and service details can be edited before the demo.

## 2. Bob's details are saved in the database

A new demo-customers table holds exactly the fields your Retell agent expects:

first name, phone number, vehicle year, vehicle make, vehicle model, completed visits, current visit stage, last visit date, last service, recommended service, loyalty credit, campaign goal, reason for call, offer description.

- Bob is seeded with realistic Visit 3 retention values.
- Edits made in the customer detail panel save back to this record, so the next call always uses the latest data.

## 3. The call itself

- Pressing the button calls a new backend function that looks Bob up by his saved record, builds the Retell dynamic variables from those saved fields, and places the outbound call to the phone number on his record.
- The number is always taken from Bob's record, so a live demo just needs his record pointed at whichever cell phone you want to ring.
- Errors (missing agent, bad number, provider failure) come back as a readable message on screen instead of a silent failure.

## 4. Retell agent ID

The call function reads the agent ID from a stored setting so you can drop in your agent as soon as it's ready. Until you give it to me, it falls back to the existing demo agent, and the button will tell you plainly if no agent is configured.

## Technical details

- New table `public.demo_customers` with the 14 Retell variable columns plus phone/email, RLS enabled, readable by authenticated users, writable by admins, full access for the service role.
- Seed row for Bob (Visit 3, ~92 days since visit, loyalty credit, tire-rotation recommendation, "Get Visit 4" goal).
- New edge function `auto-demo-retell-call`: validates input, loads the customer row with the service role, maps columns to `retell_llm_dynamic_variables` using the exact variable names given, and posts to `https://api.retellai.com/v2/create-phone-call` using `RETELL_API_KEY` and a `RETELL_AUTO_DEMO_AGENT_ID` secret (falls back to the current demo agent).
- `RetentionDemo.tsx`: fetch demo customers from the database on load, merge with existing local mock state, add the automation row + button wired to the function, and persist detail-panel edits.
- No SMS anywhere; existing demo interactions and the outreach simulation are unchanged.
