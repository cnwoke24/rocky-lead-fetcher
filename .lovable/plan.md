# Demo sidebar toggle + confirmed-visit celebration scope

## 1. Side panel: obvious expand and collapse

The panel already toggles between full width and the icon rail, but the expand control only lives at the very bottom of the collapsed rail, so it is easy to miss. Make both directions obvious:

- Collapsed: a visible expand button at the top of the rail next to the "M" mark (chevron-right), plus the existing bottom button stays.
- Expanded: the collapse chevron stays at the top next to the logo.
- Clicking the logo mark while collapsed also expands the panel.
- Keep the smooth width animation and tooltips while collapsed.

## 2. Confirmed-visit celebration: Last Call Outcome only

When a customer (e.g. Bob) confirms their next visit, today the "Visit Confirmed" treatment spreads across the whole dashboard. Narrow it so it only shows in the Last Call Outcome card:

- Customers At Risk table: Bob keeps his normal "At Risk" status — no green "Visit Confirmed" badge there.
- Automations up next: the Bob row stays "Call Bob for Visit 3 campaign" — no rewriting to "Bob confirmed Visit 4", no green row styling.
- Keep in the Last Call Outcome card: the green celebration banner, confetti burst, success toast, and the green "confirmed their next visit" entry in Recent Activity.
- Keep in Bob's customer detail panel: the confirmed state and the "Mark visit completed" button, so the stage-advance workflow still works.

## Technical details

- `src/components/auto-demo/RetentionDemo.tsx`:
  - `Sidebar`: add a top expand control (and logo-click expand) for the collapsed state.
  - `withConfirmedVisit`: stop flipping `status` to "Visit Confirmed" — set `confirmedVisit` only.
  - `AutomationQueue`: drop the confirmed/missed row rewriting (keep the row as-is).
  - `LastCall` celebration banner, confetti, toast, and activity entry stay unchanged.
  - `CustomerDetail` confirmed badge + "Mark visit completed" stay unchanged.
- No backend, webhook, or data changes.

## Verification

- Playwright at desktop and mobile: collapse/expand the panel both ways, confirm the Bob automation row and Customers At Risk table show normal states, and confirm the Last Call Outcome card still celebrates a confirmed visit. No console errors.
