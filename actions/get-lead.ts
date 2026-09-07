import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { assertOperator, toLeadSummary } from "../server/lib/leads.js";

export default defineAction({
  description: "Open one RakitApp consultation lead by id.",
  schema: z.object({ leadId: z.string().min(1) }),
  http: { method: "GET" },
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: true,
    title: "Open RakitApp lead",
  },
  link: ({ result }) => ({
    url: `/_agent-native/open?app=rakitapp&view=lead&leadId=${encodeURIComponent(result.id)}`,
    label: "Open lead in RakitApp",
    view: "lead",
  }),
  run: async ({ leadId }, ctx) => {
    assertOperator(ctx?.userEmail);
    const [row] = await getDb()
      .select()
      .from(schema.projectLeads)
      .where(eq(schema.projectLeads.id, leadId))
      .limit(1);
    if (!row) throw new Error("Lead not found.");
    return toLeadSummary(row);
  },
});
