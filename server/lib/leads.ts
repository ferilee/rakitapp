import { ForbiddenError } from "@agent-native/core/sharing";

import { SCOPE_OPTIONS, type ScopeId } from "../../shared/catalog.js";
import type { ProjectBrief, ProjectLeadSummary } from "../../shared/types.js";
import type { schema } from "../db/index.js";

type ProjectLeadRow = typeof schema.projectLeads.$inferSelect;

export function assertOperator(userEmail: string | undefined) {
  if (!userEmail) {
    throw new ForbiddenError("An authenticated operator account is required.");
  }

  // guard:allow-env-credential — deploy-level operator allowlist, never a user credential
  const configuredOperators = (process.env.RAKITAPP_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (configuredOperators.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenError(
        "RAKITAPP_OPERATOR_EMAILS must be configured before lead access is enabled.",
      );
    }
    return;
  }

  if (!configuredOperators.includes(userEmail.toLowerCase())) {
    throw new ForbiddenError("This account is not a RakitApp operator.");
  }
}

export function parseProjectBrief(value: string): ProjectBrief {
  try {
    const brief = JSON.parse(value) as Partial<ProjectBrief> & {
      categoryId: string;
    };
    const scope = (brief.scope ??
      (brief.categoryId === "personal-web" ? "personal" : "school")) as ScopeId;
    return {
      ...brief,
      scope,
      scopeLabel:
        brief.scopeLabel ??
        SCOPE_OPTIONS.find((option) => option.id === scope)?.label ??
        scope,
    } as ProjectBrief;
  } catch {
    throw new Error("The saved project brief is invalid.");
  }
}

export function toLeadSummary(row: ProjectLeadRow): ProjectLeadSummary {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    organization: row.organization,
    status: row.status,
    brief: parseProjectBrief(row.brief),
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function notificationEmail() {
  // guard:allow-env-credential — deploy-level notification destination configured by the operator
  return process.env.RAKITAPP_NOTIFICATION_EMAIL?.trim() || null;
}
