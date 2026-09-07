import { defineAction } from "@agent-native/core/action";
import { desc } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toLeadSummary } from "../server/lib/leads.js";

export default defineAction({
  description:
    "List RakitApp consultation leads for the authenticated operator, newest first.",
  schema: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
  http: { method: "GET" },
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: true,
    title: "List RakitApp leads",
  },
  run: async ({ limit }, ctx) => {
    assertOperator(ctx?.userEmail);
    const rows = await getDb()
      .select()
      .from(schema.projectLeads)
      .orderBy(desc(schema.projectLeads.updatedAt))
      .limit(limit);
    return rows.map(toLeadSummary);
  },
});
