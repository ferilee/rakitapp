import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const actionsDirectory = path.dirname(new URL(import.meta.url).pathname);
const endpointNames = [
  "archive-catalog-app",
  "calculate-project-estimate",
  "create-catalog-app",
  "generate-project-brief",
  "get-lead",
  "get-prototype-trial",
  "get-public-activity",
  "list-catalog-apps-admin",
  "list-catalog-apps",
  "list-leads",
  "list-prototype-trials-admin",
  "recommend-catalog-app",
  "reorder-catalog-apps",
  "start-prototype-trial",
  "submit-consultation",
  "update-catalog-app",
  "update-lead",
  "update-prototype-trial",
  "upload-catalog-cover",
] as const;

const publicGetActions = new Set([
  "get-prototype-trial",
  "get-public-activity",
  "list-catalog-apps",
]);

const protectedGetActions = new Set([
  "get-lead",
  "list-catalog-apps-admin",
  "list-leads",
  "list-prototype-trials-admin",
]);

const publicReadOnlyPostActions = new Set([
  "calculate-project-estimate",
  "generate-project-brief",
]);

const publicPostActions = new Set([
  "start-prototype-trial",
  "submit-consultation",
]);

const protectedReadOnlyPostActions = new Set(["recommend-catalog-app"]);

function sourceFor(name: string) {
  return fs.readFileSync(path.join(actionsDirectory, `${name}.ts`), "utf8");
}

function hasProperty(source: string, property: string, value: string) {
  return new RegExp(`${property}\\s*:\\s*${value}`).test(source);
}

describe("RakitApp HTTP endpoint declarations", () => {
  it("keeps every backend action mounted and intentional agent-only actions excluded", () => {
    for (const name of endpointNames) {
      const source = sourceFor(name);
      expect(source, name).toContain("defineAction({");
      expect(source, name).not.toContain("http: false");
    }
    expect(sourceFor("navigate")).toContain("http: false");
    expect(sourceFor("view-screen")).toContain("http: false");
  });

  it("keeps public and operator GET endpoint boundaries explicit", () => {
    for (const name of publicGetActions) {
      const source = sourceFor(name);
      expect(source, name).toMatch(/http:\s*\{\s*method:\s*"GET"/s);
      expect(hasProperty(source, "requiresAuth", "false"), name).toBe(true);
      expect(hasProperty(source, "readOnly", "true"), name).toBe(true);
    }
    for (const name of protectedGetActions) {
      const source = sourceFor(name);
      expect(source, name).toMatch(/http:\s*\{\s*method:\s*"GET"/s);
      expect(hasProperty(source, "requiresAuth", "true"), name).toBe(true);
      expect(hasProperty(source, "readOnly", "true"), name).toBe(true);
    }
  });

  it("keeps mutating endpoints protected or explicitly public", () => {
    for (const name of endpointNames) {
      if (publicGetActions.has(name) || protectedGetActions.has(name)) continue;
      if (publicReadOnlyPostActions.has(name)) {
        expect(sourceFor(name), name).toMatch(/readOnly:\s*true/);
        continue;
      }
      if (publicPostActions.has(name)) {
        expect(sourceFor(name), name).toMatch(/requiresAuth:\s*false/);
        continue;
      }
      if (protectedReadOnlyPostActions.has(name)) {
        expect(sourceFor(name), name).toMatch(/readOnly:\s*true/);
        continue;
      }
      const source = sourceFor(name);
      expect(source, name).not.toContain("http: false");
      expect(source, name).not.toMatch(/http:\s*\{\s*method:\s*"GET"/s);
      expect(source, name).not.toMatch(/requiresAuth:\s*false/);
      expect(source, name).not.toMatch(/readOnly:\s*true/);
    }
  });
});
