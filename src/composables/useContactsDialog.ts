import { computed, ref } from "vue";

const contactsDialogVisible = ref(false);

/**
 * Manage global visibility state for the contacts dialog.
 */
export function useContactsDialog() {
  const isContactsDialogVisible = computed({
    get: () => contactsDialogVisible.value,
    set: (value: boolean) => {
      contactsDialogVisible.value = value;
    },
  });

  function openContactsDialog(): void {
    contactsDialogVisible.value = true;
  }

  function closeContactsDialog(): void {
    contactsDialogVisible.value = false;
  }

  return {
    isContactsDialogVisible,
    openContactsDialog,
    closeContactsDialog,
  };
}
