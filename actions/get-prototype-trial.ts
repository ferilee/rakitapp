import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseProjectBrief } from "../server/lib/leads.js";
import {
  getPrototypeTrialStatus,
  prototypeTrialHoursForCategory,
  type PrototypeTrialPhase,
} from "../shared/prototype.js";

const prototypeTrialSchema = z.object({
  trialToken: z.string().uuid(),
});

export default defineAction({
  description:
    "Read the status of a RakitApp prototype request and expose its live demo only while the team-activated trial is valid.",
  schema: prototypeTrialSchema,
  http: { method: "GET" },
  requiresAuth: false,
  agentTool: false,
  readOnly: true,
  run: async ({ trialToken }) => {
    const [row] = await getDb()
      .select()
      .from(schema.prototypeTrials)
      .where(eq(schema.prototypeTrials.id, trialToken))
      .limit(1);

    if (!row)
      throw new Error("Prototype tidak ditemukan atau tautannya salah.");

    const phase = ((): PrototypeTrialPhase => {
      if (
        row.phase === "active" &&
        row.trialExpiresAt &&
        getPrototypeTrialStatus(row.trialExpiresAt) === "expired"
      ) {
        return "expired";
      }
      return row.phase;
    })();
    const brief = parseProjectBrief(row.brief);
    return {
      trialToken: row.id,
      brief,
      phase,
      status: phase === "expired" ? "expired" : "active",
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      demoUrl: row.demoUrl,
      activatedAt: row.activatedAt,
      trialExpiresAt: row.trialExpiresAt,
      archivedAt: row.archivedAt,
      isTestData: row.isTestData,
      updatedAt: row.updatedAt,
      trialHours: prototypeTrialHoursForCategory(brief.categoryId, brief.scope),
    };
  },
});
