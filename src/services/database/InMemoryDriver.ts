import type { DatabaseDriver } from "./DatabaseDriver";
import type { QueryBindings, QueryResult } from "./QueryBindings";

import { BetterSqliteDriver } from "./BetterSqliteDriver.server";

export class InMemoryDriver implements DatabaseDriver {
  readonly name = "in-memory";

  private constructor(private readonly delegate: DatabaseDriver) {}

  static connect(): Promise<InMemoryDriver> {
    return Promise.resolve(
      new InMemoryDriver(BetterSqliteDriver.connect(":memory:")),
    );
  }

  select<T = unknown>(sql: string, bindings: QueryBindings = []): Promise<T[]> {
    return this.delegate.select<T>(sql, bindings);
  }

  execute(sql: string, bindings: QueryBindings = []): Promise<QueryResult> {
    return this.delegate.execute(sql, bindings);
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    return await this.delegate.transaction(callback);
  }
}
