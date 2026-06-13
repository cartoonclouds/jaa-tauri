import { computed, ref } from "vue";

const globalSearchDialogVisible = ref(false);

/**
 * Manage global visibility state for the cross-entity search dialog.
 */
export function useGlobalSearchDialog() {
  const isGlobalSearchDialogVisible = computed({
    get: () => globalSearchDialogVisible.value,
    set: (value: boolean) => {
      globalSearchDialogVisible.value = value;
    },
  });

  /**
   * Opens the global search dialog.
   */
  function openGlobalSearchDialog(): void {
    globalSearchDialogVisible.value = true;
  }

  /**
   * Closes the global search dialog.
   */
  function closeGlobalSearchDialog(): void {
    globalSearchDialogVisible.value = false;
  }

  return {
    isGlobalSearchDialogVisible,
    openGlobalSearchDialog,
    closeGlobalSearchDialog,
  };
}
