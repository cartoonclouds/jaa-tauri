import type { DatabaseDriver } from "./DatabaseDriver";
import type { QueryBindings, QueryResult } from "./QueryBindings";

import Database from "@tauri-apps/plugin-sql";

type TauriDatabase = Awaited<ReturnType<typeof Database.load>>;

export class TauriSqliteDriver implements DatabaseDriver {
  readonly name = "tauri-sqlite";

  constructor(private readonly db: TauriDatabase) {}

  static async connect(path = "sqlite:jaa.db"): Promise<TauriSqliteDriver> {
    const db = await Database.load(path);

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
    await this.execute("BEGIN");

    try {
      const result = await callback(this);
      await this.execute("COMMIT");
      return result;
    } catch (error) {
      await this.execute("ROLLBACK");
      throw error;
    }
  }
}
