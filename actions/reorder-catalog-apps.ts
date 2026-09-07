import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator } from "../server/lib/catalog.js";

export default defineAction({
  description: "Change the display order of RakitApp catalog applications.",
  schema: z.object({
    items: z
      .array(
        z.object({
          appId: z.string().trim().min(2).max(64),
          sortOrder: z.number().int().min(0).max(10_000),
        }),
      )
      .min(1)
      .max(200),
  }),
  needsApproval: true,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: true,
    title: "Reorder RakitApp catalog applications",
  },
  run: async ({ items }, ctx) => {
    assertOperator(ctx?.userEmail);
    const db = getDb();
    await Promise.all(
      items.map(({ appId, sortOrder }) =>
        db
          .update(schema.catalogApps)
          .set({ sortOrder, updatedAt: new Date().toISOString() })
          .where(eq(schema.catalogApps.id, appId)),
      ),
    );
    return { updated: items.length };
  },
});
