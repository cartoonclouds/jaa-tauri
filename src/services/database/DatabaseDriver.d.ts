import type { QueryBindings, QueryResult } from "./QueryBindings";

/**
 * Abstraction over the database driver used by the app.
 */
export interface DatabaseDriver {
  /** Human-readable driver name. */
  readonly name: string;

  /** Execute a SELECT query and return typed rows. */
  select<T = unknown>(sql: string, bindings?: QueryBindings): Promise<T[]>;

  /** Execute a write query and return metadata about the change. */
  execute(sql: string, bindings?: QueryBindings): Promise<QueryResult>;

  /** Execute a transaction with a transaction-scoped driver instance. */
  transaction<T>(callback: (tx: DatabaseDriver) => Promise<T>): Promise<T>;
}
