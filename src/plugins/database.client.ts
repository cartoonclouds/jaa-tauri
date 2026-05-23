import { isTauri } from "@tauri-apps/api/core";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

import { ensureMigrationsAppliedOnFirstRun } from "@/services/database/ensureMigrationsApplied.client";
import { resolveDatabaseUrl } from "@/services/database/resolveDatabaseUrl";
import { seedConstantsOnFirstRun } from "@/services/database/seedConstants.client";
import { TauriSqliteDriver } from "@/services/database/TauriSqliteDriver.client";

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
    throw new Error(
      "SQLite database is only supported inside Tauri runtime. Start the app with Tauri.",
    );
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
