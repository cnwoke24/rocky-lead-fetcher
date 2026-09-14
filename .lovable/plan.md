# Connect Retell agent to auto-demo dashboard

Use the provided agent ID `agent_207fae2372f9309f151c8bb69b` for the Bob demo call.

## Steps

1. Store the agent ID as the `RETELL_AUTO_DEMO_AGENT_ID` runtime secret so the edge function picks it up without hardcoding credentials.
2. Update the fallback constant in `supabase/functions/auto-demo-retell-call/index.ts` from the old demo agent to `agent_207fae2372f9309f151c8bb69b` as a safety net.
3. Deploy the `auto-demo-retell-call` edge function.
4. Smoke-test the function with a `list` invocation to confirm it still responds, then validate that pressing "Run demo call" for Bob uses the new agent.

## Notes

- No changes to the dashboard UI or customer data are needed; the existing button and status flow remain the same.
- The call will still use the from-number `+19163144644` and the phone number saved on Bob's record.
