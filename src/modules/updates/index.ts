/**
 * Updates module exports.
 */

export {
  checkForUpdates,
  checkForUpdatesSilently,
  hasPendingUpdate,
  installPendingUpdate,
} from "./application/actions/CheckForUpdates";

// Application
export { UpdateService } from "./application/services/UpdateService";
// Domain
export type {
  AvailableUpdate,
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "./domain/entities/UpdateCheck";

// Presentation
export { useUpdateChecker } from "./presentation/composables/useUpdateChecker";
