/**
 * Check for updates use cases.
 */

import type {
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "../../domain/entities/UpdateCheck";

import { UpdateService } from "../services/UpdateService";

/**
 * Check server for updates and notify the user if an update exists.
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const service = UpdateService.getInstance();
  return service.checkForUpdates(true);
}

/**
 * Check server for updates without triggering a notification.
 */
export async function checkForUpdatesSilently(): Promise<UpdateCheckResult> {
  const service = UpdateService.getInstance();
  return service.checkForUpdates(false);
}

export function hasPendingUpdate(): boolean {
  const service = UpdateService.getInstance();
  return service.hasPendingUpdate();
}

export async function installPendingUpdate(
  onProgress?: (progress: UpdateInstallProgress) => void,
): Promise<UpdateInstallResult> {
  const service = UpdateService.getInstance();
  return service.installPendingUpdate(onProgress);
}
