import { computed, ref } from "vue";

const contactsDialogVisible = ref(false);
const pendingContactId = ref<string | null>(null);

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

  function openContactsDialog(contactId?: string | null): void {
    pendingContactId.value =
      typeof contactId === "string" && contactId.trim().length > 0
        ? contactId
        : null;
    contactsDialogVisible.value = true;
  }

  function closeContactsDialog(): void {
    contactsDialogVisible.value = false;
  }

  function consumePendingContactId(): string | null {
    const nextContactId = pendingContactId.value;
    pendingContactId.value = null;

    return nextContactId;
  }

  return {
    isContactsDialogVisible,
    openContactsDialog,
    closeContactsDialog,
    consumePendingContactId,
  };
}
