import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";

export default defineAction({
  description:
    "Save a public RakitApp prototype request to the authenticated client's account.",
  schema: z.object({ trialToken: z.string().uuid() }),
  requiresAuth: true,
  agentTool: false,
  run: async ({ trialToken }, ctx) => {
    const ownerEmail = ctx?.userEmail?.trim().toLowerCase();
    if (!ownerEmail)
      throw new Error("Silakan masuk untuk menyimpan prototype.");

    const db = getDb();
    const [existing] = await db
      .select({ ownerEmail: schema.prototypeTrials.ownerEmail })
      .from(schema.prototypeTrials)
      .where(eq(schema.prototypeTrials.id, trialToken))
      .limit(1);
    if (!existing) throw new Error("Prototype tidak ditemukan.");
    if (existing.ownerEmail && existing.ownerEmail !== ownerEmail) {
      throw new Error("Prototype ini sudah tersimpan di akun lain.");
    }

    await db
      .update(schema.prototypeTrials)
      .set({ ownerEmail })
      .where(eq(schema.prototypeTrials.id, trialToken));

    return { saved: true, trialToken };
  },
});
