/**
 * Runtime configuration values injected into the Nuxt app.
 */
export interface DatabasePublicRuntimeConfig {
  /** Optional database driver override. */
  appDatabaseDriver?: string;
  /** Optional database name override. */
  appDatabaseName?: string;
  /** Optional database URL override. */
  appDatabaseUrl?: string;
}
