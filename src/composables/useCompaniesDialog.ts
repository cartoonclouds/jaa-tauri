import { computed, ref } from "vue";

const companiesDialogVisible = ref(false);
const pendingCompanyId = ref<string | null>(null);

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

  function openCompaniesDialog(companyId?: string | null): void {
    pendingCompanyId.value =
      typeof companyId === "string" && companyId.trim().length > 0
        ? companyId
        : null;
    companiesDialogVisible.value = true;
  }

  function closeCompaniesDialog(): void {
    companiesDialogVisible.value = false;
  }

  function consumePendingCompanyId(): string | null {
    const nextCompanyId = pendingCompanyId.value;
    pendingCompanyId.value = null;

    return nextCompanyId;
  }

  return {
    isCompaniesDialogVisible,
    openCompaniesDialog,
    closeCompaniesDialog,
    consumePendingCompanyId,
  };
}
