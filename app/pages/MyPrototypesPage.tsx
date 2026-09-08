import { useActionQuery } from "@agent-native/core/client/hooks";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import type { PrototypeTrial, PrototypeTrialPhase } from "@shared/prototype";
import { IconArrowRight, IconClock, IconSparkles } from "@tabler/icons-react";
import { Link } from "react-router";

import { Card, CardContent } from "@/components/ui/card";

const phaseLabels: Record<PrototypeTrialPhase, string> = {
  requested: "Request diterima",
  building: "Sedang dibuat",
  ready: "Siap diaktifkan",
  active: "Prototype aktif",
  expired: "Masa coba selesai",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function MyPrototypesPage() {
  useSetPageTitle("Prototype Saya");
  const query = useActionQuery<PrototypeTrial[]>(
    "list-my-prototype-trials",
    {},
  );
  const trials = query.data ?? [];

  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="public-neon-link text-sm font-semibold">
            ← RakitApp
          </Link>
          <Link
            to="/build"
            className="public-neon-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            <IconSparkles className="size-4" /> Rakit ide baru
          </Link>
        </header>
        <div className="mt-12">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
            Ruang Anda
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Prototype Saya
          </h1>
          <p className="public-neon-copy mt-4 max-w-2xl text-lg leading-8">
            Simpanan prototype yang terhubung ke akun Anda. Buka kembali kapan
            saja untuk melihat status atau mencoba demo yang sudah aktif.
          </p>
        </div>

        {query.isLoading ? (
          <p className="public-neon-muted mt-10">Memuat prototype...</p>
        ) : query.isError ? (
          <Card className="public-glass-panel mt-10 rounded-3xl">
            <CardContent className="p-6 text-sm text-rose-200">
              Prototype belum dapat dimuat. Silakan muat ulang halaman.
            </CardContent>
          </Card>
        ) : trials.length === 0 ? (
          <Card className="public-glass-panel mt-10 rounded-3xl">
            <CardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
                <IconSparkles className="size-7" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">
                Belum ada prototype tersimpan
              </h2>
              <p className="public-neon-muted mx-auto mt-2 max-w-md text-sm leading-6">
                Setelah meminta prototype, pilih “Simpan dengan Google” agar
                request tersebut muncul di sini.
              </p>
              <Link
                to="/build"
                className="public-neon-button mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                Mulai dari ide <IconArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {trials.map((trial) => (
              <Card
                key={trial.trialToken}
                className="public-glass-panel rounded-3xl border-slate-700/70"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-300">
                        {trial.brief.categoryLabel}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-white">
                        {trial.brief.temporaryName}
                      </h2>
                    </div>
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-[0.7rem] text-cyan-100">
                      {phaseLabels[trial.phase]}
                    </span>
                  </div>
                  <p className="public-neon-muted mt-4 line-clamp-2 text-sm leading-6">
                    {trial.brief.idea}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                    <IconClock className="size-3.5" />
                    Dibuat {formatDate(trial.createdAt)}
                  </div>
                  <Link
                    to={`/prototype/${trial.trialToken}`}
                    className="public-neon-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  >
                    Buka prototype <IconArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
