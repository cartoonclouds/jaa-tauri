import { defineNuxtPlugin } from "nuxt/app";

import { setupNativeContextMenu } from "@/composables/useNativeContextMenu";

export default defineNuxtPlugin((nuxtApp) => {
  let cleanup: (() => void | Promise<void>) | null = null;

  nuxtApp.hook("app:mounted", async () => {
    cleanup = await setupNativeContextMenu();

    window.addEventListener("beforeunload", () => {
      if (cleanup) {
        void cleanup();
        cleanup = null;
      }
    });
  });
});
