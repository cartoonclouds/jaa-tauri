/**
 * Composable for update checks in Vue components.
 */

import type {
  UpdateCheckResult,
  UpdateInstallProgress,
  UpdateInstallResult,
} from "../../domain/entities/UpdateCheck";

import { readonly, ref, type Ref } from "vue";

import {
  checkForUpdates,
  checkForUpdatesSilently,
  hasPendingUpdate,
  installPendingUpdate,
} from "../../application/actions/CheckForUpdates";

interface UseUpdateCheckerReturn {
  isChecking: Readonly<Ref<boolean>>;
  isInstalling: Readonly<Ref<boolean>>;
  hasUpdateReadyToInstall: Readonly<Ref<boolean>>;
  installProgress: Readonly<Ref<UpdateInstallProgress | null>>;
  lastCheckedAt: Readonly<Ref<Date | null>>;
  lastResult: Readonly<Ref<UpdateCheckResult | null>>;
  lastInstallResult: Readonly<Ref<UpdateInstallResult | null>>;
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
