import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ResponseRate } from "@modules/statistics/domain/executables/responseRate";
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

describe("ResponseRate", () => {
  it("computes response rate and negative points trend", async () => {
    const { db } = createMockDb([
      {
        responded: 4,
        applied: 8,
        responded_last_30: 1,
        applied_last_30: 4,
        responded_previous_30: 3,
        applied_previous_30: 4,
      },
    ]);
    const executable = new ResponseRate(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(50);

    const view = executable.toView();
    expect(view.id).toBe(ResponseRate.id);
    expect(view.value).toBe(50);
    expect(view.suffix).toBe("%");
    expect(view.trendLabel).toBe("vs previous 30-day response rate");
    expect(view.trendValue).toBe("-50pp");
    expect(view.trendTone).toBe("negative");
  });

  it("propagates database errors", async () => {
    const executable = new ResponseRate(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
