
## Create Alternate Demo Landing Page

### Goal
Create a standalone `/demo` page that displays only the lead capture form (not as a popup) and sends submissions to a **different** Slack channel than the main homepage popup.

### What will be created

#### 1. New Page: `src/pages/Demo.tsx`
A clean, focused landing page containing:
- The lead capture form (extracted from the modal)
- Same validation logic (phone formatting, email validation)
- Calls a **new** edge function for this page's submissions
- Simple, centered layout with the form as the main focus
- Success state displayed inline (no redirect needed)

#### 2. New Edge Function: `supabase/functions/submit-demo-lead/index.ts`
A copy of the existing `submit-lead` function but configured to:
- Use a **separate** Slack webhook URL (`DEMO_SLACK_WEBHOOK_URL`)
- Set source as "Demo Page" instead of "Homepage Popup"
- Same validation, Airtable, and n8n integrations

#### 3. Route Registration: `src/App.tsx`
Add the new route:
```
/demo → Demo page
```

### New Secret Required
You'll need to add a new secret for the demo page's Slack channel:
- **`DEMO_SLACK_WEBHOOK_URL`** - The Slack incoming webhook URL for the demo page channel

### Files to create/modify
| File | Action |
|------|--------|
| `src/pages/Demo.tsx` | Create - standalone form page |
| `supabase/functions/submit-demo-lead/index.ts` | Create - edge function for demo leads |
| `src/App.tsx` | Modify - add `/demo` route |

### Page Design
- Clean white background
- Centered form card (similar to modal styling)
- No header, footer, or navigation - just the form
- Mobile responsive

### Technical Details

The Demo page will:
- Reuse the same form fields (Name, Company, Email, Phone)
- Use the same phone auto-formatting `(XXX) XXX-XXXX`
- Apply the same validation (10-digit phone, valid email)
- Call `submit-demo-lead` edge function instead of `submit-lead`

The `submit-demo-lead` edge function will:
- Read from `DEMO_SLACK_WEBHOOK_URL` environment variable
- Format Slack message identically to the main form
- Still integrate with Airtable and n8n (using existing secrets)
- Mark source as "Demo Page" for tracking
