---
name: rakitapp-consultation
description: Manage RakitApp education-app briefs and consultation leads.
scope: dev
metadata:
  internal: true
---

# RakitApp Consultation

Use the RakitApp action surface to turn an education application idea into a
brief and move a consultation lead through operator review.

## Brief workflow

1. Call `view-screen` when the current screen or selected lead matters.
2. Use `generate-project-brief` with the user's idea, category, audience, and
   selected feature ids.
3. Treat the returned price and duration as indicative ranges. Preserve the
   assumptions when explaining the result.
4. Use `submit-consultation` only when the user explicitly asks to send the
   consultation request and provides name, email, and organization.

## Operator workflow

- Call `list-leads` for the newest consultation requests.
- Call `get-lead` when a particular lead is selected or referenced.
- Use `update-lead` to change status or append internal notes.
- Use `navigate` with `view=admin` or `view=lead` to open the operator UI.

Use `navigate` with `view=agent` to open the internal agent chat when a
conversation should continue in the app UI.

Do not expose contact details or notes to a caller who is not an authenticated
RakitApp operator. Do not send a price commitment, scope commitment, or client
message based only on the indicative estimate.
