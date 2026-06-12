import path from "node:path";

import { FactoryConfigurationError } from "./errors";

/** Environment record loaded from `.env` files. */
export type AppSeedEnv = Record<string, string>;

/** Minimal interface for a prepared SQLite statement. */
export interface SqliteStatement {
  run(...params: SqlValue[]): unknown;
  all(...params: SqlValue[]): unknown[];
  get(...params: SqlValue[]): unknown;
}

/** Minimal interface for a SQLite database connection. */
export interface SqliteDatabaseLike {
  exec(sql: string): unknown;
  prepare(sql: string): SqliteStatement;
  pragma(sql: string): unknown;
  transaction<T>(callback: () => T): () => T;
  close(): void;
}

export type SqlValue = string | number | bigint | Uint8Array | null;

/**
 * Resolves a database URL from environment variables.
 */
export function resolveDatabaseUrlFromEnv(env: AppSeedEnv): string {
  const explicitUrl = env.APP_DATABASE_URL;
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl;
  }

  const driver = env.APP_DATABASE_DRIVER ?? "sqlite";
  const name = env.APP_DATABASE_NAME ?? "applyflow.db";

  if (driver === "memory" || driver === "in-memory") {
    return ":memory:";
  }

  return `${driver}:${name}`;
}

/**
 * Resolves an absolute SQLite file path from a database URL string.
 */
export function resolveSqliteFile(databaseUrl: string): string {
  if (databaseUrl === ":memory:") {
    return databaseUrl;
  }

  if (databaseUrl.startsWith("sqlite:")) {
    const file = databaseUrl.slice("sqlite:".length);
    if (!file) {
      throw new FactoryConfigurationError(
        "Invalid sqlite URL. Example: sqlite:applyflow.db",
      );
    }

    return path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.resolve(process.cwd(), databaseUrl);
}
