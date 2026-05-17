/**
 * Updates module exports.
 */

// Domain
export type {
  AvailableUpdate,
  UpdateCheckResult,
} from "./domain/entities/UpdateCheck";

// Application
export { UpdateService } from "./application/services/UpdateService";
export {
  checkForUpdates,
  checkForUpdatesSilently,
} from "./application/use-cases/CheckForUpdates";

// Presentation
export { useUpdateChecker } from "./presentation/composables/useUpdateChecker";
