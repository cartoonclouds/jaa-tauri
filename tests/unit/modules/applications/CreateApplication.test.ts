import { ApplicationRepository } from "@modules/applications";
import { ApplicationStatus } from "@modules/applications/types/enums";
import { EVENT_FLOW_STAGE_SET } from "@modules/events/constants";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  const db = {
    select: vi.fn((sql: unknown, args?: unknown[]) => {
      const statement = String(sql);
      if (statement.includes("SELECT id FROM events WHERE type = $1")) {
        return Promise.resolve([{ id: args?.[0] as string }]);
      }

      return Promise.resolve([] as unknown[]);
    }),
    execute: vi.fn((..._args: unknown[]) =>
      Promise.resolve({ rowsAffected: 1 }),
    ),
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

  it("writes a row and links the default stage set", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db as never);

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
    const repository = new ApplicationRepository(db as never);

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
