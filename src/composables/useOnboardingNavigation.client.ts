import { logError } from "@infra/logging/tauriLog.client";
import { toErrorMessage } from "@shared/utils/error";
import { isTauri } from "@tauri-apps/api/core";

import { useRouter } from "#imports";
import { useChildWebviewWindow } from "@/composables/useChildWebviewWindow.client";

/**
 * Handle onboarding navigation for both desktop (child webview) and web.
 */
export function useOnboardingNavigation() {
  const { openChildWebviewWindow } = useChildWebviewWindow();
  const router = useRouter();

  async function openOnboarding(): Promise<void> {
    try {
      if (import.meta.client && isTauri()) {
        await openChildWebviewWindow({
          label: "onboarding-dialog",
          url: "/onboarding",
          title: "Complete Onboarding",
          focus: true,
          resizable: true,
          minimizable: false,
          maximizable: false,
          skipTaskbar: true,
          alwaysOnTop: true,
          hideNativeMenuBar: true,
        });
        return;
      }

      await router.push("/onboarding");
    } catch (error) {
      logError("Failed to open onboarding:", toErrorMessage(error));
    }
  }

  return {
    openOnboarding,
  };
}
