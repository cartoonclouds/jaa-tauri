/**
 * Notifications module exports.
 * Core domain entities, application services, and presentation layer.
 */

export {
  sendNotification,
  sendInfoNotification,
  sendSuccessNotification,
  sendWarningNotification,
  sendErrorNotification,
} from "./application/actions/SendNotification";
// Application
export { NotificationService } from "./application/services/NotificationService";

// Domain
export type {
  Notification,
  NotificationRequest,
  NotificationResult,
  RichNotification,
} from "./domain/entities/Notification";
export { NotificationSeverity } from "./domain/entities/Notification";

// Presentation
export { useNotification } from "./presentation/composables/useNotification";
