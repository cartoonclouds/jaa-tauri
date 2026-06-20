/**
 * Options for executing a promise with a timeout.
 */
export interface WithTimeoutOptions {
  /** Human-readable operation label used in timeout errors. */
  label: string;
  /** Maximum duration in milliseconds before rejecting. */
  timeoutMs: number;
}

/**
 * Resolve a promise or reject when the timeout elapses.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  options: WithTimeoutOptions,
): Promise<T> {
  const { label, timeoutMs } = options;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`${label} timed out after ${String(timeoutMs)}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (typeof timeoutHandle !== "undefined") {
      clearTimeout(timeoutHandle);
    }
  }
}
