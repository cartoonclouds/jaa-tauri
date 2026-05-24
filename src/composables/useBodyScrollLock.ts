import { onBeforeUnmount, type Ref, watch } from "vue";

let globalLockCount = 0;
let globalPreviousBodyOverflow: string | null = null;

function acquireBodyScrollLock(): void {
  if (!import.meta.client) {
    return;
  }

  if (globalLockCount === 0) {
    globalPreviousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  globalLockCount += 1;
}

function releaseBodyScrollLock(): void {
  if (!import.meta.client || globalLockCount === 0) {
    return;
  }

  globalLockCount -= 1;
  if (globalLockCount > 0) {
    return;
  }

  if (globalPreviousBodyOverflow !== null) {
    document.body.style.overflow = globalPreviousBodyOverflow;
    globalPreviousBodyOverflow = null;
    return;
  }

  document.body.style.removeProperty("overflow");
}

/**
 * Locks body scrolling while the provided visibility ref is true.
 */
export function useBodyScrollLock(isLocked: Ref<boolean>): void {
  let hasLock = false;

  function setBodyScrollLocked(locked: boolean): void {
    if (locked && !hasLock) {
      acquireBodyScrollLock();
      hasLock = true;
      return;
    }

    if (!locked && hasLock) {
      releaseBodyScrollLock();
      hasLock = false;
    }
  }

  watch(
    isLocked,
    (value) => {
      setBodyScrollLocked(value);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    setBodyScrollLocked(false);
  });
}
