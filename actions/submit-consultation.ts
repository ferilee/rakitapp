import { defineAction } from "@agent-native/core/action";
import { sendEmail } from "@agent-native/core/server";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { notificationEmail } from "../server/lib/leads.js";
import { projectIntakeSchema } from "../shared/catalog.js";
import { buildProjectBrief } from "../shared/estimator.js";

const consultationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(240),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(24)
    .regex(/^\+?[0-9\s().-]+$/, "Nomor WhatsApp tidak valid."),
  organization: z.string().trim().min(2).max(160),
  intake: projectIntakeSchema,
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export default defineAction({
  description:
    "Submit an education application consultation request. Rebuild the brief from the intake, save the lead, and notify the configured RakitApp operator.",
  schema: consultationSchema,
  requiresAuth: false,
  agentTool: true,
  maxBodyBytes: 64 * 1024,
  needsApproval: (_args, ctx) =>
    ctx?.caller === "tool" || ctx?.caller === "mcp" || ctx?.caller === "a2a",
  link: ({ result }) => ({
    url: `/_agent-native/open?app=rakitapp&view=lead&leadId=${encodeURIComponent(result.leadId)}`,
    label: "Open consultation lead in RakitApp",
    view: "lead",
  }),
  run: async ({ name, email, whatsapp, organization, intake }) => {
    const brief = buildProjectBrief(intake);
    const leadId = `lead-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await getDb()
      .insert(schema.projectLeads)
      .values({
        id: leadId,
        name,
        email,
        whatsapp,
        organization,
        categoryId: intake.categoryId,
        brief: JSON.stringify(brief),
        status: "new",
        notes: null,
        createdAt: now,
        updatedAt: now,
      });

    let notification: "sent" | "not_configured" | "failed" = "not_configured";
    const recipient = notificationEmail();
    if (recipient) {
      try {
        await sendEmail({
          to: recipient,
          replyTo: email,
          subject: `RakitApp: konsultasi baru dari ${name}`,
          text: [
            `Nama: ${name}`,
            `Email: ${email}`,
            `WhatsApp: ${whatsapp}`,
            `Organisasi: ${organization}`,
            `Kategori: ${brief.categoryLabel}`,
            `Estimasi: Rp ${brief.estimate.priceMin.toLocaleString("id-ID")} - Rp ${brief.estimate.priceMax.toLocaleString("id-ID")}`,
            `Lead ID: ${leadId}`,
          ].join("\n"),
          html: `<h2>Konsultasi baru di RakitApp</h2><p><strong>${escapeHtml(name)}</strong> dari ${escapeHtml(organization)} mengirimkan brief aplikasi.</p><ul><li>Email: ${escapeHtml(email)}</li><li>WhatsApp: ${escapeHtml(whatsapp)}</li><li>Kategori: ${escapeHtml(brief.categoryLabel)}</li><li>Lead ID: ${escapeHtml(leadId)}</li></ul>`,
        });
        notification = "sent";
      } catch (error) {
        notification = "failed";
        console.error("[rakitapp] lead notification failed", error);
      }
    }

    return { leadId, brief, notification };
  },
});
