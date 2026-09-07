import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  rakitAppRoutePath,
  RAKITAPP_NAVIGATION_VIEWS,
} from "../shared/navigation.js";
import {
  readAppStateForCurrentTab,
  writeAppStateForCurrentTab,
} from "./_tab-state.js";

export default defineAction({
  description:
    "Navigate RakitApp to the builder, lead list, catalog manager, a specific lead, agent, or settings.",
  schema: z.object({
    view: z.enum(RAKITAPP_NAVIGATION_VIEWS),
    leadId: z.string().min(1).optional(),
  }),
  http: false,
  run: async ({ view, leadId }) => {
    if (view === "lead" && !leadId) {
      throw new Error("Lead navigation requires leadId.");
    }
    const path = rakitAppRoutePath({ view, leadId });
    if (!path) throw new Error(`Unsupported RakitApp view: ${view}`);
    const current = await readAppStateForCurrentTab("navigation", {
      fallbackToGlobal: false,
    });
    await writeAppStateForCurrentTab("navigate", {
      path,
      view,
      ...(leadId ? { leadId } : {}),
      _writeId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
    return {
      path,
      previousView: (current as { view?: string } | null)?.view ?? null,
    };
  },
});
