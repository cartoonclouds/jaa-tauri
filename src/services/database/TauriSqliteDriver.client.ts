import type { DatabaseDriver } from "./DatabaseDriver";
import type { QueryBindings, QueryResult } from "./QueryBindings";

import Database from "@tauri-apps/plugin-sql";

/**
 * Type alias for tauri database.
 */
type TauriDatabase = Awaited<ReturnType<typeof Database.load>>;

/**
 * Implements tauri sqlite driver.
 */
export class TauriSqliteDriver implements DatabaseDriver {
  readonly name = "tauri-sqlite";

  constructor(private readonly db: TauriDatabase) {}

  static async connect(
    databaseUrl = "sqlite:applyflow.db",
  ): Promise<TauriSqliteDriver> {
    if (databaseUrl === ":memory:") {
      throw new Error(
        "In-memory SQLite is not supported by the Tauri SQL plugin URL format.",
      );
    }

    const normalizedUrl = databaseUrl.startsWith("sqlite:")
      ? databaseUrl
      : `sqlite:${databaseUrl}`;

    const db = await Database.load(normalizedUrl);

    await db.execute("PRAGMA foreign_keys = ON");

    return new TauriSqliteDriver(db);
  }

  async select<T = unknown>(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<T[]> {
    return await this.db.select<T[]>(sql, bindings);
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    const result = await this.db.execute(sql, bindings);

    return {
      rowsAffected: result.rowsAffected,
      lastInsertId: result.lastInsertId,
    };
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    // Tauri SQL plugin execute calls may not preserve transaction scope
    // across separate statements, so explicit BEGIN/COMMIT can fail with
    // "no transaction is active".
    return await callback(this);
  }
}
