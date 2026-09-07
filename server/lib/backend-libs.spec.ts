import { describe, expect, it, vi } from "vitest";

import {
  catalogSeedMigrationSql,
  formatCatalogEstimate,
  toCatalogApp,
} from "./catalog.js";
import {
  assertOperator,
  notificationEmail,
  parseProjectBrief,
  toLeadSummary,
} from "./leads.js";

describe("RakitApp server library functions", () => {
  it("formats catalog estimates and maps catalog rows", () => {
    expect(formatCatalogEstimate(100_000, 5_000_000)).toBe(
      "Rp 100 rb – Rp 5 jt",
    );

    const result = toCatalogApp({
      id: "portfolio",
      name: "Portfolio",
      category: "Website pribadi",
      audience: "Guru",
      summary: "Website profil dan karya pribadi.",
      description: "Halaman ringan untuk menampilkan karya.",
      featuresJson: JSON.stringify(["Profil", "Galeri"]),
      outcome: "Karya mudah dibagikan.",
      accent: "pink",
      priceMin: 100_000,
      priceMax: 300_000,
      demoUrl: "https://demo.example",
      coverUrl: null,
      coverAssetId: null,
      coverAlt: null,
      status: "published",
      sortOrder: 1,
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-07T00:00:00.000Z",
    } as any);

    expect(result).toMatchObject({
      id: "portfolio",
      features: ["Profil", "Galeri"],
      priceMin: 100_000,
    });
    expect(
      toCatalogApp({ ...(result as any), featuresJson: "not-json" } as any)
        .features,
    ).toEqual([]);
    expect(catalogSeedMigrationSql()).toContain("INSERT INTO catalog_apps");
  });

  it("enforces operator rules and parses stored lead briefs", () => {
    vi.stubEnv("RAKITAPP_OPERATOR_EMAILS", "");
    vi.stubEnv("NODE_ENV", "test");
    expect(() => assertOperator("operator@example.com")).not.toThrow();
    expect(() => assertOperator(undefined)).toThrow("authenticated operator");

    vi.stubEnv("RAKITAPP_OPERATOR_EMAILS", "Allowed@Example.com");
    expect(() => assertOperator("allowed@example.com")).not.toThrow();
    expect(() => assertOperator("other@example.com")).toThrow(
      "not a RakitApp operator",
    );
    expect(() => parseProjectBrief("bad-json")).toThrow(
      "saved project brief is invalid",
    );
    expect(notificationEmail()).toBeNull();
    vi.stubEnv("RAKITAPP_NOTIFICATION_EMAIL", " notify@example.com ");
    expect(notificationEmail()).toBe("notify@example.com");
  });

  it("maps a lead row to the public operator summary", () => {
    const brief = {
      temporaryName: "JurnalMengajarLMS",
      idea: "Jurnal mengajar",
      categoryId: "lms",
      categoryLabel: "LMS & Kelas Digital",
      audience: ["teacher"],
      audienceLabels: ["Guru"],
      features: [],
      estimate: {
        priceMin: 1_000_000,
        priceMax: 2_000_000,
        daysMin: 20,
        daysMax: 30,
        complexity: "sederhana",
        points: 1,
        assumptions: [],
      },
    };
    expect(
      toLeadSummary({
        id: "lead-1",
        name: "Guru",
        email: "guru@example.com",
        whatsapp: null,
        organization: "Sekolah",
        categoryId: "lms",
        brief: JSON.stringify(brief),
        status: "new",
        notes: null,
        createdAt: "2026-09-07T00:00:00.000Z",
        updatedAt: "2026-09-07T00:00:00.000Z",
      } as any),
    ).toMatchObject({ id: "lead-1", organization: "Sekolah", brief });
  });
});
