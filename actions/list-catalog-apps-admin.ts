import { asc } from "drizzle-orm";

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toCatalogApp } from "../server/lib/catalog.js";

export default defineAction({
  description:
    "List all RakitApp catalog applications for the authenticated operator, including drafts and archived records.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: true,
    title: "Manage RakitApp catalog applications",
  },
  run: async (_args, ctx) => {
    assertOperator(ctx?.userEmail);
    const rows = await getDb()
      .select()
      .from(schema.catalogApps)
      .orderBy(asc(schema.catalogApps.sortOrder), asc(schema.catalogApps.name));
    return rows.map(toCatalogApp);
  },
});
