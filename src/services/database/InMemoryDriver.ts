import type { DatabaseDriver } from './DatabaseDriver'
import type { QueryBindings, QueryResult } from './QueryBindings'

export class InMemoryDriver implements DatabaseDriver {
  readonly name = 'in-memory'

  async select<T = unknown>(
    _sql: string,
    _bindings: QueryBindings = [],
  ): Promise<T[]> {
    return []
  }

  async execute(
    _sql: string,
    _bindings: QueryBindings = [],
  ): Promise<QueryResult> {
    return {
      rowsAffected: 0,
    }
  }

  async transaction<T>(
    callback: (tx: DatabaseDriver) => Promise<T>,
  ): Promise<T> {
    return await callback(this)
  }
}
