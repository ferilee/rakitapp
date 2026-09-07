import { useActionQuery } from "@agent-native/core/client/hooks";
import {
  getPrototypeRemainingMs,
  type PrototypeTrial,
  type PrototypeTrialPhase,
} from "@shared/prototype";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconArrowRight,
  IconCircleCheck,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatRemaining(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function PrototypePage({ trialToken }: { trialToken: string }) {
  const navigate = useNavigate();
  const trialQuery = useActionQuery<PrototypeTrial>(
    "get-prototype-trial",
    { trialToken },
    { enabled: Boolean(trialToken), retry: false },
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const trial = trialQuery.data;
  const remainingMs = useMemo(
    () =>
      trial?.phase === "active" && trial.trialExpiresAt
        ? getPrototypeRemainingMs(trial.trialExpiresAt, new Date(now))
        : 0,
    [now, trial],
  );
  const phase: PrototypeTrialPhase =
    trial?.phase === "active" && remainingMs <= 0
      ? "expired"
      : (trial?.phase ?? "requested");
  const prototypeUrl =
    typeof window === "undefined" ? "" : window.location.href;
  const whatsappHref = trial
    ? `https://wa.me/?text=${encodeURIComponent(
        [
          "Halo RakitApp, saya sudah melihat prototype dan ingin membahas produksi.",
          `Nama aplikasi: ${trial.brief.temporaryName}`,
          `Jenis aplikasi: ${trial.brief.categoryLabel}`,
          `Estimasi awal: ${formatCurrency(trial.brief.estimate.priceMin)} - ${formatCurrency(trial.brief.estimate.priceMax)}`,
          `Prototype: ${prototypeUrl}`,
        ].join("\n"),
      )}`
    : "https://wa.me/";

  if (trialQuery.isLoading) return <PrototypeLoading />;

  if (trialQuery.isError || !trial) {
    return (
      <PrototypeMessage
        title="Prototype tidak dapat dibuka"
        description={
          trialQuery.error?.message ??
          "Tautan prototype tidak ditemukan. Buat rancangan baru untuk mencoba lagi."
        }
        action="Buat rancangan baru"
        onAction={() => navigate("/build")}
      />
    );
  }

  if (phase === "expired") {
    return (
      <PrototypeMessage
        title="Masa coba prototype sudah selesai"
        description="Akses demo ini sudah berakhir. Hubungi RakitApp jika Anda ingin melanjutkan aplikasi ini ke tahap produksi."
        action="Diskusikan produksi"
        href={whatsappHref}
        secondaryAction="Buat rancangan baru"
        onSecondaryAction={() => navigate("/build")}
      />
    );
  }

  if (phase !== "active" || !trial.demoUrl) {
    return <PrototypePending trial={trial} phase={phase} />;
  }

  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-4 py-5 text-white sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="public-neon-logo grid size-9 place-items-center overflow-hidden rounded-xl p-1.5">
              <img
                src="/rakitapp-logo.png"
                alt=""
                aria-hidden="true"
                className="size-full object-contain"
              />
            </span>
            RakitApp
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
            Prototype aktif · {formatRemaining(remainingMs)}
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="public-glass-panel h-fit rounded-3xl p-5 lg:sticky lg:top-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Prototype live
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {trial.brief.temporaryName}
            </h1>
            <p className="public-neon-muted mt-1 text-sm">
              {trial.brief.categoryLabel}
            </p>
            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-slate-950/45 p-3">
              <p className="text-xs text-slate-400">Sisa masa coba</p>
              <p className="mt-1 text-xl font-semibold text-cyan-200">
                {formatRemaining(remainingMs)}
              </p>
            </div>
            <div className="mt-5 grid gap-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Pengguna:</span>{" "}
                {trial.brief.audienceLabels.join(", ")}
              </p>
              <p>
                <span className="text-slate-500">Fitur:</span>{" "}
                {trial.brief.features
                  .map((feature) => feature.label)
                  .join(", ")}
              </p>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-orange-300/25 bg-orange-400/10 p-4 text-sm leading-6 text-orange-100 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <strong>Prototype buatan tim.</strong> Ini adalah aplikasi live
                dengan data contoh. Akses, ekspor, dan integrasi produksi
                dibahas setelah scope disepakati.
              </p>
              <a
                href={trial.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 text-orange-100 underline underline-offset-4 hover:text-white"
              >
                Buka tab baru <IconExternalLink className="size-4" />
              </a>
            </div>
            <div className="overflow-hidden rounded-3xl border border-cyan-300/30 bg-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
              <iframe
                title={`Demo live ${trial.brief.temporaryName}`}
                src={trial.demoUrl}
                className="h-[min(75vh,760px)] w-full bg-white"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              />
            </div>
            <Card className="public-glass-panel mt-5 rounded-3xl border-cyan-300/25">
              <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-lg font-semibold">
                    Cocok dengan kebutuhan Anda?
                  </p>
                  <p className="public-neon-muted mt-1 text-sm leading-6">
                    Setelah scope disepakati dan pembayaran produksi dilakukan,
                    RakitApp menyiapkan aplikasi dengan data dan akses milik
                    Anda.
                  </p>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="public-neon-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  Konsultasikan produksi <IconExternalLink className="size-4" />
                </a>
              </CardContent>
            </Card>
          </section>
        </section>
      </div>
    </main>
  );
}

function PrototypePending({
  trial,
  phase,
}: {
  trial: PrototypeTrial;
  phase: PrototypeTrialPhase;
}) {
  const copy = {
    requested: {
      title: "Request prototype sudah diterima",
      description: `Tim RakitApp akan merancang aplikasi ${trial.brief.temporaryName} berdasarkan ide dan fitur yang Anda pilih. Halaman ini akan berubah setelah demo live siap diaktifkan.`,
    },
    building: {
      title: "Prototype sedang dibuat tim",
      description:
        "Tim RakitApp sedang menerjemahkan brief ini menjadi aplikasi yang bisa dicoba. Silakan simpan tautan ini dan buka kembali setelah mendapat kabar dari tim.",
    },
    ready: {
      title: "Prototype siap diaktifkan",
      description:
        "Demo aplikasi sudah disiapkan dan sedang menunggu aktivasi tim. Masa coba baru dimulai setelah akses live diaktifkan.",
    },
    active: {
      title: "Prototype sedang disiapkan",
      description:
        "Aplikasi live belum tersedia di tautan ini. Tim RakitApp akan memperbarui akses setelah URL demo siap.",
    },
    expired: {
      title: "Masa coba prototype sudah selesai",
      description: "Akses demo ini sudah berakhir.",
    },
  }[phase];

  return (
    <PrototypeMessage
      title={copy.title}
      description={copy.description}
      action="Buat rancangan lain"
      onAction={() => window.location.assign("/build")}
      detail={
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-slate-950/45 p-4 text-left text-sm">
          <p className="text-slate-400">Rancangan</p>
          <p className="mt-1 font-semibold text-white">
            {trial.brief.temporaryName}
          </p>
          <p className="mt-3 text-slate-400">
            Perkiraan masa coba setelah aktif
          </p>
          <p className="mt-1 text-cyan-200">{trial.trialHours} jam</p>
        </div>
      }
    />
  );
}

function PrototypeLoading() {
  return (
    <main className="public-neon-page public-neon-grid grid min-h-screen place-items-center px-5">
      <div className="flex items-center gap-3 text-cyan-200">
        <IconLoader2 className="size-5 animate-spin" /> Menyiapkan prototype...
      </div>
    </main>
  );
}

function PrototypeMessage({
  title,
  description,
  action,
  href,
  onAction,
  secondaryAction,
  onSecondaryAction,
  detail,
}: {
  title: string;
  description: string;
  action: string;
  href?: string;
  onAction?: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
  detail?: ReactNode;
}) {
  return (
    <main className="public-neon-page public-neon-grid grid min-h-screen place-items-center px-5 py-8">
      <Card className="public-glass-panel w-full max-w-xl rounded-3xl">
        <CardContent className="p-8 text-center sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-cyan-300/35 bg-cyan-400/10 text-cyan-200">
            <IconCircleCheck className="size-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="public-neon-copy mt-4 leading-7">{description}</p>
          {detail}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="public-neon-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                {action} <IconExternalLink className="size-4" />
              </a>
            ) : (
              <Button
                onClick={onAction}
                className="public-neon-button rounded-xl"
              >
                {action} <IconArrowRight className="size-4" />
              </Button>
            )}
            {secondaryAction ? (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
                className="rounded-xl border-slate-700 bg-slate-950/50 text-slate-200"
              >
                {secondaryAction}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
