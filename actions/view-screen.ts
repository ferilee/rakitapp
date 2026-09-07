import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toCatalogApp } from "../server/lib/catalog.js";
import { toLeadSummary } from "../server/lib/leads.js";
import { readAppStateForCurrentTab } from "./_tab-state.js";

export default defineAction({
  description:
    "See the RakitApp screen and the selected consultation lead when one is open.",
  schema: z.object({}),
  http: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const navigation = await readAppStateForCurrentTab("navigation", {
      fallbackToGlobal: false,
    });
    const screen: Record<string, unknown> = { navigation };
    const leadId =
      navigation && typeof navigation.leadId === "string"
        ? navigation.leadId
        : null;
    const catalogAppId =
      navigation && typeof navigation.catalogAppId === "string"
        ? navigation.catalogAppId
        : null;

    if (leadId) {
      assertOperator(ctx?.userEmail);
      const [lead] = await getDb()
        .select()
        .from(schema.projectLeads)
        .where(eq(schema.projectLeads.id, leadId))
        .limit(1);
      if (lead) screen.lead = toLeadSummary(lead);
    }

    if (catalogAppId) {
      assertOperator(ctx?.userEmail);
      const [catalogApp] = await getDb()
        .select()
        .from(schema.catalogApps)
        .where(eq(schema.catalogApps.id, catalogAppId))
        .limit(1);
      if (catalogApp) screen.catalogApp = toCatalogApp(catalogApp);
    }

    return screen;
  },
});
