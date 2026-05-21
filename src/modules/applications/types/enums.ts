/**
 * PHP-style enum for application attendance type.
 * Usage:
 *   ApplicationAttendanceType.Remote.value // "remote"
 *   ApplicationAttendanceType.Remote.toLabel() // "Remote"
 *   ApplicationAttendanceType.values() // [Remote, Hybrid, OnSite]
 *   Object.values(ApplicationAttendanceType) // [Remote, Hybrid, OnSite, ...]
 */
class ApplicationAttendanceTypeEnum {
  private constructor(public readonly value: string) {}

  toLabel(): string {
    switch (this.value) {
      case "remote":
        return "Remote";
      case "hybrid":
        return "Hybrid";
      case "on-site":
        return "On-site";
      default:
        return this.value;
    }
  }

  toString() {
    return this.value;
  }

  static readonly Remote = new ApplicationAttendanceTypeEnum("remote");
  static readonly Hybrid = new ApplicationAttendanceTypeEnum("hybrid");
  static readonly OnSite = new ApplicationAttendanceTypeEnum("on-site");

  static values(): ApplicationAttendanceTypeEnum[] {
    return [this.Remote, this.Hybrid, this.OnSite];
  }
}

export const ApplicationAttendanceType = ApplicationAttendanceTypeEnum;

export type ApplicationAttendanceType = ReturnType<
  typeof ApplicationAttendanceTypeEnum.values
>[number];

/**
 * PHP-style enum for application employment type.
 * Usage:
 *   ApplicationEmploymentType.FullTime.value // "full-time"
 *   ApplicationEmploymentType.FullTime.toLabel() // "Full-time"
 *   ApplicationEmploymentType.values() // [FullTime, PartTime, ...]
 *   Object.values(ApplicationEmploymentType) // [FullTime, PartTime, ...]
 */
class ApplicationEmploymentTypeEnum {
  private constructor(public readonly value: string) {}

  toLabel(): string {
    switch (this.value) {
      case "full-time":
        return "Full-time";
      case "part-time":
        return "Part-time";
      case "contract":
        return "Contract";
      case "internship":
        return "Internship";
      case "volunteer":
        return "Volunteer";
      default:
        return this.value;
    }
  }

  toString() {
    return this.value;
  }

  static readonly FullTime = new ApplicationEmploymentTypeEnum("full-time");
  static readonly PartTime = new ApplicationEmploymentTypeEnum("part-time");
  static readonly Contract = new ApplicationEmploymentTypeEnum("contract");
  static readonly Internship = new ApplicationEmploymentTypeEnum("internship");
  static readonly Volunteer = new ApplicationEmploymentTypeEnum("volunteer");

  static values(): ApplicationEmploymentTypeEnum[] {
    return [
      this.FullTime,
      this.PartTime,
      this.Contract,
      this.Internship,
      this.Volunteer,
    ];
  }
}

export const ApplicationEmploymentType = ApplicationEmploymentTypeEnum;

export type ApplicationEmploymentType = ReturnType<
  typeof ApplicationEmploymentTypeEnum.values
>[number];
