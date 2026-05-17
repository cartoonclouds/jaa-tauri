/**
 * Composable for sending desktop notifications in Vue components.
 */

import { ref } from "vue";
import type {
  NotificationRequest,
  NotificationResult,
} from "../../domain/entities/Notification";
import { NotificationService } from "../../application/services/NotificationService";
import {
  sendNotification,
  sendInfoNotification,
  sendSuccessNotification,
  sendWarningNotification,
  sendErrorNotification,
} from "../../application/use-cases/SendNotification";

interface UseNotificationReturn {
  isSupported: Readonly<import("vue").Ref<boolean>>;
  isLoading: Readonly<import("vue").Ref<boolean>>;
  send: (request: NotificationRequest) => Promise<NotificationResult>;
  info: (title: string, body: string) => Promise<NotificationResult>;
  success: (title: string, body: string) => Promise<NotificationResult>;
  warning: (title: string, body: string) => Promise<NotificationResult>;
  error: (title: string, body: string) => Promise<NotificationResult>;
}

let initialized = false;

/**
 * Composable to use desktop notifications in Vue components.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 *   const { send, success, error } = useNotification();
 *
 *   const handleAction = async () => {
 *     const result = await success("Done!", "Your action completed");
 *   };
 * </script>
 * ```
 */
export function useNotification(): UseNotificationReturn {
  const isSupported = ref(false);
  const isLoading = ref(false);

  // Initialize on first use
  if (!initialized) {
    initialized = true;
    const service = NotificationService.getInstance();
    service.initialize().then(() => {
      isSupported.value = service.isSupported();
    });
  }

  async function send(
    request: NotificationRequest,
  ): Promise<NotificationResult> {
    isLoading.value = true;
    try {
      return await sendNotification(request);
    } finally {
      isLoading.value = false;
    }
  }

  async function info(
    title: string,
    body: string,
  ): Promise<NotificationResult> {
    isLoading.value = true;
    try {
      return await sendInfoNotification(title, body);
    } finally {
      isLoading.value = false;
    }
  }

  async function success(
    title: string,
    body: string,
  ): Promise<NotificationResult> {
    isLoading.value = true;
    try {
      return await sendSuccessNotification(title, body);
    } finally {
      isLoading.value = false;
    }
  }

  async function warning(
    title: string,
    body: string,
  ): Promise<NotificationResult> {
    isLoading.value = true;
    try {
      return await sendWarningNotification(title, body);
    } finally {
      isLoading.value = false;
    }
  }

  async function error(
    title: string,
    body: string,
  ): Promise<NotificationResult> {
    isLoading.value = true;
    try {
      return await sendErrorNotification(title, body);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    send,
    info,
    success,
    warning,
    error,
  };
}

/**
 * Vue readonly type - converts a Ref to readonly.
 */
function readonly<T>(
  ref: import("vue").Ref<T>,
): Readonly<import("vue").Ref<T>> {
  return ref as Readonly<import("vue").Ref<T>>;
}
