import { ApplicationRepository } from "@modules/applications";
import { ApplicationEventFlowStatus } from "@modules/applications/types/enums";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
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

    expect(db.execute).toHaveBeenCalledOnce();
    const executeArguments = vi.mocked(db.execute).mock.calls[0];
    const values = executeArguments?.[1] as unknown[];

    expect(values).toBeDefined();
    expect(values[4]).toBe(ApplicationEventFlowStatus.Applied.value);
  });
});
