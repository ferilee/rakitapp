import { useSearchParams } from "react-router";

import { AdminCatalogPage } from "@/pages/AdminCatalogPage";
// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { AdminLeadsPage } from "@/pages/AdminLeadsPage";
import { AdminPrototypeTrialsPage } from "@/pages/AdminPrototypeTrialsPage";

export function meta() {
  return [{ title: "Admin — RakitApp" }];
}

export default function AdminRoute() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");
  if (section === "catalog") return <AdminCatalogPage />;
  if (section === "prototypes") return <AdminPrototypeTrialsPage />;
  return <AdminLeadsPage />;
}
