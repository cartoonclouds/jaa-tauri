import { EnumValue } from "@shared/domain/enums";

const APPLICATION_STATUS_LABELS: Readonly<Record<string, string>> = {
  saved: "Saved",
  applied: "Applied",
  "phone-screening": "Phone Screening",
  technical: "Technical",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

/**
 * PHP-style enum for application status.
 */
class ApplicationStatusEnum extends EnumValue {
  private constructor(value: string) {
    super(value);
  }

  override toLabel(): string {
    return APPLICATION_STATUS_LABELS[this.value] ?? this.value;
  }

  static readonly Saved = new ApplicationStatusEnum("saved");
  static readonly Applied = new ApplicationStatusEnum("applied");
  static readonly PhoneScreening = new ApplicationStatusEnum("phone-screening");
  static readonly Technical = new ApplicationStatusEnum("technical");
  static readonly Interview = new ApplicationStatusEnum("interview");
  static readonly Offer = new ApplicationStatusEnum("offer");
  static readonly Rejected = new ApplicationStatusEnum("rejected");
}

/** Public enum facade for application status values. */
export const ApplicationStatus = ApplicationStatusEnum;

/**
 * Type alias for application status.
 */
export type ApplicationStatus = typeof ApplicationStatusEnum.Saved;

/**
 * PHP-style enum for application event-flow status.
 */
class ApplicationEventFlowStatusEnum extends EnumValue {
  private constructor(value: string) {
    super(value);
  }

  override toLabel(): string {
    return APPLICATION_STATUS_LABELS[this.value] ?? this.value;
  }

  static readonly Saved = new ApplicationEventFlowStatusEnum("saved");
  static readonly Applied = new ApplicationEventFlowStatusEnum("applied");
  static readonly Interview = new ApplicationEventFlowStatusEnum("interview");
  static readonly Offer = new ApplicationEventFlowStatusEnum("offer");
  static readonly Rejected = new ApplicationEventFlowStatusEnum("rejected");
}

/** Public enum facade for application event-flow status values. */
export const ApplicationEventFlowStatus = ApplicationEventFlowStatusEnum;

/**
 * Type alias for application event-flow status.
 */
export type ApplicationEventFlowStatus =
  typeof ApplicationEventFlowStatusEnum.Saved;

/**
 * PHP-style enum for application attendance type.
 * Usage:
 *   ApplicationAttendanceType.Remote.value // "remote"
 *   ApplicationAttendanceType.Remote.toLabel() // "Remote"
 *   ApplicationAttendanceType.values() // [Remote, Hybrid, OnSite]
 *   Object.values(ApplicationAttendanceType) // [Remote, Hybrid, OnSite, ...]
 */
class ApplicationAttendanceTypeEnum extends EnumValue {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Convert the enum value into a human-readable label.
   */
  override toLabel(): string {
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

  /** Remote attendance. */
  static readonly Remote = new ApplicationAttendanceTypeEnum("remote");
  /** Hybrid attendance. */
  static readonly Hybrid = new ApplicationAttendanceTypeEnum("hybrid");
  /** On-site attendance. */
  static readonly OnSite = new ApplicationAttendanceTypeEnum("on-site");
}

/** Public enum facade for application attendance type values. */
export const ApplicationAttendanceType = ApplicationAttendanceTypeEnum;

/**
 * Union type of all application attendance enum values.
 */
export type ApplicationAttendanceType =
  typeof ApplicationAttendanceTypeEnum.Remote;

/**
 * PHP-style enum for application employment type.
 * Usage:
 *   ApplicationEmploymentType.FullTime.value // "full-time"
 *   ApplicationEmploymentType.FullTime.toLabel() // "Full-time"
 *   ApplicationEmploymentType.values() // [FullTime, PartTime, ...]
 *   Object.values(ApplicationEmploymentType) // [FullTime, PartTime, ...]
 */
class ApplicationEmploymentTypeEnum extends EnumValue {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Convert the enum value into a human-readable label.
   */
  override toLabel(): string {
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
}

/** Public enum facade for application employment type values. */
export const ApplicationEmploymentType = ApplicationEmploymentTypeEnum;

/**
 * Union type of all application employment enum values.
 */
export type ApplicationEmploymentType =
  typeof ApplicationEmploymentTypeEnum.FullTime;
