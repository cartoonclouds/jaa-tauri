/**
 * Single binding value supported by the database adapters.
 */
export type QueryValue = string | number | boolean | null | Uint8Array;

/**
 * Ordered list of query binding values.
 */
export type QueryBindings = QueryValue[];

/**
 * Result metadata returned from data-modifying queries.
 */
export interface QueryResult {
  /** Number of rows affected by the query. */
  rowsAffected: number;
  /** Row id assigned by the last insert, if available. */
  lastInsertId?: number;
}
