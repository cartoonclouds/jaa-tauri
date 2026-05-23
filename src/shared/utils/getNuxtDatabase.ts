import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { NuxtApp } from "nuxt/app";

import { useNuxtApp } from "nuxt/app";

const databaseByApp = new WeakMap<NuxtApp, DatabaseDriver>();

/**
 * Checks whether database driver is true.
 */
function isDatabaseDriver(value: unknown): value is DatabaseDriver {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    name?: unknown;
    select?: unknown;
    execute?: unknown;
    transaction?: unknown;
  };

  return (
    typeof candidate.name === "string" &&
    typeof candidate.select === "function" &&
    typeof candidate.execute === "function" &&
    typeof candidate.transaction === "function"
  );
}

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

  const injectedDatabase = nuxtApp.$database;
  if (!isDatabaseDriver(injectedDatabase)) {
    throw new Error("Nuxt database injection is unavailable or invalid.");
  }

  const database = injectedDatabase;
  databaseByApp.set(nuxtApp, database);

  return database;
}




