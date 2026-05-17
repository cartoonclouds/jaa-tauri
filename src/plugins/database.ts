import type { DatabaseDriver } from '~/services/database/DatabaseDriver'

import { defineNuxtPlugin } from 'nuxt/app'

// Example SQLite driver implementation (replace with real one as needed)
class SQLiteDriver implements DatabaseDriver {
  readonly name = 'sqlite'

  async select<T = unknown>(_: string, __?: unknown[]): Promise<T[]> {
    await Promise.resolve(); // silence async/await warning
    return []
  }

  async execute(_: string, __?: unknown[]): Promise<{ rowsAffected: number; lastInsertId?: number }> {
    await Promise.resolve();
    return { rowsAffected: 0 }
  }

  async transaction<T>(callback: (tx: DatabaseDriver) => Promise<T>): Promise<T> {
    return callback(this)
  }
}

export default defineNuxtPlugin(() => {
  const driver = new SQLiteDriver()

  return {
    provide: {
      database: driver,
    },
  }
})
