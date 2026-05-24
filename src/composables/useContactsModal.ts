import { computed, ref } from "vue";

const contactsModalVisible = ref(false);

/**
 * Manage global visibility state for the contacts modal.
 */
export function useContactsModal() {
  const isContactsModalVisible = computed({
    get: () => contactsModalVisible.value,
    set: (value: boolean) => {
      contactsModalVisible.value = value;
    },
  });

  function openContactsModal(): void {
    contactsModalVisible.value = true;
  }

  function closeContactsModal(): void {
    contactsModalVisible.value = false;
  }

  return {
    isContactsModalVisible,
    openContactsModal,
    closeContactsModal,
  };
}
