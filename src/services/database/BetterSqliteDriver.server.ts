import type { DatabaseDriver } from "./DatabaseDriver";
import type { QueryBindings, QueryResult } from "./QueryBindings";

import { ConfigurationError } from "@shared/domain/errors";
import Database from "better-sqlite3";
import path from "node:path";

/**
 * Type alias for better sqlite database.
 */
type BetterSqliteDatabase = InstanceType<typeof Database>;

/**
 * Implements better sqlite driver.
 */
export class BetterSqliteDriver implements DatabaseDriver {
  readonly name = "better-sqlite3";

  constructor(private readonly db: BetterSqliteDatabase) {}

  static connect(databaseUrl = "sqlite:applyflow.db"): BetterSqliteDriver {
    if (databaseUrl === ":memory:") {
      return new BetterSqliteDriver(new Database(":memory:"));
    }

    if (databaseUrl.startsWith("sqlite:")) {
      const file = databaseUrl.slice("sqlite:".length);
      if (!file) {
        throw new ConfigurationError(
          "Invalid sqlite URL. Example: sqlite:applyflow.db",
        );
      }

      return new BetterSqliteDriver(
        new Database(
          path.isAbsolute(file) ? file : path.resolve(process.cwd(), file),
        ),
      );
    }

    return new BetterSqliteDriver(
      new Database(
        path.isAbsolute(databaseUrl)
          ? databaseUrl
          : path.resolve(process.cwd(), databaseUrl),
      ),
    );
  }

  async select<T = unknown>(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<T[]> {
    const result = this.db.prepare(sql).all(...bindings) as T[];

    return Promise.resolve(result);
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    const result = this.db.prepare(sql).run(...bindings) as {
      changes: number;
      lastInsertRowid?: number | bigint;
    };

    return Promise.resolve({
      rowsAffected: result.changes,
      lastInsertId:
        typeof result.lastInsertRowid === "bigint"
          ? Number(result.lastInsertRowid)
          : result.lastInsertRowid,
    });
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    this.db.exec("BEGIN");

    try {
      const result = await callback(this);
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}
