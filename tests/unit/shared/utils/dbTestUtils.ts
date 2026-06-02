import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { vi } from "vitest";

type SelectImplementation = (
  sql: unknown,
  bindings?: unknown,
) => Promise<Record<string, unknown>[]>;

type ExecuteImplementation = (
  sql: unknown,
  bindings?: unknown,
) => Promise<{ rowsAffected: number }>;

type TransactionImplementation = <T>(
  callback: (tx: DatabaseDriver) => Promise<T>,
) => Promise<T>;

interface MockDbOptions {
  select?: SelectImplementation;
  execute?: ExecuteImplementation;
  transaction?: TransactionImplementation;
}

export function createMockDb(rows: Record<string, unknown>[] = []): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  return createMockDbWithOptions(rows);
}

export function createMockDbWithOptions(
  rows: Record<string, unknown>[] = [],
  options: MockDbOptions = {},
): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn(options.select ?? (() => Promise.resolve(rows)));
  const executeMock = vi.fn(
    options.execute ?? (() => Promise.resolve({ rowsAffected: 0 })),
  );
  const transactionMock = vi.fn(
    options.transaction ??
      (<T>(callback: (tx: DatabaseDriver) => Promise<T>) => callback(db)),
  );

  const db = {
    name: "mock",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock,
  } as unknown as DatabaseDriver;

  return {
    db,
    selectMock,
    executeMock,
    transactionMock,
  };
}

export function createFailingDb(error: Error): DatabaseDriver {
  const selectMock = vi.fn(() => Promise.reject(error));

  const db = {
    name: "mock",
    select: selectMock,
    execute: vi.fn(() => Promise.resolve({ rowsAffected: 0 })),
    transaction: vi.fn(<T>(callback: (tx: DatabaseDriver) => Promise<T>) =>
      callback(db),
    ),
  } as unknown as DatabaseDriver;

  return db;
}
