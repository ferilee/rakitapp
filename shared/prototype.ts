import type { ProjectBrief } from "./types.js";

export const PERSONAL_PROTOTYPE_TRIAL_HOURS = 8;
export const SCHOOL_PROTOTYPE_TRIAL_HOURS = 24;
export const PROTOTYPE_TRIAL_HOURS = SCHOOL_PROTOTYPE_TRIAL_HOURS;
export const PROTOTYPE_TRIAL_DURATION_MS =
  PROTOTYPE_TRIAL_HOURS * 60 * 60 * 1000;

export type PrototypeTrialStatus = "active" | "expired";
export type PrototypeTrialPhase =
  | "requested"
  | "building"
  | "ready"
  | "active"
  | "expired";

export interface PrototypeTrial {
  trialToken: string;
  brief: ProjectBrief;
  phase: PrototypeTrialPhase;
  status: PrototypeTrialStatus;
  createdAt: string;
  expiresAt: string;
  demoUrl: string | null;
  activatedAt: string | null;
  trialExpiresAt: string | null;
  archivedAt: string | null;
  isTestData: boolean;
  updatedAt: string;
  trialHours: number;
}

export function prototypeTrialHoursForCategory(categoryId: string): number {
  return categoryId === "personal-web"
    ? PERSONAL_PROTOTYPE_TRIAL_HOURS
    : SCHOOL_PROTOTYPE_TRIAL_HOURS;
}

export function createPrototypeExpiry(
  createdAt: Date,
  hours = PROTOTYPE_TRIAL_HOURS,
): string {
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function getPrototypeTrialStatus(
  expiresAt: string,
  now = new Date(),
): PrototypeTrialStatus {
  return new Date(expiresAt).getTime() > now.getTime() ? "active" : "expired";
}

export function getPrototypeRemainingMs(
  expiresAt: string,
  now = new Date(),
): number {
  return Math.max(0, new Date(expiresAt).getTime() - now.getTime());
}
