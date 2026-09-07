import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toCatalogApp } from "../server/lib/catalog.js";

export default defineAction({
  description:
    "Archive a RakitApp catalog application so it is removed from the public catalog without deleting its history.",
  schema: z.object({ appId: z.string().trim().min(2).max(64) }),
  needsApproval: true,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: true,
    title: "Archive a RakitApp catalog application",
  },
  run: async ({ appId }, ctx) => {
    assertOperator(ctx?.userEmail);
    const [row] = await getDb()
      .update(schema.catalogApps)
      .set({ status: "archived", updatedAt: new Date().toISOString() })
      .where(eq(schema.catalogApps.id, appId))
      .returning();
    if (!row) throw new Error("Catalog application not found.");
    return toCatalogApp(row);
  },
});
