import type { DatabasePublicRuntimeConfig } from "@/types/runtime-config";

import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

import { TauriSqliteDriver } from "./TauriSqliteDriver.client";

function resolveDatabaseUrl(
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

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig() as { public: DatabasePublicRuntimeConfig };
  const driver = config.public.appDatabaseDriver ?? "sqlite";
  const name = config.public.appDatabaseName ?? "jaa.db";
  const explicitUrl = config.public.appDatabaseUrl ?? undefined;

  const databaseUrl = resolveDatabaseUrl(driver, name, explicitUrl);

  const database = await TauriSqliteDriver.connect(databaseUrl);

  return {
    provide: {
      database,
    },
  };
});
