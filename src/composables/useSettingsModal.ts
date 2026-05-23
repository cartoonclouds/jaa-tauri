import { computed, ref } from "vue";

const settingsModalVisible = ref(false);

/**
 * Manage global visibility state for the settings modal.
 */
export function useSettingsModal() {
  const isSettingsModalVisible = computed({
    get: () => settingsModalVisible.value,
    set: (value: boolean) => {
      settingsModalVisible.value = value;
    },
  });

  function openSettingsModal(): void {
    settingsModalVisible.value = true;
  }

  function closeSettingsModal(): void {
    settingsModalVisible.value = false;
  }

  return {
    isSettingsModalVisible,
    openSettingsModal,
    closeSettingsModal,
  };
}



