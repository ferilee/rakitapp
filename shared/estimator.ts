import {
  AUDIENCE_OPTIONS,
  CATEGORY_CATALOG,
  getCategory,
  getSelectedFeatures,
  SCHOOL_APP_PRICE_RANGE,
  SCOPE_OPTIONS,
  type ScopeId,
  type CategoryId,
} from "./catalog.js";
import type { ProjectBrief, ProjectEstimate, ProjectIntake } from "./types.js";

const DEFAULT_PRICE_PER_POINT_MIN = 25_000;
const DEFAULT_PRICE_PER_POINT_MAX = 50_000;
const MAX_INDICATIVE_PRICE = 5_000_000;
const DAYS_PER_POINT_MIN = 2;
const DAYS_PER_POINT_MAX = 4;
const SCHOOL_SCOPE_PRICE_BASE_MIN = SCHOOL_APP_PRICE_RANGE.min;
const SCHOOL_SCOPE_PRICE_BASE_MAX = 2_000_000;
const SCHOOL_SCOPE_PRICE_CEILING = SCHOOL_APP_PRICE_RANGE.max;

const SCOPE_PRICING: Record<
  Exclude<ScopeId, "school">,
  {
    basePriceMin: number;
    basePriceMax: number;
    pricePerPointMin: number;
    pricePerPointMax: number;
    maxPrice: number;
  }
> = {
  personal: {
    basePriceMin: 100_000,
    basePriceMax: 150_000,
    pricePerPointMin: 25_000,
    pricePerPointMax: 50_000,
    maxPrice: 300_000,
  },
  "single-class": {
    basePriceMin: 300_000,
    basePriceMax: 450_000,
    pricePerPointMin: 50_000,
    pricePerPointMax: 100_000,
    maxPrice: 900_000,
  },
  "multi-class": {
    basePriceMin: 500_000,
    basePriceMax: 750_000,
    pricePerPointMin: 75_000,
    pricePerPointMax: 125_000,
    maxPrice: 1_500_000,
  },
};

const SCOPE_COMPLEXITY_POINTS: Record<ScopeId, number> = {
  personal: 0,
  "single-class": 1,
  "multi-class": 3,
  school: 5,
};

function roundToFiftyThousand(value: number) {
  return Math.round(value / 50_000) * 50_000;
}

export function calculateProjectEstimate(
  intake: ProjectIntake,
): ProjectEstimate {
  const category = getCategory(intake.categoryId);
  const features = getSelectedFeatures(intake);
  const points = features.reduce((total, feature) => total + feature.weight, 0);
  const audienceAdjustment = Math.max(0, intake.audience.length - 1);
  const totalPoints =
    points + audienceAdjustment + SCOPE_COMPLEXITY_POINTS[intake.scope];
  const pricePoints = points + audienceAdjustment;
  const complexity: ProjectEstimate["complexity"] =
    totalPoints <= 6
      ? "sederhana"
      : totalPoints <= 12
        ? "menengah"
        : "kompleks";

  const pricing =
    intake.scope === "school"
      ? {
          basePriceMin: Math.max(
            category.basePriceMin,
            SCHOOL_SCOPE_PRICE_BASE_MIN,
          ),
          basePriceMax: Math.max(
            category.basePriceMax,
            SCHOOL_SCOPE_PRICE_BASE_MAX,
          ),
          pricePerPointMin:
            category.pricePerPointMin ?? DEFAULT_PRICE_PER_POINT_MIN,
          pricePerPointMax:
            category.pricePerPointMax ?? DEFAULT_PRICE_PER_POINT_MAX,
          maxPrice: Math.max(
            category.maxPrice ?? MAX_INDICATIVE_PRICE,
            SCHOOL_SCOPE_PRICE_CEILING,
          ),
        }
      : SCOPE_PRICING[intake.scope];
  const priceCeiling = pricing.maxPrice;
  const priceMin = Math.min(
    priceCeiling,
    roundToFiftyThousand(
      pricing.basePriceMin + pricePoints * pricing.pricePerPointMin,
    ),
  );
  const priceMax = Math.max(
    priceMin,
    Math.min(
      priceCeiling,
      roundToFiftyThousand(
        pricing.basePriceMax + pricePoints * pricing.pricePerPointMax,
      ),
    ),
  );

  return {
    priceMin,
    priceMax,
    daysMin: category.baseDaysMin + totalPoints * DAYS_PER_POINT_MIN,
    daysMax: category.baseDaysMax + totalPoints * DAYS_PER_POINT_MAX,
    complexity,
    points: totalPoints,
    assumptions: [
      "Estimasi ini bersifat indikatif dan perlu divalidasi melalui konsultasi.",
      "Estimasi mengasumsikan satu aplikasi web responsif dengan desain standar.",
      `Estimasi mengikuti cakupan penggunaan: ${getScopeLabel(intake.scope)}.`,
      "Kisaran ini memakai template dan scope MVP agar tetap terjangkau; kebutuhan di luar katalog dapat mengubah harga final.",
      ...(audienceAdjustment > 0
        ? [
            "Peran pengguna tambahan menambah kebutuhan hak akses dan pengujian.",
          ]
        : []),
    ],
  };
}

function temporaryName(idea: string, categoryId: CategoryId) {
  const firstWords = idea
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("");
  const categoryName = CATEGORY_CATALOG[categoryId].label
    .split(/[& ]/)[0]
    .replace(/[^\p{L}\p{N}]/gu, "");
  return firstWords ? `${firstWords}${categoryName}` : `Edu${categoryName}`;
}

export function buildProjectBrief(intake: ProjectIntake): ProjectBrief {
  const category = getCategory(intake.categoryId);
  const audienceLabels = intake.audience.map(
    (audienceId) =>
      AUDIENCE_OPTIONS.find((option) => option.id === audienceId)?.label ??
      audienceId,
  );

  return {
    temporaryName: temporaryName(intake.idea, intake.categoryId),
    idea: intake.idea,
    categoryId: intake.categoryId,
    categoryLabel: category.label,
    scope: intake.scope,
    scopeLabel: getScopeLabel(intake.scope),
    audience: intake.audience,
    audienceLabels,
    features: getSelectedFeatures(intake),
    estimate: calculateProjectEstimate(intake),
  };
}

function getScopeLabel(scope: ScopeId) {
  return SCOPE_OPTIONS.find((option) => option.id === scope)?.label ?? scope;
}
