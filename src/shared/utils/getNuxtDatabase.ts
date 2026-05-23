import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { NuxtApp } from "nuxt/app";

import { useNuxtApp } from "nuxt/app";

const databaseByApp = new WeakMap<NuxtApp, DatabaseDriver>();

/**
 * Read the injected database driver from the current Nuxt app instance.
 *
 * Nuxt's generated typings can surface plugin injections as `unknown` during
 * standalone TypeScript checks, so this helper centralizes the cast in one
 * place instead of repeating it across service factories.
 */
export function getNuxtDatabase(): DatabaseDriver {
  const nuxtApp = useNuxtApp();
  const existingDatabase = databaseByApp.get(nuxtApp);

  if (existingDatabase) {
    return existingDatabase;
  }

  const database = nuxtApp.$database;
  databaseByApp.set(nuxtApp, database);

  return database;
}
