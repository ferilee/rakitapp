import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseProjectBrief } from "../server/lib/leads.js";
import {
  prototypeTrialHoursForCategory,
  type PrototypeTrialPhase,
} from "../shared/prototype.js";

export default defineAction({
  description:
    "List prototype requests saved to the authenticated client's account.",
  schema: z.object({}),
  http: { method: "GET" },
  requiresAuth: true,
  agentTool: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const ownerEmail = ctx?.userEmail?.trim().toLowerCase();
    if (!ownerEmail) throw new Error("Silakan masuk untuk melihat prototype.");

    const rows = await getDb()
      .select()
      .from(schema.prototypeTrials)
      .where(eq(schema.prototypeTrials.ownerEmail, ownerEmail))
      .orderBy(desc(schema.prototypeTrials.updatedAt));

    return rows.map((row) => {
      const brief = parseProjectBrief(row.brief);
      return {
        trialToken: row.id,
        brief,
        phase: row.phase as PrototypeTrialPhase,
        status: row.status as "active" | "expired",
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        demoUrl: row.demoUrl,
        activatedAt: row.activatedAt,
        trialExpiresAt: row.trialExpiresAt,
        updatedAt: row.updatedAt,
        trialHours: prototypeTrialHoursForCategory(brief.categoryId),
      };
    });
  },
});
