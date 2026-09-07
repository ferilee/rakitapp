import { defineAction } from "@agent-native/core/action";
import { desc, gte } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { CATEGORY_CATALOG, type CategoryId } from "../shared/catalog.js";

const ACTIVITY_WINDOW_DAYS = 7;

export default defineAction({
  description:
    "Return an anonymized recent RakitApp activity signal for the public landing page.",
  schema: z.object({}),
  http: { method: "GET" },
  requiresAuth: false,
  agentTool: false,
  readOnly: true,
  run: async () => {
    const since = new Date(
      Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const rows = await getDb()
      .select({
        categoryId: schema.projectLeads.categoryId,
        createdAt: schema.projectLeads.createdAt,
      })
      .from(schema.projectLeads)
      .where(gte(schema.projectLeads.createdAt, since))
      .orderBy(desc(schema.projectLeads.createdAt))
      .limit(20);

    if (rows.length === 0) {
      return { visible: false, recentCount: 0 };
    }

    const latestCategory = CATEGORY_CATALOG[rows[0].categoryId as CategoryId];
    return {
      visible: true,
      recentCount: rows.length,
      categoryLabel: latestCategory?.label ?? "aplikasi pendidikan",
      latestCreatedAt: rows[0].createdAt,
    };
  },
});
