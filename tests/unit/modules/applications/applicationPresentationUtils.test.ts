import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import {
  formatApplicationAttendanceTypeLabel,
  formatApplicationEmploymentTypeLabel,
  formatApplicationEventFlowStatusLabel,
  formatApplicationStatusLabel,
  getApplicationArchivedClass,
  getApplicationAttendanceTypeClass,
  getApplicationEmploymentTypeClass,
  getApplicationEventFlowStatusClass,
  getApplicationPriorityClass,
  getApplicationStatusClass,
} from "@modules/applications/presentation/utils/applicationVisualTokens";
import { createEmptyApplicationFormValues } from "@modules/applications/presentation/utils/createEmptyApplicationFormValues";
import { describe, expect, it } from "vitest";

describe("application presentation utilities", () => {
  it("formats application visual tokens across known and fallback branches", () => {
    expect(getApplicationStatusClass(ApplicationStatus.Applied)).toContain(
      "blue",
    );
    expect(
      getApplicationStatusClass(ApplicationStatus.PhoneScreening),
    ).toContain("cyan");
    expect(getApplicationStatusClass(ApplicationStatus.Technical)).toContain(
      "violet",
    );
    expect(getApplicationStatusClass(ApplicationStatus.Interview)).toContain(
      "amber",
    );
    expect(getApplicationStatusClass(ApplicationStatus.Offer)).toContain(
      "emerald",
    );
    expect(getApplicationStatusClass(ApplicationStatus.Rejected)).toContain(
      "rose",
    );
    expect(getApplicationStatusClass(null)).toContain("slate");
    expect(formatApplicationStatusLabel(ApplicationStatus.Saved)).toBe("Saved");
    expect(formatApplicationStatusLabel(null)).toBe("Unknown");

    expect(
      getApplicationEventFlowStatusClass(ApplicationEventFlowStatus.Applied),
    ).toContain("blue");
    expect(
      getApplicationEventFlowStatusClass(ApplicationEventFlowStatus.Interview),
    ).toContain("amber");
    expect(
      getApplicationEventFlowStatusClass(ApplicationEventFlowStatus.Offer),
    ).toContain("emerald");
    expect(
      getApplicationEventFlowStatusClass(ApplicationEventFlowStatus.Rejected),
    ).toContain("rose");
    expect(getApplicationEventFlowStatusClass(undefined)).toContain("slate");
    expect(
      formatApplicationEventFlowStatusLabel(ApplicationEventFlowStatus.Saved),
    ).toBe("Saved");
    expect(formatApplicationEventFlowStatusLabel(undefined)).toBe("Unknown");

    expect(getApplicationPriorityClass(5)).toContain("rose");
    expect(getApplicationPriorityClass(4)).toContain("amber");
    expect(getApplicationPriorityClass(3)).toContain("sky");
    expect(getApplicationPriorityClass(1)).toContain("slate");
    expect(getApplicationArchivedClass(true)).toContain("zinc");
    expect(getApplicationArchivedClass(false)).toContain("emerald");

    expect(
      getApplicationAttendanceTypeClass(ApplicationAttendanceType.Remote),
    ).toContain("sky");
    expect(
      getApplicationAttendanceTypeClass(ApplicationAttendanceType.Hybrid),
    ).toContain("violet");
    expect(
      getApplicationAttendanceTypeClass(ApplicationAttendanceType.OnSite),
    ).toContain("amber");
    expect(getApplicationAttendanceTypeClass(null)).toContain("slate");
    expect(
      formatApplicationAttendanceTypeLabel(ApplicationAttendanceType.Remote),
    ).toBe("Remote");
    expect(formatApplicationAttendanceTypeLabel(undefined)).toBe("-");

    expect(
      getApplicationEmploymentTypeClass(ApplicationEmploymentType.FullTime),
    ).toContain("emerald");
    expect(
      getApplicationEmploymentTypeClass(ApplicationEmploymentType.PartTime),
    ).toContain("indigo");
    expect(
      getApplicationEmploymentTypeClass(ApplicationEmploymentType.Contract),
    ).toContain("orange");
    expect(
      getApplicationEmploymentTypeClass(ApplicationEmploymentType.Internship),
    ).toContain("cyan");
    expect(
      getApplicationEmploymentTypeClass(ApplicationEmploymentType.Volunteer),
    ).toContain("lime");
    expect(getApplicationEmploymentTypeClass(null)).toContain("slate");
    expect(
      formatApplicationEmploymentTypeLabel(ApplicationEmploymentType.Contract),
    ).toBe("Contract");
    expect(formatApplicationEmploymentTypeLabel(undefined)).toBe("-");
  });

  it("creates default empty application form values", () => {
    expect(createEmptyApplicationFormValues()).toEqual({
      companyId: null,
      title: "",
      status: ApplicationStatus.Saved,
      sourceUrl: "",
      appliedAt: "",
      locationText: "",
      locationLat: null,
      locationLng: null,
      attendanceType: null,
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      currency: "",
      description: "",
      interviewProcess: "",
      benefits: "",
      tagIds: [],
      priority: 3,
      isArchived: false,
    });
  });
});
