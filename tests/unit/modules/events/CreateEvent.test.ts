import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { EventRepository } from "@modules/events";
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
  const { db } = createMockDbWithOptions([], {
    select: (sql: unknown) => {
      if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
        return Promise.resolve([{ id: "Interview/Technical Interview" }]);
      }

      return Promise.resolve([]);
    },
    execute: () => Promise.resolve({ rowsAffected: 1 }),
  });

  return db;
}

describe("EventRepository.create", () => {
  it("rejects missing required fields", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);

    await expect(
      repository.create({
        applicationId: "",
        type: "" as never,
        title: "",
        description: null,
      }),
    ).rejects.toThrow("Event applicationId, type, and title are required");
  });

  it("marks a canonical event as completed for an application", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
    });

    expect(db.execute).toHaveBeenCalledTimes(2);
    expect(db.select).toHaveBeenCalledTimes(2);
  });

  it("uses a provided eventAt timestamp when creating the flow step", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);
    const eventAt = "2026-05-29T09:30:00.000Z";

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
      eventAt,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("COALESCE($3, CURRENT_TIMESTAMP)"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
        1,
      ],
    );
  });

  it("persists explicit sortOrder when creating the flow step", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);

    await repository.create({
      applicationId: "11111111-1111-4111-8111-111111111111",
      type: "Interview/Technical Interview",
      title: "Tech interview",
      description: null,
      sortOrder: 7,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("sort_order"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        null,
        7,
      ],
    );
  });
});

describe("EventRepository.update", () => {
  it("uses a provided eventAt timestamp when updating an existing step", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);
    const eventAt = "2026-06-01T14:15:00.000Z";

    await repository.update({
      id: "11111111-1111-4111-8111-111111111111::Interview/Technical Interview",
      type: "Interview/Technical Interview",
      eventAt,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("SET event_at = $3"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
      ],
    );
  });

  it("updates sortOrder without mutating eventAt", async () => {
    const db = mockDb();
    const repository = new EventRepository(db);

    await repository.update({
      id: "11111111-1111-4111-8111-111111111111::Interview/Technical Interview",
      sortOrder: 4,
    });

    expect(db.execute).toHaveBeenLastCalledWith(
      expect.stringContaining("SET sort_order = $3"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        4,
      ],
    );
  });
});
