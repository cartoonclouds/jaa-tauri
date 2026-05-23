declare module "better-sqlite3" {
  interface Statement {
    /** Execute the statement and return the low-level result. */
    run(...params: unknown[]): unknown;
    /** Execute the statement and return every matching row. */
    all(...params: unknown[]): unknown[];
  }

  interface Database {
    /** Execute raw SQL without returning rows. */
    exec(sql: string): unknown;
    /** Prepare a statement for repeated execution. */
    prepare(sql: string): Statement;
    /** Execute a pragma statement. */
    pragma(sql: string): unknown;
    /** Wrap the callback in a transaction and return the transactional runner. */
    transaction<T>(callback: () => T): () => T;
    /** Close the underlying database connection. */
    close(): void;
  }

  /** Constructor used to open a SQLite database file. */
  const Database: new (filename: string) => Database;

  export default Database;
}



