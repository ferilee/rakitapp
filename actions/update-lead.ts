import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toLeadSummary } from "../server/lib/leads.js";

export default defineAction({
  description:
    "Update the status or internal notes of a RakitApp consultation lead.",
  schema: z
    .object({
      leadId: z.string().min(1),
      status: z.enum(["new", "contacted", "qualified", "closed"]).optional(),
      notes: z.string().trim().max(4000).nullable().optional(),
    })
    .refine(
      (value) => value.status !== undefined || value.notes !== undefined,
      {
        message: "Provide status or notes to update.",
      },
    ),
  run: async ({ leadId, status, notes }, ctx) => {
    assertOperator(ctx?.userEmail);
    const now = new Date().toISOString();
    const [row] = await getDb()
      .update(schema.projectLeads)
      .set({
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: now,
      })
      .where(eq(schema.projectLeads.id, leadId))
      .returning();
    if (!row) throw new Error("Lead not found.");
    return toLeadSummary(row);
  },
});
