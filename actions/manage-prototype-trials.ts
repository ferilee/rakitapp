import { defineAction } from "@agent-native/core/action";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator } from "../server/lib/leads.js";

const operationSchema = z.enum(["archive", "restore", "delete-test"]);

export default defineAction({
  description:
    "Archive, restore, or permanently delete archived RakitApp prototype test data for the authenticated operator.",
  schema: z.object({
    operation: operationSchema,
    trialTokens: z.array(z.string().uuid()).min(1).max(100),
  }),
  run: async ({ operation, trialTokens }, ctx) => {
    assertOperator(ctx?.userEmail);
    const db = getDb();
    const nowIso = new Date().toISOString();
    const operatorEmail = ctx?.userEmail?.trim().toLowerCase() ?? null;

    if (operation === "delete-test") {
      const result = await db
        .delete(schema.prototypeTrials)
        .where(
          and(
            inArray(schema.prototypeTrials.id, trialTokens),
            eq(schema.prototypeTrials.isTestData, true),
            isNotNull(schema.prototypeTrials.archivedAt),
          ),
        );

      return {
        operation,
        affectedCount: result.rowsAffected,
      };
    }

    const values =
      operation === "archive"
        ? { archivedAt: nowIso, archivedBy: operatorEmail, updatedAt: nowIso }
        : { archivedAt: null, archivedBy: null, updatedAt: nowIso };
    const result = await db
      .update(schema.prototypeTrials)
      .set(values)
      .where(inArray(schema.prototypeTrials.id, trialTokens));

    return {
      operation,
      affectedCount: result.rowsAffected,
    };
  },
});
