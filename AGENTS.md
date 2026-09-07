# RakitApp — Agent Guide

RakitApp turns education application ideas into structured project briefs and
consultation leads. The public builder is the primary customer surface; the
authenticated `/admin` route is the operator workspace; `/chat` is the
internal agent surface and `/agent` remains the framework's agent settings.

## Core contract

- Durable lead data lives in SQL through Drizzle.
- The UI and agent use the same actions. Do not add duplicate `/api` CRUD
  routes or call the action endpoints with hand-written `fetch`.
- The public builder may calculate a brief without login. It only persists data
  after the visitor submits a consultation request.
- Marketing, builder, catalog, and prototype pages are public; operator and
  agent workspace routes remain protected by the auth configuration.
- Estimates are indicative. Never present them as a final quote or promise a
  delivery date without an operator review.
- Lead data is private operator data. `RAKITAPP_OPERATOR_EMAILS` controls
  access to the operator action surface outside local development.
- All AI work goes through the agent chat. The public wizard uses deterministic
  actions for its brief and estimate; the agent can explain the same results.

## Domain actions

- `generate-project-brief` turns `idea`, `categoryId`, `audience`, and
  `featureIds` into the structured brief shown by the builder.
- `calculate-project-estimate` returns the indicative price, duration,
  complexity, points, and assumptions.
- `submit-consultation` validates contact data, rebuilds the brief, stores a
  new lead, and sends an operator notification when configured.
- `start-prototype-trial` creates a public prototype request from a brief. The
  team attaches the real application's URL before the request becomes live.
- `get-prototype-trial` reads a prototype request by its opaque token. A trial
  lasts 8 hours for personal applications or 24 hours for school applications,
  starting when an operator activates the live URL.
- `list-prototype-trials-admin` and `update-prototype-trial` let authenticated
  operators manage the build phase, live URL, and activation timer.
- `list-leads` and `get-lead` are authenticated operator reads.
- `update-lead` patches a lead's `status` or internal `notes`.
- `list-catalog-apps` is the public published catalog read.
- `list-catalog-apps-admin` is the authenticated operator catalog read.
- `recommend-catalog-app` turns an operator's idea into an editable catalog
  draft with suggested content, features, audience, and indicative price; it
  never writes or publishes a catalog record.
- `create-catalog-app`, `update-catalog-app`, `archive-catalog-app`, and
  `reorder-catalog-apps` manage catalog content, publication status, archive
  state, and display order. These writes require operator access and agent
  approval.
- `upload-catalog-cover` accepts an operator-selected image, uploads it to the
  configured file provider, and returns a hosted URL for the catalog record.
- `navigate` opens `builder`, `admin`, `admin-catalog`, `lead`, `agent`, or
  `settings`.
- `view-screen` reports current navigation and the selected lead or catalog
  application when one is open.

When Hermes is connected through MCP, expose read actions first. Keep writes
behind the operator's authenticated app context and human approval for any
outbound notification or consequential change.

## Estimate policy

The feature catalog is in `shared/catalog.ts` and the calculation is in
`shared/estimator.ts`. Prices and durations are editable configuration, not a
contract. Add or change a feature there with a user-facing label, description,
and weight, then update the estimator tests.

## Application state

Private routes write `navigation` with `view` and optional `leadId` or
`catalogAppId`. The agent should call `view-screen` when the selected lead,
catalog application, or current operator view is unclear, then use `navigate`
to move the UI. Public catalog cards read from `list-catalog-apps` and use the
seeded showcase only as a hydration fallback while the action loads.

## Related skills

Read `rakitapp-consultation` for the lead workflow. Also follow the shared
`actions`, `storing-data`, `security`, `real-time-sync`, `frontend-design`, and
`shadcn-ui` skills before changing those areas.
