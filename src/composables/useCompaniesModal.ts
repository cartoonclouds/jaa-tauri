import { computed, ref } from "vue";

const companiesModalVisible = ref(false);

/**
 * Manage global visibility state for the companies modal.
 */
export function useCompaniesModal() {
  const isCompaniesModalVisible = computed({
    get: () => companiesModalVisible.value,
    set: (value: boolean) => {
      companiesModalVisible.value = value;
    },
  });

  function openCompaniesModal(): void {
    companiesModalVisible.value = true;
  }

  function closeCompaniesModal(): void {
    companiesModalVisible.value = false;
  }

  return {
    isCompaniesModalVisible,
    openCompaniesModal,
    closeCompaniesModal,
  };
}
