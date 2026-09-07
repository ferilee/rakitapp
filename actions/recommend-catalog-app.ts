import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { assertOperator } from "../server/lib/catalog.js";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_CATALOG,
  CATEGORY_IDS,
  type AudienceId,
  type CategoryId,
} from "../shared/catalog.js";
import { buildProjectBrief } from "../shared/estimator.js";

const recommendationSchema = z.object({
  idea: z.string().trim().min(3).max(400),
  name: z.string().trim().min(2).max(100).optional(),
});

type ContentProfile = {
  id: string;
  signals: string[];
  categoryId: CategoryId;
  audience: AudienceId[];
  name: string;
  featureIds: string[];
  featureLabels: string[];
  summary: (name: string) => string;
  description: (name: string) => string;
  outcome: (name: string) => string;
};

const contentProfiles: ContentProfile[] = [
  {
    id: "teaching-journal",
    signals: [
      "jurnal mengajar",
      "jurnal guru",
      "catatan mengajar",
      "agenda mengajar",
      "refleksi mengajar",
      "refleksi pembelajaran",
    ],
    categoryId: "lms",
    audience: ["teacher"],
    name: "Jurnal Mengajar",
    featureIds: ["auth-roles", "learning-materials", "teacher-dashboard"],
    featureLabels: [
      "Catatan kegiatan mengajar",
      "Materi & kelas",
      "Refleksi pembelajaran",
      "Laporan mengajar",
    ],
    summary: (name) =>
      `${name} membantu guru mencatat kegiatan mengajar, materi, kelas, dan refleksi pembelajaran secara rapi.`,
    description: (name) =>
      `${name} adalah jurnal digital untuk guru. Guru dapat mencatat kelas, materi yang disampaikan, aktivitas siswa, kendala pembelajaran, dan tindak lanjut untuk pertemuan berikutnya dalam satu tempat.`,
    outcome: (name) =>
      `Guru memiliki catatan pembelajaran yang rapi sehingga lebih mudah mengevaluasi proses mengajar dan menyiapkan pertemuan berikutnya melalui ${name}.`,
  },
  {
    id: "school-attendance",
    signals: [
      "presensi sekolah",
      "absensi sekolah",
      "kehadiran siswa",
      "rekap kehadiran",
    ],
    categoryId: "school-operations",
    audience: ["teacher", "admin"],
    name: "Presensi Sekolah",
    featureIds: ["auth-roles", "attendance", "reports-export"],
    featureLabels: ["Presensi siswa", "Rekap per kelas", "Laporan kehadiran"],
    summary: (name) =>
      `${name} membantu guru dan admin mencatat kehadiran siswa serta menyiapkan rekap kelas.`,
    description: (name) =>
      `${name} memudahkan sekolah mencatat presensi harian, melihat riwayat kehadiran setiap siswa, dan membuat laporan per kelas tanpa menghitung ulang secara manual.`,
    outcome: (name) =>
      `Sekolah memiliki data kehadiran yang lebih rapi dan mudah ditindaklanjuti melalui ${name}.`,
  },
  {
    id: "personal-portfolio",
    signals: ["portofolio", "portfolio", "galeri karya", "karya pribadi"],
    categoryId: "personal-web",
    audience: ["teacher"],
    name: "PortofolioKu",
    featureIds: ["personal-profile", "portfolio-gallery", "contact-links"],
    featureLabels: [
      "Profil & tentang saya",
      "Galeri karya",
      "Kontak & tautan sosial",
    ],
    summary: (name) =>
      `${name} menampilkan profil, karya, dan pengalaman dalam satu website yang mudah dibagikan.`,
    description: (name) =>
      `${name} membantu profesional, pelajar, dan freelancer menata profil, proyek, sertifikat, serta informasi kontak agar calon klien atau kolaborator dapat mengenal karya mereka dengan cepat.`,
    outcome: (name) =>
      `Karya dan pengalaman pemilik memiliki rumah online yang rapi melalui ${name}.`,
  },
  {
    id: "personal-website",
    signals: [
      "website pribadi",
      "web pribadi",
      "profil pribadi",
      "website guru",
      "situs pribadi",
    ],
    categoryId: "personal-web",
    audience: ["teacher"],
    name: "Website Pribadi",
    featureIds: ["personal-profile", "contact-links", "custom-domain"],
    featureLabels: [
      "Profil & tentang saya",
      "Kontak & tautan sosial",
      "Bantuan publikasi",
    ],
    summary: (name) =>
      `${name} menjadi rumah online sederhana untuk memperkenalkan diri, layanan, dan cara menghubungi pemiliknya.`,
    description: (name) =>
      `${name} membantu guru atau profesional menampilkan bio, pengalaman, layanan, dan kontak dalam website pribadi yang ringan serta mudah dibagikan kepada calon klien atau rekan kerja.`,
    outcome: (name) =>
      `Guru memiliki halaman pribadi yang rapi untuk memperkenalkan keahlian dan membagikan informasi kontak melalui ${name}.`,
  },
  {
    id: "personal-blog",
    signals: ["blog pribadi", "blog guru", "catatan pribadi", "menulis"],
    categoryId: "personal-web",
    audience: ["teacher"],
    name: "BlogPribadi",
    featureIds: ["personal-profile", "personal-blog", "contact-links"],
    featureLabels: ["Profil penulis", "Artikel & catatan", "Kontak pembaca"],
    summary: (name) =>
      `${name} membantu guru menulis dan membagikan catatan, pengalaman, atau materi dalam blog pribadi.`,
    description: (name) =>
      `${name} adalah blog sederhana untuk guru yang ingin menerbitkan refleksi mengajar, catatan pembelajaran, opini, atau tulisan pribadi dengan profil penulis yang jelas.`,
    outcome: (name) =>
      `Tulisan dan pengalaman guru tersusun sebagai arsip online yang mudah dibaca melalui ${name}.`,
  },
  {
    id: "personal-linkbio",
    signals: ["linkbio", "link in bio", "tautan bio", "kumpulan tautan"],
    categoryId: "personal-web",
    audience: ["teacher"],
    name: "LinkBio",
    featureIds: ["personal-profile", "contact-links", "custom-domain"],
    featureLabels: ["Foto & bio", "Tautan utama", "Kontak WhatsApp"],
    summary: (name) =>
      `${name} mengumpulkan profil, kontak, dan semua tautan penting guru dalam satu halaman.`,
    description: (name) =>
      `${name} cocok untuk guru, kreator, atau pemilik usaha yang ingin membagikan portofolio, media sosial, materi, dan kontak WhatsApp dari satu alamat yang mudah diingat.`,
    outcome: (name) =>
      `Orang lain dapat menemukan profil dan kanal penting guru dari satu halaman melalui ${name}.`,
  },
];

const categorySignals: Record<CategoryId, string[]> = {
  lms: [
    "kelas",
    "materi",
    "belajar",
    "pembelajaran",
    "lms",
    "kursus",
    "modul",
    "tutor",
  ],
  assessment: [
    "kuis",
    "quiz",
    "soal",
    "ujian",
    "asesmen",
    "cbt",
    "evaluasi",
    "latihan",
  ],
  "school-operations": [
    "sekolah",
    "presensi",
    "absen",
    "kehadiran",
    "orang tua",
    "operasional",
    "administrasi",
  ],
  "learning-dashboard": [
    "dashboard",
    "nilai",
    "analisis",
    "laporan",
    "perkembangan",
    "insight",
    "data",
  ],
  "personal-web": [
    "portofolio",
    "portfolio",
    "pribadi",
    "blog",
    "website",
    "profil",
    "linkbio",
    "freelancer",
  ],
};

const audienceSignals: Array<{ id: AudienceId; signals: string[] }> = [
  { id: "teacher", signals: ["guru", "pengajar", "dosen", "mentor"] },
  { id: "student", signals: ["siswa", "murid", "pelajar", "peserta"] },
  { id: "admin", signals: ["admin", "operator", "sekolah", "petugas"] },
  { id: "parent", signals: ["orang tua", "wali", "orangtua"] },
];

const accentByCategory: Record<
  CategoryId,
  "cyan" | "violet" | "orange" | "emerald" | "pink" | "blue"
> = {
  lms: "cyan",
  assessment: "violet",
  "school-operations": "orange",
  "learning-dashboard": "emerald",
  "personal-web": "pink",
};

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID");
}

function includesSignal(text: string, signal: string) {
  return text.includes(signal);
}

function findContentProfile(context: string) {
  const text = normalize(context);
  let bestProfile: ContentProfile | null = null;
  let bestScore = 0;

  for (const profile of contentProfiles) {
    const score = profile.signals.reduce(
      (total, signal) => total + (includesSignal(text, signal) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestProfile = profile;
      bestScore = score;
    }
  }

  return bestProfile;
}

function chooseCategory(
  context: string,
  profile: ContentProfile | null,
): CategoryId {
  if (profile) return profile.categoryId;
  const text = normalize(context);
  let bestCategory: CategoryId = "lms";
  let bestScore = 0;

  for (const categoryId of CATEGORY_IDS) {
    const score = categorySignals[categoryId].reduce(
      (total, signal) => total + (includesSignal(text, signal) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestCategory = categoryId;
      bestScore = score;
    }
  }

  return bestCategory;
}

function chooseAudience(
  context: string,
  categoryId: CategoryId,
  profile: ContentProfile | null,
) {
  if (profile) return profile.audience;
  const text = normalize(context);
  const selected = audienceSignals
    .filter(({ signals }) =>
      signals.some((signal) => includesSignal(text, signal)),
    )
    .map(({ id }) => id);

  if (selected.length > 0) return selected.slice(0, 4);
  if (categoryId === "personal-web") return ["teacher"] as AudienceId[];
  return ["teacher"] as AudienceId[];
}

function chooseFeatures(
  context: string,
  categoryId: CategoryId,
  profile: ContentProfile | null,
) {
  const category = CATEGORY_CATALOG[categoryId];
  if (profile) {
    return category.features.filter((feature) =>
      profile.featureIds.includes(feature.id),
    );
  }

  const text = normalize(context);
  const ranked = category.features.map((feature, index) => {
    const featureText = normalize(`${feature.label} ${feature.description}`);
    const keywordMatches = categorySignals[categoryId].filter((signal) =>
      text.includes(signal),
    ).length;
    const directMatch = featureText
      .split(/[^\p{L}\p{N}]+/u)
      .some((word) => word.length > 3 && text.includes(word));
    return {
      feature,
      score: (directMatch ? 4 : 0) + keywordMatches + feature.weight,
      index,
    };
  });

  return ranked
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, categoryId === "personal-web" ? 3 : 4)
    .map(({ feature }) => feature);
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function makeName(
  idea: string,
  categoryId: CategoryId,
  profile: ContentProfile | null,
  preferredName?: string,
) {
  if (preferredName?.trim()) return preferredName.trim();
  if (profile) return profile.name;
  const text = idea
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 2)
    .join(" ");
  const fallback: Record<CategoryId, string> = {
    lms: "KelasCerdas",
    assessment: "QuizCerdas",
    "school-operations": "SekolahRapi",
    "learning-dashboard": "InsightBelajar",
    "personal-web": "ProfilKu",
  };

  if (!text) return fallback[categoryId];
  const name = titleCase(text).replace(/\s+/g, "");
  return `${name.slice(0, 24)}${categoryId === "personal-web" ? "Ku" : "App"}`;
}

function audienceLabel(audience: AudienceId[]) {
  return audience
    .map(
      (id) => AUDIENCE_OPTIONS.find((option) => option.id === id)?.label ?? id,
    )
    .join(" & ");
}

function summarizeIdea(idea: string) {
  const clean = idea.trim().replace(/\s+/g, " ");
  return clean.length > 190 ? `${clean.slice(0, 187)}...` : clean;
}

function focusPhrase(idea: string) {
  return summarizeIdea(idea)
    .replace(/^(aplikasi|website)\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .toLocaleLowerCase("id-ID");
}

function limitSummary(value: string) {
  return value.length > 235 ? `${value.slice(0, 232)}...` : value;
}

export default defineAction({
  description:
    "Recommend a complete RakitApp catalog draft from an operator's idea. Returns editable content, features, audience, indicative price, and a cover description without publishing anything.",
  schema: recommendationSchema,
  requiresAuth: true,
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: true,
    title: "Recommend a RakitApp catalog draft",
  },
  run: async ({ idea, name: preferredName }, ctx) => {
    assertOperator(ctx?.userEmail);
    const context = `${preferredName ?? ""} ${idea}`.trim();
    const profile = findContentProfile(context);
    const categoryId = chooseCategory(context, profile);
    const audience = chooseAudience(context, categoryId, profile);
    const features = chooseFeatures(context, categoryId, profile);
    const brief = buildProjectBrief({
      idea,
      categoryId,
      audience,
      featureIds: features.map((feature) => feature.id),
    });
    const category = CATEGORY_CATALOG[categoryId];
    const name = makeName(idea, categoryId, profile, preferredName);
    const audienceText = audienceLabel(audience);
    const focus = focusPhrase(idea);
    const summary =
      profile?.summary(name) ??
      `${name} membantu ${audienceText.toLocaleLowerCase("id-ID")} menjalankan ${focus} dalam satu aplikasi yang rapi.`;
    const description =
      profile?.description(name) ??
      `${name} dirancang untuk ${audienceText.toLocaleLowerCase("id-ID")} yang membutuhkan ${focus}. Pengguna dapat memulai dari fitur inti yang disarankan dan mengembangkannya sesuai kebutuhan setelah scope MVP ditinjau.`;
    const outcome =
      profile?.outcome(name) ??
      `${name} membantu ${audienceText.toLocaleLowerCase("id-ID")} menyelesaikan kebutuhan utama dengan alur yang lebih rapi dan mudah digunakan.`;
    const featureLabels =
      profile?.featureLabels ?? features.map((feature) => feature.label);

    return {
      id: slugify(name) || "aplikasi-baru",
      name,
      category: category.label,
      audience: audienceText,
      summary: limitSummary(summary),
      description,
      features: featureLabels,
      outcome,
      accent: accentByCategory[categoryId],
      priceMin: String(brief.estimate.priceMin),
      priceMax: String(brief.estimate.priceMax),
      demoUrl: "",
      coverUrl: "",
      coverAssetId: "",
      coverAlt: `Ilustrasi ${name} untuk ${category.label}`,
      status: "draft" as const,
      sortOrder: "0",
      rationale: profile
        ? `Profil kebutuhan "${profile.id}" dipilih dari nama dan ide aplikasi. Konten disusun agar tetap fokus pada scope MVP dan harga sesuai segmen ${categoryId === "personal-web" ? "aplikasi pribadi Rp100.000–Rp300.000" : "aplikasi sekolah Rp1.000.000–Rp5.000.000"}. Estimasi tetap perlu ditinjau sebelum ditawarkan ke pelanggan.`
        : `Kategori dipilih dari kata kunci nama dan ide. ${features.length} fitur inti dipilih agar draft tetap fokus pada scope MVP dengan target harga ${categoryId === "personal-web" ? "aplikasi pribadi Rp100.000–Rp300.000" : "aplikasi sekolah Rp1.000.000–Rp5.000.000"}. Estimasi tetap perlu ditinjau sebelum ditawarkan ke pelanggan.`,
    };
  },
});
