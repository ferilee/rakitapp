import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import type { PrototypeTrial, PrototypeTrialPhase } from "@shared/prototype";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconExternalLink,
  IconLoader2,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminPrototype = Omit<PrototypeTrial, "status" | "expiresAt">;

const phases: Array<{ value: PrototypeTrialPhase; label: string }> = [
  { value: "building", label: "Sedang dikerjakan" },
  { value: "ready", label: "Siap diaktifkan" },
  { value: "active", label: "Aktif" },
  { value: "expired", label: "Kedaluwarsa" },
];

export function AdminPrototypeTrialsPage() {
  useSetPageTitle("Prototype RakitApp");
  const prototypesQuery = useActionQuery("list-prototype-trials-admin", {});
  const updatePrototype = useActionMutation("update-prototype-trial");
  const prototypes = (prototypesQuery.data ?? []) as AdminPrototype[];

  return (
    <AdminPageShell
      activeSection="prototypes"
      eyebrow="RakitApp operator"
      title="Prototype client"
      description="Terima request, masukkan URL aplikasi hasil kerja tim, lalu aktifkan masa coba setelah demo benar-benar siap."
      actions={
        <Button
          variant="outline"
          className="border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
          onClick={() => void prototypesQuery.refetch()}
          disabled={prototypesQuery.isFetching}
        >
          <IconRefresh
            className={
              prototypesQuery.isFetching ? "size-4 animate-spin" : "size-4"
            }
          />{" "}
          Segarkan
        </Button>
      }
    >
      <div className="mt-6 grid gap-4">
        {prototypesQuery.isLoading ? (
          <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
            <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-cyan-100">
              <IconLoader2 className="size-4 animate-spin" /> Memuat request
              prototype...
            </CardContent>
          </Card>
        ) : prototypes.length === 0 ? (
          <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
            <CardContent className="p-10 text-center text-sm text-slate-400">
              Belum ada request prototype dari client.
            </CardContent>
          </Card>
        ) : (
          prototypes.map((prototype) => (
            <PrototypeAdminCard
              key={prototype.trialToken}
              prototype={prototype}
              updating={updatePrototype.isPending}
              onSave={(phase, demoUrl) =>
                updatePrototype.mutate({
                  trialToken: prototype.trialToken,
                  phase,
                  demoUrl: demoUrl || null,
                })
              }
            />
          ))
        )}
      </div>
    </AdminPageShell>
  );
}

function PrototypeAdminCard({
  prototype,
  updating,
  onSave,
}: {
  prototype: AdminPrototype;
  updating: boolean;
  onSave: (
    phase: Exclude<PrototypeTrialPhase, "requested">,
    demoUrl: string,
  ) => void;
}) {
  const [phase, setPhase] = useState<PrototypeTrialPhase>(prototype.phase);
  const [demoUrl, setDemoUrl] = useState(prototype.demoUrl ?? "");

  useEffect(() => {
    setPhase(prototype.phase);
    setDemoUrl(prototype.demoUrl ?? "");
  }, [prototype.demoUrl, prototype.phase]);

  const canActivate = Boolean(demoUrl.trim());
  const categoryLabel = prototype.brief.categoryLabel;
  const durationLabel = `${prototype.trialHours} jam setelah diaktifkan`;

  return (
    <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
      <CardHeader className="gap-3 border-b border-slate-700/70 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">
              {prototype.brief.temporaryName}
            </CardTitle>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[0.68rem] font-semibold text-cyan-100">
              {phaseLabel(prototype.phase)}
            </span>
          </div>
          <p className="public-neon-muted mt-1 text-sm">
            {categoryLabel} · Durasi: {durationLabel}
          </p>
        </div>
        <span className="public-neon-muted text-xs">
          Request {formatDate(prototype.createdAt)}
        </span>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Ide client</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">
              {prototype.brief.idea}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fitur utama</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">
              {prototype.brief.features
                .map((feature) => feature.label)
                .join(", ") || "Belum ada fitur"}
            </p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Status kerja
            <select
              value={phase}
              onChange={(event) =>
                setPhase(event.target.value as PrototypeTrialPhase)
              }
              className="public-neon-input h-10 rounded-xl px-3 text-sm outline-none"
            >
              {phases.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            URL aplikasi live
            <input
              type="url"
              value={demoUrl}
              onChange={(event) => setDemoUrl(event.target.value)}
              placeholder="https://demo-aplikasi.client..."
              className="public-neon-input h-10 rounded-xl px-3 text-sm outline-none"
            />
          </label>
          <Button
            type="button"
            className="public-neon-button h-10 rounded-xl"
            disabled={updating || (phase === "active" && !canActivate)}
            onClick={() =>
              onSave(phase === "requested" ? "building" : phase, demoUrl.trim())
            }
          >
            {updating ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconSparkles className="size-4" />
            )}
            {phase === "active" ? "Aktifkan prototype" : "Simpan status"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {prototype.demoUrl ? (
            <a
              href={prototype.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-200 hover:text-white"
            >
              Buka demo live <IconExternalLink className="size-3.5" />
            </a>
          ) : null}
          <span>
            {prototype.activatedAt
              ? `Diaktifkan ${formatDate(prototype.activatedAt)}`
              : "Timer belum dimulai"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function phaseLabel(phase: PrototypeTrialPhase) {
  return phases.find((option) => option.value === phase)?.label ?? phase;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
