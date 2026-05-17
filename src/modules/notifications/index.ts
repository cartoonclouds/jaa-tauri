/**
 * Notifications module exports.
 * Core domain entities, application services, and presentation layer.
 */

// Domain
export type {
  Notification,
  NotificationRequest,
  NotificationResult,
  RichNotification,
} from "./domain/entities/Notification";
export { NotificationSeverity } from "./domain/entities/Notification";

// Application
export { NotificationService } from "./application/services/NotificationService";
export {
  sendNotification,
  sendInfoNotification,
  sendSuccessNotification,
  sendWarningNotification,
  sendErrorNotification,
} from "./application/use-cases/SendNotification";

// Presentation
export { useNotification } from "./presentation/composables/useNotification";
