declare module "better-sqlite3" {
  interface Statement {
    run(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  interface Database {
    exec(sql: string): unknown;
    prepare(sql: string): Statement;
    pragma(sql: string): unknown;
    transaction<T>(callback: () => T): () => T;
    close(): void;
  }

  const Database: new (filename: string) => Database;

  export default Database;
}
