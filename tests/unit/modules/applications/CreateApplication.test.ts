import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ApplicationRepository } from "@modules/applications";
import { ApplicationStatus } from "@modules/applications/types/enums";
import { EVENT_FLOW_STAGE_SET } from "@modules/events/constants";
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
    select: (sql: unknown, args?: unknown[]) => {
      const statement = String(sql);
      if (statement.includes("SELECT id FROM events WHERE type = $1")) {
        return Promise.resolve([{ id: args?.[0] as string }]);
      }

      return Promise.resolve([] as unknown[]);
    },
    execute: () => Promise.resolve({ rowsAffected: 1 }),
  });

  return db;
}

describe("ApplicationRepository.create", () => {
  it("rejects empty title", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db);

    await expect(repository.create({ title: "   " })).rejects.toThrow(
      "Application title is required",
    );
  });

  it("writes a row and links the default stage set", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db);

    await repository.create({ title: "Frontend Engineer" });

    const values = vi.mocked(db.execute).mock.calls[0]?.[1];

    expect(Array.isArray(values)).toBe(true);
    expect((values as unknown[])[2]).toBe("Frontend Engineer");

    const eventInsertCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) =>
        String(sql).includes("INSERT OR IGNORE INTO events"),
      );
    const eventLinkCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) =>
        String(sql).includes("INSERT OR IGNORE INTO application_events"),
      );

    expect(eventInsertCalls.length).toBe(EVENT_FLOW_STAGE_SET.size);
    expect(eventLinkCalls.length).toBe(EVENT_FLOW_STAGE_SET.size);
  });
});

describe("ApplicationRepository.update", () => {
  it("does not recreate flow events during update", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db);

    await repository.update({
      id: "app-1",
      companyId: null,
      title: "Frontend Engineer",
      status: ApplicationStatus.Applied,
      sourceUrl: null,
      appliedAt: null,
      locationText: null,
      locationLat: null,
      locationLng: null,
      attendanceType: null,
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      description: null,
      interviewProcess: null,
      benefits: null,
      tagIds: [],
      priority: 3,
      isArchived: false,
    });

    const eventInsertCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) => String(sql).includes("INSERT INTO events"));
    const eventLinkCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) =>
        String(sql).includes("INSERT INTO application_events"),
      );

    expect(eventInsertCalls).toHaveLength(0);
    expect(eventLinkCalls).toHaveLength(0);
  });
});
