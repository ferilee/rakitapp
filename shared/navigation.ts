export const RAKITAPP_NAVIGATION_VIEWS = [
  "builder",
  "admin",
  "admin-catalog",
  "lead",
  "agent",
  "settings",
] as const;

export type RakitAppNavigationView = (typeof RAKITAPP_NAVIGATION_VIEWS)[number];

export function rakitAppRoutePath(options: {
  view?: RakitAppNavigationView;
  leadId?: string;
}) {
  if (options.view === "builder") return "/build";
  if (
    options.view === "admin" ||
    options.view === "admin-catalog" ||
    options.view === "lead"
  ) {
    if (options.view === "admin-catalog") return "/admin?section=catalog";
    return options.leadId
      ? `/admin?leadId=${encodeURIComponent(options.leadId)}`
      : "/admin";
  }
  if (options.view === "agent") return "/chat";
  if (options.view === "settings") return "/settings";
  return null;
}
