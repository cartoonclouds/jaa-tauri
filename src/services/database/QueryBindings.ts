export type QueryValue =
  | string
  | number
  | boolean
  | null
  | Uint8Array

export type QueryBindings = QueryValue[]

export interface QueryResult {
  rowsAffected: number
  lastInsertId?: number
}
