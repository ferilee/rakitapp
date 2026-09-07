import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import type { ShowcaseApp } from "@shared/showcase";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconEdit,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconUpload,
  IconArchive,
} from "@tabler/icons-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FormState = {
  id: string;
  name: string;
  category: string;
  audience: string;
  summary: string;
  description: string;
  features: string;
  outcome: string;
  accent: ShowcaseApp["accent"];
  priceMin: string;
  priceMax: string;
  demoUrl: string;
  coverUrl: string;
  coverAssetId: string;
  coverAlt: string;
  status: NonNullable<ShowcaseApp["status"]>;
  sortOrder: string;
};

type UpdateField = <Key extends keyof FormState>(
  key: Key,
  value: FormState[Key],
) => void;

const emptyForm: FormState = {
  id: "",
  name: "",
  category: "",
  audience: "",
  summary: "",
  description: "",
  features: "",
  outcome: "",
  accent: "cyan",
  priceMin: "",
  priceMax: "",
  demoUrl: "",
  coverUrl: "",
  coverAssetId: "",
  coverAlt: "",
  status: "draft",
  sortOrder: "0",
};

function formFromApp(app: ShowcaseApp): FormState {
  return {
    id: app.id,
    name: app.name,
    category: app.category,
    audience: app.audience,
    summary: app.summary,
    description: app.description,
    features: app.features.join("\n"),
    outcome: app.outcome,
    accent: app.accent,
    priceMin: String(app.priceMin ?? ""),
    priceMax: String(app.priceMax ?? ""),
    demoUrl: app.demoUrl ?? "",
    coverUrl: app.coverUrl ?? "",
    coverAssetId: app.coverAssetId ?? "",
    coverAlt: app.coverAlt ?? "",
    status: app.status ?? "draft",
    sortOrder: String(app.sortOrder ?? 0),
  };
}

function nullableUrl(value: string) {
  return value.trim() ? value.trim() : null;
}

export function AdminCatalogPage() {
  const catalogQuery = useActionQuery("list-catalog-apps-admin", {});
  const createApp = useActionMutation("create-catalog-app");
  const updateApp = useActionMutation("update-catalog-app");
  const archiveApp = useActionMutation("archive-catalog-app");
  const reorderApps = useActionMutation("reorder-catalog-apps");
  const uploadCover = useActionMutation("upload-catalog-cover");
  const recommendApp = useActionMutation("recommend-catalog-app");
  const apps = catalogQuery.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [recommendationName, setRecommendationName] = useState("");
  const [recommendationIdea, setRecommendationIdea] = useState("");

  const selected = apps.find((app) => app.id === selectedId) ?? null;
  const saving = createApp.isPending || updateApp.isPending;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  function startCreate() {
    setSelectedId(null);
    setForm({ ...emptyForm, sortOrder: String(apps.length) });
    setMessage(null);
    setError(null);
    if (isMobile) setMobileEditorOpen(true);
  }

  function openRecommendation() {
    setRecommendationName("");
    setRecommendationIdea("");
    setMessage(null);
    setError(null);
    setRecommendationOpen(true);
  }

  function uniqueSlug(slug: string) {
    const base = slug || "aplikasi-baru";
    if (!apps.some((app) => app.id === base)) return base;
    let suffix = 2;
    while (apps.some((app) => app.id === `${base}-${suffix}`)) suffix += 1;
    return `${base}-${suffix}`;
  }

  function generateRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    recommendApp.mutate(
      {
        idea: recommendationIdea,
        name: recommendationName.trim() || undefined,
      },
      {
        onSuccess: (draft) => {
          setSelectedId(null);
          setForm({
            ...draft,
            id: uniqueSlug(draft.id),
            features: draft.features.join("\n"),
            sortOrder: String(apps.length),
          });
          setRecommendationOpen(false);
          setMessage(
            "AI membuat draft katalog. Tinjau dan edit isinya sebelum disimpan.",
          );
          if (isMobile) setMobileEditorOpen(true);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  }

  function startEdit(app: ShowcaseApp) {
    setSelectedId(app.id);
    setForm(formFromApp(app));
    setMessage(null);
    setError(null);
    if (isMobile) setMobileEditorOpen(true);
  }

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function payload() {
    return {
      name: form.name,
      category: form.category,
      audience: form.audience,
      summary: form.summary,
      description: form.description,
      features: form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
      outcome: form.outcome,
      accent: form.accent,
      priceMin: Number(form.priceMin),
      priceMax: Number(form.priceMax),
      demoUrl: nullableUrl(form.demoUrl),
      coverUrl: nullableUrl(form.coverUrl),
      coverAssetId: form.coverAssetId.trim() || null,
      coverAlt: form.coverAlt.trim() || null,
      status: form.status,
      sortOrder: Number(form.sortOrder),
    };
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const values = payload();
    if (selected) {
      updateApp.mutate(
        { appId: selected.id, ...values },
        {
          onSuccess: (app) => {
            setForm(formFromApp(app));
            setMessage("Perubahan aplikasi tersimpan.");
            void catalogQuery.refetch();
            setMobileEditorOpen(false);
          },
          onError: (mutationError) => setError(mutationError.message),
        },
      );
      return;
    }
    createApp.mutate(
      { id: form.id.trim(), ...values },
      {
        onSuccess: (app) => {
          setSelectedId(app.id);
          setForm(formFromApp(app));
          setMessage("Aplikasi baru berhasil ditambahkan.");
          void catalogQuery.refetch();
          setMobileEditorOpen(false);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  }

  function archiveSelected() {
    if (!selected) return;
    setMessage(null);
    setError(null);
    archiveApp.mutate(
      { appId: selected.id },
      {
        onSuccess: () => {
          setSelectedId(null);
          setForm(emptyForm);
          setMessage(
            "Aplikasi diarsipkan dan disembunyikan dari katalog publik.",
          );
          void catalogQuery.refetch();
          setMobileEditorOpen(false);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  }

  function moveApp(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= apps.length || reorderApps.isPending) return;
    const next = [...apps];
    [next[index], next[target]] = [next[target], next[index]];
    reorderApps.mutate(
      {
        items: next.map((app, itemIndex) => ({
          appId: app.id,
          sortOrder: itemIndex,
        })),
      },
      {
        onSuccess: () => void catalogQuery.refetch(),
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  }

  function uploadCoverFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar untuk cover.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setError(null);
      uploadCover.mutate(
        { data: reader.result, filename: file.name },
        {
          onSuccess: (result) => {
            updateField("coverUrl", result.url);
            updateField("coverAssetId", result.id ?? "");
            setMessage(
              "Cover berhasil diunggah. Simpan aplikasi untuk menerapkannya.",
            );
          },
          onError: (mutationError) => setError(mutationError.message),
        },
      );
    };
    reader.onerror = () => setError("File cover tidak bisa dibaca.");
    reader.readAsDataURL(file);
  }

  return (
    <AdminPageShell
      activeSection="catalog"
      eyebrow="RakitApp operator"
      title="Katalog aplikasi"
      description="Tambah, edit, urutkan, terbitkan, dan kelola cover aplikasi yang tampil ke calon pelanggan."
      actions={
        <>
          <Button
            variant="outline"
            className="border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
            onClick={() => void catalogQuery.refetch()}
            disabled={catalogQuery.isFetching}
          >
            <IconRefresh
              className={
                catalogQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
            />{" "}
            Segarkan
          </Button>
          <Button
            variant="outline"
            className="border-violet-300/40 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20 hover:text-white"
            onClick={openRecommendation}
          >
            <IconSparkles className="size-4" /> Buat dengan AI
          </Button>
          <Button className="public-neon-button" onClick={startCreate}>
            <IconPlus className="size-4" /> Aplikasi baru
          </Button>
        </>
      }
    >
      {(message || error) && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-300/40 bg-red-500/10 text-red-200" : "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"}`}
        >
          {error ?? message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="public-glass-panel h-fit rounded-2xl border-slate-600/60 text-white lg:sticky lg:top-5">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Semua aplikasi ({apps.length})
            </CardTitle>
            <p className="public-neon-muted text-xs">
              Pilih aplikasi untuk membuka editor.
            </p>
          </CardHeader>
          <CardContent className="grid max-h-[calc(100dvh-17rem)] gap-2 overflow-y-auto lg:max-h-none lg:overflow-visible">
            {catalogQuery.isLoading ? (
              <p className="public-neon-muted py-8 text-center text-sm">
                Memuat katalog...
              </p>
            ) : apps.length === 0 ? (
              <p className="public-neon-muted py-8 text-center text-sm">
                Belum ada aplikasi.
              </p>
            ) : (
              apps.map((app, index) => (
                <div
                  key={app.id}
                  className={`rounded-xl border p-2.5 transition ${selected?.id === app.id ? "border-cyan-300/50 bg-cyan-400/10" : "border-transparent hover:border-slate-600/70 hover:bg-slate-800/45"}`}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(app)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    {app.coverUrl ? (
                      <img
                        src={app.coverUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-lg object-cover sm:size-12"
                      />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-cyan-200 sm:size-12">
                        {app.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {app.name}
                      </span>
                      <span className="public-neon-muted mt-1 block truncate text-xs">
                        {app.category}
                      </span>
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${app.status === "published" ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : app.status === "archived" ? "border-slate-500/40 bg-slate-700/50 text-slate-300" : "border-amber-300/30 bg-amber-400/10 text-amber-200"}`}
                    >
                      {app.status}
                    </span>
                  </button>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-slate-300 hover:bg-slate-700/60 hover:text-white"
                      onClick={() => moveApp(index, -1)}
                      disabled={index === 0 || reorderApps.isPending}
                      aria-label={`Naikkan ${app.name}`}
                    >
                      <IconArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-slate-300 hover:bg-slate-700/60 hover:text-white"
                      onClick={() => moveApp(index, 1)}
                      disabled={
                        index === apps.length - 1 || reorderApps.isPending
                      }
                      aria-label={`Turunkan ${app.name}`}
                    >
                      <IconArrowDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-cyan-200 hover:bg-cyan-400/15 hover:text-cyan-100"
                      onClick={() => startEdit(app)}
                      aria-label={`Edit ${app.name}`}
                    >
                      <IconEdit className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="hidden lg:block">
          <Card className="public-glass-panel rounded-2xl border-slate-600/60 text-white">
            <CardHeader className="border-b border-slate-700/70">
              <CardTitle className="text-white">
                {selected ? `Edit ${selected.name}` : "Tambah aplikasi baru"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CatalogEditor
                selected={selected}
                form={form}
                updateField={updateField}
                save={save}
                archiveSelected={archiveSelected}
                saving={saving}
                archivePending={archiveApp.isPending}
                uploadPending={uploadCover.isPending}
                uploadCoverFile={uploadCoverFile}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={mobileEditorOpen} onOpenChange={setMobileEditorOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-none border-slate-700 bg-[#070b16] p-0 text-white sm:max-w-xl lg:hidden"
        >
          <SheetHeader className="border-b border-slate-700/70 px-5 py-4 text-left">
            <SheetTitle className="text-white">
              {selected ? `Edit ${selected.name}` : "Tambah aplikasi baru"}
            </SheetTitle>
            <SheetDescription className="public-neon-muted">
              Lengkapi informasi aplikasi, harga, status, dan cover.
            </SheetDescription>
          </SheetHeader>
          <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto p-5 pb-8">
            <CatalogEditor
              selected={selected}
              form={form}
              updateField={updateField}
              save={save}
              archiveSelected={archiveSelected}
              saving={saving}
              archivePending={archiveApp.isPending}
              uploadPending={uploadCover.isPending}
              uploadCoverFile={uploadCoverFile}
              mobile
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={recommendationOpen} onOpenChange={setRecommendationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <IconSparkles className="size-5 text-violet-300" />
              Buat draft dengan AI
            </DialogTitle>
            <DialogDescription className="public-neon-muted">
              Masukkan nama jika sudah ada, lalu jelaskan ide singkatnya. AI
              akan menyesuaikan isi draft dengan konteks tersebut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={generateRecommendation} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Nama aplikasi (opsional)
              <input
                value={recommendationName}
                onChange={(event) => setRecommendationName(event.target.value)}
                placeholder="Contoh: Jurnal Mengajar"
                className="public-neon-input h-10 rounded-xl px-3 outline-none"
                maxLength={100}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Ide aplikasi
              <textarea
                autoFocus
                value={recommendationIdea}
                onChange={(event) => setRecommendationIdea(event.target.value)}
                placeholder="Contoh: aplikasi presensi untuk sekolah kecil dengan rekap bulanan"
                className="public-neon-input min-h-32 resize-none rounded-xl p-3 leading-6 outline-none"
                maxLength={400}
                required
              />
            </label>
            <div className="flex items-start gap-3 rounded-xl border border-violet-300/20 bg-violet-400/10 p-3 text-xs leading-5 text-violet-100">
              <IconSparkles className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <span>
                Hasil masuk sebagai draft dan tidak langsung dipublikasikan.
                Anda tetap meninjau harga, scope, cover, dan statusnya.
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
                onClick={() => setRecommendationOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="public-neon-button"
                disabled={
                  recommendApp.isPending || recommendationIdea.trim().length < 3
                }
              >
                {recommendApp.isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconSparkles className="size-4" />
                )}{" "}
                {recommendApp.isPending ? "Menyusun..." : "Buat rekomendasi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}

function CatalogEditor({
  selected,
  form,
  updateField,
  save,
  archiveSelected,
  saving,
  archivePending,
  uploadPending,
  uploadCoverFile,
  mobile = false,
}: {
  selected: ShowcaseApp | null;
  form: FormState;
  updateField: UpdateField;
  save: (event: FormEvent<HTMLFormElement>) => void;
  archiveSelected: () => void;
  saving: boolean;
  archivePending: boolean;
  uploadPending: boolean;
  uploadCoverFile: (event: ChangeEvent<HTMLInputElement>) => void;
  mobile?: boolean;
}) {
  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Slug aplikasi"
          value={form.id}
          onChange={(value) => updateField("id", value)}
          placeholder="contoh: kelas-ceria"
          disabled={Boolean(selected)}
        />
        <Field
          label="Nama aplikasi"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Kelas Ceria"
        />
        <Field
          label="Kategori"
          value={form.category}
          onChange={(value) => updateField("category", value)}
          placeholder="Kelas digital"
        />
        <Field
          label="Pengguna"
          value={form.audience}
          onChange={(value) => updateField("audience", value)}
          placeholder="Guru & siswa"
        />
        <Field
          label="Harga minimum"
          type="number"
          value={form.priceMin}
          onChange={(value) => updateField("priceMin", value)}
          placeholder="1000000"
        />
        <Field
          label="Harga maksimum"
          type="number"
          value={form.priceMax}
          onChange={(value) => updateField("priceMax", value)}
          placeholder="3000000"
        />
        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Warna aksen
          <select
            value={form.accent}
            onChange={(event) =>
              updateField("accent", event.target.value as FormState["accent"])
            }
            className="public-neon-input h-10 rounded-lg px-3 font-normal"
          >
            <option value="cyan">Cyan</option>
            <option value="violet">Violet</option>
            <option value="orange">Orange</option>
            <option value="emerald">Emerald</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-200">
          Status publikasi
          <select
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as FormState["status"])
            }
            className="public-neon-input h-10 rounded-lg px-3 font-normal"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <Field
        label="Ringkasan"
        value={form.summary}
        onChange={(value) => updateField("summary", value)}
        placeholder="Ringkasan singkat yang tampil di kartu."
      />
      <TextAreaField
        label="Deskripsi"
        value={form.description}
        onChange={(value) => updateField("description", value)}
        placeholder="Jelaskan manfaat aplikasi ini."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaField
          label="Fitur (satu per baris)"
          value={form.features}
          onChange={(value) => updateField("features", value)}
          placeholder={"Login\nDashboard\nLaporan"}
        />
        <TextAreaField
          label="Manfaat"
          value={form.outcome}
          onChange={(value) => updateField("outcome", value)}
          placeholder="Hasil yang dirasakan pengguna."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="URL demo live (opsional)"
          value={form.demoUrl}
          onChange={(value) => updateField("demoUrl", value)}
          placeholder="https://demo.contoh.id"
        />
        <Field
          label="Urutan tampil"
          type="number"
          value={form.sortOrder}
          onChange={(value) => updateField("sortOrder", value)}
          placeholder="0"
        />
      </div>
      <div className="rounded-2xl border border-slate-600/70 bg-slate-900/35 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {form.coverUrl ? (
            <img
              src={form.coverUrl}
              alt={form.coverAlt || "Preview cover"}
              className="h-28 w-full rounded-xl object-cover sm:w-48"
            />
          ) : (
            <div className="grid h-28 w-full place-items-center rounded-xl bg-slate-950 text-sm text-slate-400 sm:w-48">
              Belum ada cover
            </div>
          )}
          <div className="grid flex-1 gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Cover aplikasi
              </p>
              <p className="public-neon-muted mt-1 text-xs">
                Upload gambar atau tempel URL cover yang sudah di-host.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-600/70 bg-slate-900/40 px-3 text-sm font-medium text-slate-100 hover:bg-slate-800/70">
                {uploadPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconUpload className="size-4" />
                )}{" "}
                Upload cover
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  className="sr-only"
                  onChange={uploadCoverFile}
                  disabled={uploadPending}
                />
              </label>
              {form.coverUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800/70 hover:text-white"
                  onClick={() => {
                    updateField("coverUrl", "");
                    updateField("coverAssetId", "");
                  }}
                >
                  Hapus cover
                </Button>
              ) : null}
            </div>
            <Field
              label="URL cover"
              value={form.coverUrl}
              onChange={(value) => updateField("coverUrl", value)}
              placeholder="https://cdn.contoh.id/cover.webp"
            />
            <Field
              label="Alt text cover"
              value={form.coverAlt}
              onChange={(value) => updateField("coverAlt", value)}
              placeholder="Dashboard belajar siswa"
            />
          </div>
        </div>
      </div>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/70 pt-5 ${mobile ? "sticky bottom-0 z-10 -mx-5 bg-[#070b16]/95 px-5 pb-1 pt-4 backdrop-blur" : ""}`}
      >
        <div>
          {selected ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-300/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100"
              onClick={archiveSelected}
              disabled={archivePending}
            >
              <IconArchive className="size-4" /> Arsipkan
            </Button>
          ) : (
            <p className="public-neon-muted text-sm">
              Aplikasi baru tersimpan sebagai draft sesuai pilihan status.
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="public-neon-button"
          disabled={saving || uploadPending}
        >
          {saving ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}{" "}
          {selected ? "Simpan perubahan" : "Tambah aplikasi"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="public-neon-input h-10 rounded-lg px-3 font-normal outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="public-neon-input min-h-28 resize-y rounded-lg p-3 font-normal outline-none"
      />
    </label>
  );
}
