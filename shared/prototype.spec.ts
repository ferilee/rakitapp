import { describe, expect, it } from "vitest";

import {
  createPrototypeExpiry,
  getPrototypeRemainingMs,
  getPrototypeTrialStatus,
  prototypeTrialHoursForCategory,
  PROTOTYPE_TRIAL_DURATION_MS,
} from "./prototype.js";

describe("prototype trial policy", () => {
  it("uses a shorter trial for personal applications", () => {
    expect(prototypeTrialHoursForCategory("personal-web")).toBe(8);
    expect(prototypeTrialHoursForCategory("lms")).toBe(24);
    expect(prototypeTrialHoursForCategory("assessment", "single-class")).toBe(
      8,
    );
    expect(prototypeTrialHoursForCategory("assessment", "school")).toBe(24);
  });

  it("expires exactly 24 hours after it starts", () => {
    const createdAt = new Date("2026-09-06T10:00:00.000Z");
    const expiresAt = createPrototypeExpiry(createdAt);

    expect(expiresAt).toBe("2026-09-07T10:00:00.000Z");
    expect(getPrototypeRemainingMs(expiresAt, createdAt)).toBe(
      PROTOTYPE_TRIAL_DURATION_MS,
    );
  });

  it("treats the expiry instant as expired", () => {
    const expiresAt = "2026-09-07T10:00:00.000Z";

    expect(
      getPrototypeTrialStatus(expiresAt, new Date("2026-09-07T09:59:59.999Z")),
    ).toBe("active");
    expect(
      getPrototypeTrialStatus(expiresAt, new Date("2026-09-07T10:00:00.000Z")),
    ).toBe("expired");
  });
});
