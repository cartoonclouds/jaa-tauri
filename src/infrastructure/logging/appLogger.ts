import { toErrorMessage } from "@shared/utils/error";

/**
 * Supported severity levels emitted by the shared logger.
 */
type LogLevel = "error" | "info" | "warn";

/**
 * Console fallback used when Tauri logging is unavailable.
 */
function fallbackConsole(level: LogLevel, message: string): void {
  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "info") {
    console.warn(`[info] ${message}`);
    return;
  }

  console.warn(message);
}

/**
 * Attempt to write a log entry through the Tauri log plugin.
 */
async function writeToTauri(
  level: LogLevel,
  message: string,
): Promise<boolean> {
  if (!import.meta.client) {
    return false;
  }

  try {
    const [{ isTauri }, pluginLog] = await Promise.all([
      import("@tauri-apps/api/core"),
      import("@tauri-apps/plugin-log"),
    ]);

    if (!isTauri()) {
      return false;
    }

    if (level === "error") {
      await pluginLog.error(message);
      return true;
    }

    if (level === "warn") {
      await pluginLog.warn(message);
      return true;
    }

    await pluginLog.info(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * Emit a log entry, preferring Tauri logging with console fallback.
 */
function emit(level: LogLevel, message: string): void {
  void writeToTauri(level, message).then((written) => {
    if (!written) {
      fallbackConsole(level, message);
    }
  });
}

/**
 * Log an error message, optionally enriched with serialized error details.
 */
export function logError(message: string, error?: unknown): void {
  const serializedError =
    error === undefined ? "" : ` ${toErrorMessage(error)}`;
  emit("error", `${message}${serializedError}`);
}

/**
 * Log a warning message.
 */
export function logWarn(message: string): void {
  emit("warn", message);
}

/**
 * Log an informational message.
 */
export function logInfo(message: string): void {
  emit("info", message);
}
