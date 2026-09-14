# Verify and reconnect the correct Retell account

## What the logs show

The call is reaching Retell correctly. The function log for the two most recent attempts shows:

```text
Placing auto-demo call { agentId: "agent_207fae2372f9309f151c8bb69b", toNumber: "+14046265800", slug: "bob" }
Retell error { status: "error", message: "Payment overdue, service stopped." }
```

So the agent ID, the from-number and Bob's record are all wired up and sent. Retell itself is refusing
the request authenticated by the currently stored key. Since your Retell account shows no overdue balance,
the most likely explanation is that the stored `RETELL_API_KEY` belongs to a different Retell account.

The key you just supplied will be stored securely and will not be added to frontend code or displayed.

## What the dashboard shows today

The red toast only says "Edge Function returned a non-2xx status code", which hides the real reason.
The function does return Retell's message, but the client throws before reading it.

## Proposed fix

1. Replace the existing secure `RETELL_API_KEY` value with the key you just supplied.
2. Before attempting another phone call, query Retell for agent
   `agent_207fae2372f9309f151c8bb69b` using that key. This confirms the key and agent belong to the same
   Retell account and that the agent is accessible.
3. Verify the assigned outbound number `+14722261802` is available to that account.
4. Redeploy the demo-call function so it loads the replaced key, then place one controlled test call to
   Bob's saved destination and inspect the provider response.
5. In `src/components/auto-demo/demo-call.ts`, read the error response body when `supabase.functions.invoke`
   fails (`error.context.json()` / `.text()`) and use the `error` field from it as the thrown message,
   falling back to the generic message only when no body is available.
6. Keep the existing behaviour for successful calls unchanged.

Result: pressing "Run demo call" while the provider account is unpaid will read
"Payment overdue, service stopped." instead of a generic status-code message, and any future provider
error (bad number, agent misconfigured, rate limit) will surface the same way.

## Not changing

- The agent ID, from-number, Bob's record, or the outreach simulation unless Retell's verification shows
  that the supplied key cannot access that agent or number.
- No retry loop — a payment block is terminal until the account is settled.

## Expected outcome

The dashboard will use the newly supplied Retell key, with the agent and assigned number verified against
the same account. If Retell still rejects the call, the dashboard will show Retell's exact reason instead
of the generic non-2xx message.
