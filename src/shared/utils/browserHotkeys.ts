/**
 * Determines whether a keyboard event should be treated as a browser hotkey.
 */
export function shouldBlockBrowserHotkey(
  event: Pick<
    KeyboardEvent,
    "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
  >,
): boolean {
  const key = event.key.toLowerCase();

  // Allow app-level save handling (Ctrl/Cmd+S) in edit forms.
  if (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    key === "s"
  ) {
    return false;
  }

  // Browser shortcut keys are usually function keys or any modified key combo.
  if (/^f\d{1,2}$/.test(key)) {
    return true;
  }

  return event.ctrlKey || event.metaKey || event.altKey;
}
