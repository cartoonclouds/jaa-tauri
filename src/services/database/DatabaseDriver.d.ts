import type { QueryBindings, QueryResult } from './QueryBindings'

export interface DatabaseDriver {
  readonly name: string

  select<T = unknown>(
    sql: string,
    bindings?: QueryBindings,
  ): Promise<T[]>

  execute(
    sql: string,
    bindings?: QueryBindings,
  ): Promise<QueryResult>

  transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T>
}
