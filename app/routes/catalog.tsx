import { asc, eq } from "drizzle-orm";
import { useLoaderData } from "react-router";

// i18n-raw-literal-disable-file: RakitApp MVP copy is intentionally Indonesian.
import { CatalogPage } from "@/pages/CatalogPage";

import { getDb, schema } from "../../server/db/index.js";
import { toCatalogApp } from "../../server/lib/catalog.js";
import { prioritizePersonalApps } from "../../shared/showcase.js";

export async function loader() {
  const rows = await getDb()
    .select()
    .from(schema.catalogApps)
    .where(eq(schema.catalogApps.status, "published"))
    .orderBy(asc(schema.catalogApps.sortOrder), asc(schema.catalogApps.name));
  return { apps: prioritizePersonalApps(rows.map(toCatalogApp)) };
}

export function meta() {
  return [{ title: "Katalog Aplikasi — RakitApp" }];
}

export default function CatalogRoute() {
  const { apps } = useLoaderData<typeof loader>();
  return <CatalogPage initialApps={apps} />;
}
