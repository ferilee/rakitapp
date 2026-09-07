import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, parseProjectBrief } from "../server/lib/leads.js";
import {
  createPrototypeExpiry,
  prototypeTrialHoursForCategory,
  type PrototypeTrialPhase,
} from "../shared/prototype.js";

const phaseSchema = z.enum(["building", "ready", "active", "expired"]);

export default defineAction({
  description:
    "Update a prototype request, attach the team's live demo URL, or activate its trial timer.",
  schema: z.object({
    trialToken: z.string().uuid(),
    phase: phaseSchema,
    demoUrl: z.string().url().nullable().optional(),
  }),
  run: async ({ trialToken, phase, demoUrl }, ctx) => {
    assertOperator(ctx?.userEmail);
    const db = getDb();
    const [existing] = await db
      .select()
      .from(schema.prototypeTrials)
      .where(eq(schema.prototypeTrials.id, trialToken))
      .limit(1);
    if (!existing) throw new Error("Prototype request not found.");

    const nextDemoUrl = demoUrl === undefined ? existing.demoUrl : demoUrl;
    if (phase === "active" && !nextDemoUrl) {
      throw new Error(
        "Tambahkan URL aplikasi live sebelum mengaktifkan prototype.",
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const brief = parseProjectBrief(existing.brief);
    const hours = prototypeTrialHoursForCategory(brief.categoryId);
    const activation = phase === "active";
    const trialExpiresAt = activation
      ? createPrototypeExpiry(now, hours)
      : existing.trialExpiresAt;

    const [row] = await db
      .update(schema.prototypeTrials)
      .set({
        phase,
        demoUrl: nextDemoUrl,
        activatedAt: activation ? nowIso : existing.activatedAt,
        trialExpiresAt,
        expiresAt: activation ? trialExpiresAt! : existing.expiresAt,
        status: phase === "expired" ? "expired" : "active",
        updatedAt: nowIso,
      })
      .where(eq(schema.prototypeTrials.id, trialToken))
      .returning();
    if (!row) throw new Error("Prototype request not found.");

    return {
      trialToken: row.id,
      brief,
      phase: row.phase as PrototypeTrialPhase,
      demoUrl: row.demoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      activatedAt: row.activatedAt,
      trialExpiresAt: row.trialExpiresAt,
      trialHours: hours,
    };
  },
});
