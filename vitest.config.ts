import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    include: [
      "actions/**/*.spec.ts",
      "server/**/*.spec.ts",
      "shared/**/*.spec.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/.output/**",
    ],
    fileParallelism: false,
    restoreMocks: true,
    passWithNoTests: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
