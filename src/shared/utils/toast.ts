import { toErrorMessage } from "@shared/utils/error";

/**
 * Minimal toast adapter contract used by shared toast helpers.
 */
export interface ToastAdapter {
  add: (message: {
    severity: string;
    summary: string;
    detail: string;
    life: number;
  }) => void;
}

/**
 * Show a standardized success toast for create/update entity saves.
 */
export function showEntitySavedToast(
  toast: ToastAdapter,
  entityLabel: string,
  isEditMode: boolean,
): void {
  toast.add({
    severity: "success",
    summary: `${entityLabel} saved`,
    detail: `${entityLabel} ${isEditMode ? "updated" : "created"} successfully.`,
    life: 3000,
  });
}

/**
 * Show a standardized error toast for a rejected promise reason.
 */
export function showFailedPromiseToast(
  toast: ToastAdapter,
  operationLabel: string,
  reason: unknown,
): void {
  toast.add({
    severity: "error",
    summary: `${operationLabel} failed`,
    detail: toErrorMessage(reason),
    life: 5000,
  });
}
