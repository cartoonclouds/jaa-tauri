import type { DatabaseDriver } from '~/services/database/DatabaseDriver'

declare module 'nuxt/app' {
  interface NuxtApp {
    $database: DatabaseDriver
  }
}

declare module '#app' {
  interface NuxtApp {
    $database: DatabaseDriver
  }
}

export {}
