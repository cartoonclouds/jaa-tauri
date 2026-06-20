import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { defineNuxtPlugin } from "nuxt/app";
import { useRuntimeConfig } from "nuxt/app";

import { BetterSqliteDriver } from "@/services/database/BetterSqliteDriver.server";
import { InMemoryDriver } from "@/services/database/InMemoryDriver";
import { resolveDatabaseRuntimeConfig } from "@/services/database/resolveDatabaseRuntimeConfig";

/**
 * Creates a no-op database driver for static prerendering contexts.
 */
function createServerNoopDatabaseDriver() {
  const driver: DatabaseDriver = {
    name: "server-noop",
    select<T = unknown>(): Promise<T[]> {
      return Promise.resolve([]);
    },
    execute() {
      return Promise.resolve({ rowsAffected: 0 });
    },
    async transaction<T>(
      callback: (tx: DatabaseDriver) => Promise<T>,
    ): Promise<T> {
      return await callback(driver);
    },
  };

  return driver;
}

export default defineNuxtPlugin(async () => {
  if (import.meta.prerender) {
    console.warn(
      "[database] Running Nuxt server in prerender mode; using server no-op database driver.",
    );

    return {
      provide: {
        database: createServerNoopDatabaseDriver(),
      },
    };
  }

  if (import.meta.dev) {
    console.warn(
      "[database] Running Nuxt server in dev mode; using server no-op database driver.",
    );

    return {
      provide: {
        database: createServerNoopDatabaseDriver(),
      },
    };
  }

  const databaseConfig = resolveDatabaseRuntimeConfig(
    useRuntimeConfig().public,
  );
  const database =
    databaseConfig.normalizedDriver === "memory" ||
    databaseConfig.normalizedDriver === "in-memory"
      ? await InMemoryDriver.connect()
      : BetterSqliteDriver.connect(databaseConfig.configuredUrl);

  return {
    provide: {
      database,
    },
  };
});
