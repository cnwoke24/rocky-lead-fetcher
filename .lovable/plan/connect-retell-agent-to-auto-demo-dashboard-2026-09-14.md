# Connect Retell agent to auto-demo dashboard

Wire the Bob demo call to the correct Retell agent and phone number for this project, replacing the old demo-agent configuration.

## Provided values

- Agent ID: `agent_207fae2372f9309f151c8bb69b`
- Agent phone number: +1(472)226-1802 (stored in E.164 as `+14722261802`)

## Steps

1. Store `RETELL_AUTO_DEMO_AGENT_ID` as a runtime secret with value `agent_207fae2372f9309f151c8bb69b` so the edge function reads it without hardcoding.
2. Update `supabase/functions/auto-demo-retell-call/index.ts`:
   - Change `FALLBACK_AGENT_ID` from `agent_63426c2713064c5f302799ae36` to `agent_207fae2372f9309f151c8bb69b`.
   - Change `FROM_NUMBER` from `+19163144644` to `+14722261802`.
3. Deploy the `auto-demo-retell-call` edge function.
4. Smoke-test the function with a `list` invocation to confirm it responds, then validate that pressing "Run demo call" for Bob uses the new agent ID and from-number.

## Notes

- No changes to the dashboard UI or customer data are needed; the existing button, status flow, and activity logging remain the same.
- The call will still use the phone number saved on Bob's record as the destination.
- The old demo agent (`agent_63426c2713064c5f302799ae36`) and old number (`+19163144644`) are only referenced in this one demo function; other Retell functions in the project are untouched.
