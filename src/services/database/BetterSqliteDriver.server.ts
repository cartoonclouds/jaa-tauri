import type { DatabaseDriver } from "./DatabaseDriver";
import type { QueryBindings, QueryResult } from "./QueryBindings";

import Database from "better-sqlite3";
import path from "node:path";

type BetterSqliteDatabase = InstanceType<typeof Database>;

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
        throw new Error("Invalid sqlite URL. Example: sqlite:applyflow.db");
      }

      return new BetterSqliteDriver(
        new Database(path.resolve(process.cwd(), file)),
      );
    }

    return new BetterSqliteDriver(
      new Database(path.resolve(process.cwd(), databaseUrl)),
    );
  }

  async select<T = unknown>(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<T[]> {
    return this.db.prepare(sql).all(...bindings) as T[];
  }

  async execute(
    sql: string,
    bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    const result = this.db.prepare(sql).run(...bindings) as {
      changes: number;
      lastInsertRowid?: number | bigint;
    };

    return {
      rowsAffected: result.changes,
      lastInsertId:
        typeof result.lastInsertRowid === "bigint"
          ? Number(result.lastInsertRowid)
          : result.lastInsertRowid,
    };
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
