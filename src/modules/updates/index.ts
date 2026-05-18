/**
 * Updates module exports.
 */

// Application
export { UpdateService } from "./application/services/UpdateService";

export {
  checkForUpdates,
  checkForUpdatesSilently,
  hasPendingUpdate,
  installPendingUpdate,
} from "./application/use-cases/CheckForUpdates";
// Domain
export type {
  AvailableUpdate,
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "./domain/entities/UpdateCheck";

// Presentation
export { useUpdateChecker } from "./presentation/composables/useUpdateChecker";
