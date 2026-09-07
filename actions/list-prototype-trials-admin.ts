import { defineAction } from "@agent-native/core/action";
import { desc } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, parseProjectBrief } from "../server/lib/leads.js";
import {
  prototypeTrialHoursForCategory,
  type PrototypeTrialPhase,
} from "../shared/prototype.js";

export default defineAction({
  description:
    "List prototype requests for the authenticated RakitApp operator.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: true,
    title: "Manage RakitApp prototype requests",
  },
  run: async (_args, ctx) => {
    assertOperator(ctx?.userEmail);
    const rows = await getDb()
      .select()
      .from(schema.prototypeTrials)
      .orderBy(desc(schema.prototypeTrials.updatedAt));

    return rows.map((row) => {
      const brief = parseProjectBrief(row.brief);
      return {
        trialToken: row.id,
        brief,
        phase: row.phase as PrototypeTrialPhase,
        demoUrl: row.demoUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        activatedAt: row.activatedAt,
        trialExpiresAt: row.trialExpiresAt,
        trialHours: prototypeTrialHoursForCategory(brief.categoryId),
      };
    });
  },
});
