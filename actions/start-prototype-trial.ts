import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { projectIntakeSchema } from "../shared/catalog.js";
import { buildProjectBrief } from "../shared/estimator.js";
import { prototypeTrialHoursForCategory } from "../shared/prototype.js";

export default defineAction({
  description:
    "Submit a public request for a RakitApp prototype that will be built by the team and activated after a real demo URL is ready.",
  schema: z.object({ intake: projectIntakeSchema }),
  requiresAuth: false,
  agentTool: false,
  maxBodyBytes: 64 * 1024,
  run: async ({ intake }, ctx) => {
    const createdAt = new Date();
    const trialToken = crypto.randomUUID();
    const brief = buildProjectBrief(intake);
    const now = createdAt.toISOString();

    await getDb()
      .insert(schema.prototypeTrials)
      .values({
        id: trialToken,
        brief: JSON.stringify(brief),
        ownerEmail: ctx?.userEmail ?? null,
        phase: "requested",
        status: "active",
        createdAt: now,
        expiresAt: now,
        demoUrl: null,
        activatedAt: null,
        trialExpiresAt: null,
        updatedAt: now,
      });

    return {
      trialToken,
      brief,
      phase: "requested" as const,
      status: "active" as const,
      createdAt: now,
      expiresAt: now,
      demoUrl: null,
      activatedAt: null,
      trialExpiresAt: null,
      updatedAt: now,
      trialHours: prototypeTrialHoursForCategory(brief.categoryId),
    };
  },
});
