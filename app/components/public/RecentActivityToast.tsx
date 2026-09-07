import { useActionQuery } from "@agent-native/core/client/hooks";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { IconSparkles, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface PublicActivity {
  visible: boolean;
  recentCount: number;
  categoryLabel?: string;
  latestCreatedAt?: string;
}

export function RecentActivityToast() {
  const activityQuery = useActionQuery<PublicActivity>(
    "get-public-activity",
    {},
    { retry: false },
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!activityQuery.data?.visible) return;

    const storageKey = "rakitapp-recent-activity-toast-shown";
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // The toast remains useful when browser storage is unavailable.
    }

    setOpen(true);
    const timer = window.setTimeout(() => setOpen(false), 9000);
    return () => window.clearTimeout(timer);
  }, [activityQuery.data]);

  if (!open || !activityQuery.data?.visible) return null;

  const countLabel =
    activityQuery.data.recentCount === 1
      ? "Ada request baru"
      : `${activityQuery.data.recentCount} request baru`;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-5 sm:max-w-sm"
    >
      <div className="public-glass-panel relative flex items-start gap-3 rounded-2xl border border-cyan-300/35 bg-slate-950/95 p-4 shadow-[0_0_32px_rgba(34,211,238,0.2)] backdrop-blur-xl">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-violet-300/30 bg-violet-400/15 text-violet-200">
          <IconSparkles className="size-5" />
        </span>
        <div className="min-w-0 pr-5">
          <p className="text-sm font-semibold text-white">{countLabel}</p>
          <p className="mt-1 text-sm leading-5 text-slate-300">
            Ada yang sedang merancang {activityQuery.data.categoryLabel} bersama
            RakitApp.
          </p>
          <p className="mt-2 text-xs text-cyan-200">Aktivitas terbaru</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup aktivitas terbaru"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </aside>
  );
}
