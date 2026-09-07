import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { listPublishedCatalogApps } from "../server/lib/catalog.js";

export default defineAction({
  description:
    "List published RakitApp catalog applications for the public catalog.",
  schema: z.object({}),
  http: { method: "GET" },
  requiresAuth: false,
  readOnly: true,
  parallelSafe: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: false,
    title: "List published RakitApp applications",
  },
  run: async () => {
    return listPublishedCatalogApps();
  },
});
