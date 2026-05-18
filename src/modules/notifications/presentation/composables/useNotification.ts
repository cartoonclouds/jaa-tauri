/**
 * Composable for sending desktop notifications in Vue components.
 */

import type {
  NotificationRequest,
  NotificationResult,
} from "../../domain/entities/Notification";

import { isWindowsDevToastLimited } from "@infra/tauri/notifications";
import { onMounted, ref, type Ref } from "vue";

import {
  sendErrorNotification,
  sendInfoNotification,
  sendNotification,
  sendSuccessNotification,
  sendWarningNotification,
} from "../../application/actions/SendNotification";
import { NotificationService } from "../../application/services/NotificationService";

interface UseNotificationReturn {
  isSupported: Readonly<Ref<boolean>>;
  isLoading: Readonly<Ref<boolean>>;
  showWindowsDevToastNotice: Readonly<Ref<boolean>>;
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
  const showWindowsDevToastNotice = ref(false);

  // Keep SSR and client pre-hydration markup identical.
  onMounted(() => {
    showWindowsDevToastNotice.value = isWindowsDevToastLimited();
  });

  // Initialize on first use
  if (!initialized) {
    initialized = true;
    const service = NotificationService.getInstance();
    void service
      .initialize()
      .then(() => {
        isSupported.value = service.isSupported();
      })
      .catch((error: unknown) => {
        console.error("[Notifications] Failed to initialize service", error);
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
    showWindowsDevToastNotice: readonly(showWindowsDevToastNotice),
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
function readonly<T>(ref: Ref<T>): Readonly<Ref<T>> {
  return ref;
}
