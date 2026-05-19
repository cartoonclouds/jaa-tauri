/**
 * Tauri notification adapter.
 * Provides low-level integration with Tauri's notification plugin.
 */

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface NotificationRequest {
  title: string;
  body: string;
  icon?: string;
  sound?: string;
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function ensureNotificationPermission(): Promise<boolean> {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }

  return permissionGranted;
}

let hasWarnedWindowsDevToastLimit = false;

export function isWindowsDevToastLimited(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const isTauriProtocol = window.location.protocol === "tauri:";
  return !isTauriProtocol && /windows/i.test(navigator.userAgent);
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

    const permissionGranted = await ensureNotificationPermission();
    if (!permissionGranted) {
      return { success: false, error: "Notification permission not granted" };
    }

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
    return await ensureNotificationPermission();
  } catch {
    return false;
  }
}
