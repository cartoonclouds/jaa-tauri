import { onBeforeUnmount, type Ref, watch } from "vue";

/**
 * Locks body scrolling while the provided visibility ref is true.
 */
export function useBodyScrollLock(isLocked: Ref<boolean>): void {
  let previousBodyOverflow: string | null = null;

  function setBodyScrollLocked(locked: boolean): void {
    if (!import.meta.client) {
      return;
    }

    if (locked) {
      previousBodyOverflow ??= document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return;
    }

    if (previousBodyOverflow !== null) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = null;
      return;
    }

    document.body.style.removeProperty("overflow");
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
