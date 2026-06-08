import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { describe, expect, it } from "vitest";

import { buildApplicationRow } from "../../../fixtures/factories/testPayloadFactories";

describe("mapApplicationRowToEntity", () => {
  it("returns instantiated enum values for attendance and employment types", () => {
    const entity = mapApplicationRowToEntity(buildApplicationRow());

    expect(entity.attendanceType).toBe(ApplicationAttendanceType.Remote);
    expect(entity.employmentType).toBe(ApplicationEmploymentType.FullTime);
    expect(entity.status).toBe(ApplicationStatus.Applied);
    expect(entity.eventFlowStatus).toBe(ApplicationEventFlowStatus.Offer);
  });

  it("returns null for unsupported optional enums and defaults invalid status", () => {
    const entity = mapApplicationRowToEntity(
      buildApplicationRow({
        id: "app-2",
        title: "Backend Engineer",
        status: "invalid-status",
        event_flow_status: "invalid-flow",
        attendance_type: "invalid-attendance",
        employment_type: "invalid-employment",
      }),
    );

    expect(entity.attendanceType).toBeNull();
    expect(entity.employmentType).toBeNull();
    expect(entity.status).toBe(ApplicationStatus.Saved);
    expect(entity.eventFlowStatus).toBe(ApplicationEventFlowStatus.Saved);
  });
});
