# Demo call failure: voice provider account is unpaid

## What the logs show

The call is reaching Retell correctly. The function log for the two most recent attempts shows:

```text
Placing auto-demo call { agentId: "agent_207fae2372f9309f151c8bb69b", toNumber: "+14046265800", slug: "bob" }
Retell error { status: "error", message: "Payment overdue, service stopped." }
```

So the agent ID, the from-number and Bob's record are all wired up and sent. Retell itself is refusing
to place the call because the Retell account has an overdue balance and outbound calling is suspended.

Nothing in this project can fix that — the balance has to be settled in the Retell account. Once it is,
the same button will place the call with no code changes.

## What the dashboard shows today

The red toast only says "Edge Function returned a non-2xx status code", which hides the real reason.
The function does return Retell's message, but the client throws before reading it.

## Proposed fix (code)

1. In `src/components/auto-demo/demo-call.ts`, read the error response body when `supabase.functions.invoke`
   fails (`error.context.json()` / `.text()`) and use the `error` field from it as the thrown message,
   falling back to the generic message only when no body is available.
2. Keep the existing behaviour for successful calls unchanged.

Result: pressing "Run demo call" while the provider account is unpaid will read
"Payment overdue, service stopped." instead of a generic status-code message, and any future provider
error (bad number, agent misconfigured, rate limit) will surface the same way.

## Not changing

- The agent ID, from-number, Bob's record, or the outreach simulation.
- No retry loop — a payment block is terminal until the account is settled.

## Your action

Settle the overdue balance on the Retell account, then press "Run demo call" again.
