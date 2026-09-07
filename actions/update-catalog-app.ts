import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  assertOperator,
  catalogAccents,
  catalogStatuses,
  toCatalogApp,
} from "../server/lib/catalog.js";

const catalogFields = z
  .object({
    appId: z.string().trim().min(2).max(64),
    name: z.string().trim().min(2).max(100),
    category: z.string().trim().min(2).max(80),
    audience: z.string().trim().min(2).max(120),
    summary: z.string().trim().min(10).max(240),
    description: z.string().trim().min(10).max(500),
    features: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
    outcome: z.string().trim().min(10).max(300),
    accent: z.enum(catalogAccents),
    priceMin: z.number().int().min(0).max(100_000_000),
    priceMax: z.number().int().min(0).max(100_000_000),
    demoUrl: z.string().trim().url().max(2000).nullable(),
    coverUrl: z.string().trim().url().max(2000).nullable(),
    coverAssetId: z.string().trim().max(300).nullable(),
    coverAlt: z.string().trim().max(200).nullable(),
    status: z.enum(catalogStatuses),
    sortOrder: z.number().int().min(0).max(10_000),
  })
  .refine((value) => value.priceMax >= value.priceMin, {
    message: "Harga maksimum harus sama atau lebih besar dari harga minimum.",
    path: ["priceMax"],
  });

export default defineAction({
  description:
    "Update a RakitApp catalog application, including content, price, publication status, demo URL, and cover metadata.",
  schema: catalogFields,
  needsApproval: true,
  publicAgent: {
    expose: true,
    readOnly: false,
    requiresAuth: true,
    title: "Update a RakitApp catalog application",
  },
  run: async ({ appId, features, ...args }, ctx) => {
    assertOperator(ctx?.userEmail);
    const [row] = await getDb()
      .update(schema.catalogApps)
      .set({
        ...args,
        featuresJson: JSON.stringify(features),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.catalogApps.id, appId))
      .returning();
    if (!row) throw new Error("Catalog application not found.");
    return toCatalogApp(row);
  },
});
