import type { DatabasePublicRuntimeConfig } from "@/types/runtime-config";

import { resolveDatabaseUrl } from "@/services/database/resolveDatabaseUrl";

/**
 * Defines the resolved database runtime configuration used by database plugins.
 */
export interface ResolvedDatabaseRuntimeConfig {
  driver: string;
  name: string;
  explicitUrl?: string;
  configuredUrl: string;
  normalizedDriver: string;
}

/**
 * Resolve database runtime config values and derived URL details.
 */
export function resolveDatabaseRuntimeConfig(
  publicConfig: DatabasePublicRuntimeConfig,
): ResolvedDatabaseRuntimeConfig {
  const driver = publicConfig.appDatabaseDriver ?? "sqlite";
  const name = publicConfig.appDatabaseName ?? "applyflow.db";
  const explicitUrl = publicConfig.appDatabaseUrl ?? undefined;

  return {
    driver,
    name,
    explicitUrl,
    configuredUrl: resolveDatabaseUrl(driver, name, explicitUrl),
    normalizedDriver: driver.trim().toLowerCase(),
  };
}
