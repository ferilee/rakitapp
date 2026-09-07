import { useAgentRouteState } from "@agent-native/core/client/navigation";
import { rakitAppRoutePath } from "@shared/navigation";

import { TAB_ID } from "@/lib/tab-id";

interface NavigationState {
  view: string;
  leadId?: string;
}

interface NavigateCommand {
  view?: "builder" | "admin" | "admin-catalog" | "lead" | "agent" | "settings";
  leadId?: string;
  path?: string;
}

export function useNavigationState() {
  useAgentRouteState<NavigationState, NavigateCommand>({
    browserTabId: TAB_ID,
    requestSource: TAB_ID,
    getNavigationState: ({ pathname, searchParams }) => ({
      view: pathname.startsWith("/admin")
        ? searchParams.get("section") === "catalog"
          ? "admin-catalog"
          : searchParams.get("leadId")
            ? "lead"
            : "admin"
        : pathname.startsWith("/chat") || pathname.startsWith("/agent")
          ? "agent"
          : pathname.startsWith("/settings")
            ? "settings"
            : pathname.startsWith("/build")
              ? "builder"
              : "public",
      ...(searchParams.get("leadId")
        ? { leadId: searchParams.get("leadId") ?? undefined }
        : {}),
    }),
    getCommandPath: (command) => {
      if (typeof command.path === "string" && command.path.startsWith("/")) {
        return command.path;
      }
      return rakitAppRoutePath(command) ?? "/build";
    },
    navigateOptions: { flushSync: true, replace: true },
  });
}
