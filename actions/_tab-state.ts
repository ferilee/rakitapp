import {
  readAppState,
  writeAppState,
} from "@agent-native/core/application-state";
import { getRequestRunContext } from "@agent-native/core/server/request-context";

import {
  appStateKeyForBrowserTab,
  normalizeBrowserTabId,
} from "../shared/app-state-tabs.js";

function currentBrowserTabId() {
  return normalizeBrowserTabId(getRequestRunContext()?.browserTabId);
}

export function appStateKeyForCurrentTab(key: string) {
  return appStateKeyForBrowserTab(key, currentBrowserTabId());
}

export async function readAppStateForCurrentTab(
  key: string,
  options?: { fallbackToGlobal?: boolean },
) {
  const tabKey = appStateKeyForCurrentTab(key);
  if (tabKey !== key) {
    const scoped = await readAppState(tabKey).catch(() => null);
    if (scoped) return scoped;
    if (options?.fallbackToGlobal === false) return null;
  }
  return readAppState(key);
}

export async function writeAppStateForCurrentTab(
  key: string,
  value: Record<string, unknown>,
) {
  await writeAppState(appStateKeyForCurrentTab(key), value);
}
