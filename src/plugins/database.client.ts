import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { isTauri } from "@tauri-apps/api/core";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

import { ensureMigrationsAppliedOnFirstRun } from "@/services/database/ensureMigrationsApplied.client";
import { resolveDatabaseUrl } from "@/services/database/resolveDatabaseUrl";
import { seedConstantsOnFirstRun } from "@/services/database/seedConstants.client";
import { TauriSqliteDriver } from "@/services/database/TauriSqliteDriver.client";

function createBrowserNoopDatabaseDriver(): DatabaseDriver {
  const driver: DatabaseDriver = {
    name: "browser-noop",
    async select<T = unknown>(): Promise<T[]> {
      return [];
    },
    async execute() {
      return {
        rowsAffected: 0,
      };
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
  const config = useRuntimeConfig() as {
    public: {
      appDatabaseDriver?: string;
      appDatabaseName?: string;
      appDatabaseUrl?: string;
    };
  };

  const driver = config.public.appDatabaseDriver ?? "sqlite";
  const name = config.public.appDatabaseName ?? "applyflow.db";
  const explicitUrl = config.public.appDatabaseUrl ?? undefined;
  const configuredUrl = resolveDatabaseUrl(driver, name, explicitUrl);

  const isSqliteUrl = configuredUrl.startsWith("sqlite:");

  if (!isTauri()) {
    if (!import.meta.dev) {
      throw new Error(
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
    throw new Error(
      `Invalid database URL "${configuredUrl}". This desktop app requires a sqlite:* URL.`,
    );
  }

  const database = await TauriSqliteDriver.connect(configuredUrl);
  await ensureMigrationsAppliedOnFirstRun(database);
  await seedConstantsOnFirstRun(database);

  return {
    provide: {
      database,
    },
  };
});
