import { useActionQuery } from "@agent-native/core/client/hooks";
import {
  isPersonalShowcaseApp,
  getPackageDetails,
  prioritizePersonalApps,
  RAKITAPP_SHOWCASE,
  type ShowcaseApp,
} from "@shared/showcase";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";

// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { CatalogDemoDialog } from "@/components/catalog/CatalogDemoDialog";
import { APP_TITLE } from "@/lib/app-config";

const accentClasses: Record<
  ShowcaseApp["accent"],
  { card: string; surface: string; label: string }
> = {
  cyan: {
    card: "public-neon-card-cyan",
    surface: "public-neon-surface-cyan",
    label: "text-cyan-200",
  },
  violet: {
    card: "public-neon-card-violet",
    surface: "public-neon-surface-violet",
    label: "text-violet-200",
  },
  orange: {
    card: "public-neon-card-orange",
    surface: "public-neon-surface-orange",
    label: "text-orange-200",
  },
  emerald: {
    card: "public-neon-card-emerald",
    surface: "public-neon-surface-emerald",
    label: "text-emerald-200",
  },
  pink: {
    card: "public-neon-card-pink",
    surface: "public-neon-surface-pink",
    label: "text-pink-200",
  },
  blue: {
    card: "public-neon-card-blue",
    surface: "public-neon-surface-blue",
    label: "text-blue-200",
  },
};

const coverPositions: Record<string, string> = {
  smartclass: "0% 0%",
  quizlab: "33.333% 0%",
  presensikita: "66.666% 0%",
  "asesmen-insight": "100% 0%",
  "perpus-sekolah": "0% 50%",
  "tefa-tracker": "33.333% 50%",
  "portofolio-pribadi": "66.666% 50%",
  "rumah-pribadi": "100% 50%",
  "blog-ceritakita": "0% 100%",
  "linkbio-pribadi": "33.333% 100%",
};

export function CatalogPage({
  initialApps = prioritizePersonalApps(RAKITAPP_SHOWCASE),
}: {
  initialApps?: ShowcaseApp[];
}) {
  const [demoApp, setDemoApp] = useState<ShowcaseApp | null>(null);
  const catalogQuery = useActionQuery("list-catalog-apps", {});
  const apps = catalogQuery.data ?? initialApps;

  return (
    <main className="public-neon-page public-neon-grid min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
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
          <Link
            to="/build"
            className="public-neon-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Buat aplikasi
            <IconArrowRight className="size-4" />
          </Link>
        </header>

        <section className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,1.08fr)] lg:items-center lg:gap-14">
          <Link
            to="/"
            className="public-neon-link inline-flex items-center gap-2 text-sm font-medium lg:col-span-2"
          >
            <IconArrowLeft className="size-4" /> Kembali ke beranda
          </Link>
          <div className="max-w-3xl">
            <p className="public-neon-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
              <IconSparkles className="size-4" /> Katalog RakitApp
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl">
              Contoh solusi digital untuk kebutuhan Anda.
            </h1>
            <p className="public-neon-copy mt-6 max-w-2xl text-lg leading-8">
              Lihat contoh solusi pendidikan, website pribadi, dan produk
              digital yang dapat disesuaikan dengan masalah dan kebutuhan Anda.
              Semua dimulai dari scope MVP yang sederhana dan terjangkau.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
              <span className="rounded-full border border-pink-300/30 bg-pink-400/10 px-3 py-1.5 text-pink-100">
                Pribadi: Rp 100 rb – Rp 300 rb
              </span>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">
                Sekolah: Rp 1 jt – Rp 5 jt
              </span>
            </div>
          </div>
          <div className="public-glass-panel relative overflow-hidden rounded-[2rem] border-cyan-300/30 p-2 shadow-[0_0_70px_rgba(34,211,238,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(59,130,246,0.18),transparent_44%),radial-gradient(circle_at_28%_76%,rgba(217,70,239,0.16),transparent_42%)]" />
            <img
              src="/catalog-hero.png"
              alt="Ilustrasi layar aplikasi pendidikan dan website pribadi"
              className="relative aspect-[1.5] w-full rounded-[1.6rem] object-cover object-center"
              decoding="async"
              loading="eager"
            />
          </div>
        </section>

        <section className="grid gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <article
              key={app.id}
              className={`public-glass-panel public-neon-card flex flex-col rounded-[1.75rem] p-5 ${accentClasses[app.accent].card}`}
            >
              <div
                role="img"
                aria-label={`Ilustrasi ${app.category.toLowerCase()}`}
                className={`relative min-h-32 overflow-hidden rounded-2xl border bg-slate-950/90 bg-no-repeat ${accentClasses[app.accent].surface}`}
                style={
                  app.coverUrl
                    ? undefined
                    : {
                        backgroundImage: "url('/catalog-app-atlas.png')",
                        backgroundPosition: coverPositions[app.id] ?? "50% 50%",
                        backgroundSize: "400% 300%",
                      }
                }
              >
                {app.coverUrl ? (
                  <img
                    src={app.coverUrl}
                    alt={
                      app.coverAlt ?? `Ilustrasi ${app.category.toLowerCase()}`
                    }
                    className="absolute inset-0 size-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-white/5" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${accentClasses[app.accent].label}`}
                  >
                    {app.category}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {app.name}
                  </h2>
                </div>
                <span className="public-neon-price rounded-full px-2.5 py-1 text-xs font-medium">
                  {app.estimate}
                </span>
              </div>
              <p className="mt-4 font-medium leading-6 text-slate-100">
                {app.summary}
              </p>
              <p className="public-neon-muted mt-2 text-sm leading-6">
                {app.description}
              </p>
              <div className="mt-5 border-t border-slate-700/60 pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <IconUsers className="size-4 text-emerald-600" />
                  {app.audience}
                </div>
                <div className="mt-3 grid gap-2">
                  {app.features.map((feature) => (
                    <div
                      key={feature}
                      className="public-neon-copy flex items-center gap-2 text-sm"
                    >
                      <IconCheck
                        className={`size-4 ${accentClasses[app.accent].label}`}
                      />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <p className="public-neon-muted mt-5 border-t border-slate-700/60 pt-4 text-sm leading-6">
                <span className="font-semibold text-slate-200">Manfaat: </span>
                {app.outcome}
              </p>
              <details className="group mt-4 border-t border-slate-700/60 pt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-cyan-100 marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    Yang termasuk dalam paket
                    <span className="text-lg text-cyan-300 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  {getPackageDetails(isPersonalShowcaseApp(app)).includes.map(
                    (item) => (
                      <p
                        key={item}
                        className="public-neon-muted flex gap-2 text-xs leading-5"
                      >
                        <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                        {item}
                      </p>
                    ),
                  )}
                  <p className="pt-1 text-[0.7rem] leading-5 text-slate-500">
                    {getPackageDetails(isPersonalShowcaseApp(app)).note}
                  </p>
                </div>
              </details>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-700/60 pt-4">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Coba langsung
                </span>
                <button
                  type="button"
                  onClick={() => setDemoApp(app)}
                  className="public-neon-button inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold"
                >
                  DEMO <IconSparkles className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="public-glass-panel mb-10 rounded-[2rem] border-violet-400/30 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-300">
                Belum menemukan yang sesuai?
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Punya masalah pendidikan yang ingin diselesaikan?
              </h2>
              <p className="public-neon-copy mt-3 max-w-xl leading-7">
                Ceritakan masalahnya. RakitApp membantu menemukan bentuk solusi,
                fitur, dan estimasi yang mudah dipahami.
              </p>
            </div>
            <Link
              to="/build"
              className="public-neon-button inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              Mulai Rakit Solusi <IconArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <footer className="public-neon-muted border-t border-slate-700/60 py-5 text-sm">
          Dari masalah → solusi → aplikasi siap digunakan.
        </footer>
      </div>
      <CatalogDemoDialog
        app={demoApp}
        onOpenChange={(open) => !open && setDemoApp(null)}
      />
    </main>
  );
}
