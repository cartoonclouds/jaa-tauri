import { defineNuxtPlugin } from "nuxt/app";
import { useRuntimeConfig } from "nuxt/app";

import { BetterSqliteDriver } from "@/services/database/BetterSqliteDriver.server";
import { InMemoryDriver } from "@/services/database/InMemoryDriver";
import { resolveDatabaseUrl } from "@/services/database/resolveDatabaseUrl";

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
  const normalizedDriver = driver.trim().toLowerCase();
  const database =
    normalizedDriver === "memory" || normalizedDriver === "in-memory"
      ? await InMemoryDriver.connect()
      : BetterSqliteDriver.connect(configuredUrl);

  return {
    provide: {
      database,
    },
  };
});



