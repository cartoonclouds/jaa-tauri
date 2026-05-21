import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

function readBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const appName = process.env.APP_NAME ?? "Apply-Flow";
const appEnv = process.env.APP_ENV ?? "development";
const appDevMode = readBoolean(process.env.APP_DEV_MODE, true);
const appLogLevel = process.env.APP_LOG_LEVEL ?? "info";
const appDatabaseDriver = process.env.APP_DATABASE_DRIVER ?? "sqlite";
const appDatabaseName = process.env.APP_DATABASE_NAME ?? "applyflow.db";
const configuredDatabaseUrl = process.env.APP_DATABASE_URL?.trim();
const isInMemoryDriver = ["memory", "in-memory"].includes(
  appDatabaseDriver.toLowerCase(),
);
const appDatabaseUrl =
  configuredDatabaseUrl && configuredDatabaseUrl.length > 0
    ? configuredDatabaseUrl
    : isInMemoryDriver
      ? ":memory:"
      : `${appDatabaseDriver}:${resolve(rootDir, appDatabaseName)}`;

export default defineNuxtConfig({
  srcDir: "src/",

  css: ["~/assets/css/tailwind.css"],

  alias: {
    "@modules": resolve(rootDir, "./src/modules"),
    "@shared": resolve(rootDir, "./src/shared"),
    "@infra": resolve(rootDir, "./src/infrastructure"),
  },

  imports: {
    dirs: [
      "modules/**/application/actions",
      "modules/**/application/services",
      "modules/**/presentation/composables",
      "modules/**/stores",
      "services/**",
    ],
  },

  modules: [
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/hints",
    "nuxt-security",
    "@nuxtjs/device",
    [
      "@primevue/nuxt-module",
      {
        autoImport: true,
        options: {
          ripple: true,
          inputVariant: "filled",
        },
      },
    ],
    "@vee-validate/nuxt",
  ],

  devtools: {
    enabled: appDevMode,
  },

  runtimeConfig: {
    public: {
      appName,
      appEnv,
      appDevMode,
      appLogLevel,
      appDatabaseDriver,
      appDatabaseName,
      appDatabaseUrl,
    },
  },

  compatibilityDate: "2026-05-17",

  vite: {
    plugins: [tailwindcss()],
    clearScreen: false,
    optimizeDeps: {
      include: [
        "@tauri-apps/api/core",
        "@tauri-apps/api/dpi",
        "@tauri-apps/api/menu",
        "@tauri-apps/plugin-dialog",
        "@vue/devtools-core",
        "@vue/devtools-kit",
      ],
    },
  },

  typescript: {
    strict: true,
  },

  experimental: {
    typedPages: true,
  },
});
