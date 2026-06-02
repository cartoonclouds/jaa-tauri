import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { CompanyRepository } from "@modules/companies";
import { describe, expect, it, vi } from "vitest";
type LocalSelectRows = Record<string, unknown>[];

type LocalSelectImplementation = (
  sql: unknown,
  bindings?: unknown,
) => Promise<LocalSelectRows>;

type LocalExecuteImplementation = (
  sql: unknown,
  bindings?: unknown,
) => Promise<{ rowsAffected: number }>;

type LocalTransactionImplementation = <T>(
  callback: (tx: DatabaseDriver) => Promise<T>,
) => Promise<T>;

interface LocalMockDbOptions {
  select?: LocalSelectImplementation;
  execute?: LocalExecuteImplementation;
  transaction?: LocalTransactionImplementation;
}

function createMockDbWithOptions(
  rows: LocalSelectRows = [],
  options: LocalMockDbOptions = {},
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


function mockDb() {
  const { db, selectMock } = createMockDbWithOptions();

  return {
    db,
    selectMock,
  };
}

describe("CompanyRepository associations", () => {
  it("derives application status without relying on applications.status column", async () => {
    const { db, selectMock } = mockDb();
    selectMock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "app-1",
          title: "Frontend Engineer",
          status: "offer",
          applied_at: "2026-05-01T10:00:00.000Z",
        },
      ]),
    );

    const repository = new CompanyRepository(db);
    const applications =
      await repository.listAssociatedApplications("company-1");

    expect(applications).toEqual([
      {
        id: "app-1",
        title: "Frontend Engineer",
        status: "offer",
        appliedAt: "2026-05-01T10:00:00.000Z",
      },
    ]);

    expect(selectMock).toHaveBeenCalledTimes(1);
    const query = selectMock.mock.calls[0]?.[0];
    if (typeof query !== "string") {
      throw new Error("Expected SQL query to be passed to db.select");
    }
    expect(query).toContain("CASE");
    expect(query).toContain("AS status");
    expect(query).toContain("applications.deleted_at IS NULL");
    expect(query).not.toContain("applications.status");
  });

  it("falls back to saved status when derived value is missing", async () => {
    const { db, selectMock } = mockDb();
    selectMock.mockImplementation(() =>
      Promise.resolve([
        {
          id: "app-2",
          title: "Backend Engineer",
          status: null,
          applied_at: null,
        },
      ]),
    );

    const repository = new CompanyRepository(db);
    const applications =
      await repository.listAssociatedApplications("company-2");

    expect(applications).toEqual([
      {
        id: "app-2",
        title: "Backend Engineer",
        status: "saved",
        appliedAt: null,
      },
    ]);
  });
});
