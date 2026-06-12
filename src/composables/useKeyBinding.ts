import { type MaybeRefOrGetter, onBeforeUnmount, toValue, watch } from "vue";

/**
 * A single key binding entry that maps a key to a callback.
 */
export interface KeyBinding {
  /** The `KeyboardEvent.key` value to match (case-sensitive). */
  key: string;
  /** Callback invoked when the key is pressed and the binding is enabled. */
  onTrigger: () => void;
  /** Whether to call `event.preventDefault()` when the key matches. Defaults to false. */
  preventDefault?: boolean;
  /** Whether to call `event.stopPropagation()` when the key matches. Defaults to false. */
  stopPropagation?: boolean;
}

/**
 * Options for the key binding composable.
 */
export interface UseKeyBindingOptions {
  /** One or more key bindings to register. */
  bindings: KeyBinding[];
  /** Reactive flag that enables or disables all bindings together. Defaults to true. */
  isEnabled?: MaybeRefOrGetter<boolean>;
}

/**
 * Registers keyboard event listeners that invoke callbacks when matched keys are pressed.
 * All listeners are automatically removed when the component is unmounted.
 */
export function useKeyBinding(options: UseKeyBindingOptions): void {
  const onKeydown = (event: KeyboardEvent): void => {
    if (!toValue(options.isEnabled ?? true)) {
      return;
    }

    for (const binding of options.bindings) {
      if (event.key !== binding.key) {
        continue;
      }

      if (binding.preventDefault) {
        event.preventDefault();
      }

      if (binding.stopPropagation) {
        event.stopPropagation();
      }

      binding.onTrigger();
    }
  };

  watch(
    () => toValue(options.isEnabled ?? true),
    (enabled) => {
      if (!import.meta.client) {
        return;
      }

      if (enabled) {
        window.addEventListener("keydown", onKeydown);
        return;
      }

      window.removeEventListener("keydown", onKeydown);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (!import.meta.client) {
      return;
    }

    window.removeEventListener("keydown", onKeydown);
  });
}
