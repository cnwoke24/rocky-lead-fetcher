# Receive call results from the voice provider

Right now the dashboard can place a demo call to Bob, but nothing comes back. This adds a listening endpoint so the outcome of each call (what happened, how long it lasted, the summary, and whether a follow-up is needed) lands in the dashboard automatically.

## What you'll see

- After a demo call ends, the call appears in the dashboard with its duration, a written summary, and the transcript.
- The call outcome (booked, callback requested, not interested, no answer) is shown on Bob's record and in Recent Activity.
- The Calls view lists real completed calls alongside the existing demo examples.

## How it works

1. A new public endpoint receives the call-ended and call-analysed notifications from the voice provider.
2. Each notification is saved: call id, which customer it belongs to, from/to numbers, start time, duration, outcome, summary, transcript, and recording link.
3. The dashboard reads those saved results and shows the newest ones.

## Technical detail

**New table `public.demo_call_results`**
- `id uuid pk`, `call_id text unique`, `customer_slug text`, `agent_id text`, `from_number text`, `to_number text`, `call_status text`, `outcome text`, `duration_seconds int`, `summary text`, `transcript text`, `recording_url text`, `sentiment text`, `disconnection_reason text`, `raw jsonb`, `started_at timestamptz`, `ended_at timestamptz`, `created_at timestamptz default now()`
- GRANTs: `SELECT` to `authenticated`, `ALL` to `service_role`; RLS enabled with authenticated read and service-role-only writes.

**New edge function `auto-demo-call-webhook`** (`verify_jwt = false`, since the provider calls it unauthenticated)
- Accepts POST, validates the payload shape, ignores `call_started` events.
- Reads `call.call_id`, `call.metadata.customer_slug` (set when the call is placed), `call.call_analysis` (summary, user sentiment, custom analysis data), `duration_ms`, `recording_url`, `transcript`, `disconnection_reason`.
- Derives `outcome` from the analysis data when present, otherwise from `disconnection_reason`.
- Upserts on `call_id` with the service role so `call_ended` then `call_analyzed` merge into one row.
- Optionally verifies a shared signing secret header if you want the endpoint locked down (see below).
- Always returns 200 quickly so the provider does not retry.

**Client changes**
- `src/components/auto-demo/demo-call.ts`: add `fetchDemoCallResults()` reading `demo_call_results` ordered by newest.
- `src/components/auto-demo/RetentionDemo.tsx`: after "Run demo call", poll the results for that call id for up to ~2 minutes and, once it lands, add a Recent Activity entry and populate the Last Call panel with the real summary/outcome/duration; the Calls view merges real results above the mock examples.

## What I need from you

- The webhook URL will be printed after I deploy the function; you paste it into the agent's webhook settings in your voice provider dashboard.
- Optional: if you want the endpoint to reject anything that isn't your provider, we add a shared signing secret you also paste into the provider settings.

## Not changing

Agent id, from-number, Bob's record, the outreach simulation, or anything outside `/auto-demo`. No SMS.
