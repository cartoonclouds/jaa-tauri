/**
 * Send notification use case.
 */

import type {
  NotificationRequest,
  NotificationResult,
} from "../../domain/entities/Notification";

import { NotificationService } from "../services/NotificationService";

export async function sendNotification(
  request: NotificationRequest,
): Promise<NotificationResult> {
  const service = NotificationService.getInstance();
  return service.send(request);
}

/**
 * Send info notification use case.
 */
export async function sendInfoNotification(
  title: string,
  body: string,
): Promise<NotificationResult> {
  const service = NotificationService.getInstance();
  return service.sendInfo(title, body);
}

/**
 * Send success notification use case.
 */
export async function sendSuccessNotification(
  title: string,
  body: string,
): Promise<NotificationResult> {
  const service = NotificationService.getInstance();
  return service.sendSuccess(title, body);
}

/**
 * Send warning notification use case.
 */
export async function sendWarningNotification(
  title: string,
  body: string,
): Promise<NotificationResult> {
  const service = NotificationService.getInstance();
  return service.sendWarning(title, body);
}

/**
 * Send error notification use case.
 */
export async function sendErrorNotification(
  title: string,
  body: string,
): Promise<NotificationResult> {
  const service = NotificationService.getInstance();
  return service.sendError(title, body);
}
