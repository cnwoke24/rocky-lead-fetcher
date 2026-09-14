# Update Bob's demo offer

Change Bob's saved offer so the Retell agent pitches the new promotion on the demo call.

## Change

- Update Bob's `offer_description` in `public.demo_customers` (slug `bob`) to:
  **"10% off his next oil change, and he can also apply his $34.75 in loyalty credit toward the service."**
- Also align Bob's `recommended_service` with the offer: "Oil Change" (currently "Tire Rotation"), since the offer is now built around an oil change.
- Nothing else changes: Bob's phone, loyalty credit, campaign goal (Get Visit 4), reason for call, and the Retell variable mapping all stay the same.

## Technical details

- Single `UPDATE public.demo_customers SET offer_description = ..., recommended_service = 'Oil Change' WHERE slug = 'bob'` — a data update only, no schema change.
- The next demo call automatically picks up the new offer because `auto-demo-retell-call` reads `offer_description` and `recommended_service` from Bob's record at call time and passes them as `retell_llm_dynamic_variables`.
- No frontend code changes; Bob's row in the dashboard reflects the saved record on next load.
