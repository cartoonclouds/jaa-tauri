import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { TagModelType } from "@modules/tags";
import { TagRepository } from "@modules/tags";
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

describe("TagRepository.create", () => {
  it("rejects empty tag name", async () => {
    const { db } = createMockDb();
    const repository = new TagRepository(db);

    await expect(
      repository.create({ name: "  ", color: null }),
    ).rejects.toThrow("Tag name is required");
  });

  it("inserts tag row with default model type", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new TagRepository(db);

    await repository.create({ name: "urgent", color: null });

    expect(executeMock).toHaveBeenCalledOnce();
    const [sql, params] = executeMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("model_type");
    expect(params).toContain("general");
  });

  it("inserts tag row with provided model type", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new TagRepository(db);

    await repository.create({
      name: "referral",
      color: null,
      modelType: TagModelType.Application,
    });

    const [, params] = executeMock.mock.calls[0] as [string, unknown[]];
    expect(params).toContain("application");
  });
});
