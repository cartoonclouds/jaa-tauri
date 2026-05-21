import { defineNuxtPlugin } from "nuxt/app";
import { useRuntimeConfig } from "nuxt/app";

import { BetterSqliteDriver } from "@/services/database/BetterSqliteDriver.server";
import { resolveDatabaseUrl } from "@/services/database/resolveDatabaseUrl";

export default defineNuxtPlugin(() => {
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

  return {
    provide: {
      database: BetterSqliteDriver.connect(configuredUrl),
    },
  };
});
