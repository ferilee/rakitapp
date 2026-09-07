export interface ShowcaseApp {
  id: string;
  accent: "cyan" | "violet" | "orange" | "emerald" | "pink" | "blue";
  name: string;
  category: string;
  audience: string;
  summary: string;
  description: string;
  features: string[];
  outcome: string;
  estimate: string;
  priceMin?: number;
  priceMax?: number;
  demoUrl?: string | null;
  coverUrl?: string | null;
  coverAssetId?: string | null;
  coverAlt?: string | null;
  status?: "draft" | "published" | "archived";
  sortOrder?: number;
}

export function isPersonalShowcaseApp(
  app: Pick<ShowcaseApp, "id" | "category">,
) {
  const category = app.category.toLocaleLowerCase("id-ID");
  return (
    category.includes("pribadi") ||
    category.includes("personal") ||
    category.includes("portofolio") ||
    category.includes("blog") ||
    category.includes("linkbio") ||
    app.id.endsWith("-pribadi")
  );
}

export function prioritizePersonalApps<
  T extends Pick<ShowcaseApp, "id" | "category">,
>(apps: T[]) {
  return [...apps].sort(
    (left, right) =>
      Number(isPersonalShowcaseApp(right)) -
      Number(isPersonalShowcaseApp(left)),
  );
}

export function getPackageDetails(isPersonal: boolean) {
  return isPersonal
    ? {
        includes: [
          "Tampilan responsif untuk ponsel dan laptop",
          "Profil, galeri karya, dan kontak utama",
          "Publikasi ke hosting atau domain yang disepakati",
          "Rancangan sederhana yang mudah dikembangkan",
        ],
        note: "Domain, hosting, dan fitur tambahan dibahas sesuai kebutuhan.",
      }
    : {
        includes: [
          "Rancangan alur dan peran pengguna",
          "Fitur inti sesuai scope aplikasi",
          "Uji coba alur utama sebelum serah terima",
          "Dokumentasi singkat untuk penggunaan awal",
        ],
        note: "Scope, revisi, hosting, dan pemeliharaan disepakati sebelum produksi.",
      };
}

export const RAKITAPP_SHOWCASE: ShowcaseApp[] = [
  {
    id: "smartclass",
    accent: "cyan",
    name: "SmartClass",
    category: "Kelas digital",
    audience: "Guru & siswa",
    summary: "Ruang belajar digital untuk materi, kuis, dan kemajuan siswa.",
    description:
      "Membantu guru membagikan materi dan melihat aktivitas belajar siswa dalam satu tempat.",
    features: ["Materi pembelajaran", "Kuis interaktif", "Dashboard guru"],
    outcome: "Guru lebih mudah memantau proses belajar setiap kelas.",
    estimate: "Rp 2,5 jt – Rp 4,5 jt",
  },
  {
    id: "quizlab",
    accent: "violet",
    name: "QuizLab",
    category: "Kuis & asesmen",
    audience: "Guru & siswa",
    summary: "Kuis interaktif dengan bank soal dan hasil yang mudah dibaca.",
    description:
      "Cocok untuk latihan harian, evaluasi kelas, dan persiapan ujian sekolah.",
    features: ["Bank soal", "Penilaian otomatis", "Riwayat hasil"],
    outcome: "Siswa mendapat umpan balik lebih cepat setelah mengerjakan kuis.",
    estimate: "Rp 2 jt – Rp 4 jt",
  },
  {
    id: "presensikita",
    accent: "orange",
    name: "PresensiKita",
    category: "Operasional sekolah",
    audience: "Guru, siswa & admin",
    summary: "Presensi kelas sederhana dengan rekap yang siap digunakan.",
    description:
      "Mengurangi pencatatan manual dan membantu sekolah melihat kehadiran per kelas.",
    features: ["Presensi digital", "Rekap kelas", "Laporan sederhana"],
    outcome: "Admin dan guru dapat menyiapkan rekap tanpa menghitung ulang.",
    estimate: "Rp 1 jt – Rp 3 jt",
  },
  {
    id: "asesmen-insight",
    accent: "emerald",
    name: "Asesmen Insight",
    category: "Dashboard belajar",
    audience: "Guru & kepala sekolah",
    summary: "Dashboard untuk membaca hasil asesmen dan perkembangan kelas.",
    description:
      "Mengubah data nilai menjadi ringkasan yang membantu guru menentukan tindak lanjut.",
    features: ["Dashboard asesmen", "Filter kelas", "Ekspor laporan"],
    outcome:
      "Sekolah memiliki gambaran yang lebih jelas tentang kebutuhan belajar siswa.",
    estimate: "Rp 2 jt – Rp 4,5 jt",
  },
  {
    id: "perpus-sekolah",
    accent: "blue",
    name: "PerpusSekolah",
    category: "Perpustakaan",
    audience: "Siswa, guru & pustakawan",
    summary:
      "Katalog buku dan pencatatan peminjaman untuk perpustakaan sekolah.",
    description:
      "Membuat pencarian koleksi dan pencatatan peminjaman lebih rapi untuk sekolah.",
    features: ["Katalog buku", "Peminjaman", "Riwayat anggota"],
    outcome:
      "Siswa lebih mudah menemukan buku dan petugas lebih cepat mengelola transaksi.",
    estimate: "Rp 1,5 jt – Rp 3,5 jt",
  },
  {
    id: "tefa-tracker",
    accent: "orange",
    name: "TeFa Tracker",
    category: "Teaching Factory",
    audience: "Guru produktif & siswa",
    summary:
      "Pencatatan proyek Teaching Factory dari tugas sampai hasil akhir.",
    description:
      "Membantu guru mengatur pekerjaan praktik dan memantau kontribusi setiap siswa.",
    features: ["Daftar proyek", "Status pekerjaan", "Penilaian"],
    outcome: "Proses praktik lebih mudah dipantau dan dievaluasi bersama.",
    estimate: "Rp 2,5 jt – Rp 5 jt",
  },
  {
    id: "portofolio-pribadi",
    accent: "pink",
    name: "PortofolioKu",
    category: "Website pribadi",
    audience: "Profesional & freelancer",
    summary: "Portofolio online untuk menampilkan karya dan pengalaman.",
    description:
      "Membantu calon klien melihat kemampuan, proyek, dan cara menghubungi Anda.",
    features: ["Profil singkat", "Galeri karya", "Kontak & media sosial"],
    outcome: "Karya Anda memiliki rumah online yang rapi dan mudah dibagikan.",
    estimate: "Rp 200 rb – Rp 300 rb",
    demoUrl: "https://ferilee.gurumuda.eu.org",
  },
  {
    id: "rumah-pribadi",
    accent: "blue",
    name: "RumahSaya",
    category: "Profil pribadi",
    audience: "Individu & keluarga",
    summary:
      "Website pribadi sederhana untuk perkenalan dan informasi penting.",
    description:
      "Cocok untuk guru, pembicara, penulis, atau siapa saja yang ingin dikenal secara online.",
    features: ["Tentang saya", "Kontak", "Tautan sosial"],
    outcome:
      "Informasi pribadi tersusun dalam satu halaman yang mudah diingat.",
    estimate: "Rp 150 rb – Rp 250 rb",
  },
  {
    id: "blog-ceritakita",
    accent: "violet",
    name: "CeritaKita",
    category: "Blog pribadi",
    audience: "Penulis & kreator",
    summary: "Blog ringan untuk menulis cerita, opini, dan catatan perjalanan.",
    description:
      "Ruang publikasi sederhana untuk membangun kebiasaan menulis dan berbagi pengalaman.",
    features: ["Daftar artikel", "Halaman tulisan", "Profil penulis"],
    outcome: "Tulisan dapat dibaca publik tanpa bergantung pada platform lain.",
    estimate: "Rp 200 rb – Rp 300 rb",
  },
  {
    id: "linkbio-pribadi",
    accent: "pink",
    name: "LinkBio",
    category: "Halaman profil",
    audience: "Kreator & pemilik usaha",
    summary: "Satu halaman untuk mengumpulkan semua tautan penting.",
    description:
      "Alternatif halaman bio yang lebih sesuai dengan identitas dan kebutuhan Anda.",
    features: ["Foto & bio", "Tautan utama", "Kontak WhatsApp"],
    outcome: "Audiens menemukan semua kanal Anda dari satu alamat.",
    estimate: "Rp 150 rb – Rp 300 rb",
  },
];
