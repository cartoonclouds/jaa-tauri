import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { SettingRepository } from "@modules/settings";
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


describe("SettingRepository.upsert", () => {
  it("writes defaults when payload is empty", async () => {
    const { db } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert({});

    expect(db.execute).toHaveBeenCalledOnce();
  });

  it("writes provided setting values", async () => {
    const { db } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert({
      theme: "dark",
      notificationsEnabled: false,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
