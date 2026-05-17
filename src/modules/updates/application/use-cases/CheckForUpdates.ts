/**
 * Check for updates use cases.
 */

import type { UpdateCheckResult } from "../../domain/entities/UpdateCheck";
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
