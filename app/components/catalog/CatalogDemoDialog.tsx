import type { ShowcaseApp } from "@shared/showcase";
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconCircleCheck,
  IconExternalLink,
  IconSearch,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DemoTone = ShowcaseApp["accent"];

const toneClasses: Record<
  DemoTone,
  { border: string; glow: string; accent: string; soft: string }
> = {
  cyan: {
    border: "border-cyan-300/30",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.12)]",
    accent: "text-cyan-200",
    soft: "bg-cyan-400/10",
  },
  violet: {
    border: "border-violet-300/30",
    glow: "shadow-[0_0_40px_rgba(167,139,250,0.12)]",
    accent: "text-violet-200",
    soft: "bg-violet-400/10",
  },
  orange: {
    border: "border-orange-300/30",
    glow: "shadow-[0_0_40px_rgba(251,146,60,0.12)]",
    accent: "text-orange-200",
    soft: "bg-orange-400/10",
  },
  emerald: {
    border: "border-emerald-300/30",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.12)]",
    accent: "text-emerald-200",
    soft: "bg-emerald-400/10",
  },
  pink: {
    border: "border-pink-300/30",
    glow: "shadow-[0_0_40px_rgba(244,114,182,0.12)]",
    accent: "text-pink-200",
    soft: "bg-pink-400/10",
  },
  blue: {
    border: "border-blue-300/30",
    glow: "shadow-[0_0_40px_rgba(96,165,250,0.12)]",
    accent: "text-blue-200",
    soft: "bg-blue-400/10",
  },
};

const controlClass =
  "rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-300/50";

export function CatalogDemoDialog({
  app,
  onOpenChange,
}: {
  app: ShowcaseApp | null;
  onOpenChange: (open: boolean) => void;
}) {
  const tone = app ? toneClasses[app.accent] : toneClasses.cyan;

  return (
    <Dialog open={app !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-5xl border-cyan-300/25 bg-slate-950/95 p-0 ${tone.glow}`}
      >
        {app ? (
          <>
            <DialogHeader className="border-b border-slate-800/90 p-6 pr-14 sm:p-7 sm:pr-16">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone.accent}`}
              >
                Live demo · {app.category}
              </p>
              <DialogTitle className="mt-2 text-2xl text-white sm:text-3xl">
                {app.name}
              </DialogTitle>
              <DialogDescription className="max-w-2xl">
                Coba alur singkatnya di sini. Ini adalah preview interaktif
                untuk membantu Anda membayangkan versi yang akan dirakit.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 sm:p-7">
              <DemoPreview app={app} tone={tone} />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-800/90 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-xs leading-5 text-slate-500">
                Data demo bersifat sementara dan tidak tersimpan.
              </p>
              <Link
                to="/build"
                className="public-neon-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                Rakit versi Anda <IconArrowRight className="size-4" />
              </Link>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DemoPreview({
  app,
  tone,
}: {
  app: ShowcaseApp;
  tone: (typeof toneClasses)[DemoTone];
}) {
  const [frameFailed, setFrameFailed] = useState(false);

  useEffect(() => {
    setFrameFailed(false);
  }, [app.demoUrl]);

  if (app.demoUrl) {
    return (
      <div className="space-y-3">
        {frameFailed ? (
          <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-2xl border border-orange-300/25 bg-orange-400/10 p-8 text-center">
            <IconExternalLink className="size-8 text-orange-200" />
            <p className="mt-4 text-lg font-semibold text-white">
              Preview belum bisa ditampilkan di dalam modal.
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              Website demo mungkin membatasi tampilan dalam frame. Buka demo di
              tab baru untuk mencoba aplikasi secara penuh.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950">
            <iframe
              src={app.demoUrl}
              title={`Demo live ${app.name}`}
              className="h-[32rem] w-full bg-white"
              loading="lazy"
              onError={() => setFrameFailed(true)}
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
        )}
        <a
          href={app.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100"
        >
          Buka demo di tab baru <IconExternalLink className="size-4" />
        </a>
      </div>
    );
  }

  let content: ReactNode;

  switch (app.id) {
    case "smartclass":
      content = <SmartClassDemo tone={tone} />;
      break;
    case "quizlab":
      content = <QuizLabDemo tone={tone} />;
      break;
    case "presensikita":
      content = <PresensiDemo tone={tone} />;
      break;
    case "asesmen-insight":
      content = <AssessmentDemo tone={tone} />;
      break;
    case "perpus-sekolah":
      content = <LibraryDemo tone={tone} />;
      break;
    case "tefa-tracker":
      content = <TeachingFactoryDemo tone={tone} />;
      break;
    case "portofolio-pribadi":
      content = <PortfolioDemo tone={tone} />;
      break;
    case "rumah-pribadi":
      content = <ProfileDemo tone={tone} />;
      break;
    case "blog-ceritakita":
      content = <BlogDemo tone={tone} />;
      break;
    case "linkbio-pribadi":
      content = <LinkBioDemo tone={tone} />;
      break;
    default:
      content = <GenericDemo app={app} tone={tone} />;
  }

  return (
    <DemoFrame app={app} tone={tone}>
      {content}
    </DemoFrame>
  );
}

function DemoFrame({
  app,
  tone,
  children,
}: {
  app: ShowcaseApp;
  tone: (typeof toneClasses)[DemoTone];
  children: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-slate-900/70 ${tone.border}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-800/90 bg-slate-950/75 px-4 py-3">
        <span className="size-2 rounded-full bg-pink-400/80" />
        <span className="size-2 rounded-full bg-orange-300/80" />
        <span className="size-2 rounded-full bg-emerald-300/80" />
        <div className="ml-3 flex min-w-0 flex-1 items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-500">
          <span className="truncate">demo.rakitapp.local/{app.id}</span>
        </div>
      </div>
      <div className="min-h-[23rem] p-4 sm:p-6">{children}</div>
    </div>
  );
}

function DemoHeading({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: (typeof toneClasses)[DemoTone];
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone.accent}`}
        >
          Ruang kerja demo
        </p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function DemoTabs({
  items,
  active,
  onChange,
  tone,
}: {
  items: string[];
  active: string;
  onChange: (item: string) => void;
  tone: (typeof toneClasses)[DemoTone];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => onChange(item)}
          aria-pressed={item === active}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${item === active ? `${tone.border} ${tone.soft} ${tone.accent}` : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: (typeof toneClasses)[DemoTone];
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/60 p-4 ${tone.soft}`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${tone.accent}`}>{value}</p>
    </div>
  );
}

function SmartClassDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [tab, setTab] = useState("Ringkasan");
  return (
    <div className="space-y-6">
      <DemoHeading
        title="SmartClass"
        subtitle="Kelas XI · 32 siswa"
        tone={tone}
      />
      <DemoTabs
        items={["Ringkasan", "Materi", "Tugas"]}
        active={tab}
        onChange={setTab}
        tone={tone}
      />
      {tab === "Ringkasan" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Materi selesai" value="76%" tone={tone} />
            <MetricCard label="Rata-rata kuis" value="84" tone={tone} />
            <MetricCard label="Aktif hari ini" value="28" tone={tone} />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-200">Kemajuan belajar</p>
                <IconChartBar className={`size-5 ${tone.accent}`} />
              </div>
              <div className="mt-5 flex h-28 items-end gap-2">
                {[42, 64, 52, 78, 66, 88, 76].map((height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full rounded-t-md ${tone.soft}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-medium text-slate-200">Aktivitas terbaru</p>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  "Dina menyelesaikan Kuis 3",
                  "Raka membuka Materi 5",
                  "Siti mengumpulkan tugas",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-slate-400"
                  >
                    <IconCheck className={`mt-0.5 size-4 ${tone.accent}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Pengantar materi",
            "Video pembelajaran",
            "Latihan mandiri",
            "Refleksi kelas",
          ].map((item, index) => (
            <button
              type="button"
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-cyan-300/40"
            >
              <p className="text-xs text-slate-500">Modul {index + 1}</p>
              <p className="mt-2 font-medium text-slate-200">{item}</p>
              <p className="mt-2 text-sm text-slate-400">
                Buka dan lihat materi demo.
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizLabDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const options = ["Fotosintesis", "Respirasi", "Transpirasi", "Fermentasi"];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="QuizLab"
        subtitle="Kuis Biologi · 5 soal"
        tone={tone}
      />
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full w-2/5 rounded-full ${tone.soft.replace("/10", "/70")}`}
        />
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-7">
        <p className="text-sm text-slate-500">Soal 2 dari 5</p>
        <h4 className="mt-3 text-xl font-semibold text-white">
          Proses tumbuhan membuat makanan disebut?
        </h4>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                setSelected(option);
                setSubmitted(false);
              }}
              aria-pressed={selected === option}
              className={`rounded-xl border p-3 text-left text-sm transition ${selected === option ? `${tone.border} ${tone.soft} ${tone.accent}` : "border-slate-700 text-slate-300 hover:border-slate-500"}`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Jawaban tersimpan otomatis
          </span>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!selected}
            className="public-neon-button rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Periksa jawaban
          </button>
        </div>
        {submitted ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
            <IconCircleCheck className="size-4" /> Jawaban direkam untuk preview
            ini.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PresensiDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [attendance, setAttendance] = useState([true, true, false, true]);
  const students = ["Alya", "Bima", "Citra", "Doni"];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="PresensiKita"
        subtitle="Senin, 06 September · XI RPL"
        tone={tone}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Hadir"
          value={`${attendance.filter(Boolean).length}`}
          tone={tone}
        />
        <MetricCard
          label="Belum hadir"
          value={`${attendance.filter((value) => !value).length}`}
          tone={tone}
        />
        <MetricCard label="Total siswa" value="32" tone={tone} />
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>Daftar siswa</span>
          <span>Klik status untuk mengubah</span>
        </div>
        <div className="space-y-2">
          {students.map((student, index) => (
            <button
              type="button"
              key={student}
              onClick={() =>
                setAttendance((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? !value : value,
                  ),
                )
              }
              className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-left transition hover:border-orange-300/50"
            >
              <span className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid size-7 place-items-center rounded-full bg-slate-800 text-xs">
                  {student[0]}
                </span>
                {student}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${attendance[index] ? "bg-emerald-400/15 text-emerald-300" : "bg-orange-400/15 text-orange-300"}`}
              >
                {attendance[index] ? "Hadir" : "Belum hadir"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssessmentDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [className, setClassName] = useState("Kelas X");
  const values =
    className === "Kelas X" ? [72, 86, 64, 92, 78] : [58, 70, 82, 76, 88];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="Asesmen Insight"
        subtitle="Ringkasan akademik"
        tone={tone}
      />
      <DemoTabs
        items={["Kelas X", "Kelas XI", "Kelas XII"]}
        active={className}
        onChange={setClassName}
        tone={tone}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Rata-rata nilai"
          value={`${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}`}
          tone={tone}
        />
        <MetricCard label="Siswa tuntas" value="86%" tone={tone} />
        <MetricCard label="Perlu tindak lanjut" value="5" tone={tone} />
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-200">Perbandingan kompetensi</p>
          <IconChartBar className={`size-5 ${tone.accent}`} />
        </div>
        <div className="mt-6 flex h-36 items-end gap-3">
          {values.map((value, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className={`w-full rounded-t-lg ${tone.soft.replace("/10", "/70")}`}
                style={{ height: `${value}%` }}
              />
              <span className="text-xs text-slate-500">K{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [query, setQuery] = useState("");
  const [borrowed, setBorrowed] = useState<string | null>(null);
  const books = [
    "Laskar Pelangi",
    "Belajar React",
    "Bumi Manusia",
    "Dasar Algoritma",
  ];
  const filteredBooks = useMemo(
    () =>
      books.filter((book) => book.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  return (
    <div className="space-y-6">
      <DemoHeading
        title="PerpusSekolah"
        subtitle="Koleksi perpustakaan"
        tone={tone}
      />
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari judul buku..."
          className={`${controlClass} w-full pl-9`}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredBooks.map((book, index) => (
          <div
            key={book}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <div className="flex gap-3">
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-lg ${tone.soft} ${tone.accent}`}
              >
                <span className="text-lg font-semibold">{index + 1}</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-200">{book}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Rak {index + 1} · Tersedia
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBorrowed(book)}
              className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs font-medium ${borrowed === book ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-300" : "border-slate-700 text-slate-300 hover:border-blue-300/50"}`}
            >
              {borrowed === book ? "Permintaan dicatat" : "Ajukan pinjam"}
            </button>
          </div>
        ))}
        {filteredBooks.length === 0 ? (
          <p className="text-sm text-slate-500">
            Buku tidak ditemukan di preview.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TeachingFactoryDemo({
  tone,
}: {
  tone: (typeof toneClasses)[DemoTone];
}) {
  const [done, setDone] = useState([true, false, false]);
  const tasks = [
    "Riset kebutuhan klien",
    "Buat rancangan produk",
    "Uji coba hasil",
  ];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="TeFa Tracker"
        subtitle="Proyek: Produk Kreatif"
        tone={tone}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {tasks.map((task, index) => (
          <button
            type="button"
            key={task}
            onClick={() =>
              setDone((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? !value : value,
                ),
              )
            }
            className={`rounded-xl border p-4 text-left transition ${done[index] ? `${tone.border} ${tone.soft}` : "border-slate-800 bg-slate-950/60 hover:border-slate-600"}`}
          >
            <p className="text-xs text-slate-500">Tahap {index + 1}</p>
            <p className="mt-2 text-sm font-medium text-slate-200">{task}</p>
            <span
              className={`mt-4 inline-flex items-center gap-1.5 text-xs ${done[index] ? "text-emerald-300" : "text-slate-500"}`}
            >
              {done[index] ? <IconCheck className="size-3.5" /> : null}
              {done[index] ? "Selesai" : "Belum mulai"}
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Kemajuan proyek</span>
          <span className={tone.accent}>
            {Math.round((done.filter(Boolean).length / tasks.length) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${tone.soft.replace("/10", "/70")}`}
            style={{
              width: `${(done.filter(Boolean).length / tasks.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PortfolioDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [project, setProject] = useState("LMS Sekolah");
  const projects = ["LMS Sekolah", "Brand Fotografi", "Dashboard UMKM"];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="PortofolioKu"
        subtitle="Nadia Pratama · Product Designer"
        tone={tone}
      />
      <DemoTabs
        items={projects}
        active={project}
        onChange={setProject}
        tone={tone}
      />
      <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
        <div
          className={`min-h-48 rounded-2xl border ${tone.border} ${tone.soft} p-5`}
        >
          <p className={`text-xs uppercase tracking-[0.16em] ${tone.accent}`}>
            Studi kasus
          </p>
          <h4 className="mt-3 text-2xl font-semibold text-white">{project}</h4>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Merancang pengalaman digital yang sederhana, jelas, dan mudah
            digunakan oleh tim.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-cyan-200"
          >
            Lihat studi kasus <IconExternalLink className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["Riset", "Struktur", "Visual", "Prototype"].map((item, index) => (
            <div
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div
                className={`grid size-8 place-items-center rounded-lg ${tone.soft} ${tone.accent}`}
              >
                {index + 1}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-200">{item}</p>
              <p className="mt-1 text-xs text-slate-500">Tahap proyek</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [section, setSection] = useState("Tentang");
  return (
    <div className="space-y-6 text-center">
      <div
        className={`mx-auto grid size-20 place-items-center rounded-full border ${tone.border} ${tone.soft}`}
      >
        <IconUsers className={`size-9 ${tone.accent}`} />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-white">Rina Kurnia</h3>
        <p className="mt-1 text-sm text-slate-400">
          Guru · Penulis · Pembelajar
        </p>
      </div>
      <DemoTabs
        items={["Tentang", "Karya", "Kontak"]}
        active={section}
        onChange={setSection}
        tone={tone}
      />
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-left">
        <p className="text-sm leading-7 text-slate-300">
          {section === "Tentang"
            ? "Ruang pribadi untuk berbagi pengalaman mengajar dan karya yang sedang dikerjakan."
            : section === "Karya"
              ? "12 tulisan dan 4 proyek yang pernah dibuat."
              : "Terhubung melalui email dan media sosial."}
        </p>
      </div>
    </div>
  );
}

function BlogDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [article, setArticle] = useState("Belajar pelan-pelan");
  const articles = [
    "Belajar pelan-pelan",
    "Catatan dari kelas",
    "Membuat waktu terasa cukup",
  ];
  return (
    <div className="space-y-6">
      <DemoHeading
        title="CeritaKita"
        subtitle="Catatan Raka · 12 tulisan"
        tone={tone}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {articles.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setArticle(item)}
            className={`rounded-xl border p-4 text-left transition ${article === item ? `${tone.border} ${tone.soft}` : "border-slate-800 bg-slate-950/60 hover:border-slate-600"}`}
          >
            <div className={`mb-8 h-10 rounded-lg ${tone.soft}`} />
            <p className="text-sm font-medium text-slate-200">{item}</p>
            <p className="mt-2 text-xs text-slate-500">5 menit membaca</p>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <p className={`text-xs uppercase tracking-[0.16em] ${tone.accent}`}>
          Artikel terpilih
        </p>
        <h4 className="mt-2 text-xl font-semibold text-white">{article}</h4>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Preview tulisan tampil di sini agar pembaca dapat menemukan cerita
          yang paling menarik.
        </p>
      </div>
    </div>
  );
}

function LinkBioDemo({ tone }: { tone: (typeof toneClasses)[DemoTone] }) {
  const [visited, setVisited] = useState<string | null>(null);
  const links = [
    "Karya terbaru",
    "Instagram",
    "Konsultasi proyek",
    "Newsletter mingguan",
  ];
  return (
    <div className="mx-auto max-w-sm space-y-5 text-center">
      <div
        className={`mx-auto grid size-16 place-items-center rounded-full border ${tone.border} ${tone.soft}`}
      >
        <IconSparkles className={`size-7 ${tone.accent}`} />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-white">Alya Creative</h3>
        <p className="mt-1 text-sm text-slate-400">
          Desain, cerita, dan hal-hal baik.
        </p>
      </div>
      <div className="space-y-2">
        {links.map((link) => (
          <button
            type="button"
            key={link}
            onClick={() => setVisited(link)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${visited === link ? `${tone.border} ${tone.soft} ${tone.accent}` : "border-slate-700 bg-slate-950/60 text-slate-200 hover:border-pink-300/50"}`}
          >
            <span>{link}</span>
            {visited === link ? (
              <IconCheck className="size-4" />
            ) : (
              <IconArrowRight className="size-4 text-slate-500" />
            )}
          </button>
        ))}
      </div>
      {visited ? (
        <p className="text-xs text-emerald-300">
          Tautan “{visited}” dipilih dalam preview.
        </p>
      ) : null}
    </div>
  );
}

function GenericDemo({
  app,
  tone,
}: {
  app: ShowcaseApp;
  tone: (typeof toneClasses)[DemoTone];
}) {
  return (
    <div className="space-y-6">
      <DemoHeading title={app.name} subtitle="Preview aplikasi" tone={tone} />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Pengguna aktif" value="128" tone={tone} />
        <MetricCard label="Aktivitas hari ini" value="42" tone={tone} />
        <MetricCard label="Status" value="Aktif" tone={tone} />
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="font-medium text-slate-200">Alur utama aplikasi</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {app.features.map((feature, index) => (
            <div
              key={feature}
              className="rounded-lg border border-slate-800 p-3 text-sm text-slate-400"
            >
              <span className={`mr-2 ${tone.accent}`}>{index + 1}.</span>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
