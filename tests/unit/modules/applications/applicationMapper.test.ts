import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { describe, expect, it } from "vitest";

import {
  buildApplicationRow,
} from "../../../fixtures/factories/testPayloadFactories";

describe("application mapper", () => {
  it("maps raw application rows and falls back on invalid persistence values", () => {
    const entity = mapApplicationRowToEntity(buildApplicationRow());

    expect(entity.status).toBe(ApplicationStatus.Applied);
    expect(entity.eventFlowStatus).toBe(ApplicationEventFlowStatus.Offer);
    expect(entity.attendanceType).toBe(ApplicationAttendanceType.Remote);
    expect(entity.employmentType).toBe(ApplicationEmploymentType.FullTime);
    expect(entity.isArchived).toBe(false);
    expect(entity.isDeleted).toBe(false);
    expect(entity.appliedAt).toBeInstanceOf(Date);

    const fallbackEntity = mapApplicationRowToEntity(
      buildApplicationRow({
        status: "unknown",
        event_flow_status: "unknown",
        attendance_type: 123,
        employment_type: {},
        priority: "not-a-number",
        is_archived: 1,
        deleted_at: new Date().toISOString(),
      }),
    );

    expect(fallbackEntity.status).toBe(ApplicationStatus.Saved);
    expect(fallbackEntity.eventFlowStatus).toBe(
      ApplicationEventFlowStatus.Saved,
    );
    expect(fallbackEntity.attendanceType).toBeNull();
    expect(fallbackEntity.employmentType).toBeNull();
    expect(fallbackEntity.priority).toBe(3);
    expect(fallbackEntity.isArchived).toBe(true);
    expect(fallbackEntity.isDeleted).toBe(true);
  });
});