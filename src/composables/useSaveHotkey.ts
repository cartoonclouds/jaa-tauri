import { type MaybeRefOrGetter, onBeforeUnmount, toValue, watch } from "vue";

/**
 * Predicate for the app save hotkey (Ctrl/Cmd+S without Shift/Alt).
 */
// fallow-ignore-next-line complexity
function isSaveHotkey(
  event: Pick<
    KeyboardEvent,
    "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
  >,
): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "s"
  );
}

/**
 * Options for wiring a save hotkey listener.
 */
export interface UseSaveHotkeyOptions {
  isEnabled: MaybeRefOrGetter<boolean>;
  onTrigger: () => void;
}

/**
 * Registers a save hotkey listener and invokes the provided callback on trigger.
 */
export function useSaveHotkey(options: UseSaveHotkeyOptions): void {
  const onKeydown = (event: KeyboardEvent): void => {
    if (!isSaveHotkey(event) || !toValue(options.isEnabled)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    options.onTrigger();
  };

  watch(
    () => toValue(options.isEnabled),
    (enabled) => {
      if (!import.meta.client) {
        return;
      }

      if (enabled) {
        window.addEventListener("keydown", onKeydown, { capture: true });
        return;
      }

      window.removeEventListener("keydown", onKeydown, { capture: true });
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (!import.meta.client) {
      return;
    }

    window.removeEventListener("keydown", onKeydown, { capture: true });
  });
}
