/// <reference types="vitest" />

import { defineVitestConfig } from "@nuxt/test-utils/config";
import { resolve } from "node:path";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",

    globals: true,

    setupFiles: ["./tests/setup.ts"],

    coverage: {
      provider: "v8",

      reporter: ["text", "html", "json-summary", "cobertura"],

      reportsDirectory: "./coverage",

      exclude: ["src-tauri/", ".nuxt/", "tests/"],
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@infra": resolve(__dirname, "./src/infrastructure"),
    },
  },
});
