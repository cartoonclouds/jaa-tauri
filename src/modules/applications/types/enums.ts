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

  /**
   * Convert the enum value into a human-readable label.
   */
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

  /**
   * Serialize the enum value as its raw string representation.
   */
  toString() {
    return this.value;
  }

  /** Remote attendance. */
  static readonly Remote = new ApplicationAttendanceTypeEnum("remote");
  /** Hybrid attendance. */
  static readonly Hybrid = new ApplicationAttendanceTypeEnum("hybrid");
  /** On-site attendance. */
  static readonly OnSite = new ApplicationAttendanceTypeEnum("on-site");

  /** List every attendance type value. */
  static values(): ApplicationAttendanceTypeEnum[] {
    return [this.Remote, this.Hybrid, this.OnSite];
  }
}

export const ApplicationAttendanceType = ApplicationAttendanceTypeEnum;

/**
 * Union type of all application attendance enum values.
 */
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

  /**
   * Convert the enum value into a human-readable label.
   */
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

  /**
   * Serialize the enum value as its raw string representation.
   */
  toString() {
    return this.value;
  }

  /** Full-time employment. */
  static readonly FullTime = new ApplicationEmploymentTypeEnum("full-time");
  /** Part-time employment. */
  static readonly PartTime = new ApplicationEmploymentTypeEnum("part-time");
  /** Contract employment. */
  static readonly Contract = new ApplicationEmploymentTypeEnum("contract");
  /** Internship employment. */
  static readonly Internship = new ApplicationEmploymentTypeEnum("internship");
  /** Volunteer engagement. */
  static readonly Volunteer = new ApplicationEmploymentTypeEnum("volunteer");

  /** List every employment type value. */
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

/**
 * Union type of all application employment enum values.
 */
export type ApplicationEmploymentType = ReturnType<
  typeof ApplicationEmploymentTypeEnum.values
>[number];
