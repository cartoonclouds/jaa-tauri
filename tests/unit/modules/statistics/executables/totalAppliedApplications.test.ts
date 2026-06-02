import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { TotalAppliedApplications } from "@modules/statistics/domain/executables/totalAppliedApplications";
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
describe("TotalAppliedApplications", () => {
  it("returns count and populates trend fields", async () => {
    const { db } = createMockDb([{ totalAppliedApplications: 13 }]);
    const executable = new TotalAppliedApplications(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(13);

    const view = executable.toView();
    expect(view.id).toBe(TotalAppliedApplications.id);
    expect(view.value).toBe(13);
    expect(view.trendLabel).toBe("Change vs total applications");
    expect(view.trendValue).toBe("+13%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new TotalAppliedApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
