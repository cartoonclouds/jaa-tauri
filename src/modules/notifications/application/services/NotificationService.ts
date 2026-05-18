/**
 * Notification application service.
 * Orchestrates notification operations and integrates with Tauri.
 */

import type {
  NotificationRequest,
  NotificationResult,
  RichNotification,
} from "../../domain/entities/Notification";

import {
  isNotificationSupported,
  sendTauriNotification,
} from "@infra/tauri/notifications";

import { NotificationSeverity } from "../../domain/entities/Notification";

export class NotificationService {
  private static instance: NotificationService | null = null;
  private supported = false;

  private constructor() {
    this.supported = false;
  }

  static getInstance(): NotificationService {
    NotificationService.instance ??= new NotificationService();
    return NotificationService.instance;
  }

  /**
   * Initialize the service and check if notifications are supported.
   */
  async initialize(): Promise<void> {
    this.supported = await isNotificationSupported();
  }

  /**
   * Check if notifications are supported.
   */
  isSupported(): boolean {
    return this.supported;
  }

  /**
   * Send a notification.
   */
  async send(request: NotificationRequest): Promise<NotificationResult> {
    if (!this.supported) {
      return { success: false, error: "Notifications not supported" };
    }

    return sendTauriNotification(request);
  }

  /**
   * Send a rich notification with severity level.
   */
  async sendRich(notification: RichNotification): Promise<NotificationResult> {
    const request: NotificationRequest = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      sound: notification.sound,
    };

    return this.send(request);
  }

  /**
   * Send an info notification.
   */
  async sendInfo(title: string, body: string): Promise<NotificationResult> {
    return this.sendRich({
      id: String(Date.now()),
      title,
      body,
      severity: NotificationSeverity.INFO,
      timestamp: new Date(),
    });
  }

  /**
   * Send a success notification.
   */
  async sendSuccess(title: string, body: string): Promise<NotificationResult> {
    return this.sendRich({
      id: String(Date.now()),
      title,
      body,
      severity: NotificationSeverity.SUCCESS,
      timestamp: new Date(),
    });
  }

  /**
   * Send a warning notification.
   */
  async sendWarning(title: string, body: string): Promise<NotificationResult> {
    return this.sendRich({
      id: String(Date.now()),
      title,
      body,
      severity: NotificationSeverity.WARNING,
      timestamp: new Date(),
    });
  }

  /**
   * Send an error notification.
   */
  async sendError(title: string, body: string): Promise<NotificationResult> {
    return this.sendRich({
      id: String(Date.now()),
      title,
      body,
      severity: NotificationSeverity.ERROR,
      timestamp: new Date(),
    });
  }
}
