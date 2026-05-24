import { ApplicationRepository } from "@modules/applications";
import {
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  const db = {
    select: vi.fn((..._args: unknown[]) => Promise.resolve([] as unknown[])),
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

  it("writes a row with default status and applied flow", async () => {
    const db = mockDb();
    const repository = new ApplicationRepository(db as never);

    await repository.create({ title: "Frontend Engineer" });

    const values = vi.mocked(db.execute).mock.calls[0]?.[1];

    expect(Array.isArray(values)).toBe(true);
    expect((values as unknown[])[4]).toBe(
      ApplicationEventFlowStatus.Applied.value,
    );

    const eventInsertCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) => String(sql).includes("INSERT INTO events"));
    const eventLinkCalls = vi
      .mocked(db.execute)
      .mock.calls.filter(([sql]) =>
        String(sql).includes("INSERT INTO application_events"),
      );

    expect(eventInsertCalls.length).toBeGreaterThan(0);
    expect(eventLinkCalls.length).toBe(eventInsertCalls.length);
  });
});

describe("ApplicationRepository.update", () => {
  it("does not recreate flow events when event flow status is unchanged", async () => {
    const db = mockDb();
    vi.mocked(db.select).mockImplementationOnce(() =>
      Promise.resolve([
        { event_flow_status: ApplicationEventFlowStatus.Applied.value },
      ] as unknown[]),
    );
    const repository = new ApplicationRepository(db as never);

    await repository.update({
      id: "app-1",
      companyId: null,
      title: "Frontend Engineer",
      status: ApplicationStatus.Applied,
      eventFlowStatus: ApplicationEventFlowStatus.Applied,
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
