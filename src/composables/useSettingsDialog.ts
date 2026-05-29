import { computed, ref } from "vue";

const settingsDialogVisible = ref(false);

/**
 * Manage global visibility state for the settings dialog.
 */
export function useSettingsDialog() {
  const isSettingsDialogVisible = computed({
    get: () => settingsDialogVisible.value,
    set: (value: boolean) => {
      settingsDialogVisible.value = value;
    },
  });

  function openSettingsDialog(): void {
    settingsDialogVisible.value = true;
  }

  function closeSettingsDialog(): void {
    settingsDialogVisible.value = false;
  }

  return {
    isSettingsDialogVisible,
    openSettingsDialog,
    closeSettingsDialog,
  };
}



