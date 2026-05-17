/**
 * Composable for update checks in Vue components.
 */

import { ref } from "vue";
import type { UpdateCheckResult } from "../../domain/entities/UpdateCheck";
import {
  checkForUpdates,
  checkForUpdatesSilently,
} from "../../application/use-cases/CheckForUpdates";

interface UseUpdateCheckerReturn {
  isChecking: Readonly<import("vue").Ref<boolean>>;
  lastCheckedAt: Readonly<import("vue").Ref<Date | null>>;
  lastResult: Readonly<import("vue").Ref<UpdateCheckResult | null>>;
  check: () => Promise<UpdateCheckResult>;
  checkSilently: () => Promise<UpdateCheckResult>;
}

export function useUpdateChecker(): UseUpdateCheckerReturn {
  const isChecking = ref(false);
  const lastCheckedAt = ref<Date | null>(null);
  const lastResult = ref<UpdateCheckResult | null>(null);

  async function check(): Promise<UpdateCheckResult> {
    isChecking.value = true;
    try {
      const result = await checkForUpdates();
      lastCheckedAt.value = new Date();
      lastResult.value = result;
      return result;
    } finally {
      isChecking.value = false;
    }
  }

  async function checkSilently(): Promise<UpdateCheckResult> {
    isChecking.value = true;
    try {
      const result = await checkForUpdatesSilently();
      lastCheckedAt.value = new Date();
      lastResult.value = result;
      return result;
    } finally {
      isChecking.value = false;
    }
  }

  return {
    isChecking: readonly(isChecking),
    lastCheckedAt: readonly(lastCheckedAt),
    lastResult: readonly(lastResult),
    check,
    checkSilently,
  };
}

/**
 * Vue readonly type helper.
 */
function readonly<T>(
  value: import("vue").Ref<T>,
): Readonly<import("vue").Ref<T>> {
  return value as Readonly<import("vue").Ref<T>>;
}
