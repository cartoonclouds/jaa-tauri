import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { describe, expect, it } from "vitest";

describe("application enums", () => {
  it("exposes stable enum values and label helpers", () => {
    expect(ApplicationStatus.values()).toEqual([
      ApplicationStatus.Saved,
      ApplicationStatus.Applied,
      ApplicationStatus.PhoneScreening,
      ApplicationStatus.Technical,
      ApplicationStatus.Interview,
      ApplicationStatus.Offer,
      ApplicationStatus.Rejected,
    ]);
    expect(ApplicationStatus.fromValue("offer")).toBe(ApplicationStatus.Offer);
    expect(ApplicationStatus.fromValue("missing")).toBeNull();
    expect(ApplicationStatus.PhoneScreening.toLabel()).toBe("Phone Screening");
    expect(ApplicationEventFlowStatus.Offer.toLabel()).toBe("Offer");
    expect(ApplicationAttendanceType.OnSite.toLabel()).toBe("On-site");
    expect(ApplicationEmploymentType.FullTime.toLabel()).toBe("Full-time");
  });
});