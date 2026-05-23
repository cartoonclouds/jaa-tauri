import { toErrorMessage } from "@shared/utils/error";
import { isTauri } from "@tauri-apps/api/core";
import { useRouter } from "vue-router";

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
          label: "onboarding-modal",
          url: "/onboarding",
          title: "Complete Onboarding",
        });
        return;
      }

      await router.push("/onboarding");
    } catch (error) {
      console.error("Failed to open onboarding:", toErrorMessage(error));
    }
  }

  return {
    openOnboarding,
  };
}
