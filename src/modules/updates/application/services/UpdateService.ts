/**
 * Update application service.
 * Checks the configured update server through Tauri updater plugin.
 */

import type {
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "../../domain/entities/UpdateCheck";
import type {
  DownloadEvent,
  Update as TauriAvailableUpdate,
} from "@tauri-apps/plugin-updater";

import { sendInfoNotification } from "@modules/notifications";

export class UpdateService {
  private static instance: UpdateService;
  private pendingUpdate: TauriAvailableUpdate | null = null;

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
  async checkForUpdates(notifyUser = true): Promise<UpdateCheckResult> {
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
        this.pendingUpdate = null;
        return { hasUpdate: false };
      }

      this.pendingUpdate = update;

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
      this.pendingUpdate = null;
      const message =
        error instanceof Error ? error.message : "Unknown update check error";

      return {
        hasUpdate: false,
        error: message,
      };
    }
  }

  hasPendingUpdate(): boolean {
    return this.pendingUpdate !== null;
  }

  async installPendingUpdate(
    onProgress?: (progress: UpdateInstallProgress) => void,
  ): Promise<UpdateInstallResult> {
    if (!this.pendingUpdate) {
      return { success: false, error: "No pending update to install" };
    }

    try {
      let downloadedBytes = 0;
      let contentLength: number | null = null;

      await this.pendingUpdate.downloadAndInstall((event: DownloadEvent) => {
        if (event.event === "Started") {
          contentLength = event.data.contentLength ?? null;
          onProgress?.({
            downloadedBytes,
            contentLength,
          });
          return;
        }

        if (event.event === "Progress") {
          downloadedBytes += event.data.chunkLength;
          onProgress?.({
            downloadedBytes,
            contentLength,
          });
        }
      });

      this.pendingUpdate = null;
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown update install error";

      return { success: false, error: message };
    }
  }
}
