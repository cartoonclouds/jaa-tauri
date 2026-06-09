import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { vi } from "vitest";

/** Build a typed database driver mock for metric and repository unit tests. */
export function createDatabaseDriverMock(): {
  driver: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn();
  const executeMock = vi.fn();
  const transactionMock = vi.fn(
    async (callback: (tx: DatabaseDriver) => Promise<unknown>) =>
      callback(driver),
  );

  const driver: DatabaseDriver = {
    name: "mock-driver",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock as unknown as DatabaseDriver["transaction"],
  };

  return {
    driver,
    selectMock,
    executeMock,
    transactionMock,
  };
}
