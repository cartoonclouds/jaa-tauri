import { shouldBlockBrowserHotkey } from "@shared/utils/browserHotkeys";
import { defineNuxtPlugin } from "nuxt/app";

/**
 * Disables browser-level hotkeys in production builds.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    if (!import.meta.client || !import.meta.env.PROD) {
      return;
    }

    const onKeydown = (event: KeyboardEvent): void => {
      if (!shouldBlockBrowserHotkey(event)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener("keydown", onKeydown, { capture: true });
  });
});
