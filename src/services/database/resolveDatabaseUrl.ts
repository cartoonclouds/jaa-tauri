/**
 * Resolve the final database URL from the configured driver, name, and override.
 */
export function resolveDatabaseUrl(
  driver: string,
  name: string,
  explicitUrl?: string,
): string {
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl;
  }

  if (driver === "memory" || driver === "in-memory") {
    return ":memory:";
  }

  return `${driver}:${name}`;
}
