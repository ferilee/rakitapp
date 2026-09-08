import { useActionMutation } from "@agent-native/core/client/hooks";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_CATALOG,
  CATEGORY_IDS,
  getCategory,
  getSelectedFeatures,
  type AudienceId,
  type CategoryId,
  type ProjectIntake,
} from "@shared/catalog";
import { getPackageDetails } from "@shared/showcase";
import type { ProjectBrief } from "@shared/types";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconCircleCheck,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = ["Ide", "Jenis aplikasi", "Pengguna", "Fitur"];

const categoryAccent: Record<CategoryId, string> = {
  lms: "cyan",
  assessment: "violet",
  "school-operations": "orange",
  "learning-dashboard": "emerald",
  "personal-web": "pink",
};

const IDEA_EXAMPLES = [
  {
    label: "Kelas digital",
    idea: "Aplikasi kelas digital untuk materi, kuis, dan dashboard guru",
  },
  {
    label: "Kuis & asesmen",
    idea: "Aplikasi kuis interaktif dengan bank soal dan penilaian otomatis",
  },
  {
    label: "Presensi sekolah",
    idea: "Aplikasi presensi sekolah dengan rekap kehadiran setiap kelas",
  },
  {
    label: "Portofolio pribadi",
    idea: "Website portofolio pribadi dengan galeri karya dan kontak",
  },
  {
    label: "Blog pribadi",
    idea: "Blog pribadi untuk menulis cerita, opini, dan catatan perjalanan",
  },
  {
    label: "LinkBio",
    idea: "Halaman LinkBio untuk mengumpulkan semua tautan penting",
  },
];

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatBriefName(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Link Bio/gi, "LinkBio")
    .replace(/\s+/g, " ")
    .trim();
}

function newIntake(): ProjectIntake {
  return { idea: "", categoryId: "lms", audience: ["teacher"], featureIds: [] };
}

export function BuilderPage() {
  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<ProjectIntake>(newIntake);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    whatsapp: "",
    organization: "",
  });
  const navigate = useNavigate();
  const generateBrief = useActionMutation("generate-project-brief");
  const startPrototype = useActionMutation("start-prototype-trial");
  const submitConsultation = useActionMutation("submit-consultation");
  const category = getCategory(intake.categoryId);
  const selectedFeatures = useMemo(() => getSelectedFeatures(intake), [intake]);

  useEffect(() => {
    // The public page is server-rendered while the agent-native client bundle
    // hydrates. Preserve text entered during that short window.
    const ideaElement = document.getElementById(
      "rakitapp-builder-idea",
    ) as HTMLTextAreaElement | null;
    if (ideaElement?.value && !intake.idea) {
      updateIntake({ idea: ideaElement.value });
    }
  }, []);

  function updateIntake(patch: Partial<ProjectIntake>) {
    setIntake((current) => ({ ...current, ...patch }));
  }

  function toggleAudience(id: AudienceId) {
    setIntake((current) => {
      const audience = current.audience.includes(id)
        ? current.audience.filter((selected) => selected !== id)
        : [...current.audience, id];
      return { ...current, audience: audience as AudienceId[] };
    });
  }

  function toggleFeature(id: string) {
    updateIntake({
      featureIds: intake.featureIds.includes(id)
        ? intake.featureIds.filter((featureId) => featureId !== id)
        : [...intake.featureIds, id],
    });
  }

  function next() {
    const idea =
      intake.idea ||
      (
        document.getElementById(
          "rakitapp-builder-idea",
        ) as HTMLTextAreaElement | null
      )?.value ||
      "";
    if (step === 0 && idea.trim().length < 3) return;
    if (idea !== intake.idea) updateIntake({ idea });
    if (step === 2 && intake.audience.length === 0) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function createBrief() {
    generateBrief.mutate(intake, { onSuccess: (result) => setBrief(result) });
  }

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitConsultation.mutate(
      { ...contact, intake },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  function tryPrototype() {
    startPrototype.mutate(
      { intake },
      {
        onSuccess: (result) => navigate(`/prototype/${result.trialToken}`),
      },
    );
  }

  if (submitted) return <SubmittedPage />;
  if (brief) {
    return (
      <BriefPage
        brief={brief}
        contact={contact}
        setContact={setContact}
        onSubmit={submitLead}
        submitting={submitConsultation.isPending}
        onTryPrototype={tryPrototype}
        startingPrototype={startPrototype.isPending}
        onEdit={() => setBrief(null)}
      />
    );
  }

  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="public-neon-link text-sm font-semibold">
            ← RakitApp
          </Link>
          <span className="public-neon-muted text-sm">
            {step + 1} / {steps.length}
          </span>
        </header>
        <div className="mt-8 grid grid-cols-4 gap-2">
          {steps.map((label, index) => (
            <div key={label}>
              <div
                className={`h-1.5 rounded-full ${index <= step ? "bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.65)]" : "bg-slate-700/70"}`}
              />
              <p
                className={`public-neon-muted mt-2 hidden text-xs sm:block ${index === step ? "font-semibold text-white" : ""}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          {step === 0 ? (
            <StepFrame
              eyebrow="Mulai dari ide"
              title="Aplikasi apa yang ingin Anda buat?"
              description="Tuliskan gambaran singkatnya. Tidak perlu memakai istilah teknis."
            >
              <textarea
                id="rakitapp-builder-idea"
                autoFocus
                value={intake.idea}
                onChange={(event) => updateIntake({ idea: event.target.value })}
                placeholder="Contoh: aplikasi kuis untuk siswa SMK dengan bank soal dan dashboard guru"
                className="public-neon-input min-h-40 w-full resize-none rounded-2xl p-4 text-base leading-7 outline-none ring-offset-background"
                maxLength={400}
              />
              <p className="public-neon-muted mt-2 text-right text-xs">
                {intake.idea.length}/400
              </p>
              <div className="mt-6">
                <p className="public-neon-muted flex items-center gap-2 text-sm">
                  <IconSparkles className="size-4 text-cyan-300" />
                  Atau mulai dari contoh
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {IDEA_EXAMPLES.map((example) => (
                    <button
                      type="button"
                      key={example.label}
                      onClick={() => updateIntake({ idea: example.idea })}
                      aria-pressed={intake.idea === example.idea}
                      data-selected={intake.idea === example.idea}
                      className="public-neon-option public-neon-option-cyan inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
                    >
                      <IconSparkles className="size-3.5 text-cyan-300" />
                      {example.label}
                    </button>
                  ))}
                </div>
                <p className="public-neon-muted mt-3 text-xs">
                  Pilih contoh untuk mengisi textarea, lalu Anda bisa
                  menyesuaikannya.
                </p>
              </div>
            </StepFrame>
          ) : null}
          {step === 1 ? (
            <StepFrame
              eyebrow="Pilih arah"
              title="Jenis aplikasi yang paling dekat?"
              description="Pilihan ini membantu kami menampilkan fitur yang relevan."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORY_IDS.map((categoryId) => {
                  const item = CATEGORY_CATALOG[categoryId];
                  const selected = intake.categoryId === categoryId;
                  return (
                    <button
                      type="button"
                      key={categoryId}
                      onClick={() =>
                        updateIntake({ categoryId, featureIds: [] })
                      }
                      data-selected={selected}
                      className={`public-neon-option public-neon-option-${categoryAccent[categoryId]} rounded-2xl border p-5 text-left`}
                    >
                      <span className="flex items-center justify-between gap-3 font-semibold">
                        {item.label}
                        {selected ? (
                          <IconCheck className="size-5 text-cyan-300" />
                        ) : null}
                      </span>
                      <span className="public-neon-muted mt-2 block text-sm leading-6">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepFrame>
          ) : null}
          {step === 2 ? (
            <StepFrame
              eyebrow="Kenali pengguna"
              title="Siapa yang akan memakai aplikasi ini?"
              description="Pilih satu atau beberapa peran pengguna."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {AUDIENCE_OPTIONS.map((option) => {
                  const selected = intake.audience.includes(option.id);
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => toggleAudience(option.id)}
                      data-selected={selected}
                      className="public-neon-option public-neon-option-cyan flex items-center justify-between rounded-2xl border p-5 text-left font-medium"
                    >
                      {option.label}
                      {selected ? (
                        <IconCheck className="size-5 text-cyan-300" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </StepFrame>
          ) : null}
          {step === 3 ? (
            <StepFrame
              eyebrow={category.label}
              title="Fitur apa yang dibutuhkan?"
              description="Pilih fitur yang ingin masuk ke rancangan awal."
            >
              <div className="grid gap-3">
                {category.features.map((feature) => {
                  const selected = intake.featureIds.includes(feature.id);
                  return (
                    <button
                      type="button"
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      data-selected={selected}
                      className="public-neon-option public-neon-option-cyan flex items-start gap-4 rounded-2xl border p-4 text-left"
                    >
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${selected ? "border-cyan-300 bg-cyan-400 text-slate-950" : "border-slate-500"}`}
                      >
                        {selected ? <IconCheck className="size-3.5" /> : null}
                      </span>
                      <span>
                        <span className="font-medium text-slate-100">
                          {feature.label}
                        </span>
                        <span className="public-neon-muted mt-1 block text-sm leading-6">
                          {feature.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="public-neon-muted mt-4 text-sm">
                {selectedFeatures.length} fitur dipilih.
              </p>
            </StepFrame>
          ) : null}
        </section>

        <footer className="mt-8 flex items-center justify-between border-t border-slate-700/60 pt-5">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="public-neon-muted inline-flex items-center gap-2 text-sm font-medium disabled:invisible"
          >
            <IconArrowLeft className="size-4" /> Kembali
          </button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              className="public-neon-button rounded-xl px-5"
            >
              Lanjut <IconArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={createBrief}
              disabled={generateBrief.isPending}
              className="public-neon-button rounded-xl px-5"
            >
              {generateBrief.isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconSparkles className="size-4" />
              )}
              {generateBrief.isPending ? "Menyusun..." : "Lihat rancangan"}
            </Button>
          )}
        </footer>
      </div>
    </main>
  );
}

function StepFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-cyan-300">{eyebrow}</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="public-neon-copy mt-4 max-w-xl text-base leading-7">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function BriefPage({
  brief,
  contact,
  setContact,
  onSubmit,
  submitting,
  onTryPrototype,
  startingPrototype,
  onEdit,
}: {
  brief: ProjectBrief;
  contact: {
    name: string;
    email: string;
    whatsapp: string;
    organization: string;
  };
  setContact: (value: {
    name: string;
    email: string;
    whatsapp: string;
    organization: string;
  }) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  onTryPrototype: () => void;
  startingPrototype: boolean;
  onEdit: () => void;
}) {
  const [consultationOpen, setConsultationOpen] = useState(false);
  const packageDetails = getPackageDetails(brief.categoryId === "personal-web");
  const whatsappMessage = encodeURIComponent(
    [
      "Halo RakitApp, saya ingin konsultasi rancangan aplikasi.",
      "Nama sementara: " + formatBriefName(brief.temporaryName),
      "Jenis aplikasi: " + brief.categoryLabel,
      "Estimasi: " +
        formatCurrency(brief.estimate.priceMin) +
        " - " +
        formatCurrency(brief.estimate.priceMax),
    ].join("\n"),
  );
  const whatsappHref = "https://wa.me/?text=" + whatsappMessage;

  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="public-neon-link text-sm font-semibold">
            ← RakitApp
          </Link>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-xs font-medium text-cyan-100">
            Rancangan siap ditinjau
          </span>
        </header>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <section className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Rancangan aplikasi Anda
            </p>
            <h1 className="mt-3 max-w-3xl break-words text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {formatBriefName(brief.temporaryName)}
            </h1>
            <p className="public-neon-copy mt-5 max-w-3xl text-lg leading-8">
              {brief.idea}
            </p>
            <Card className="public-glass-panel mt-8 rounded-3xl">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-xl">Ringkasan kebutuhan</CardTitle>
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Brief awal
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <SummaryItem
                  label="Jenis aplikasi"
                  value={brief.categoryLabel}
                />
                <SummaryItem
                  label="Pengguna"
                  value={brief.audienceLabels.join(", ")}
                />
                <div className="sm:col-span-2">
                  <p className="public-neon-muted text-sm">Fitur terpilih</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {brief.features.map((feature) => (
                      <span
                        key={feature.id}
                        className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100"
                      >
                        {feature.label}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <BriefPreview brief={brief} />
            <button
              type="button"
              onClick={onEdit}
              className="public-neon-muted mt-5 text-sm font-medium underline underline-offset-4 hover:text-white"
            >
              ← Ubah rancangan
            </button>
          </section>
          <aside className="lg:sticky lg:top-8">
            <Card className="public-neon-estimate rounded-3xl text-white">
              <CardContent className="p-6 sm:p-7">
                <p className="public-neon-muted text-sm">Estimasi indikatif</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatCurrency(brief.estimate.priceMin)}
                  <span className="text-cyan-200"> – </span>
                  {formatCurrency(brief.estimate.priceMax)}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                  <div>
                    <span className="public-neon-muted block">
                      Kompleksitas
                    </span>
                    <span className="mt-1 block capitalize font-medium">
                      {brief.estimate.complexity}
                    </span>
                  </div>
                  <div>
                    <span className="public-neon-muted block">Durasi</span>
                    <span className="mt-1 block font-medium">
                      {brief.estimate.daysMin}–{brief.estimate.daysMax} hari
                    </span>
                  </div>
                </div>
                <p className="public-neon-muted mt-5 text-xs leading-5">
                  Kisaran awal untuk scope MVP. Harga final dibahas bersama tim
                  setelah kebutuhan dikonfirmasi.
                </p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-cyan-100">
                    Paket awal biasanya mencakup
                  </p>
                  <ul className="mt-3 space-y-2">
                    {packageDetails.includes.map((item) => (
                      <li
                        key={item}
                        className="public-neon-muted flex gap-2 text-xs leading-5"
                      >
                        <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[0.7rem] leading-5 text-slate-500">
                    {packageDetails.note}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-5 rounded-3xl border border-cyan-300/30 bg-cyan-400/10 text-white shadow-[0_0_34px_rgba(34,211,238,0.12)]">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-cyan-100">
                  Langkah berikutnya
                </p>
                <p className="public-neon-muted mt-2 text-sm leading-6">
                  Tim RakitApp dapat membuat versi awal yang bisa dicoba dari
                  brief ini.
                </p>
                <Button
                  type="button"
                  onClick={onTryPrototype}
                  disabled={startingPrototype}
                  className="public-neon-button mt-4 h-11 w-full rounded-xl"
                >
                  {startingPrototype ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconSparkles className="size-4" />
                  )}
                  {startingPrototype
                    ? "Menyiapkan prototype..."
                    : "Buatkan prototype awal"}
                </Button>
                <p className="mt-2 text-[0.7rem] leading-5 text-slate-500">
                  Masa coba dimulai setelah tim mengaktifkan prototype: 8 jam
                  untuk aplikasi personal atau 24 jam untuk aplikasi sekolah.
                </p>
              </CardContent>
            </Card>
            <Button
              type="button"
              onClick={() => setConsultationOpen(true)}
              className="public-neon-button mt-5 h-11 w-full rounded-xl"
            >
              Konsultasikan rancangan
            </Button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200/60 hover:bg-emerald-400/20"
            >
              <IconBrandWhatsapp className="size-4" />
              Siapkan pesan WhatsApp
            </a>
            <p className="public-neon-muted mt-2 text-center text-[0.7rem] leading-5">
              Pesan berisi ringkasan rancangan dan estimasi awal.
            </p>
          </aside>
        </div>
        <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
          <DialogContent className="public-glass-panel border-cyan-300/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                Konsultasikan rancangan
              </DialogTitle>
              <DialogDescription className="public-neon-muted">
                Isi data berikut agar tim RakitApp dapat menindaklanjuti ide
                aplikasi Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-4">
              <p className="public-neon-muted text-sm">Estimasi biaya</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {formatCurrency(brief.estimate.priceMin)}
                <span className="text-cyan-200"> – </span>
                {formatCurrency(brief.estimate.priceMax)}
              </p>
              <p className="public-neon-muted mt-2 text-xs leading-5">
                Kisaran awal untuk scope rancangan ini. Harga final dibahas saat
                konsultasi.
              </p>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
              <label className="relative block">
                <input
                  required
                  value={contact.name}
                  onChange={(event) =>
                    setContact({ ...contact, name: event.target.value })
                  }
                  placeholder=" "
                  className="public-neon-input peer h-12 w-full rounded-xl px-3 pb-1 pt-5 text-sm outline-none"
                />
                <span className="pointer-events-none absolute start-3 top-2 text-xs text-cyan-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500">
                  Nama Anda
                </span>
              </label>
              <label className="relative block">
                <input
                  required
                  type="email"
                  value={contact.email}
                  onChange={(event) =>
                    setContact({ ...contact, email: event.target.value })
                  }
                  placeholder=" "
                  className="public-neon-input peer h-12 w-full rounded-xl px-3 pb-1 pt-5 text-sm outline-none"
                />
                <span className="pointer-events-none absolute start-3 top-2 text-xs text-cyan-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500">
                  Email
                </span>
              </label>
              <label className="relative block">
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={contact.whatsapp}
                  onChange={(event) =>
                    setContact({ ...contact, whatsapp: event.target.value })
                  }
                  placeholder=" "
                  className="public-neon-input peer h-12 w-full rounded-xl px-3 pb-1 pt-5 text-sm outline-none"
                />
                <span className="pointer-events-none absolute start-3 top-2 text-xs text-cyan-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500">
                  Nomor WhatsApp
                </span>
              </label>
              <label className="relative block">
                <input
                  required
                  value={contact.organization}
                  onChange={(event) =>
                    setContact({
                      ...contact,
                      organization: event.target.value,
                    })
                  }
                  placeholder=" "
                  className="public-neon-input peer h-12 w-full rounded-xl px-3 pb-1 pt-5 text-sm outline-none"
                />
                <span className="pointer-events-none absolute start-3 top-2 text-xs text-cyan-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500">
                  Sekolah atau organisasi
                </span>
              </label>
              <Button
                type="submit"
                className="public-neon-button mt-1 h-11 rounded-xl"
                disabled={submitting}
              >
                {submitting ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : null}
                {submitting ? "Mengirim..." : "Kirim untuk konsultasi"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

function SubmittedPage() {
  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <Card className="public-glass-panel w-full rounded-3xl">
          <CardContent className="p-8 text-center sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-300/40 bg-emerald-400/15 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.2)]">
              <IconCircleCheck className="size-8" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              Brief Anda sudah diterima
            </h1>
            <p className="public-neon-copy mt-4 leading-7">
              Terima kasih. Tim RakitApp akan meninjau rancangan Anda dan
              menghubungi melalui email untuk konsultasi berikutnya.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex text-sm font-semibold text-cyan-200 underline underline-offset-4 hover:text-white"
            >
              Kembali ke beranda
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="public-neon-muted text-sm">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}

function BriefPreview({ brief }: { brief: ProjectBrief }) {
  const previewFeatures = brief.features.slice(0, 4);

  return (
    <Card className="public-glass-panel mt-6 overflow-hidden rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="public-neon-muted text-xs uppercase tracking-[0.18em]">
              Gambaran awal
            </p>
            <CardTitle className="mt-2 text-xl">Preview rancangan</CardTitle>
          </div>
          <span className="text-xs text-slate-500">Konsep layar utama</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-300/80" />
              <span className="size-2 rounded-full bg-amber-300/80" />
              <span className="size-2 rounded-full bg-emerald-300/80" />
            </div>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[0.65rem] text-slate-500">
              RakitApp preview
            </span>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(170px,0.9fr)] sm:items-center">
            <div>
              <p className="text-xs font-medium text-cyan-300">
                {brief.categoryLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {formatBriefName(brief.temporaryName)}
              </p>
              <p className="public-neon-muted mt-2 text-sm leading-6">
                {brief.idea}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewFeatures.map((feature) => (
                  <span
                    key={feature.id}
                    className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-100"
                  >
                    {feature.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-cyan-400/10 via-violet-400/10 to-pink-400/10 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progress konsep</span>
                <span className="text-cyan-200">MVP</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3">
                  <p className="text-lg font-semibold text-white">
                    {brief.features.length}
                  </p>
                  <p className="mt-1 text-[0.65rem] text-slate-500">fitur</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3">
                  <p className="text-lg font-semibold text-white">
                    {brief.audience.length}
                  </p>
                  <p className="mt-1 text-[0.65rem] text-slate-500">peran</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="public-neon-muted mt-3 text-xs leading-5">
          Preview ini membantu memvisualisasikan arah aplikasi sebelum tim mulai
          membuat prototype live.
        </p>
      </CardContent>
    </Card>
  );
}
