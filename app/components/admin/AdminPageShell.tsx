// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import type { ReactNode } from "react";
import { Link } from "react-router";

type AdminSection = "leads" | "prototypes" | "catalog";

export function AdminPageShell({
  activeSection,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  activeSection: AdminSection;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="public-neon-page public-neon-grid min-h-full">
      <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
        <header className="border-b border-slate-700/70 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="public-neon-badge inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="public-neon-copy mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                {description}
              </p>
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-2">{actions}</div>
            ) : null}
          </div>

          <nav
            aria-label="Navigasi admin"
            className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1"
          >
            <AdminNavLink to="/admin" active={activeSection === "leads"}>
              Lead konsultasi
            </AdminNavLink>
            <AdminNavLink
              to="/admin?section=prototypes"
              active={activeSection === "prototypes"}
            >
              Prototype client
            </AdminNavLink>
            <AdminNavLink
              to="/admin?section=catalog"
              active={activeSection === "catalog"}
            >
              Kelola katalog
            </AdminNavLink>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminNavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.14)]" : "border-slate-600/70 bg-slate-900/35 text-slate-300 hover:border-slate-400/70 hover:text-white"}`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
