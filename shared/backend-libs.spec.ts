import { describe, expect, it } from "vitest";

import {
  appStateKeyForBrowserTab,
  normalizeBrowserTabId,
} from "./app-state-tabs.js";
import {
  getCategory,
  getSelectedFeatures,
  PERSONAL_APP_PRICE_RANGE,
  SCHOOL_APP_PRICE_RANGE,
} from "./catalog.js";
import { rakitAppRoutePath } from "./navigation.js";
import {
  createPrototypeExpiry,
  getPrototypeRemainingMs,
  getPrototypeTrialStatus,
  prototypeTrialHoursForCategory,
} from "./prototype.js";
import {
  getPackageDetails,
  isPersonalShowcaseApp,
  prioritizePersonalApps,
} from "./showcase.js";

describe("RakitApp shared helper functions", () => {
  it("normalizes safe browser tab ids and scopes state keys", () => {
    expect(normalizeBrowserTabId(" tab-1 ")).toBe("tab-1");
    expect(normalizeBrowserTabId("bad tab")).toBeNull();
    expect(normalizeBrowserTabId(42)).toBeNull();
    expect(appStateKeyForBrowserTab("navigation", "tab-1")).toBe(
      "navigation:tab-1",
    );
    expect(appStateKeyForBrowserTab("navigation", "bad tab")).toBe(
      "navigation",
    );
  });

  it("maps every supported navigation view", () => {
    expect(rakitAppRoutePath({ view: "builder" })).toBe("/build");
    expect(rakitAppRoutePath({ view: "admin" })).toBe("/admin");
    expect(rakitAppRoutePath({ view: "admin-catalog" })).toBe(
      "/admin?section=catalog",
    );
    expect(rakitAppRoutePath({ view: "lead", leadId: "lead 1" })).toBe(
      "/admin?leadId=lead%201",
    );
    expect(rakitAppRoutePath({ view: "agent" })).toBe("/chat");
    expect(rakitAppRoutePath({ view: "settings" })).toBe("/settings");
    expect(rakitAppRoutePath({})).toBeNull();
  });

  it("recognizes and prioritizes personal showcase apps", () => {
    expect(
      isPersonalShowcaseApp({ id: "blog-1", category: "Blog pribadi" }),
    ).toBe(true);
    expect(isPersonalShowcaseApp({ id: "school", category: "LMS" })).toBe(
      false,
    );
    const apps = [
      { id: "school", category: "LMS" },
      { id: "portfolio-pribadi", category: "Website" },
    ];
    expect(prioritizePersonalApps(apps).map((app) => app.id)).toEqual([
      "portfolio-pribadi",
      "school",
    ]);
    expect(getPackageDetails(true).includes).toContain(
      "Profil, galeri karya, dan kontak utama",
    );
    expect(getPackageDetails(false).includes).toContain(
      "Uji coba alur utama sebelum serah terima",
    );
  });

  it("selects catalog features and preserves the intended price bands", () => {
    expect(PERSONAL_APP_PRICE_RANGE).toEqual({ min: 100_000, max: 300_000 });
    expect(SCHOOL_APP_PRICE_RANGE).toEqual({
      min: 1_000_000,
      max: 5_000_000,
    });
    expect(getCategory("personal-web").label).toContain("Website Pribadi");
    expect(
      getSelectedFeatures({
        idea: "Website portofolio pribadi",
        categoryId: "personal-web",
        audience: ["teacher"],
        featureIds: ["contact-links", "missing-feature"],
      }).map((feature) => feature.id),
    ).toEqual(["contact-links"]);
  });

  it("calculates personal and school prototype trial windows", () => {
    const createdAt = new Date("2026-09-07T00:00:00.000Z");
    const personalExpiry = createPrototypeExpiry(createdAt, 8);
    const schoolExpiry = createPrototypeExpiry(createdAt, 24);

    expect(prototypeTrialHoursForCategory("personal-web")).toBe(8);
    expect(prototypeTrialHoursForCategory("lms")).toBe(24);
    expect(personalExpiry).toBe("2026-09-07T08:00:00.000Z");
    expect(getPrototypeTrialStatus(personalExpiry, createdAt)).toBe("active");
    expect(
      getPrototypeTrialStatus(
        personalExpiry,
        new Date("2026-09-07T08:00:00.000Z"),
      ),
    ).toBe("expired");
    expect(getPrototypeRemainingMs(schoolExpiry, createdAt)).toBe(
      24 * 60 * 60 * 1000,
    );
    expect(
      getPrototypeRemainingMs(personalExpiry, new Date("2026-09-08")),
    ).toBe(0);
  });
});
