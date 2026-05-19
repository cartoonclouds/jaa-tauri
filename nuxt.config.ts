import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

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
        },
      },
    ],
    "@vee-validate/nuxt",
  ],

  devtools: {
    enabled: true,
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
