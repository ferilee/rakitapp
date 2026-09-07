import {
  AUDIENCE_OPTIONS,
  CATEGORY_CATALOG,
  getCategory,
  getSelectedFeatures,
  type CategoryId,
} from "./catalog.js";
import type { ProjectBrief, ProjectEstimate, ProjectIntake } from "./types.js";

const DEFAULT_PRICE_PER_POINT_MIN = 25_000;
const DEFAULT_PRICE_PER_POINT_MAX = 50_000;
const MAX_INDICATIVE_PRICE = 5_000_000;
const DAYS_PER_POINT_MIN = 2;
const DAYS_PER_POINT_MAX = 4;

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
  const totalPoints = points + audienceAdjustment;
  const complexity: ProjectEstimate["complexity"] =
    totalPoints <= 6
      ? "sederhana"
      : totalPoints <= 12
        ? "menengah"
        : "kompleks";

  const priceCeiling = category.maxPrice ?? MAX_INDICATIVE_PRICE;
  const priceMin = Math.min(
    priceCeiling,
    roundToFiftyThousand(
      category.basePriceMin +
        totalPoints *
          (category.pricePerPointMin ?? DEFAULT_PRICE_PER_POINT_MIN),
    ),
  );
  const priceMax = Math.max(
    priceMin,
    Math.min(
      priceCeiling,
      roundToFiftyThousand(
        category.basePriceMax +
          totalPoints *
            (category.pricePerPointMax ?? DEFAULT_PRICE_PER_POINT_MAX),
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
    audience: intake.audience,
    audienceLabels,
    features: getSelectedFeatures(intake),
    estimate: calculateProjectEstimate(intake),
  };
}
