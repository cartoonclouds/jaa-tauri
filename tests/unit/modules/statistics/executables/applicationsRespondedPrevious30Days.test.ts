import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ApplicationsRespondedPrevious30Days } from "@modules/statistics/domain/executables/applicationsRespondedPrevious30Days";
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
describe("ApplicationsRespondedPrevious30Days", () => {
  it("returns count and positive trend", async () => {
    const { db } = createMockDb([{ applicationsRespondedPrevious30Days: 1 }]);
    const executable = new ApplicationsRespondedPrevious30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(1);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsRespondedPrevious30Days.id);
    expect(view.value).toBe(1);
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsRespondedPrevious30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
