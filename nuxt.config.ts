import { defineNuxtConfig } from "nuxt/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineNuxtConfig({
  srcDir: "src/",

  css: ["primeicons/primeicons.css", "~/assets/css/tailwind.css"],

  alias: {
    "@shared": resolve(rootDir, "./src/shared"),
    "@modules": resolve(rootDir, "./src/modules"),
    "@infra": resolve(rootDir, "./src/infrastructure"),
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
    "nuxt-typed-router",
  ],

  devtools: {
    enabled: true,
  },

  compatibilityDate: "2026-05-17",

  vite: {
    plugins: [tailwindcss()],
    clearScreen: false,
    server: {
      strictPort: true,
    },
  },
});
