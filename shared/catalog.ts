import { z } from "zod";

export const CATEGORY_IDS = [
  "personal-web",
  "lms",
  "assessment",
  "school-operations",
  "learning-dashboard",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const AUDIENCE_IDS = ["teacher", "student", "admin", "parent"] as const;

export type AudienceId = (typeof AUDIENCE_IDS)[number];

export const PERSONAL_APP_PRICE_RANGE = {
  min: 100_000,
  max: 300_000,
} as const;

export const SCHOOL_APP_PRICE_RANGE = {
  min: 1_000_000,
  max: 5_000_000,
} as const;

export interface FeatureDefinition {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  description: string;
  basePriceMin: number;
  basePriceMax: number;
  pricePerPointMin?: number;
  pricePerPointMax?: number;
  maxPrice?: number;
  baseDaysMin: number;
  baseDaysMax: number;
  features: FeatureDefinition[];
}

export const AUDIENCE_OPTIONS: ReadonlyArray<{
  id: AudienceId;
  label: string;
}> = [
  { id: "teacher", label: "Guru" },
  { id: "student", label: "Siswa" },
  { id: "admin", label: "Admin sekolah" },
  { id: "parent", label: "Orang tua" },
];

export const CATEGORY_CATALOG: Record<CategoryId, CategoryDefinition> = {
  lms: {
    id: "lms",
    label: "LMS & Kelas Digital",
    description: "Materi, kelas, aktivitas belajar, dan ruang kerja guru.",
    basePriceMin: SCHOOL_APP_PRICE_RANGE.min + 500_000,
    basePriceMax: 2_500_000,
    pricePerPointMin: 100_000,
    pricePerPointMax: 200_000,
    maxPrice: SCHOOL_APP_PRICE_RANGE.max,
    baseDaysMin: 24,
    baseDaysMax: 42,
    features: [
      {
        id: "auth-roles",
        label: "Login & hak akses",
        description: "Akun dan akses berbeda untuk setiap peran pengguna.",
        weight: 2,
      },
      {
        id: "learning-materials",
        label: "Materi pembelajaran",
        description: "Guru dapat mengelola dan siswa dapat membaca materi.",
        weight: 2,
      },
      {
        id: "quiz-engine",
        label: "Kuis interaktif",
        description: "Kuis dengan penilaian otomatis dan riwayat pengerjaan.",
        weight: 3,
      },
      {
        id: "teacher-dashboard",
        label: "Dashboard guru",
        description: "Ringkasan aktivitas dan kemajuan siswa.",
        weight: 3,
      },
      {
        id: "attendance",
        label: "Presensi",
        description: "Pencatatan kehadiran dan rekap kelas.",
        weight: 2,
      },
      {
        id: "ai-tutor",
        label: "AI tutor",
        description: "Pendamping belajar berbasis materi yang disediakan.",
        weight: 5,
      },
    ],
  },
  assessment: {
    id: "assessment",
    label: "Kuis, Bank Soal & CBT",
    description: "Asesmen digital untuk latihan, ujian, dan analisis hasil.",
    basePriceMin: 1_200_000,
    basePriceMax: 2_200_000,
    pricePerPointMin: 100_000,
    pricePerPointMax: 200_000,
    maxPrice: SCHOOL_APP_PRICE_RANGE.max,
    baseDaysMin: 20,
    baseDaysMax: 38,
    features: [
      {
        id: "auth-roles",
        label: "Login & hak akses",
        description: "Akun dan akses berbeda untuk setiap peran pengguna.",
        weight: 2,
      },
      {
        id: "question-bank",
        label: "Bank soal",
        description: "Penyimpanan, kategori, dan penggunaan ulang soal.",
        weight: 4,
      },
      {
        id: "quiz-engine",
        label: "Mesin kuis",
        description: "Pengerjaan soal, penilaian, dan pembatasan waktu.",
        weight: 3,
      },
      {
        id: "cbt-mode",
        label: "Mode CBT",
        description: "Sesi ujian terjadwal dengan kontrol pengerjaan.",
        weight: 5,
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        description: "Papan peringkat berdasarkan hasil atau poin.",
        weight: 2,
      },
      {
        id: "certificates",
        label: "Sertifikat",
        description: "Penerbitan sertifikat berdasarkan syarat kelulusan.",
        weight: 3,
      },
    ],
  },
  "school-operations": {
    id: "school-operations",
    label: "Operasional Sekolah",
    description: "Presensi, komunikasi, dan administrasi yang lebih rapi.",
    basePriceMin: 1_000_000,
    basePriceMax: 2_000_000,
    pricePerPointMin: 100_000,
    pricePerPointMax: 200_000,
    maxPrice: SCHOOL_APP_PRICE_RANGE.max,
    baseDaysMin: 18,
    baseDaysMax: 36,
    features: [
      {
        id: "auth-roles",
        label: "Login & hak akses",
        description: "Akun dan akses berbeda untuk setiap peran pengguna.",
        weight: 2,
      },
      {
        id: "attendance",
        label: "Presensi",
        description: "Pencatatan kehadiran dan rekap kelas.",
        weight: 2,
      },
      {
        id: "parent-dashboard",
        label: "Dashboard orang tua",
        description: "Ringkasan informasi belajar untuk orang tua.",
        weight: 3,
      },
      {
        id: "notifications",
        label: "Notifikasi",
        description: "Pemberitahuan untuk aktivitas dan informasi penting.",
        weight: 3,
      },
      {
        id: "reports-export",
        label: "Laporan & ekspor",
        description: "Rekap yang dapat diunduh untuk kebutuhan administrasi.",
        weight: 3,
      },
    ],
  },
  "learning-dashboard": {
    id: "learning-dashboard",
    label: "Dashboard Guru & Asesmen",
    description: "Data belajar menjadi gambaran yang mudah ditindaklanjuti.",
    basePriceMin: 1_300_000,
    basePriceMax: 2_300_000,
    pricePerPointMin: 100_000,
    pricePerPointMax: 200_000,
    maxPrice: SCHOOL_APP_PRICE_RANGE.max,
    baseDaysMin: 20,
    baseDaysMax: 38,
    features: [
      {
        id: "auth-roles",
        label: "Login & hak akses",
        description: "Akun dan akses berbeda untuk setiap peran pengguna.",
        weight: 2,
      },
      {
        id: "teacher-dashboard",
        label: "Dashboard guru",
        description: "Ringkasan aktivitas dan kemajuan siswa.",
        weight: 3,
      },
      {
        id: "assessment-dashboard",
        label: "Dashboard asesmen",
        description: "Analisis hasil asesmen berdasarkan kelas atau periode.",
        weight: 4,
      },
      {
        id: "reports-export",
        label: "Laporan & ekspor",
        description: "Rekap yang dapat diunduh untuk kebutuhan administrasi.",
        weight: 3,
      },
      {
        id: "notifications",
        label: "Notifikasi",
        description: "Pemberitahuan untuk aktivitas dan informasi penting.",
        weight: 3,
      },
    ],
  },
  "personal-web": {
    id: "personal-web",
    label: "Website Pribadi & Portofolio",
    description: "Portofolio, blog, profil pribadi, dan halaman profil online.",
    basePriceMin: PERSONAL_APP_PRICE_RANGE.min,
    basePriceMax: 150_000,
    maxPrice: PERSONAL_APP_PRICE_RANGE.max,
    baseDaysMin: 3,
    baseDaysMax: 7,
    features: [
      {
        id: "personal-profile",
        label: "Profil & tentang saya",
        description:
          "Perkenalan, bio singkat, dan informasi utama pemilik website.",
        weight: 1,
      },
      {
        id: "portfolio-gallery",
        label: "Galeri karya",
        description:
          "Tampilan proyek, karya, sertifikat, atau pengalaman kerja.",
        weight: 2,
      },
      {
        id: "personal-blog",
        label: "Blog sederhana",
        description:
          "Halaman artikel untuk cerita, tulisan, atau catatan pribadi.",
        weight: 2,
      },
      {
        id: "contact-links",
        label: "Kontak & tautan sosial",
        description:
          "Tombol email, WhatsApp, dan media sosial yang mudah ditemukan.",
        weight: 1,
      },
      {
        id: "custom-domain",
        label: "Bantuan publikasi",
        description:
          "Bantuan dasar untuk menyiapkan website agar bisa dibuka online.",
        weight: 1,
      },
    ],
  },
};

export const projectIntakeSchema = z.object({
  idea: z.string().trim().min(3).max(400),
  categoryId: z.enum(CATEGORY_IDS),
  audience: z.array(z.enum(AUDIENCE_IDS)).min(1).max(4),
  featureIds: z.array(z.string().min(1)).max(30),
});

export type ProjectIntake = z.infer<typeof projectIntakeSchema>;

export function getCategory(categoryId: CategoryId) {
  return CATEGORY_CATALOG[categoryId];
}

export function getSelectedFeatures(intake: ProjectIntake) {
  const category = getCategory(intake.categoryId);
  const selectedIds = new Set(intake.featureIds);
  return category.features.filter((feature) => selectedIds.has(feature.id));
}
