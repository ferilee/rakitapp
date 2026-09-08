import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import type { PrototypeTrial, PrototypeTrialPhase } from "@shared/prototype";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconArchive,
  IconExternalLink,
  IconLoader2,
  IconRefresh,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminPrototype = Omit<PrototypeTrial, "status" | "expiresAt">;
type PrototypeFilter = "active" | "archived" | "all";

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
  const managePrototypes = useActionMutation("manage-prototype-trials");
  const [filter, setFilter] = useState<PrototypeFilter>("active");
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(
    () => new Set(),
  );
  const prototypes = (prototypesQuery.data ?? []) as AdminPrototype[];
  const visiblePrototypes = prototypes.filter((prototype) => {
    if (filter === "archived") return Boolean(prototype.archivedAt);
    if (filter === "active") return !prototype.archivedAt;
    return true;
  });
  const selectedPrototypes = prototypes.filter((prototype) =>
    selectedTokens.has(prototype.trialToken),
  );
  const activeSelected = selectedPrototypes.filter(
    (prototype) => !prototype.archivedAt,
  );
  const archivedSelected = selectedPrototypes.filter((prototype) =>
    Boolean(prototype.archivedAt),
  );
  const canDeleteSelectedTestData =
    selectedPrototypes.length > 0 &&
    selectedPrototypes.every(
      (prototype) => Boolean(prototype.archivedAt) && prototype.isTestData,
    );
  const allVisibleSelected =
    visiblePrototypes.length > 0 &&
    visiblePrototypes.every((prototype) =>
      selectedTokens.has(prototype.trialToken),
    );

  function toggleSelected(trialToken: string) {
    setSelectedTokens((current) => {
      const next = new Set(current);
      if (next.has(trialToken)) next.delete(trialToken);
      else next.add(trialToken);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedTokens((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visiblePrototypes.forEach((prototype) =>
          next.delete(prototype.trialToken),
        );
      } else {
        visiblePrototypes.forEach((prototype) =>
          next.add(prototype.trialToken),
        );
      }
      return next;
    });
  }

  function runBulkOperation(
    operation: "archive" | "restore" | "delete-test",
    trialTokens: string[],
  ) {
    if (trialTokens.length === 0) return;
    const confirmation =
      operation === "delete-test"
        ? "Hapus permanen data uji yang sudah diarsipkan? Tindakan ini tidak dapat dibatalkan."
        : operation === "archive"
          ? `Arsipkan ${trialTokens.length} permintaan prototype yang dipilih?`
          : `Pulihkan ${trialTokens.length} permintaan prototype yang dipilih?`;
    if (!window.confirm(confirmation)) return;

    managePrototypes.mutate(
      { operation, trialTokens },
      {
        onSuccess: () => {
          setSelectedTokens(new Set());
          void prototypesQuery.refetch();
        },
      },
    );
  }

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
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAllVisible}
            disabled={
              visiblePrototypes.length === 0 || managePrototypes.isPending
            }
            className="size-4 accent-cyan-400"
          />
          Pilih semua yang tampil
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{selectedPrototypes.length} dipilih</span>
          <span>·</span>
          <span>
            {prototypes.filter((prototype) => !prototype.archivedAt).length}{" "}
            aktif
          </span>
          <span>·</span>
          <span>
            {prototypes.filter((prototype) => prototype.archivedAt).length}{" "}
            diarsipkan
          </span>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as PrototypeFilter);
              setSelectedTokens(new Set());
            }}
            className="public-neon-input h-9 rounded-lg px-3 text-sm outline-none"
            aria-label="Filter request prototype"
          >
            <option value="active">Aktif</option>
            <option value="archived">Diarsipkan</option>
            <option value="all">Semua</option>
          </select>
          {activeSelected.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20 hover:text-white"
              disabled={managePrototypes.isPending}
              onClick={() =>
                runBulkOperation(
                  "archive",
                  activeSelected.map((prototype) => prototype.trialToken),
                )
              }
            >
              <IconArchive className="size-4" /> Arsipkan
            </Button>
          ) : null}
          {archivedSelected.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 hover:text-white"
              disabled={managePrototypes.isPending}
              onClick={() =>
                runBulkOperation(
                  "restore",
                  archivedSelected.map((prototype) => prototype.trialToken),
                )
              }
            >
              Pulihkan
            </Button>
          ) : null}
          {canDeleteSelectedTestData ? (
            <Button
              type="button"
              variant="outline"
              className="border-rose-300/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20 hover:text-white"
              disabled={managePrototypes.isPending}
              onClick={() =>
                runBulkOperation(
                  "delete-test",
                  selectedPrototypes.map((prototype) => prototype.trialToken),
                )
              }
            >
              <IconTrash className="size-4" /> Hapus data uji
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {prototypesQuery.isLoading ? (
          <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
            <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-cyan-100">
              <IconLoader2 className="size-4 animate-spin" /> Memuat request
              prototype...
            </CardContent>
          </Card>
        ) : visiblePrototypes.length === 0 ? (
          <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
            <CardContent className="p-10 text-center text-sm text-slate-400">
              {filter === "archived"
                ? "Belum ada request yang diarsipkan."
                : "Belum ada request prototype dari client."}
            </CardContent>
          </Card>
        ) : (
          visiblePrototypes.map((prototype) => (
            <PrototypeAdminCard
              key={prototype.trialToken}
              prototype={prototype}
              updating={updatePrototype.isPending}
              selected={selectedTokens.has(prototype.trialToken)}
              onSelect={() => toggleSelected(prototype.trialToken)}
              onSave={(phase, demoUrl, isTestData) =>
                updatePrototype.mutate(
                  {
                    trialToken: prototype.trialToken,
                    phase,
                    demoUrl: demoUrl || null,
                    isTestData,
                  },
                  {
                    onSuccess: () => void prototypesQuery.refetch(),
                  },
                )
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
  selected,
  onSelect,
  onSave,
}: {
  prototype: AdminPrototype;
  updating: boolean;
  selected: boolean;
  onSelect: () => void;
  onSave: (
    phase: Exclude<PrototypeTrialPhase, "requested">,
    demoUrl: string,
    isTestData: boolean,
  ) => void;
}) {
  const [phase, setPhase] = useState<PrototypeTrialPhase>(prototype.phase);
  const [demoUrl, setDemoUrl] = useState(prototype.demoUrl ?? "");
  const [isTestData, setIsTestData] = useState(prototype.isTestData);

  useEffect(() => {
    setPhase(prototype.phase);
    setDemoUrl(prototype.demoUrl ?? "");
    setIsTestData(prototype.isTestData);
  }, [prototype.demoUrl, prototype.isTestData, prototype.phase]);

  const canActivate = Boolean(demoUrl.trim());
  const categoryLabel = prototype.brief.categoryLabel;
  const durationLabel = `${prototype.trialHours} jam setelah diaktifkan`;

  return (
    <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
      <CardHeader className="gap-3 border-b border-slate-700/70 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`Pilih request ${prototype.brief.temporaryName}`}
            className="mt-1 size-4 accent-cyan-400"
          />
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
            {prototype.archivedAt ? (
              <p className="mt-1 text-xs text-amber-200/80">
                Diarsipkan {formatDate(prototype.archivedAt)}
              </p>
            ) : null}
          </div>
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
              onSave(
                phase === "requested" ? "building" : phase,
                demoUrl.trim(),
                isTestData,
              )
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
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <label className="inline-flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={isTestData}
              onChange={(event) => setIsTestData(event.target.checked)}
              className="size-4 accent-violet-400"
            />
            Tandai sebagai data uji
          </label>
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
