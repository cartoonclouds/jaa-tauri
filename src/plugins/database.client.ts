import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import {
  ConfigurationError,
  RuntimeEnvironmentError,
} from "@shared/domain/errors";
import { isTauri } from "@tauri-apps/api/core";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

import { ensureMigrationsAppliedOnFirstRun } from "@/services/database/ensureMigrationsApplied.client";
import { resolveDatabaseRuntimeConfig } from "@/services/database/resolveDatabaseRuntimeConfig";
import { seedConstantsOnFirstRun } from "@/services/database/seedConstants.client";
import { TauriSqliteDriver } from "@/services/database/TauriSqliteDriver.client";

/**
 * Creates browser noop database driver.
 */
function createBrowserNoopDatabaseDriver(): DatabaseDriver {
  const driver: DatabaseDriver = {
    name: "browser-noop",
    select<T = unknown>(): Promise<T[]> {
      return Promise.resolve([]);
    },
    execute() {
      return Promise.resolve({
        rowsAffected: 0,
      });
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
  const databaseConfig = resolveDatabaseRuntimeConfig(
    useRuntimeConfig().public,
  );

  const isSqliteUrl = databaseConfig.configuredUrl.startsWith("sqlite:");

  if (!isTauri()) {
    if (!import.meta.dev) {
      throw new RuntimeEnvironmentError(
        "SQLite database is only supported inside Tauri runtime. Start the app with Tauri.",
      );
    }

    console.warn(
      "[database] Running outside Tauri in dev mode; using browser no-op database driver for UI smoke tests.",
    );

    return {
      provide: {
        database: createBrowserNoopDatabaseDriver(),
      },
    };
  }

  if (!isSqliteUrl) {
    throw new ConfigurationError(
      `Invalid database URL "${databaseConfig.configuredUrl}". This desktop app requires a sqlite:* URL.`,
    );
  }

  const database = await TauriSqliteDriver.connect(
    databaseConfig.configuredUrl,
  );
  await ensureMigrationsAppliedOnFirstRun(database);
  await seedConstantsOnFirstRun(database);

  return {
    provide: {
      database,
    },
  };
});
