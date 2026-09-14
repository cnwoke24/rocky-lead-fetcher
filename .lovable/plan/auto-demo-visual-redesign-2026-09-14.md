# Auto-Demo Visual Redesign

Restyle the full `/auto-demo` experience to match the selected **Modern automotive aesthetic** and the supplied screenshots, while preserving the existing retention-demo functionality and mock data.

## 1. Dashboard shell

- Replace the wide labeled sidebar with a narrow dark-navy icon rail.
- Keep every destination available: Overview, Customers, Campaigns, Calls, Integrations, Analytics, and Settings.
- Add tooltips to icon-only navigation and retain a clear active state.
- Use a compact breadcrumb header styled as `Mike’s Motor Zone / Current View`.
- Keep mobile navigation accessible through a compact menu drawer.
- Constrain the desktop workspace to the screenshot’s focused proportions instead of stretching content edge-to-edge.

## 2. Reference-matched visual system

- Use the screenshot palette: deep navy navigation, pale blue-gray workspace, white surfaces, cobalt blue actions, muted blue-gray supporting text, and soft peach/orange for Visit 3 priority states.
- Update semantic design tokens for these roles rather than placing raw colors throughout the page.
- Adopt the selected direction’s clean sans-serif typography, strong black headings, small muted labels, fine borders, restrained shadows, and compact spacing.
- Use moderately rounded cards and controls consistent with the screenshots, avoiding oversized pills or heavy decoration.
- Apply the same visual language to tables, forms, dialogs, customer details, charts, badges, tabs, and settings.

## 3. Overview composition

- Lead with the headline `Your customer journey, at a glance.` and supporting retention message.
- Move Customer Journey to the top as the primary bordered panel.
- Restyle its four stages as individual light panels with icons, labels, counts, action text, and a distinct orange Visit 3 priority treatment.
- Add the peach priority message band beneath the journey stages.
- Add an `Automations up next` panel using the existing Mike, Sarah, and Robert demo context, with scheduled action details and locally working pause controls.
- Move the six KPIs into a `Performance overview` section matching the reference card grid, with recovered revenue receiving subtle blue emphasis.
- Keep Customers At Risk, Recent Activity, Last Call Outcome, and Email Preview available below the reference-matched top sections so no current demo capability is lost.

## 4. Remaining dashboard views

- Restyle Customers and spreadsheet upload with the same compact cards, pale workspace, fine borders, and blue/orange lifecycle states.
- Restyle Campaigns and Calls tables for clearer density and horizontal handling on smaller screens.
- Restyle Integrations, data mapping, Analytics charts, and Settings so they feel like one product with the new Overview.
- Restyle the customer detail panel, outreach progress, transcript, and email preview dialogs to match the same visual system.
- Preserve customer search, row drill-down, stage simulation, outreach simulation, email simulation, file upload/analysis, navigation, and settings toggles.

## 5. Responsive behavior and validation

- On mobile, stack journey stages, automation details, performance cards, and secondary panels without clipped text or horizontal page overflow.
- Keep touch targets accessible while maintaining the compact desktop proportions.
- Verify the Overview and all navigation views on desktop and mobile.
- Test customer drill-down, outreach, transcript, email, sample upload/analysis, pause controls, and navigation.
- Confirm the browser console remains clear.

## Technical details

- Primary implementation: `src/components/auto-demo/RetentionDemo.tsx`.
- Theme updates: `src/index.css` and `tailwind.config.ts` using semantic tokens.
- Existing local data and mock services remain unchanged unless a small display-only addition is needed for the automation queue.
- No backend, authentication, live call, email-provider, or SMS changes.
