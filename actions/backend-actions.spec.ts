import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { closeDbExec } from "@agent-native/core/db";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as schema from "../server/db/schema.js";
import type { ProjectIntake } from "../shared/catalog.js";
import { buildProjectBrief } from "../shared/estimator.js";

const mocks = vi.hoisted(() => ({
  db: undefined as any,
  sendEmail: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock("../server/db/index.js", async () => {
  const actual = await vi.importActual<typeof import("../server/db/index.js")>(
    "../server/db/index.js",
  );
  return { ...actual, getDb: () => mocks.db };
});

vi.mock("@agent-native/core/server", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@agent-native/core/file-upload", () => ({
  uploadFile: mocks.uploadFile,
}));

type Action = { run: (input: any, context?: any) => Promise<any> };

const operator = { userEmail: "operator@example.com" };
const intake: ProjectIntake = {
  idea: "Aplikasi jurnal mengajar untuk guru",
  categoryId: "lms",
  audience: ["teacher"],
  featureIds: ["auth-roles", "learning-materials", "teacher-dashboard"],
};

let db: any;
let client: Client;
let databaseDirectory: string;
let actions: Record<string, Action>;

function action(name: string) {
  const selected = actions[name];
  if (!selected) throw new Error(`Missing action fixture: ${name}`);
  return selected;
}

async function resetTables() {
  await client.executeMultiple(`
    DELETE FROM prototype_trials;
    DELETE FROM project_leads;
    DELETE FROM catalog_apps;
  `);
  mocks.sendEmail.mockReset();
  mocks.uploadFile.mockReset();
  vi.stubEnv("RAKITAPP_NOTIFICATION_EMAIL", "");
  vi.stubEnv("RAKITAPP_OPERATOR_EMAILS", "");
}

async function seedCatalog(
  overrides: Partial<typeof schema.catalogApps.$inferInsert> = {},
) {
  const now = "2026-09-07T12:00:00.000Z";
  const row = {
    id: "school-app",
    name: "School App",
    category: "Kelas digital",
    audience: "Guru & siswa",
    summary: "Aplikasi sekolah untuk kebutuhan belajar harian.",
    description:
      "Ruang belajar sekolah dengan fitur inti yang mudah digunakan.",
    featuresJson: JSON.stringify(["Materi", "Dashboard"]),
    outcome: "Guru dapat memantau kegiatan belajar.",
    accent: "cyan" as const,
    priceMin: 1_000_000,
    priceMax: 3_000_000,
    demoUrl: null,
    coverUrl: null,
    coverAssetId: null,
    coverAlt: null,
    status: "published" as const,
    sortOrder: 10,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  const [inserted] = await db
    .insert(schema.catalogApps)
    .values(row)
    .returning();
  return inserted;
}

async function seedLead(id = "lead-fixture") {
  const now = new Date().toISOString();
  const brief = buildProjectBrief(intake);
  const [inserted] = await db
    .insert(schema.projectLeads)
    .values({
      id,
      name: "Guru Contoh",
      email: "guru@example.com",
      whatsapp: "+628123456789",
      organization: "SMK Contoh",
      categoryId: intake.categoryId,
      brief: JSON.stringify(brief),
      status: "new",
      notes: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return inserted;
}

beforeAll(async () => {
  databaseDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "rakitapp-backend-"),
  );
  const databaseUrl = `file:${path.join(databaseDirectory, "test.db")}`;
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = "test";
  await closeDbExec();
  client = createClient({ url: databaseUrl });
  db = drizzle(client, { schema });
  mocks.db = db;
  await client.executeMultiple(`
    CREATE TABLE project_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      organization TEXT NOT NULL,
      category_id TEXT NOT NULL,
      brief TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE catalog_apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      audience TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      features_json TEXT NOT NULL,
      outcome TEXT NOT NULL,
      accent TEXT NOT NULL DEFAULT 'cyan',
      price_min INTEGER NOT NULL,
      price_max INTEGER NOT NULL,
      demo_url TEXT,
      cover_url TEXT,
      cover_asset_id TEXT,
      cover_alt TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE prototype_trials (
      id TEXT PRIMARY KEY,
      brief TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      phase TEXT NOT NULL DEFAULT 'requested',
      demo_url TEXT,
      activated_at TEXT,
      trial_expires_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX project_leads_status_updated_idx ON project_leads (status, updated_at);
    CREATE INDEX prototype_trials_expires_idx ON prototype_trials (expires_at);
    CREATE INDEX prototype_trials_phase_updated_idx ON prototype_trials (phase, updated_at);
  `);

  const imported = await Promise.all([
    import("./archive-catalog-app.js"),
    import("./calculate-project-estimate.js"),
    import("./create-catalog-app.js"),
    import("./generate-project-brief.js"),
    import("./get-lead.js"),
    import("./get-prototype-trial.js"),
    import("./get-public-activity.js"),
    import("./list-catalog-apps-admin.js"),
    import("./list-catalog-apps.js"),
    import("./list-leads.js"),
    import("./list-prototype-trials-admin.js"),
    import("./recommend-catalog-app.js"),
    import("./reorder-catalog-apps.js"),
    import("./start-prototype-trial.js"),
    import("./submit-consultation.js"),
    import("./update-catalog-app.js"),
    import("./update-lead.js"),
    import("./update-prototype-trial.js"),
    import("./upload-catalog-cover.js"),
  ]);
  actions = {
    "archive-catalog-app": imported[0].default,
    "calculate-project-estimate": imported[1].default,
    "create-catalog-app": imported[2].default,
    "generate-project-brief": imported[3].default,
    "get-lead": imported[4].default,
    "get-prototype-trial": imported[5].default,
    "get-public-activity": imported[6].default,
    "list-catalog-apps-admin": imported[7].default,
    "list-catalog-apps": imported[8].default,
    "list-leads": imported[9].default,
    "list-prototype-trials-admin": imported[10].default,
    "recommend-catalog-app": imported[11].default,
    "reorder-catalog-apps": imported[12].default,
    "start-prototype-trial": imported[13].default,
    "submit-consultation": imported[14].default,
    "update-catalog-app": imported[15].default,
    "update-lead": imported[16].default,
    "update-prototype-trial": imported[17].default,
    "upload-catalog-cover": imported[18].default,
  };
});

beforeEach(resetTables);

afterAll(async () => {
  await closeDbExec();
  client?.close();
  if (databaseDirectory)
    fs.rmSync(databaseDirectory, { recursive: true, force: true });
});

describe("RakitApp public planning actions", () => {
  it("calculates an affordable personal estimate and builds a brief", async () => {
    const personal = {
      ...intake,
      idea: "Website portofolio pribadi",
      categoryId: "personal-web" as const,
      featureIds: ["personal-profile"],
    };
    const estimate = await action("calculate-project-estimate").run(personal);
    const brief = await action("generate-project-brief").run(personal);

    expect(estimate.priceMin).toBeGreaterThanOrEqual(100_000);
    expect(estimate.priceMax).toBeLessThanOrEqual(300_000);
    expect(brief.categoryLabel).toContain("Website Pribadi");
    expect(brief.features).toHaveLength(1);
    await expect(
      action("calculate-project-estimate").run({ idea: "x" }),
    ).rejects.toThrow("Invalid action parameters");
  });

  it("lists only published apps and prioritizes personal apps", async () => {
    await seedCatalog({
      id: "school-app",
      category: "Kelas digital",
      sortOrder: 1,
    });
    await seedCatalog({
      id: "portfolio-pribadi",
      category: "Website pribadi",
      sortOrder: 20,
      priceMin: 100_000,
      priceMax: 300_000,
    });
    await seedCatalog({ id: "draft-app", status: "draft", sortOrder: 0 });

    const result = await action("list-catalog-apps").run({});

    expect(result.map((item: any) => item.id)).toEqual([
      "portfolio-pribadi",
      "school-app",
    ]);
    expect(result[0].estimate).toContain("Rp 100 rb");
  });

  it("returns activity only for leads inside the seven-day window", async () => {
    const empty = await action("get-public-activity").run({});
    expect(empty).toEqual({ visible: false, recentCount: 0 });

    await seedLead();
    const visible = await action("get-public-activity").run({});
    expect(visible).toMatchObject({
      visible: true,
      recentCount: 1,
      categoryLabel: "LMS & Kelas Digital",
    });
  });
});

describe("RakitApp recommendation and consultation actions", () => {
  it("creates a specific catalog draft from an application name and idea", async () => {
    const result = await action("recommend-catalog-app").run(
      {
        name: "Jurnal Mengajar",
        idea: "Jurnal Mengajar untuk mencatat refleksi guru",
      },
      operator,
    );

    expect(result).toMatchObject({
      name: "Jurnal Mengajar",
      category: "LMS & Kelas Digital",
      status: "draft",
    });
    expect(result.summary).toContain("mencatat kegiatan mengajar");
    expect(result.description).toContain("jurnal digital untuk guru");
    expect(result.rationale).toContain("teaching-journal");
  });

  it("rejects recommendations without an operator", async () => {
    await expect(
      action("recommend-catalog-app").run({ idea: "Aplikasi kuis" }),
    ).rejects.toThrow("authenticated operator");
  });

  it("saves a consultation lead and reports notification state", async () => {
    const result = await action("submit-consultation").run({
      name: "Bu Sari",
      email: "sari@example.com",
      whatsapp: "+628123456789",
      organization: "SMP Harapan",
      intake,
    });

    expect(result.leadId).toMatch(/^lead-/);
    expect(result.notification).toBe("not_configured");
    const [saved] = await db.select().from(schema.projectLeads);
    expect(saved).toMatchObject({
      name: "Bu Sari",
      whatsapp: "+628123456789",
      categoryId: "lms",
    });

    vi.stubEnv("RAKITAPP_NOTIFICATION_EMAIL", "operator@example.com");
    mocks.sendEmail.mockResolvedValue(undefined);
    const notified = await action("submit-consultation").run({
      name: "Bu <Sari>",
      email: "sari2@example.com",
      whatsapp: "+628123456789",
      organization: "SMP Harapan",
      intake,
    });
    expect(notified.notification).toBe("sent");
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "operator@example.com",
        html: expect.stringContaining("&lt;Sari&gt;"),
      }),
    );
  });
});

describe("RakitApp lead actions", () => {
  it("lists, opens, and updates leads for an operator", async () => {
    await seedLead();
    const listed = await action("list-leads").run({ limit: 10 }, operator);
    expect(listed).toHaveLength(1);
    expect(listed[0].brief.categoryId).toBe("lms");

    const opened = await action("get-lead").run(
      { leadId: "lead-fixture" },
      operator,
    );
    expect(opened.id).toBe("lead-fixture");

    const updated = await action("update-lead").run(
      {
        leadId: "lead-fixture",
        status: "contacted",
        notes: "Sudah dihubungi.",
      },
      operator,
    );
    expect(updated).toMatchObject({
      status: "contacted",
      notes: "Sudah dihubungi.",
    });
    await expect(
      action("get-lead").run({ leadId: "missing" }, operator),
    ).rejects.toThrow("Lead not found");
  });

  it("enforces operator access and update input requirements", async () => {
    await expect(action("list-leads").run({ limit: 10 })).rejects.toThrow(
      "authenticated operator",
    );
    await expect(
      action("update-lead").run({ leadId: "lead-fixture" }, operator),
    ).rejects.toThrow("Invalid action parameters");
    vi.stubEnv("RAKITAPP_OPERATOR_EMAILS", "allowed@example.com");
    await expect(
      action("list-leads").run({ limit: 10 }, operator),
    ).rejects.toThrow("not a RakitApp operator");
  });
});

describe("RakitApp catalog administration actions", () => {
  const catalogInput = {
    id: "jurnal-mengajar",
    name: "Jurnal Mengajar",
    category: "Website pribadi",
    audience: "Guru",
    summary: "Jurnal digital untuk mencatat kegiatan mengajar.",
    description:
      "Guru dapat mencatat materi, kelas, refleksi, dan tindak lanjut pembelajaran.",
    features: ["Catatan mengajar", "Refleksi pembelajaran"],
    outcome: "Catatan guru lebih rapi dan mudah ditinjau.",
    accent: "pink" as const,
    priceMin: 100_000,
    priceMax: 300_000,
    demoUrl: null,
    coverUrl: null,
    coverAssetId: null,
    coverAlt: null,
    status: "draft" as const,
    sortOrder: 2,
  };

  it("creates, updates, reorders, archives, and lists catalog apps", async () => {
    const created = await action("create-catalog-app").run(
      catalogInput,
      operator,
    );
    expect(created).toMatchObject({
      id: "jurnal-mengajar",
      name: "Jurnal Mengajar",
      priceMin: 100_000,
    });

    const updated = await action("update-catalog-app").run(
      {
        ...catalogInput,
        appId: "jurnal-mengajar",
        status: "published",
        summary: "Jurnal mengajar digital untuk guru.",
      },
      operator,
    );
    expect(updated.status).toBe("published");
    await expect(
      action("reorder-catalog-apps").run(
        { items: [{ appId: "jurnal-mengajar", sortOrder: 7 }] },
        operator,
      ),
    ).resolves.toEqual({ updated: 1 });
    const adminList = await action("list-catalog-apps-admin").run({}, operator);
    expect(adminList[0].id).toBe("jurnal-mengajar");

    const archived = await action("archive-catalog-app").run(
      { appId: "jurnal-mengajar" },
      operator,
    );
    expect(archived.status).toBe("archived");
    await expect(
      action("update-catalog-app").run(
        { ...catalogInput, appId: "missing" },
        operator,
      ),
    ).rejects.toThrow("Catalog application not found");
  });

  it("validates catalog price ranges and uploads a cover through the provider", async () => {
    await expect(
      action("create-catalog-app").run(
        { ...catalogInput, priceMin: 300_000, priceMax: 100_000 },
        operator,
      ),
    ).rejects.toThrow("Invalid action parameters");
    mocks.uploadFile.mockResolvedValue({
      url: "https://cdn.example/cover.png",
      id: "asset-1",
      provider: "test",
    });
    const data =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    await expect(
      action("upload-catalog-cover").run(
        { data, filename: "cover.png" },
        operator,
      ),
    ).resolves.toEqual({
      url: "https://cdn.example/cover.png",
      id: "asset-1",
      provider: "test",
    });
    await expect(
      action("upload-catalog-cover").run(
        {
          data: "data:text/plain;base64,SGVsbG8gd29ybGQ=",
          filename: "cover.txt",
        },
        operator,
      ),
    ).rejects.toThrow("Gunakan cover");
  });
});

describe("RakitApp prototype actions", () => {
  it("creates, reads, activates, and lists a prototype trial", async () => {
    const started = await action("start-prototype-trial").run({ intake });
    expect(started).toMatchObject({ phase: "requested", trialHours: 24 });

    const requested = await action("get-prototype-trial").run({
      trialToken: started.trialToken,
    });
    expect(requested.phase).toBe("requested");
    await expect(
      action("update-prototype-trial").run(
        { trialToken: started.trialToken, phase: "active" },
        operator,
      ),
    ).rejects.toThrow("URL aplikasi live");

    const active = await action("update-prototype-trial").run(
      {
        trialToken: started.trialToken,
        phase: "active",
        demoUrl: "https://demo.example/app",
      },
      operator,
    );
    expect(active).toMatchObject({
      phase: "active",
      demoUrl: "https://demo.example/app",
      trialHours: 24,
    });
    const adminList = await action("list-prototype-trials-admin").run(
      {},
      operator,
    );
    expect(adminList[0].trialToken).toBe(started.trialToken);
  });

  it("reports an expired activated prototype and validates missing tokens", async () => {
    const started = await action("start-prototype-trial").run({ intake });
    await action("update-prototype-trial").run(
      {
        trialToken: started.trialToken,
        phase: "active",
        demoUrl: "https://demo.example/app",
      },
      operator,
    );
    await db
      .update(schema.prototypeTrials)
      .set({ trialExpiresAt: "2000-01-01T00:00:00.000Z" })
      .where(
        (await import("drizzle-orm")).eq(
          schema.prototypeTrials.id,
          started.trialToken,
        ),
      );
    const expired = await action("get-prototype-trial").run({
      trialToken: started.trialToken,
    });
    expect(expired).toMatchObject({ phase: "expired", status: "expired" });
    await expect(
      action("get-prototype-trial").run({ trialToken: "not-a-uuid" }),
    ).rejects.toThrow("Invalid action parameters");
  });
});
