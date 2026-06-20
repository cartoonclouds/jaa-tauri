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
import { seedProductionBootstrapOnFirstRun } from "@/services/database/seedProductionBootstrap.client";
import { TauriSqliteDriver } from "@/services/database/TauriSqliteDriver.client";

/**
 * Detects migration checksum mismatch errors raised by the Tauri SQL plugin.
 */
function isMigrationChecksumMismatchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /previously applied but has been modified/i.test(error.message);
}

/**
 * Builds a fallback sqlite URL for development recovery after migration drift.
 */
function toDevRecoverySqliteUrl(sqliteUrl: string): string {
  const sqlitePrefix = "sqlite:";
  const fileName = sqliteUrl.slice(sqlitePrefix.length);

  if (fileName.length === 0) {
    return "sqlite:applyflow.dev-recovery.db";
  }

  if (fileName.endsWith(".db")) {
    return `sqlite:${fileName.slice(0, -3)}.dev-recovery.db`;
  }

  return `sqlite:${fileName}.dev-recovery`;
}

/**
 * Connects to sqlite and applies a dev-only recovery fallback for migration drift.
 */
async function connectWithDevRecovery(
  sqliteUrl: string,
): Promise<TauriSqliteDriver> {
  try {
    return await TauriSqliteDriver.connect(sqliteUrl);
  } catch (error) {
    if (!import.meta.dev || !isMigrationChecksumMismatchError(error)) {
      throw error;
    }

    const recoveryUrl = toDevRecoverySqliteUrl(sqliteUrl);

    console.warn(
      "[database] migration checksum mismatch detected in dev; retrying with recovery database",
      {
        originalUrl: sqliteUrl,
        recoveryUrl,
      },
    );

    return await TauriSqliteDriver.connect(recoveryUrl);
  }
}

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

  console.info(
    `[database] bootstrap start: url=${databaseConfig.configuredUrl}`,
  );

  try {
    const database = await connectWithDevRecovery(databaseConfig.configuredUrl);
    console.info("[database] connection established");

    await ensureMigrationsAppliedOnFirstRun(database);
    console.info("[database] migration schema checks complete");

    await seedProductionBootstrapOnFirstRun(database);
    console.info("[database] production bootstrap seeding complete");

    await seedConstantsOnFirstRun(database);
    console.info("[database] constants seeding complete");

    return {
      provide: {
        database,
      },
    };
  } catch (error) {
    if (!import.meta.dev) {
      throw error;
    }

    console.error(
      "[database] dev bootstrap failed; falling back to browser no-op database driver",
      error,
    );

    return {
      provide: {
        database: createBrowserNoopDatabaseDriver(),
      },
    };
  }
});
