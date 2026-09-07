import { asc, eq } from "drizzle-orm";

import type { ShowcaseApp } from "../../shared/showcase.js";
import {
  prioritizePersonalApps,
  RAKITAPP_SHOWCASE,
} from "../../shared/showcase.js";
import { getDb, schema } from "../db/index.js";

export { assertOperator } from "./leads.js";

export const catalogAccents = [
  "cyan",
  "violet",
  "orange",
  "emerald",
  "pink",
  "blue",
] as const;

export const catalogStatuses = ["draft", "published", "archived"] as const;

export type CatalogAccent = (typeof catalogAccents)[number];
export type CatalogStatus = (typeof catalogStatuses)[number];
export type CatalogAppRow = typeof schema.catalogApps.$inferSelect;

const seededPrices: Record<string, { min: number; max: number }> = {
  smartclass: { min: 2_500_000, max: 4_500_000 },
  quizlab: { min: 2_000_000, max: 4_000_000 },
  presensikita: { min: 1_000_000, max: 3_000_000 },
  "asesmen-insight": { min: 2_000_000, max: 4_500_000 },
  "perpus-sekolah": { min: 1_500_000, max: 3_500_000 },
  "tefa-tracker": { min: 2_500_000, max: 5_000_000 },
  "portofolio-pribadi": { min: 200_000, max: 300_000 },
  "rumah-pribadi": { min: 150_000, max: 250_000 },
  "blog-ceritakita": { min: 200_000, max: 300_000 },
  "linkbio-pribadi": { min: 150_000, max: 300_000 },
};

function compactRupiah(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  return `${Math.round(value / 1_000).toLocaleString("id-ID")} rb`;
}

export function formatCatalogEstimate(priceMin: number, priceMax: number) {
  return `Rp ${compactRupiah(priceMin)} – Rp ${compactRupiah(priceMax)}`;
}

function parseFeatures(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function toCatalogApp(row: CatalogAppRow): ShowcaseApp {
  return {
    id: row.id,
    accent: row.accent as CatalogAccent,
    name: row.name,
    category: row.category,
    audience: row.audience,
    summary: row.summary,
    description: row.description,
    features: parseFeatures(row.featuresJson),
    outcome: row.outcome,
    estimate: formatCatalogEstimate(row.priceMin, row.priceMax),
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    demoUrl: row.demoUrl,
    coverUrl: row.coverUrl,
    coverAssetId: row.coverAssetId,
    coverAlt: row.coverAlt,
    status: row.status as CatalogStatus,
    sortOrder: row.sortOrder,
  };
}

export async function listPublishedCatalogApps() {
  const rows = await getDb()
    .select()
    .from(schema.catalogApps)
    .where(eq(schema.catalogApps.status, "published"))
    .orderBy(asc(schema.catalogApps.sortOrder), asc(schema.catalogApps.name));
  return prioritizePersonalApps(rows.map(toCatalogApp));
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

export function catalogSeedMigrationSql() {
  const now = "1970-01-01T00:00:00.000Z";
  return RAKITAPP_SHOWCASE.map((app, index) => {
    const price = seededPrices[app.id];
    if (!price) throw new Error(`Missing seeded price for ${app.id}`);
    return `INSERT INTO catalog_apps (id, name, category, audience, summary, description, features_json, outcome, accent, price_min, price_max, status, sort_order, created_at, updated_at)
VALUES (${sqlString(app.id)}, ${sqlString(app.name)}, ${sqlString(app.category)}, ${sqlString(app.audience)}, ${sqlString(app.summary)}, ${sqlString(app.description)}, ${sqlString(JSON.stringify(app.features))}, ${sqlString(app.outcome)}, ${sqlString(app.accent)}, ${price.min}, ${price.max}, 'published', ${index}, ${sqlString(now)}, ${sqlString(now)})
ON CONFLICT (id) DO NOTHING;`;
  }).join("\n");
}
