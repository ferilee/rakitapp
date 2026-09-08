import { useSession } from "@agent-native/core/client/hooks";
import { IconLoader2 } from "@tabler/icons-react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";

import { AdminCatalogPage } from "@/pages/AdminCatalogPage";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { AdminLeadsPage } from "@/pages/AdminLeadsPage";
import { AdminPrototypeTrialsPage } from "@/pages/AdminPrototypeTrialsPage";

export function meta() {
  return [{ title: "Admin — RakitApp" }];
}

export default function AdminRoute() {
  const { session, isLoading } = useSession();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (location.pathname === "/admin/login") return <Outlet />;

  if (isLoading) {
    return (
      <div className="public-neon-page public-neon-grid grid min-h-screen place-items-center p-6">
        <p className="flex items-center gap-2 text-sm text-cyan-100">
          <IconLoader2 className="size-4 animate-spin" /> Memeriksa akses
          admin...
        </p>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  const section = searchParams.get("section");
  if (section === "catalog") return <AdminCatalogPage />;
  if (section === "prototypes") return <AdminPrototypeTrialsPage />;
  return <AdminLeadsPage />;
}
