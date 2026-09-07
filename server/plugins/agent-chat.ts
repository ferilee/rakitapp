import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";

const INITIAL_TOOL_NAMES = ["view-screen", "navigate", "hello"];

export default createAgentChatPlugin({
  appId: "rakitapp",
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  initialToolNames: [
    "view-screen",
    "navigate",
    "generate-project-brief",
    "list-leads",
    "get-lead",
    "update-lead",
    "list-catalog-apps",
    "list-catalog-apps-admin",
    "recommend-catalog-app",
  ],
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `You are the RakitApp agent.

RakitApp helps people turn education-app ideas into structured project briefs. The main product workflow is the public builder at /build and the authenticated operator workspace at /admin, which includes consultation leads and the catalog manager.

Use actions as the source of truth. Inspect the current screen when context matters. Preserve the distinction between an indicative estimate and a final quote: estimates are based on the configured feature catalog and require human consultation before commitment. Keep client data private and never invent a final price or promise a delivery date. Catalog writes require an authenticated operator and human approval; use the catalog read actions before proposing changes. When an operator asks for a new catalog idea, use recommend-catalog-app to prepare an editable draft before suggesting any catalog write.`,
});
