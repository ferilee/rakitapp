import type {
  AudienceId,
  CategoryId,
  FeatureDefinition,
  ProjectIntake,
  ScopeId,
} from "./catalog.js";

export type ProjectComplexity = "sederhana" | "menengah" | "kompleks";

export interface ProjectEstimate {
  priceMin: number;
  priceMax: number;
  daysMin: number;
  daysMax: number;
  complexity: ProjectComplexity;
  points: number;
  assumptions: string[];
}

export interface ProjectBrief {
  temporaryName: string;
  idea: string;
  categoryId: CategoryId;
  categoryLabel: string;
  scope: ScopeId;
  scopeLabel: string;
  audience: AudienceId[];
  audienceLabels: string[];
  features: FeatureDefinition[];
  estimate: ProjectEstimate;
}

export interface ProjectLeadSummary {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  organization: string;
  status: "new" | "contacted" | "qualified" | "closed";
  brief: ProjectBrief;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type { ProjectIntake };
