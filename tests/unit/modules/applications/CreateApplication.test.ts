import { ApplicationRepository } from "@modules/applications";
import { EVENT_FLOW_STAGE_SET } from "@modules/events/constants";
import { describe, expect, it } from "vitest";

import {
  buildApplicationCreatePayload,
  buildApplicationUpdatePayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createMockDbWithOptions } from "../../shared/utils/dbTestUtils";

function resolveEventTypeSelect(sql: unknown, bindings?: unknown) {
  const statement = String(sql);
  const args = Array.isArray(bindings) ? bindings : undefined;

  if (statement.includes("SELECT id FROM events WHERE type = $1")) {
    return Promise.resolve([{ id: args?.[0] as string }]);
  }

  return Promise.resolve([]);
}

describe("ApplicationRepository.create", () => {
  it("rejects empty title", async () => {
    const { db } = createMockDbWithOptions([], {
      select: resolveEventTypeSelect,
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new ApplicationRepository(db);

    await expect(
      repository.create(buildApplicationCreatePayload({ title: "   " })),
    ).rejects.toThrow("Application title is required");
  });

  it("writes a row and links the default stage set", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: resolveEventTypeSelect,
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new ApplicationRepository(db);

    await repository.create(buildApplicationCreatePayload());

    const values = executeMock.mock.calls[0]?.[1];

    expect(Array.isArray(values)).toBe(true);
    expect((values as unknown[])[2]).toBe("Frontend Engineer");

    const eventInsertCalls = executeMock.mock.calls.filter(
      ([sql]) =>
        typeof sql === "string" && sql.includes("INSERT OR IGNORE INTO events"),
    );
    const eventLinkCalls = executeMock.mock.calls.filter(
      ([sql]) =>
        typeof sql === "string" &&
        sql.includes("INSERT OR IGNORE INTO application_events"),
    );

    expect(eventInsertCalls.length).toBe(EVENT_FLOW_STAGE_SET.size);
    expect(eventLinkCalls.length).toBe(EVENT_FLOW_STAGE_SET.size);
  });
});

describe("ApplicationRepository.update", () => {
  it("does not recreate flow events during update", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: resolveEventTypeSelect,
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new ApplicationRepository(db);

    await repository.update(buildApplicationUpdatePayload());

    const eventInsertCalls = executeMock.mock.calls.filter(
      ([sql]) => typeof sql === "string" && sql.includes("INSERT INTO events"),
    );
    const eventLinkCalls = executeMock.mock.calls.filter(
      ([sql]) =>
        typeof sql === "string" &&
        sql.includes("INSERT INTO application_events"),
    );

    expect(eventInsertCalls).toHaveLength(0);
    expect(eventLinkCalls).toHaveLength(0);
  });
});
