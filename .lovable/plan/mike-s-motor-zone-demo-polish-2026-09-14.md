# Mike’s Motor Zone Demo Polish

Refresh `/auto-demo` so it feels more branded, useful, and lively without changing the working customer, call, webhook, or retention logic.

## 1. Mike’s Motor Zone branding

- Add the uploaded Mike’s Motor Zone Sales and Service logo as a project asset and use it in the demo navigation.
- Remove the Rocky logo from `/auto-demo` only; Rocky branding elsewhere in the app remains unchanged.
- Give the wider navigation enough room for the full horizontal logo, with a compact branded mark treatment when collapsed.

## 2. Collapsible side panel

- Replace the permanent icon rail with a true collapsible side panel.
- Default to an expanded desktop panel showing the logo, icons, and destination labels; provide a clear collapse/expand control that leaves the icon rail accessible.
- Keep the active destination visually obvious in both states and retain tooltips while collapsed.
- Preserve a full-width mobile drawer with the same labeled navigation and a visible close control.
- Remove Integrations from the navigation and remove its now-unreachable demo view; keep Overview, Customers, Campaigns, Calls, Analytics, and Settings.
- Adjust the main workspace offset smoothly as the panel expands or collapses, without content jumps or overlap.

## 3. Overview copy and visual refinement

- Change the overview title to **“Mike's Motor Zone Retention Workflow.”**
- Keep the current retention workflow content and live Bob call controls intact.
- Improve hierarchy and polish with richer surface contrast, refined borders and shadows, clearer active/priority states, and stronger Mike’s Motor Zone branding.
- Add restrained motion: smooth sidebar transitions, staggered page/card entrance, gentle interactive elevation, animated active-navigation treatment, and purposeful status motion.
- Respect reduced-motion preferences and avoid distracting continuous animation.

## 4. Responsive validation

- Verify expanded and collapsed desktop navigation, mobile navigation, all remaining destinations, customer details, and the Bob demo-call control.
- Confirm the uploaded logo stays sharp and proportionate at desktop and mobile sizes.
- Check for clipping, horizontal overflow, layout shifts, and browser errors.

## Technical details

- Primary UI work: `src/components/auto-demo/RetentionDemo.tsx`.
- Shared demo styling and motion tokens: `src/index.css` and existing Tailwind configuration only where needed.
- Store the uploaded logo through the project asset flow and import its pointer into the demo.
- Update the `DemoView` type if Integrations is removed from the available views.
- No changes to Retell, call results, customer records, database tables, or webhook behavior.
