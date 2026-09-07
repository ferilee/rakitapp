import { describe, expect, it } from "vitest";

import type { ProjectIntake } from "./catalog.js";
import { buildProjectBrief, calculateProjectEstimate } from "./estimator.js";

describe("RakitApp project estimator", () => {
  it("returns a deterministic estimate for the same intake", () => {
    const intake = {
      idea: "Kelas kuis untuk siswa sekolah",
      categoryId: "assessment",
      audience: ["teacher", "student"],
      featureIds: ["auth-roles", "question-bank", "quiz-engine"],
    } satisfies ProjectIntake;

    const first = calculateProjectEstimate(intake);
    const second = calculateProjectEstimate(intake);

    expect(first).toEqual(second);
    expect(first.priceMin).toBe(2_200_000);
    expect(first.priceMax).toBe(4_200_000);
    expect(first.daysMin).toBe(40);
    expect(first.daysMax).toBe(78);
    expect(first.complexity).toBe("menengah");
    expect(first.assumptions[0]).toMatch(/indikatif/);
  });

  it("includes extra audience roles in complexity and assumptions", () => {
    const estimate = calculateProjectEstimate({
      idea: "Pusat belajar adaptif",
      categoryId: "lms",
      audience: ["teacher", "student", "admin", "parent"],
      featureIds: [
        "auth-roles",
        "learning-materials",
        "quiz-engine",
        "teacher-dashboard",
        "ai-tutor",
      ],
    });

    expect(estimate.complexity).toBe("kompleks");
    expect(estimate.points).toBe(18);
    expect(estimate.priceMax).toBe(5_000_000);
    expect(estimate.assumptions).toContain(
      "Peran pengguna tambahan menambah kebutuhan hak akses dan pengujian.",
    );
  });

  it("builds a brief with labels and selected feature definitions", () => {
    const brief = buildProjectBrief({
      idea: "Bank soal matematika",
      categoryId: "assessment",
      audience: ["teacher", "student"],
      featureIds: ["question-bank", "unknown-feature"],
    });

    expect(brief.temporaryName).toBe("BanksoalKuis");
    expect(brief.categoryLabel).toBe("Kuis, Bank Soal & CBT");
    expect(brief.audienceLabels).toEqual(["Guru", "Siswa"]);
    expect(brief.features.map((feature) => feature.id)).toEqual([
      "question-bank",
    ]);
  });

  it("keeps personal websites within the one hundred to three hundred thousand range", () => {
    const estimate = calculateProjectEstimate({
      idea: "Website portofolio pribadi",
      categoryId: "personal-web",
      audience: ["teacher"],
      featureIds: [
        "personal-profile",
        "portfolio-gallery",
        "personal-blog",
        "contact-links",
        "custom-domain",
      ],
    });

    expect(estimate.priceMin).toBe(300_000);
    expect(estimate.priceMax).toBe(300_000);
  });

  it("keeps a maximum personal scope below the affordability ceiling", () => {
    const estimate = calculateProjectEstimate({
      idea: "Website pribadi untuk guru",
      categoryId: "personal-web",
      audience: ["teacher", "student", "admin", "parent"],
      featureIds: [
        "personal-profile",
        "portfolio-gallery",
        "personal-blog",
        "contact-links",
        "custom-domain",
      ],
    });

    expect(estimate.priceMin).toBe(300_000);
    expect(estimate.priceMax).toBe(300_000);
  });
});
