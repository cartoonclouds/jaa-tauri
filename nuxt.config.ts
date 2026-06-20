import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

import applyFlowPrimeVueTheme from "./src/themes/applyflow";

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

const appName = process.env.APP_NAME ?? "ApplyFlow";
const appEnv = process.env.APP_ENV ?? "development";
const appDevMode = readBoolean(process.env.APP_DEV_MODE, true);
const appLogLevel = process.env.APP_LOG_LEVEL ?? "info";
const appDatabaseDriver = process.env.APP_DATABASE_DRIVER ?? "sqlite";
const appDatabaseName = process.env.APP_DATABASE_NAME ?? "applyflow.db";
const configuredDatabaseUrl = process.env.APP_DATABASE_URL?.trim();
const appSemanticEmbeddingProvider =
  process.env.APP_SEMANTIC_EMBEDDING_PROVIDER ?? "ollama";
const appSemanticEmbeddingModel =
  process.env.APP_SEMANTIC_EMBEDDING_MODEL ?? "bge-small-en";
const appSemanticEmbeddingDimensions = Number(
  process.env.APP_SEMANTIC_EMBEDDING_DIMENSIONS ?? "384",
);
const appSemanticEmbeddingBaseUrl =
  process.env.APP_SEMANTIC_EMBEDDING_BASE_URL ?? "http://127.0.0.1:11434";
const appSemanticEmbeddingApiKey =
  process.env.APP_SEMANTIC_EMBEDDING_API_KEY ?? "";
const appSemanticEnableSqliteVec = readBoolean(
  process.env.APP_SEMANTIC_ENABLE_SQLITE_VEC,
  true,
);
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

  app: {
    head: {
      title: appName,
      htmlAttrs: {
        lang: "en",
      },
    },
  },

  css: ["~/assets/css/tailwind.css"],

  alias: {
    "@modules": resolve(rootDir, "./src/modules"),
    "@modules/insights": resolve(rootDir, "./src/modules/insights"),
    "@shared": resolve(rootDir, "./src/shared"),
    "@infra": resolve(rootDir, "./src/infrastructure"),
    "@testUtils": resolve(rootDir, "./tests/unit/shared/utils"),
  },

  imports: {
    dirs: [
      "modules/**/application/actions",
      "modules/**/application/services",
      "modules/**/composables",
      "modules/**/stores",
      "services/**",
    ],
  },

  components: {
    dirs: [
      {
        path: "~/components/global",
        global: true,
      },
      {
        path: "~/components/ui",
        pathPrefix: false,
      },
      "~/components",
      {
        path: "~/modules",
        pattern: "**/presentation/components/**/*.vue",
        pathPrefix: false,
      },
    ],
    generateMetadata: true,
  },

  modules: [
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
          theme: applyFlowPrimeVueTheme,
        },
      },
    ],
    [
      "@vee-validate/nuxt",
      {
        componentNames: {
          Form: "VeeForm",
          Field: "VeeField",
          FieldArray: "VeeFieldArray",
          ErrorMessage: "VeeErrorMessage",
        },
      },
    ],
  ],

  sourcemap: {
    client: false,
    server: false,
  },

  build: {
    analyze: true,
  },

  hints: {
    features: {
      lazyLoad: false,
      hydration: true,
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        "img-src": [
          "'self'",
          "data:",
          "https://tile.openstreetmap.org",
          "https://a.tile.openstreetmap.org",
          "https://b.tile.openstreetmap.org",
          "https://c.tile.openstreetmap.org",
        ],
      },
    },
  },

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
      appSemanticEmbeddingProvider,
      appSemanticEmbeddingModel,
      appSemanticEmbeddingDimensions,
      appSemanticEmbeddingBaseUrl,
      appSemanticEmbeddingApiKey,
      appSemanticEnableSqliteVec,
    },
  },

  compatibilityDate: "2026-05-17",

  vite: {
    plugins: [
      tailwindcss(),
      // Suppress third-party plugin warnings that cannot be fixed upstream.
      // Applied to both client and SSR server Vite builds.
      {
        name: "suppress-upstream-build-warnings",
        configResolved(config) {
          if (!config.logger?.warn) {
            return;
          }
          const originalWarn = config.logger.warn.bind(config.logger);
          config.logger.warn = (msg, options) => {
            if (
              typeof msg === "string" &&
              msg.includes("Sourcemap is likely to be incorrect")
            ) {
              return;
            }
            originalWarn(msg, options);
          };
        },
      },
    ],
    clearScreen: false,
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress invalid #__PURE__ annotation warnings from @vueuse/core (upstream issue)
          if (warning.code === "INVALID_ANNOTATION") {
            return;
          }
          // Suppress sourcemap warnings from third-party Vite/Nuxt plugins that don't
          // provide sourcemaps for their transformations (@tailwindcss/vite, nuxt:module-preload-polyfill)
          if (
            warning.code === "SOURCEMAP_ERROR" ||
            (warning.message?.includes("Sourcemap is likely to be incorrect") &&
              warning.plugin !== undefined)
          ) {
            return;
          }
          // Suppress the Rollup "dynamic import will not move module into another chunk"
          // warning for Tauri modules – appLogger.ts uses dynamic imports for SSR safety,
          // which is intentional even though the modules are statically imported elsewhere.
          if (
            warning.message?.includes("dynamically imported") &&
            warning.message?.includes("@tauri-apps/")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    optimizeDeps: {
      include: [
        "quill",
        "quill-delta",
        "@tauri-apps/api/core",
        "@tauri-apps/api/dpi",
        "@tauri-apps/api/menu",
        "@tauri-apps/plugin-dialog",
        "@vue/devtools-core",
        "@vue/devtools-kit",
      ],
    },
    server: {
      forwardConsole: {
        unhandledErrors: true,
        logLevels: ["error", "warn", "info", "log", "debug"],
      },
    },
  },

  logLevel: appLogLevel as "silent" | "info" | "verbose",

  typescript: {
    strict: true,
  },

  experimental: {
    typedPages: true,
    restoreState: true,
    viewTransition: true,
  },
});
