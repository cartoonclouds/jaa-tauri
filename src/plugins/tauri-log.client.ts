import { logError } from "@infra/logging/tauriLog.client";
import { isTauri } from "@tauri-apps/api/core";
import { attachConsole } from "@tauri-apps/plugin-log";
import { defineNuxtPlugin } from "nuxt/app";

/**
 * Bridge browser console logs to Tauri's logging plugin during desktop runtime.
 */
export default defineNuxtPlugin(async () => {
  if (!import.meta.client || !isTauri()) {
    return;
  }

  try {
    await attachConsole();
  } catch (error) {
    logError("Failed to attach Tauri console logger:", error);
  }
});
