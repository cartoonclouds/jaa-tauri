import { defineNuxtPlugin } from "nuxt/app";
import { useRuntimeConfig } from "nuxt/app";

import { BetterSqliteDriver } from "@/services/database/BetterSqliteDriver.server";
import { InMemoryDriver } from "@/services/database/InMemoryDriver";
import { resolveDatabaseRuntimeConfig } from "@/services/database/resolveDatabaseRuntimeConfig";

export default defineNuxtPlugin(async () => {
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
