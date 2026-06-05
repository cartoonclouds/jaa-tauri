import { computed, type ComputedRef, ref, type Ref } from "vue";

/**
 * Generic guard state for confirming discard actions when unsaved edits exist.
 */
export interface UnsavedChangesGuardState<TIntent> {
  isConfirmVisible: Ref<boolean>;
  pendingIntent: Ref<TIntent | null>;
  confirmMessage: ComputedRef<string>;
  requestConfirmation: (intent: TIntent) => void;
  confirmAndGetIntent: () => TIntent | null;
  cancelConfirmation: () => void;
  clearConfirmation: () => void;
}

/**
 * Creates a reusable unsaved-changes confirmation guard.
 */
export function useUnsavedChangesGuard<TIntent>(
  resolveMessage: (intent: TIntent | null) => string,
): UnsavedChangesGuardState<TIntent> {
  const isConfirmVisible = ref<boolean>(false);
  const pendingIntent = ref<TIntent | null>(null) as Ref<TIntent | null>;

  const confirmMessage = computed(() => resolveMessage(pendingIntent.value));

  function clearConfirmation(): void {
    pendingIntent.value = null;
    isConfirmVisible.value = false;
  }

  function requestConfirmation(intent: TIntent): void {
    pendingIntent.value = intent;
    isConfirmVisible.value = true;
  }

  function confirmAndGetIntent(): TIntent | null {
    const intent = pendingIntent.value;
    clearConfirmation();
    return intent;
  }

  function cancelConfirmation(): void {
    clearConfirmation();
  }

  return {
    isConfirmVisible,
    pendingIntent,
    confirmMessage,
    requestConfirmation,
    confirmAndGetIntent,
    cancelConfirmation,
    clearConfirmation,
  };
}
