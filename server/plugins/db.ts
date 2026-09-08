import {
  ensureAdditiveColumns,
  getDbExec,
  runMigrations,
} from "@agent-native/core/db";

import * as schema from "../db/schema.js";
import { catalogSeedMigrationSql } from "../lib/catalog.js";

function isDrizzleTable(value: unknown): value is object {
  return (
    !!value &&
    typeof value === "object" &&
    Object.getOwnPropertySymbols(value).some((symbol) =>
      symbol.toString().includes("drizzle"),
    )
  );
}

const schemaTables = Object.values(schema).filter(isDrizzleTable);

const runRakitAppMigrations = runMigrations(
  [
    {
      version: 1,
      name: "rakitapp-project-leads",
      sql: `CREATE TABLE IF NOT EXISTS project_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  category_id TEXT NOT NULL,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'closed')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    },
    {
      version: 2,
      name: "rakitapp-project-leads-updated-index",
      sql: `CREATE INDEX IF NOT EXISTS project_leads_status_updated_idx ON project_leads (status, updated_at);
CREATE INDEX IF NOT EXISTS project_leads_email_idx ON project_leads (email)`,
    },
    {
      version: 3,
      name: "rakitapp-catalog-apps",
      sql: `CREATE TABLE IF NOT EXISTS catalog_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  audience TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  features_json TEXT NOT NULL,
  outcome TEXT NOT NULL,
  accent TEXT NOT NULL DEFAULT 'cyan' CHECK(accent IN ('cyan', 'violet', 'orange', 'emerald', 'pink', 'blue')),
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  demo_url TEXT,
  cover_url TEXT,
  cover_asset_id TEXT,
  cover_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    },
    {
      version: 4,
      name: "rakitapp-catalog-apps-seed",
      sql: catalogSeedMigrationSql(),
    },
    {
      version: 5,
      name: "rakitapp-affordable-catalog-pricing",
      sql: `UPDATE catalog_apps SET price_min = 200000, price_max = 300000, updated_at = '2026-09-06T00:00:00.000Z'
WHERE id = 'portofolio-pribadi' AND price_min = 250000 AND price_max = 450000;
UPDATE catalog_apps SET price_min = 150000, price_max = 250000, updated_at = '2026-09-06T00:00:00.000Z'
WHERE id = 'rumah-pribadi' AND price_min = 150000 AND price_max = 350000;
UPDATE catalog_apps SET price_min = 200000, price_max = 300000, updated_at = '2026-09-06T00:00:00.000Z'
WHERE id = 'blog-ceritakita' AND price_min = 250000 AND price_max = 450000;
UPDATE catalog_apps SET price_min = 150000, price_max = 300000, updated_at = '2026-09-06T00:00:00.000Z'
WHERE id = 'linkbio-pribadi' AND price_min = 150000 AND price_max = 300000;`,
    },
    {
      version: 6,
      name: "rakitapp-project-leads-whatsapp-marker",
      // ensureAdditiveColumns below applies the schema column idempotently.
      sql: "SELECT 1;",
    },
    {
      version: 7,
      name: "rakitapp-portofolio-demo-url",
      sql: "UPDATE catalog_apps SET demo_url = 'https://ferilee.gurumuda.eu.org' WHERE id = 'portofolio-pribadi';",
    },
    {
      version: 8,
      name: "rakitapp-prototype-trials",
      sql: `CREATE TABLE IF NOT EXISTS prototype_trials (
  id TEXT PRIMARY KEY,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS prototype_trials_expires_idx ON prototype_trials (expires_at);`,
    },
    {
      version: 9,
      name: "rakitapp-prototype-trial-workflow",
      sql: `ALTER TABLE prototype_trials ADD COLUMN phase TEXT NOT NULL DEFAULT 'requested';
ALTER TABLE prototype_trials ADD COLUMN demo_url TEXT;
ALTER TABLE prototype_trials ADD COLUMN activated_at TEXT;
ALTER TABLE prototype_trials ADD COLUMN trial_expires_at TEXT;
ALTER TABLE prototype_trials ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
UPDATE prototype_trials SET updated_at = created_at WHERE updated_at = '';
CREATE INDEX IF NOT EXISTS prototype_trials_phase_updated_idx ON prototype_trials (phase, updated_at);`,
    },
    {
      version: 10,
      name: "rakitapp-prototype-trial-owners",
      sql: "ALTER TABLE prototype_trials ADD COLUMN owner_email TEXT;\nCREATE INDEX IF NOT EXISTS prototype_trials_owner_email_idx ON prototype_trials (owner_email);",
    },
    {
      version: 11,
      name: "rakitapp-prototype-trial-archive-controls",
      sql: `ALTER TABLE prototype_trials ADD COLUMN archived_at TEXT;
ALTER TABLE prototype_trials ADD COLUMN archived_by TEXT;
ALTER TABLE prototype_trials ADD COLUMN is_test_data INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS prototype_trials_archive_idx ON prototype_trials (archived_at, is_test_data);`,
    },
  ],
  { table: "rakitapp_migrations" },
);

export default async (nitroApp: any): Promise<void> => {
  await runRakitAppMigrations(nitroApp);
  await ensureAdditiveColumns({ db: getDbExec(), tables: schemaTables });
};
