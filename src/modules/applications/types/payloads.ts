import {
  type ApplicationAttendanceType,
  type ApplicationEmploymentType,
  type ApplicationStatus,
} from "./enums";

/**
 * Shared field set used by application payloads and form values.
 */
export interface ApplicationBasePayload {
  /** Selected company identifier, or null when the application is uncoupled. */
  companyId: string | null;
  /** Application title. */
  title: string;
  /** Current application status. */
  status: ApplicationStatus;
  /** Optional source URL where the application was found. */
  sourceUrl?: string | null;
  /** Optional date the application was submitted. */
  appliedAt?: string | null;
  /** Free-form location text. */
  locationText?: string | null;
  /** Latitude for geocoded location data. */
  locationLat?: number | null;
  /** Longitude for geocoded location data. */
  locationLng?: number | null;
  /** Preferred attendance mode, if known. */
  attendanceType?: ApplicationAttendanceType | null;
  /** Employment type, if known. */
  employmentType?: ApplicationEmploymentType | null;
  /** Minimum salary expectation. */
  salaryMin?: number | null;
  /** Maximum salary expectation. */
  salaryMax?: number | null;
  /** Preferred salary currency code. */
  currency?: string | null;
  /** Long-form description or notes. */
  description?: string | null;
  /** Notes about the interview process. */
  interviewProcess?: string | null;
  /** Additional benefits or compensation notes. */
  benefits?: string | null;
  /** Priority score used for sorting and emphasis. */
  priority: number;
  /** Whether the application is archived. */
  isArchived: boolean;
}

/**
 * Alias for application mutation payloads.
 */
export type ApplicationMutationPayload = ApplicationBasePayload;
/**
 * Alias for application form values.
 */
export type ApplicationFormValues = ApplicationBasePayload;
/**
 * Payload shape emitted from application form submission.
 */
export type ApplicationFormSubmitPayload = Omit<ApplicationUpdatePayload, "id">;

/**
 * Payload required to update an application.
 */
export type ApplicationUpdatePayload = ApplicationBasePayload & {
  /** Identifier of the application being updated. */
  id: string;
};

/**
 * Payload required to create an application.
 */
export type ApplicationCreatePayload = {
  /** Application title. */
  title: string;
} & Partial<
  Omit<ApplicationBasePayload, "title" | "priority" | "isArchived" | "status">
> & {
    /** Optional priority override. */
    priority?: number;
    /** Optional archive flag override. */
    isArchived?: boolean;
    /** Optional status override. */
    status?: ApplicationStatus;
  };
