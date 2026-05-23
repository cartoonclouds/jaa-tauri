import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { useNuxtApp } from "nuxt/app";

/**
 * Read the injected database driver from the current Nuxt app instance.
 *
 * Nuxt's generated typings can surface plugin injections as `unknown` during
 * standalone TypeScript checks, so this helper centralizes the cast in one
 * place instead of repeating it across service factories.
 */
export function getNuxtDatabase(): DatabaseDriver {
  return useNuxtApp().$database;
}
