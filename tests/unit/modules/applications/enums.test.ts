import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/types/enums";
import { describe, expect, it } from "vitest";

describe("application enums", () => {
  it("exposes stable status values and labels", () => {
    expect(ApplicationStatus.Saved.value).toBe("saved");
    expect(ApplicationStatus.PhoneScreening.value).toBe("phone-screening");
    expect(ApplicationStatus.PhoneScreening.toLabel()).toBe("Phone Screening");
    expect(ApplicationStatus.values()).toHaveLength(7);
  });

  it("resolves status instances from raw values", () => {
    expect(ApplicationStatus.fromValue("offer")).toBe(ApplicationStatus.Offer);
    expect(ApplicationStatus.fromValue("unknown")).toBeNull();
    expect(ApplicationStatus.fromValue(null)).toBeNull();
  });

  it("resolves attendance and employment enum instances from raw values", () => {
    expect(ApplicationAttendanceType.fromValue("remote")).toBe(
      ApplicationAttendanceType.Remote,
    );
    expect(ApplicationAttendanceType.fromValue("invalid")).toBeNull();

    expect(ApplicationEmploymentType.fromValue("full-time")).toBe(
      ApplicationEmploymentType.FullTime,
    );
    expect(ApplicationEmploymentType.fromValue("invalid")).toBeNull();
  });

  it("serializes enum instances with toString", () => {
    expect(ApplicationStatus.Technical.toString()).toBe("technical");
    expect(ApplicationAttendanceType.OnSite.toString()).toBe("on-site");
    expect(ApplicationEmploymentType.Contract.toString()).toBe("contract");
  });
});
