/**
 * Update application service.
 * Checks the configured update server through Tauri updater plugin.
 */

import { sendInfoNotification } from "@modules/notifications";
import type { UpdateCheckResult } from "../../domain/entities/UpdateCheck";

export class UpdateService {
  private static instance: UpdateService;

  private constructor() {}

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  /**
   * Check update server for a newer app version.
   */
  async checkForUpdates(notifyUser: boolean = true): Promise<UpdateCheckResult> {
    if (typeof window === "undefined") {
      return {
        hasUpdate: false,
        error: "Update checks are available only in the client environment",
      };
    }

    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();

      if (!update) {
        return { hasUpdate: false };
      }

      const result: UpdateCheckResult = {
        hasUpdate: true,
        update: {
          version: update.version,
          currentVersion: update.currentVersion,
          date: update.date,
          notes: update.body,
        },
      };

      if (notifyUser) {
        const body = `Version ${update.version} is available${update.body ? `: ${update.body}` : "."}`;
        await sendInfoNotification("Update Available", body);
      }

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown update check error";

      return {
        hasUpdate: false,
        error: message,
      };
    }
  }
}
