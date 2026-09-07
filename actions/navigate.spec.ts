import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readAppState: vi.fn(),
  writeAppState: vi.fn(),
}));

vi.mock("@agent-native/core/application-state", () => ({
  readAppState: mocks.readAppState,
  writeAppState: mocks.writeAppState,
}));

import action from "./navigate";

describe("navigate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readAppState.mockResolvedValue({ view: "builder" });
    mocks.writeAppState.mockResolvedValue(undefined);
  });

  it("requires a valid RakitApp view", async () => {
    await expect(action.run({})).rejects.toThrow("Invalid action parameters");
    await expect(action.run({ view: "chat" })).rejects.toThrow(
      "Invalid action parameters",
    );
    expect(mocks.writeAppState).not.toHaveBeenCalled();
  });

  it("navigates to the builder and preserves the previous view", async () => {
    const result = await action.run({ view: "builder" });

    expect(result).toEqual({ path: "/build", previousView: "builder" });
    expect(mocks.writeAppState).toHaveBeenCalledWith(
      "navigate",
      expect.objectContaining({ path: "/build", view: "builder" }),
    );
  });

  it("requires a lead id for lead navigation", async () => {
    await expect(action.run({ view: "lead" })).rejects.toThrow(
      "Lead navigation requires leadId.",
    );
  });

  it("includes the lead id when opening a lead", async () => {
    const result = await action.run({ view: "lead", leadId: "lead-123" });

    expect(result).toEqual({
      path: "/admin?leadId=lead-123",
      previousView: "builder",
    });
    expect(mocks.writeAppState).toHaveBeenCalledWith(
      "navigate",
      expect.objectContaining({ view: "lead", leadId: "lead-123" }),
    );
  });

  it("stamps a unique write id on every navigation", async () => {
    await action.run({ view: "settings" });

    const callArg = mocks.writeAppState.mock.calls[0][1];
    expect(typeof callArg._writeId).toBe("string");
    expect(callArg._writeId.includes("-")).toBe(true);
  });
});
