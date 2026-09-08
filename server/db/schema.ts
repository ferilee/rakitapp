import { integer, table, text } from "@agent-native/core/db/schema";

export const projectLeads = table("project_leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  organization: text("organization").notNull(),
  categoryId: text("category_id").notNull(),
  brief: text("brief").notNull(),
  status: text("status", {
    enum: ["new", "contacted", "qualified", "closed"],
  })
    .notNull()
    .default("new"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const prototypeTrials = table("prototype_trials", {
  id: text("id").primaryKey(),
  brief: text("brief").notNull(),
  ownerEmail: text("owner_email"),
  status: text("status", {
    enum: ["active", "expired"],
  })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  phase: text("phase", {
    enum: ["requested", "building", "ready", "active", "expired"],
  })
    .notNull()
    .default("requested"),
  demoUrl: text("demo_url"),
  activatedAt: text("activated_at"),
  trialExpiresAt: text("trial_expires_at"),
  updatedAt: text("updated_at").notNull(),
});

export const catalogApps = table("catalog_apps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  audience: text("audience").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  featuresJson: text("features_json").notNull(),
  outcome: text("outcome").notNull(),
  accent: text("accent", {
    enum: ["cyan", "violet", "orange", "emerald", "pink", "blue"],
  })
    .notNull()
    .default("cyan"),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  demoUrl: text("demo_url"),
  coverUrl: text("cover_url"),
  coverAssetId: text("cover_asset_id"),
  coverAlt: text("cover_alt"),
  status: text("status", {
    enum: ["draft", "published", "archived"],
  })
    .notNull()
    .default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
