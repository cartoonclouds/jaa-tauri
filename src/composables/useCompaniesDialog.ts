import { computed, ref } from "vue";

const companiesDialogVisible = ref(false);

/**
 * Manage global visibility state for the companies dialog.
 */
export function useCompaniesDialog() {
  const isCompaniesDialogVisible = computed({
    get: () => companiesDialogVisible.value,
    set: (value: boolean) => {
      companiesDialogVisible.value = value;
    },
  });

  function openCompaniesDialog(): void {
    companiesDialogVisible.value = true;
  }

  function closeCompaniesDialog(): void {
    companiesDialogVisible.value = false;
  }

  return {
    isCompaniesDialogVisible,
    openCompaniesDialog,
    closeCompaniesDialog,
  };
}
