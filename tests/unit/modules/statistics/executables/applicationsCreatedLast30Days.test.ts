import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ApplicationsCreatedLast30Days } from "@modules/statistics/domain/executables/applicationsCreatedLast30Days";
import { describe, expect, it, vi } from "vitest";

type LocalSelectRows = Record<string, unknown>[];

function createMockDb(rows: LocalSelectRows = []): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn(() => Promise.resolve(rows));
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 0 }));
  const transactionMock = vi.fn(
    <T>(callback: (tx: DatabaseDriver) => Promise<T>) => callback(db),
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

function createFailingDb(error: Error): DatabaseDriver {
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
describe("ApplicationsCreatedLast30Days", () => {
  it("computes value and positive trend percentage", async () => {
    const { db } = createMockDb([
      {
        applicationsCreatedLast30Days: 12,
        applicationsCreatedPrevious30Days: 6,
      },
    ]);
    const executable = new ApplicationsCreatedLast30Days(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(12);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsCreatedLast30Days.id);
    expect(view.value).toBe(12);
    expect(view.trendValue).toBe("+100%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsCreatedLast30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
