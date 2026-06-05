import { computed, type ComputedRef } from "vue";

/**
 * Shared state for create/edit mode driven dialogs.
 */
export interface CreateEditModeState {
  isEditMode: ComputedRef<boolean>;
  dialogMode: ComputedRef<"create" | "edit">;
}

/**
 * Derives dialog mode from a boolean edit-mode getter.
 */
export function useCreateEditModeByFlag(
  resolveIsEditMode: () => boolean,
): CreateEditModeState {
  const isEditMode = computed(() => resolveIsEditMode());

  const dialogMode = computed<"create" | "edit">(() =>
    isEditMode.value ? "edit" : "create",
  );

  return {
    isEditMode,
    dialogMode,
  };
}

/**
 * Derives dialog mode from a nullable entity getter.
 */
export function useCreateEditMode(
  resolveEntity: () => unknown,
): CreateEditModeState {
  return useCreateEditModeByFlag(() => Boolean(resolveEntity()));
}
