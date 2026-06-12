import { logError } from "@infra/logging/appLogger";
import { temporalNowIsoString } from "@shared/utils/temporal";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { defineNuxtPlugin } from "nuxt/app";

type GlobalErrorLoggingState = typeof globalThis & {
  __APP_ERROR_LOGGING_INSTALLED__?: boolean;
};

type VueErrorHandler = (
  error: unknown,
  instance: unknown,
  info: string,
) => void;

let didRequestSplashscreenClose = false;

/**
 * Build a compact metadata suffix to enrich app-wide error logs.
 */
function buildMetadata(): string {
  const { pathname, search, hash } = window.location;
  const path = `${pathname}${search}${hash}`;
  const visibility = document.visibilityState;
  const online = navigator.onLine ? "online" : "offline";
  const runtime = isTauri() ? "tauri" : "web";
  const timestamp = temporalNowIsoString();

  return `meta={path:${path},visibility:${visibility},network:${online},runtime:${runtime},ts:${timestamp}}`;
}

/**
 * Reveal the main window when startup fails so the splashscreen does not remain stuck.
 */
// fallow-ignore-next-line complexity
async function closeSplashscreenOnStartupError(): Promise<void> {
  if (!import.meta.client || didRequestSplashscreenClose || !isTauri()) {
    return;
  }

  didRequestSplashscreenClose = true;

  try {
    await invoke("close_splashscreen");
  } catch {
    didRequestSplashscreenClose = false;
  }
}

/**
 * Install app-wide client error capture and route all uncaught errors to the shared logger.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) {
    return;
  }

  const globalState = globalThis as GlobalErrorLoggingState;
  if (globalState.__APP_ERROR_LOGGING_INSTALLED__) {
    return;
  }
  globalState.__APP_ERROR_LOGGING_INSTALLED__ = true;

  const previousVueErrorHandler = nuxtApp.vueApp.config.errorHandler as
    | VueErrorHandler
    | undefined;

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    const hasInstance = instance !== null;
    const metadata = buildMetadata();

    void closeSplashscreenOnStartupError();

    logError(
      `[AppError] [vue] info=${info} instance=${hasInstance ? "present" : "none"} ${metadata}`,
      error,
    );

    if (previousVueErrorHandler) {
      previousVueErrorHandler(error, instance, info);
    }
  };

  nuxtApp.hook("app:error", (error) => {
    void closeSplashscreenOnStartupError();
    logError(`[AppError] [nuxt-app] app:error ${buildMetadata()}`, error);
  });

  window.addEventListener("error", (event) => {
    void closeSplashscreenOnStartupError();

    const location =
      event.filename.length > 0
        ? `${event.filename}:${String(event.lineno)}:${String(event.colno)}`
        : "unknown";

    const message =
      event.message.length > 0 ? event.message : "Uncaught runtime error";

    if (event.error !== undefined) {
      logError(
        `[AppError] [window:error] ${message} @ ${location} ${buildMetadata()}`,
        event.error,
      );
      return;
    }

    logError(
      `[AppError] [window:error] ${message} @ ${location} ${buildMetadata()}`,
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    void closeSplashscreenOnStartupError();

    logError(
      `[AppError] [window:unhandledrejection] Unhandled promise rejection ${buildMetadata()}`,
      event.reason,
    );
  });
});
