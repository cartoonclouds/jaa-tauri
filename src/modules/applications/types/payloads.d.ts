import type { ApplicationBase } from "../domain/entities/Application";
import type { LocationFieldsInput, WithId } from "@shared/types";

import {
  type ApplicationAttendanceType,
  type ApplicationEmploymentType,
  type ApplicationStatus,
} from "./enums";

/**
 * Shared field set used by application payloads and form values.
 */
interface ApplicationPayloadOptionalFields {
  /** Optional URL where the application was found. */
  url?: string | null;
  /** Optional date the application was submitted. */
  appliedAt?: string | null;
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
}

export type ApplicationBasePayload = Omit<
  ApplicationBase,
  | "url"
  | "appliedAt"
  | "attendanceType"
  | "employmentType"
  | "salaryMin"
  | "salaryMax"
  | "currency"
  | "description"
  | "interviewProcess"
  | "benefits"
> &
  LocationFieldsInput &
  ApplicationPayloadOptionalFields & {
    /** Current application status. */
    status: ApplicationStatus;
  };

/**
 * Alias for application mutation payloads.
 */
export type ApplicationMutationPayload = ApplicationBasePayload;

/**
 * Payload required to update an application.
 */
export type ApplicationUpdatePayload = ApplicationBasePayload & WithId;

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
