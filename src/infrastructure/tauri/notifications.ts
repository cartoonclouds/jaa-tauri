/**
 * Tauri notification adapter.
 * Provides low-level integration with Tauri's notification plugin.
 */

import type {
  NotificationRequest,
  NotificationResult,
} from "@modules/notifications/domain/entities/Notification";

let hasWarnedWindowsDevToastLimit = false;

export function isWindowsDevToastLimited(): boolean {
  if (!import.meta.env.DEV) return false;

  return (
    typeof navigator !== "undefined" && /windows/i.test(navigator.userAgent)
  );
}

function warnWindowsDevToastLimitOnce(): void {
  if (hasWarnedWindowsDevToastLimit) return;
  if (!isWindowsDevToastLimited()) return;

  hasWarnedWindowsDevToastLimit = true;
  console.warn(
    "[Notifications] Windows dev mode may show notifications only in Notification Center. Install a built app to validate native popup toasts.",
  );
}

/**
 * Send a system notification using Tauri.
 * Gracefully handles cases where the notification plugin is unavailable.
 */
export async function sendTauriNotification(
  request: NotificationRequest,
): Promise<NotificationResult> {
  try {
    warnWindowsDevToastLimitOnce();

    // Dynamically import to avoid SSR issues
    const { sendNotification } =
      await import("@tauri-apps/plugin-notification");

    sendNotification({
      title: request.title,
      body: request.body,
      icon: request.icon,
      //   badge: request.badge,
      //   tag: request.tag,
      sound: request.sound,
    });

    return { success: true, id: String(Date.now()) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Notifications] Tauri notification failed:", message);
    return { success: false, error: message };
  }
}

/**
 * Check if notifications are supported in the current environment.
 */
export async function isNotificationSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const { isPermissionGranted, requestPermission } =
      await import("@tauri-apps/plugin-notification");

    const granted = await isPermissionGranted();
    if (!granted) {
      await requestPermission();
    }
    return true;
  } catch {
    return false;
  }
}
