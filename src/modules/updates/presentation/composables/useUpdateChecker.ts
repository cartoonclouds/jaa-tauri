/**
 * Composable for update checks in Vue components.
 */

import type {
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "../../domain/entities/UpdateCheck";

import { ref } from "vue";

import {
  checkForUpdates,
  checkForUpdatesSilently,
  hasPendingUpdate,
  installPendingUpdate,
} from "../../application/use-cases/CheckForUpdates";

interface UseUpdateCheckerReturn {
  isChecking: Readonly<import("vue").Ref<boolean>>;
  isInstalling: Readonly<import("vue").Ref<boolean>>;
  hasUpdateReadyToInstall: Readonly<import("vue").Ref<boolean>>;
  installProgress: Readonly<import("vue").Ref<UpdateInstallProgress | null>>;
  lastCheckedAt: Readonly<import("vue").Ref<Date | null>>;
  lastResult: Readonly<import("vue").Ref<UpdateCheckResult | null>>;
  lastInstallResult: Readonly<import("vue").Ref<UpdateInstallResult | null>>;
  check: () => Promise<UpdateCheckResult>;
  checkSilently: () => Promise<UpdateCheckResult>;
  install: () => Promise<UpdateInstallResult>;
}

export function useUpdateChecker(): UseUpdateCheckerReturn {
  const isChecking = ref(false);
  const isInstalling = ref(false);
  const hasUpdateReadyToInstall = ref(false);
  const installProgress = ref<UpdateInstallProgress | null>(null);
  const lastCheckedAt = ref<Date | null>(null);
  const lastResult = ref<UpdateCheckResult | null>(null);
  const lastInstallResult = ref<UpdateInstallResult | null>(null);

  async function check(): Promise<UpdateCheckResult> {
    isChecking.value = true;
    try {
      const result = await checkForUpdates();
      hasUpdateReadyToInstall.value = hasPendingUpdate();
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
      hasUpdateReadyToInstall.value = hasPendingUpdate();
      lastCheckedAt.value = new Date();
      lastResult.value = result;
      return result;
    } finally {
      isChecking.value = false;
    }
  }

  async function install(): Promise<UpdateInstallResult> {
    isInstalling.value = true;
    installProgress.value = null;

    try {
      const result = await installPendingUpdate((progress) => {
        installProgress.value = progress;
      });
      hasUpdateReadyToInstall.value = hasPendingUpdate();
      lastInstallResult.value = result;
      return result;
    } finally {
      isInstalling.value = false;
    }
  }

  return {
    isChecking: readonly(isChecking),
    isInstalling: readonly(isInstalling),
    hasUpdateReadyToInstall: readonly(hasUpdateReadyToInstall),
    installProgress: readonly(installProgress),
    lastCheckedAt: readonly(lastCheckedAt),
    lastResult: readonly(lastResult),
    lastInstallResult: readonly(lastInstallResult),
    check,
    checkSilently,
    install,
  };
}

/**
 * Vue readonly type helper.
 */
function readonly<T>(
  value: import("vue").Ref<T>,
): Readonly<import("vue").Ref<T>> {
  return value;
}
