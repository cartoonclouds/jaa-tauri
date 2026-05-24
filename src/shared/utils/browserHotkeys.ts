/**
 * Determines whether a keyboard event should be treated as a browser hotkey.
 */
export function shouldBlockBrowserHotkey(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey">,
): boolean {
  const key = event.key.toLowerCase();

  // Browser shortcut keys are usually function keys or any modified key combo.
  if (/^f\d{1,2}$/.test(key)) {
    return true;
  }

  return event.ctrlKey || event.metaKey || event.altKey;
}
