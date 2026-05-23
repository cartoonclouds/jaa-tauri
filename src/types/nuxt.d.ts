import type { DatabaseDriver } from "../services/database/DatabaseDriver";

declare module "nuxt/app" {
  interface NuxtApp {
    /** Database driver exposed through Nuxt app injection. */
    $database: DatabaseDriver;
  }

  /**
   * Retrieve the current Nuxt application instance with database injection typed.
   */
  function useNuxtApp(): NuxtApp & {
    /** Database driver exposed through Nuxt app injection. */
    $database: DatabaseDriver;
  };
}

declare module "#app" {
  interface NuxtApp {
    /** Database driver exposed through Nuxt app injection. */
    $database: DatabaseDriver;
  }

  /**
   * Retrieve the current Nuxt application instance with database injection typed.
   */
  function useNuxtApp(): NuxtApp & {
    /** Database driver exposed through Nuxt app injection. */
    $database: DatabaseDriver;
  };
}

declare module "vue" {
  interface ComponentCustomProperties {
    /** Database driver exposed on Vue component instances. */
    $database: DatabaseDriver;
  }
}

export {};



