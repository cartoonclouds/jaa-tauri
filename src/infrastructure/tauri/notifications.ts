/**
 * Tauri notification adapter.
 * Provides low-level integration with Tauri's notification plugin.
 */

import { toErrorMessage } from "@shared/utils/error";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

/**
 * Payload required to emit a notification.
 */
export interface NotificationRequest {
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Optional notification icon path or asset reference. */
  icon?: string;
  /** Optional notification sound identifier. */
  sound?: string;
}

/**
 * Result returned by the notification adapter.
 */
export interface NotificationResult {
  /** Whether the notification request succeeded. */
  success: boolean;
  /** Stable identifier assigned to the emitted notification, when available. */
  id?: string;
  /** Human-readable error message when the notification request fails. */
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

/**
 * Detect whether the current environment is subject to the Windows dev toast limitation.
 */
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
    const message = toErrorMessage(error);
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
