import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import type { ProjectLeadSummary } from "@shared/types";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconChevronRight,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statuses = ["new", "contacted", "qualified", "closed"] as const;

export function AdminLeadsPage() {
  useSetPageTitle("Leads RakitApp");
  const [searchParams, setSearchParams] = useSearchParams();
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const leadsQuery = useActionQuery("list-leads", { limit: 50 });
  const updateLead = useActionMutation("update-lead");
  const leads = leadsQuery.data ?? [];
  const selectedId = searchParams.get("leadId");
  const selected = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? leads[0],
    [leads, selectedId],
  );

  function selectLead(lead: ProjectLeadSummary) {
    setSearchParams({ leadId: lead.id });
    setNoteDraft(lead.notes ?? "");
  }

  function updateStatus(status: (typeof statuses)[number]) {
    if (selected) updateLead.mutate({ leadId: selected.id, status });
  }

  function saveNotes() {
    if (!selected) return;
    updateLead.mutate(
      { leadId: selected.id, notes: noteDraft ?? "" },
      { onSuccess: () => setNoteDraft(null) },
    );
  }

  return (
    <AdminPageShell
      activeSection="leads"
      eyebrow="RakitApp operator"
      title="Lead konsultasi"
      description="Tinjau brief masuk dan tentukan langkah follow-up."
      actions={
        <Button
          variant="outline"
          className="border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
          onClick={() => void leadsQuery.refetch()}
          disabled={leadsQuery.isFetching}
        >
          <IconRefresh
            className={leadsQuery.isFetching ? "size-4 animate-spin" : "size-4"}
          />{" "}
          Segarkan
        </Button>
      }
    >
      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="public-glass-panel h-fit rounded-2xl border-slate-600/60 text-white">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Lead terbaru ({leads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {leadsQuery.isLoading ? (
              <p className="public-neon-muted py-8 text-center text-sm">
                Memuat lead...
              </p>
            ) : leads.length === 0 ? (
              <p className="public-neon-muted py-8 text-center text-sm">
                Belum ada konsultasi masuk.
              </p>
            ) : (
              leads.map((lead) => (
                <button
                  type="button"
                  key={lead.id}
                  onClick={() => selectLead(lead)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected?.id === lead.id ? "border-cyan-300/50 bg-cyan-400/10" : "border-transparent hover:border-slate-600/70 hover:bg-slate-800/50"}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">
                      {lead.name}
                    </span>
                    <span className="public-neon-muted mt-1 block truncate text-xs">
                      {lead.organization}
                    </span>
                  </span>
                  <span className="public-neon-muted text-xs capitalize">
                    {lead.status}
                  </span>
                  <IconChevronRight className="size-4 text-cyan-200" />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {selected ? (
          <LeadDetail
            lead={selected}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            updateStatus={updateStatus}
            saveNotes={saveNotes}
            updating={updateLead.isPending}
          />
        ) : (
          <Card className="public-glass-panel grid min-h-96 place-items-center rounded-2xl border-slate-600/60 text-white">
            <p className="public-neon-muted text-sm">
              Pilih lead untuk melihat brief.
            </p>
          </Card>
        )}
      </div>
    </AdminPageShell>
  );
}

function LeadDetail({
  lead,
  noteDraft,
  setNoteDraft,
  updateStatus,
  saveNotes,
  updating,
}: {
  lead: ProjectLeadSummary;
  noteDraft: string | null;
  setNoteDraft: (value: string) => void;
  updateStatus: (status: (typeof statuses)[number]) => void;
  saveNotes: () => void;
  updating: boolean;
}) {
  return (
    <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
      <CardHeader className="border-b border-slate-700/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{lead.name}</CardTitle>
            <p className="public-neon-muted mt-1 text-sm">
              {lead.email} · WhatsApp: {lead.whatsapp ?? "—"} ·{" "}
              {lead.organization}
            </p>
          </div>
          <select
            value={lead.status}
            onChange={(event) =>
              updateStatus(event.target.value as (typeof statuses)[number])
            }
            className="public-neon-input h-9 rounded-lg px-3 text-sm capitalize"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Detail label="Kategori" value={lead.brief.categoryLabel} />
          <Detail
            label="Pengguna"
            value={lead.brief.audienceLabels.join(", ")}
          />
          <Detail label="Kompleksitas" value={lead.brief.estimate.complexity} />
        </div>
        <div>
          <p className="text-sm font-medium">Ide awal</p>
          <p className="public-neon-copy mt-2 leading-7">{lead.brief.idea}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Fitur</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lead.brief.features.map((feature) => (
              <span
                key={feature.id}
                className="rounded-full border border-slate-600/70 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200"
              >
                {feature.label}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-cyan-300/20 bg-slate-950/75 p-4 text-sm text-white shadow-[0_0_25px_rgba(34,211,238,0.08)]">
          <span className="text-slate-400">Estimasi indikatif</span>
          <p className="mt-1 text-lg font-semibold">
            Rp {lead.brief.estimate.priceMin.toLocaleString("id-ID")} – Rp{" "}
            {lead.brief.estimate.priceMax.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-slate-400">
            {lead.brief.estimate.daysMin}–{lead.brief.estimate.daysMax} hari
          </p>
        </div>
        <div>
          <label htmlFor="lead-notes" className="text-sm font-medium">
            Catatan internal
          </label>
          <textarea
            id="lead-notes"
            value={noteDraft ?? lead.notes ?? ""}
            onChange={(event) => setNoteDraft(event.target.value)}
            className="public-neon-input mt-2 min-h-28 w-full resize-y rounded-xl p-3 text-sm outline-none"
            placeholder="Catat hasil follow-up atau keputusan scope..."
          />
          <Button
            variant="outline"
            className="mt-3 border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
            onClick={saveNotes}
            disabled={updating}
          >
            {updating ? <IconLoader2 className="size-4 animate-spin" /> : null}
            Simpan catatan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="public-neon-muted text-xs">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-slate-100">
        {value}
      </p>
    </div>
  );
}
