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

  /**
   * Converts a positional bindings array to a named-parameter object.
   * The SQL queries in this project use `$1, $2, $3, …` (SQLite named numeric
   * parameters). better-sqlite3 requires named params to be passed as an object
   * whose keys are the parameter names without the leading sigil, so `$1` maps
   * to key `"1"`.
   */
  private static namedBindings(
    bindings: QueryBindings,
  ): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < bindings.length; i++) {
      obj[String(i + 1)] = bindings[i];
    }
    return obj;
  }

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
    const stmt = this.db.prepare(sql);
    const result = (
      bindings.length > 0
        ? stmt.all(BetterSqliteDriver.namedBindings(bindings))
        : stmt.all()
    ) as T[];

    return Promise.resolve(result);
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    const stmt = this.db.prepare(sql);
    const result = (
      bindings.length > 0
        ? stmt.run(BetterSqliteDriver.namedBindings(bindings))
        : stmt.run()
    ) as {
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
