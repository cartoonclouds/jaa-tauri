import { mapApplicationRowToEntity } from "@modules/applications/application/mappers/mapApplicationRow";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import { describe, expect, it } from "vitest";

describe("mapApplicationRowToEntity", () => {
  it("returns instantiated enum values for attendance and employment types", () => {
    const now = new Date().toISOString();

    const entity = mapApplicationRowToEntity({
      id: "app-1",
      company_id: null,
      title: "Frontend Engineer",
      status: "applied",
      event_flow_status: "offer",
      source_url: null,
      applied_at: now,
      location_text: null,
      location_lat: null,
      location_lng: null,
      attendance_type: "remote",
      employment_type: "full-time",
      salary_min: null,
      salary_max: null,
      currency: null,
      description: null,
      interview_process: null,
      benefits: null,
      priority: 3,
      is_archived: 0,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    });

    expect(entity.attendanceType).toBe(ApplicationAttendanceType.Remote);
    expect(entity.employmentType).toBe(ApplicationEmploymentType.FullTime);
    expect(entity.status).toBe(ApplicationStatus.Applied);
    expect(entity.eventFlowStatus).toBe(ApplicationEventFlowStatus.Offer);
  });

  it("returns null for unsupported optional enums and defaults invalid status", () => {
    const now = new Date().toISOString();

    const entity = mapApplicationRowToEntity({
      id: "app-2",
      company_id: null,
      title: "Backend Engineer",
      status: "invalid-status",
      event_flow_status: "invalid-flow",
      source_url: null,
      applied_at: now,
      location_text: null,
      location_lat: null,
      location_lng: null,
      attendance_type: "invalid-attendance",
      employment_type: "invalid-employment",
      salary_min: null,
      salary_max: null,
      currency: null,
      description: null,
      interview_process: null,
      benefits: null,
      priority: 3,
      is_archived: 0,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    });

    expect(entity.attendanceType).toBeNull();
    expect(entity.employmentType).toBeNull();
    expect(entity.status).toBe(ApplicationStatus.Saved);
    expect(entity.eventFlowStatus).toBe(ApplicationEventFlowStatus.Saved);
  });
});
