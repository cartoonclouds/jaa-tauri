import { ApplicationRepository } from "@modules/applications";
import { ApplicationEventFlowStatus } from "@modules/applications/types/enums";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  const db = {
    execute: vi.fn(async (..._args: unknown[]) => ({ rowsAffected: 1 })),
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(db),
    ),
  };

  return db;
}

describe("ApplicationRepository.create", () => {
  it("rejects empty title", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db as never);

    await expect(repository.create({ title: "   " })).rejects.toThrow(
      "Application title is required",
    );
  });

  it("writes a row with default status and applied flow", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db as never);

    await repository.create({ title: "Frontend Engineer" });

    expect(db.execute).toHaveBeenCalledTimes(2);
    const values = vi.mocked(db.execute).mock.calls[0]?.[1];

    expect(Array.isArray(values)).toBe(true);
    expect((values as unknown[])[4]).toBe(
      ApplicationEventFlowStatus.Applied.value,
    );
  });
});
