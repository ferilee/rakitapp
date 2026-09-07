import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readAppState: vi.fn(),
}));

vi.mock("@agent-native/core/application-state", () => ({
  readAppState: mocks.readAppState,
}));

import action from "./view-screen";

describe("view-screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the current RakitApp navigation state", async () => {
    mocks.readAppState.mockResolvedValue({ view: "builder" });

    const result = await action.run({});

    expect(result).toEqual({
      navigation: { view: "builder" },
    });
  });

  it("reports an empty navigation state when there is no active screen", async () => {
    mocks.readAppState.mockResolvedValue(null);

    const result = await action.run({});

    expect(result).toEqual({ navigation: null });
  });

  it("is marked read-only", () => {
    expect(action.readOnly).toBe(true);
  });
});
