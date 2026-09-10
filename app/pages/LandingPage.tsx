// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { useActionQuery } from "@agent-native/core/client/hooks";
import {
  isPersonalShowcaseApp,
  RAKITAPP_SHOWCASE,
  type ShowcaseApp,
} from "@shared/showcase";
import {
  IconArrowRight,
  IconChecklist,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconEye,
  IconMessageCircle,
  IconRocket,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { CatalogDemoDialog } from "@/components/catalog/CatalogDemoDialog";
import { RecentActivityToast } from "@/components/public/RecentActivityToast";
import { APP_TITLE } from "@/lib/app-config";

const examples = [
  "LMS untuk sekolah",
  "Kuis dan bank soal",
  "Dashboard asesmen",
  "Presensi digital",
  "Website portofolio pribadi",
];

const featuredIds = [
  "portofolio-pribadi",
  "rumah-pribadi",
  "blog-ceritakita",
  "smartclass",
];

const accentClasses: Record<
  ShowcaseApp["accent"],
  { card: string; label: string; surface: string }
> = {
  cyan: {
    card: "public-neon-card-cyan",
    label: "text-cyan-200",
    surface: "public-neon-surface-cyan",
  },
  violet: {
    card: "public-neon-card-violet",
    label: "text-violet-200",
    surface: "public-neon-surface-violet",
  },
  orange: {
    card: "public-neon-card-orange",
    label: "text-orange-200",
    surface: "public-neon-surface-orange",
  },
  emerald: {
    card: "public-neon-card-emerald",
    label: "text-emerald-200",
    surface: "public-neon-surface-emerald",
  },
  pink: {
    card: "public-neon-card-pink",
    label: "text-pink-200",
    surface: "public-neon-surface-pink",
  },
  blue: {
    card: "public-neon-card-blue",
    label: "text-blue-200",
    surface: "public-neon-surface-blue",
  },
};

const coverPositions: Record<string, string> = {
  smartclass: "0% 0%",
  quizlab: "33.333% 0%",
  presensikita: "66.666% 0%",
  "portofolio-pribadi": "66.666% 50%",
};

function shuffleApps(apps: ShowcaseApp[]) {
  return [...apps].sort(() => Math.random() - 0.5);
}

function pickDraftApps(apps: ShowcaseApp[]) {
  const personalApps = shuffleApps(apps.filter(isPersonalShowcaseApp));
  const schoolApps = shuffleApps(
    apps.filter((app) => !isPersonalShowcaseApp(app)),
  );
  const selected = [...personalApps.slice(0, 3), ...schoolApps.slice(0, 2)];
  const selectedIds = new Set(selected.map((app) => app.id));
  const remainingApps = shuffleApps(
    apps.filter((app) => !selectedIds.has(app.id)),
  );
  return [...selected, ...remainingApps].slice(0, 5);
}

function draftDuration(app: ShowcaseApp) {
  return isPersonalShowcaseApp(app) ? "3 – 7 hari" : "18 – 42 hari";
}

export function LandingPage() {
  const [demoApp, setDemoApp] = useState<ShowcaseApp | null>(null);
  const [savedPrototypeToken, setSavedPrototypeToken] = useState<string | null>(
    null,
  );
  const [draftApps, setDraftApps] = useState<ShowcaseApp[]>([]);
  const [activeDraftIndex, setActiveDraftIndex] = useState(0);
  const [isDraftPaused, setIsDraftPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const catalogQuery = useActionQuery("list-catalog-apps", {});
  const apps = catalogQuery.data?.length
    ? catalogQuery.data
    : RAKITAPP_SHOWCASE;
  const featuredApps = featuredIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is ShowcaseApp => Boolean(app));
  const activeDraftApp =
    draftApps[activeDraftIndex] ??
    apps.find((app) => app.id === "smartclass") ??
    apps[0];

  useEffect(() => {
    const stored = JSON.parse(
      window.localStorage.getItem("rakitapp-prototype-tokens") ?? "[]",
    ) as unknown;
    if (Array.isArray(stored) && typeof stored[0] === "string") {
      setSavedPrototypeToken(stored[0]);
    }
  }, []);

  useEffect(() => {
    setDraftApps(pickDraftApps(apps));
    setActiveDraftIndex(0);
  }, [apps]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (draftApps.length < 2 || isDraftPaused || prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveDraftIndex((current) => (current + 1) % draftApps.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [draftApps.length, isDraftPaused, prefersReducedMotion]);

  function moveDraft(offset: number) {
    if (draftApps.length < 2) return;
    setActiveDraftIndex(
      (current) => (current + offset + draftApps.length) % draftApps.length,
    );
  }

  return (
    <main className="public-neon-page public-neon-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="public-neon-logo grid size-9 place-items-center overflow-hidden rounded-xl p-1.5">
              <img
                src="/rakitapp-logo.png"
                alt=""
                aria-hidden="true"
                className="size-full object-contain"
              />
            </span>
            <span>{APP_TITLE}</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="#cara-kerja"
              className="public-neon-link hidden rounded-full px-4 py-2 text-sm font-medium lg:inline-flex"
            >
              Cara kerja
            </a>
            <a
              href="#harga"
              className="public-neon-link hidden rounded-full px-4 py-2 text-sm font-medium lg:inline-flex"
            >
              Harga
            </a>
            <Link
              to="/catalog"
              className="public-neon-link hidden rounded-full px-4 py-2 text-sm font-medium sm:inline-flex"
            >
              Katalog aplikasi
            </Link>
            {savedPrototypeToken ? (
              <Link
                to={`/prototype/${savedPrototypeToken}`}
                className="public-neon-link hidden rounded-full px-4 py-2 text-sm font-medium md:inline-flex"
              >
                Lanjutkan prototype
              </Link>
            ) : null}
            <Link
              to="/build"
              className="public-neon-link hidden items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/50 px-4 py-2 text-sm font-medium sm:flex"
            >
              Mulai Rakit Solusi
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <p className="public-neon-badge mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
              <IconSparkles className="size-4" /> Solusi digital pendidikan
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-7xl">
              <span className="block">Punya Masalah Pendidikan?</span>
              <span className="mt-3 block text-4xl text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.55)] sm:text-6xl">
                Rakit Solusinya Jadi Aplikasi.
              </span>
            </h1>
            <p className="public-neon-copy mt-7 max-w-xl text-justify text-lg leading-8">
              Ceritakan kebutuhan di kelas atau sekolah Anda. RakitApp membantu
              mengubah masalah dan ide pendidikan menjadi solusi digital yang
              jelas, terjangkau, dan siap digunakan—tanpa perlu paham coding.
            </p>
            <Link
              to="/build"
              className="public-neon-button mt-9 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Mulai Rakit Solusi Saya
              <IconArrowRight className="size-4" />
            </Link>
            <p className="public-neon-muted mt-4 text-sm">
              Mulai dari masalah atau ide yang sudah Anda punya.
            </p>
          </div>

          <div
            className="public-glass-panel rounded-[2rem] border-cyan-300/30 p-5 sm:p-7"
            onMouseEnter={() => setIsDraftPaused(true)}
            onMouseLeave={() => setIsDraftPaused(false)}
            onFocusCapture={() => setIsDraftPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsDraftPaused(false);
              }
            }}
          >
            <div
              className="public-neon-preview rounded-2xl border border-cyan-300/20 p-6 text-white sm:p-8"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="public-neon-muted text-sm">Contoh rancangan</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {activeDraftApp?.name ?? "SmartClass"}
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {activeDraftApp && isPersonalShowcaseApp(activeDraftApp)
                    ? "Sederhana"
                    : "Menengah"}
                </span>
              </div>
              <div className="mt-8 grid gap-3">
                {[
                  ["Pengguna", activeDraftApp?.audience ?? "Guru & siswa"],
                  [
                    "Fitur",
                    activeDraftApp?.features.join(", ") ??
                      "Login, kuis, bank soal, dashboard",
                  ],
                  [
                    "Estimasi",
                    activeDraftApp?.estimate ?? "Rp 2,5 jt – Rp 4,5 jt",
                  ],
                  [
                    "Durasi",
                    activeDraftApp
                      ? draftDuration(activeDraftApp)
                      : "32 – 58 hari",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-5 border-t border-white/10 pt-3 text-sm"
                  >
                    <span className="public-neon-muted">{label}</span>
                    <span className="max-w-[68%] text-right text-slate-100">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              {draftApps.length > 1 ? (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => moveDraft(-1)}
                    aria-label="Rancangan sebelumnya"
                    className="public-neon-link grid size-9 place-items-center rounded-full border border-slate-500/40"
                  >
                    <IconChevronLeft className="size-4" />
                  </button>
                  <div
                    className="flex items-center gap-1.5"
                    role="tablist"
                    aria-label="Pilihan contoh rancangan"
                  >
                    {draftApps.map((app, index) => (
                      <button
                        key={app.id}
                        type="button"
                        role="tab"
                        aria-selected={index === activeDraftIndex}
                        aria-label={"Tampilkan " + app.name}
                        onClick={() => setActiveDraftIndex(index)}
                        className={
                          index === activeDraftIndex
                            ? "h-1.5 w-6 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all"
                            : "h-1.5 w-1.5 rounded-full bg-slate-600 transition-all"
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => moveDraft(1)}
                    aria-label="Rancangan berikutnya"
                    className="public-neon-link grid size-9 place-items-center rounded-full border border-slate-500/40"
                  >
                    <IconChevronRight className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 px-1 pt-5">
              {examples.map((example) => (
                <div
                  key={example}
                  className="public-neon-copy flex items-center gap-2 text-sm"
                >
                  <IconChecklist className="size-4 text-emerald-600" />
                  {example}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cara-kerja"
          className="scroll-mt-6 border-t border-slate-700/60 py-16 sm:py-20"
          aria-labelledby="how-it-works-title"
        >
          <div className="max-w-2xl">
            <p className="public-neon-badge inline-flex rounded-full px-3 py-1.5 text-sm font-medium">
              Cara kerja RakitApp
            </p>
            <h2
              id="how-it-works-title"
              className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Dari masalah pendidikan sampai aplikasi siap digunakan.
            </h2>
            <p className="public-neon-copy mt-3 leading-7">
              Anda menjelaskan masalah pendidikan dengan bahasa sehari-hari.
              RakitApp membantu menemukan bentuk solusi, menyusun rancangan dan
              biaya, lalu tim merakit aplikasi yang dapat Anda coba sebelum
              dipublikasikan.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                number: "01",
                icon: IconMessageCircle,
                title: "Ceritakan masalah",
                description:
                  "Ceritakan kebutuhan di kelas atau sekolah dengan bahasa sehari-hari.",
              },
              {
                number: "02",
                icon: IconChecklist,
                title: "Temukan bentuk solusi",
                description:
                  "Jika belum punya bentuk aplikasi, pilih masalah dan RakitApp memberi rekomendasi.",
              },
              {
                number: "03",
                icon: IconClock,
                title: "Susun rancangan",
                description:
                  "Masalah, pengguna, dan fitur dirapikan menjadi rancangan yang mudah dipahami.",
              },
              {
                number: "04",
                icon: IconClock,
                title: "Tentukan biaya",
                description:
                  "Lihat estimasi biaya dan durasi sebelum memutuskan aplikasi dikembangkan.",
              },
              {
                number: "05",
                icon: IconEye,
                title: "Coba prototype",
                description:
                  "Coba aplikasi live buatan tim dengan data contoh sebelum dipublikasikan.",
              },
              {
                number: "06",
                icon: IconRocket,
                title: "Gunakan solusi",
                description:
                  "Setelah sesuai kebutuhan, aplikasi disiapkan untuk digunakan dan dipublikasikan.",
              },
            ].map(({ number, icon: Icon, title, description }) => (
              <article
                key={number}
                className="public-glass-panel rounded-3xl border-slate-700/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="public-neon-muted mt-2 text-sm leading-6">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="harga"
          className="scroll-mt-6 pb-20"
          aria-labelledby="pricing-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="public-neon-badge inline-flex rounded-full px-3 py-1.5 text-sm font-medium">
                Harga sederhana
              </p>
              <h2
                id="pricing-title"
                className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Mulai Sesuai Kebutuhan Anda
              </h2>
            </div>
            <p className="public-neon-muted max-w-md text-sm leading-6 sm:text-right">
              Harga ini adalah kisaran awal agar Anda bisa memilih jalur yang
              sesuai kemampuan sebelum berkonsultasi. Jenis aplikasi tidak
              otomatis menentukan harga; cakupan pemakaian dan kompleksitas
              fitur ikut diperhitungkan.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <PricingCard
              accent="pink"
              eyebrow="Personal"
              title="Aplikasi pribadi"
              price="Mulai Rp100 ribuan"
              description="Cocok untuk mulai membangun kehadiran digital atau alat bantu kerja pribadi."
              items={[
                "Website portofolio",
                "Blog pribadi",
                "Profil online atau LinkBio",
              ]}
            />
            <PricingCard
              accent="cyan"
              eyebrow="Guru & Pembelajaran"
              title="Aplikasi untuk guru"
              price="Mulai Rp500 ribuan"
              description="Cocok untuk membantu kegiatan mengajar, pembelajaran, dan administrasi pribadi guru."
              items={[
                "Jurnal mengajar",
                "Kuis dan media belajar",
                "Form dan dashboard guru",
              ]}
            />
            <PricingCard
              accent="violet"
              eyebrow="Sekolah & Institusi"
              title="Aplikasi sekolah"
              price="Mulai Rp1 jutaan"
              description="Cocok untuk alur belajar, asesmen, administrasi, dan dashboard sekolah."
              items={[
                "LMS dan kelas digital",
                "Kuis, bank soal, dan CBT",
                "Presensi dan dashboard asesmen",
              ]}
            />
          </div>
        </section>

        <section className="pb-20" aria-labelledby="featured-apps-title">
          <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="public-neon-badge inline-flex rounded-full px-3 py-1.5 text-sm font-medium">
                Galeri aplikasi
              </p>
              <h2
                id="featured-apps-title"
                className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Lihat aplikasi yang bisa kami rakit.
              </h2>
              <p className="public-neon-copy mt-3 max-w-2xl leading-7">
                Pilih contoh yang paling dekat dengan kebutuhan Anda, lalu coba
                demonya langsung sebelum mulai merancang.
              </p>
            </div>
            <Link
              to="/catalog"
              className="public-neon-link inline-flex items-center gap-2 rounded-full border border-slate-500/40 px-4 py-2 text-sm font-medium"
            >
              Lihat semua aplikasi
              <IconArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredApps.map((app) => {
              const tone = accentClasses[app.accent];
              return (
                <article
                  key={app.id}
                  className={`public-glass-panel public-neon-card flex flex-col rounded-[1.5rem] p-4 ${tone.card}`}
                >
                  <div
                    role="img"
                    aria-label={`Ilustrasi ${app.category.toLowerCase()}`}
                    className={`relative aspect-[1.45] overflow-hidden rounded-xl border bg-slate-950/90 bg-no-repeat ${tone.surface}`}
                    style={
                      app.coverUrl
                        ? undefined
                        : {
                            backgroundImage: "url('/catalog-app-atlas.png')",
                            backgroundPosition:
                              coverPositions[app.id] ?? "50% 50%",
                            backgroundSize: "400% 300%",
                          }
                    }
                  >
                    {app.coverUrl ? (
                      <img
                        src={app.coverUrl}
                        alt={
                          app.coverAlt ??
                          `Ilustrasi ${app.category.toLowerCase()}`
                        }
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-white/5" />
                  </div>
                  <div className="mt-4 flex min-h-20 flex-1 flex-col">
                    <p
                      className={`text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${tone.label}`}
                    >
                      {app.category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                      {app.name}
                    </h3>
                    <p className="public-neon-muted mt-2 text-sm leading-6">
                      {app.summary}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-700/60 pt-4">
                    <span className="public-neon-price rounded-full px-2.5 py-1 text-xs font-medium">
                      {app.estimate}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDemoApp(app)}
                      className="public-neon-button inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <IconEye className="size-3.5" /> Demo
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="grid gap-5 pb-20 lg:grid-cols-[0.9fr_1.1fr]"
          aria-labelledby="trust-title"
        >
          <div className="public-glass-panel rounded-[2rem] border-emerald-300/25 p-6 sm:p-8">
            <p className="public-neon-badge inline-flex rounded-full px-3 py-1.5 text-sm font-medium">
              Rakit dengan tenang
            </p>
            <h2
              id="trust-title"
              className="mt-4 text-3xl font-semibold tracking-tight text-white"
            >
              Anda memahami masalahnya. Kami bantu merakit solusinya.
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [
                  "Bahasa sederhana",
                  "Mulai dari masalah sehari-hari, tanpa harus memahami coding.",
                ],
                [
                  "Solusi sesuai kebutuhan",
                  "RakitApp membantu memilih bentuk aplikasi yang sesuai dengan masalah Anda.",
                ],
                [
                  "Bisa dicoba",
                  "Coba prototype live sebelum memutuskan aplikasi digunakan.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                    <IconCheck className="size-4" />
                    {title}
                  </div>
                  <p className="public-neon-muted mt-2 text-sm leading-6">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="public-glass-panel rounded-[2rem] border-cyan-300/25 p-6 sm:p-8">
            <p className="text-sm font-medium text-cyan-200">Jawaban singkat</p>
            <div className="mt-4 divide-y divide-slate-700/60">
              {[
                [
                  "Apa yang sebenarnya dibantu RakitApp?",
                  "RakitApp membantu mengubah masalah atau ide pendidikan menjadi rancangan solusi digital, memperkirakan biaya, mengembangkan prototype, dan menyiapkan aplikasi untuk digunakan.",
                ],
                [
                  "Apakah saya harus memahami coding?",
                  "Tidak. Anda cukup menceritakan masalah atau kebutuhan dan memilih arah yang paling dekat. RakitApp membantu menyusunnya menjadi rancangan.",
                ],
                [
                  "Apakah estimasi ini sudah menjadi harga final?",
                  "Belum. Estimasi adalah kisaran awal. Harga final dibahas setelah scope, kebutuhan desain, dan kebutuhan teknis dikonfirmasi.",
                ],
                [
                  "Apakah domain dan hosting sudah termasuk?",
                  "Belum tentu. Kebutuhan domain, hosting, dan pemeliharaan dibahas terbuka agar Anda hanya membayar layanan yang diperlukan.",
                ],
                [
                  "Bagaimana jika ide saya masih sederhana?",
                  "Justru itu titik awal yang baik. Mulai dari wizard dan contoh aplikasi, lalu kembangkan secara bertahap sesuai kemampuan anggaran.",
                ],
                [
                  "Kapan saya bisa mencoba prototype?",
                  "Setelah tim RakitApp menyelesaikan aplikasi live dan mengaktifkan aksesnya. Masa coba personal berlangsung 8 jam, sedangkan prototype sekolah berlangsung 24 jam.",
                ],
              ].map(([question, answer]) => (
                <details
                  key={question}
                  className="group py-4 first:pt-0 last:pb-0"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-100 marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {question}
                      <span className="text-xl font-normal text-cyan-300 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="public-neon-muted mt-3 max-w-2xl text-sm leading-6">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="public-neon-muted flex flex-col gap-3 border-t border-slate-700/60 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Dari masalah → solusi → aplikasi siap digunakan.</span>
          <span>RakitApp Studio</span>
        </footer>
      </div>
      <CatalogDemoDialog
        app={demoApp}
        onOpenChange={(open) => !open && setDemoApp(null)}
      />
      <RecentActivityToast />
    </main>
  );
}

function PricingCard({
  accent,
  eyebrow,
  title,
  price,
  description,
  items,
}: {
  accent: "pink" | "cyan" | "violet";
  eyebrow: string;
  title: string;
  price: string;
  description: string;
  items: string[];
}) {
  const accentClass =
    accent === "pink"
      ? "border-pink-300/30 bg-pink-400/10 text-pink-200"
      : accent === "violet"
        ? "border-violet-300/30 bg-violet-400/10 text-violet-200"
        : "border-cyan-300/30 bg-cyan-400/10 text-cyan-200";

  return (
    <article
      className={`public-glass-panel rounded-3xl border p-6 sm:p-7 ${accentClass}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        {eyebrow}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="text-lg font-semibold">{price}</p>
      </div>
      <p className="public-neon-muted mt-3 max-w-xl text-sm leading-6">
        {description}
      </p>
      <ul className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-slate-200"
          >
            <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        to="/build"
        className="public-neon-button mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        Mulai Rakit Solusi <IconArrowRight className="size-4" />
      </Link>
    </article>
  );
}
