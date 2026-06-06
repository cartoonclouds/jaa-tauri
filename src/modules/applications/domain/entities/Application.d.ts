import type {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
import type {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "../../types/enums";
import type { LocationFields, LocationFieldsInput } from "@shared/types";

/**
 * All mutable data fields shared across application read and write models,
 * excluding system-managed identifiers, derived fields, and audit timestamps.
 */
export interface ApplicationBase extends LocationFields {
  /** Related company identifier, when available. */
  companyId: string | null;
  /** Application title. */
  title: string;
  /** Source URL where the application was discovered, when available. */
  sourceUrl: string | null;
  /** Application submission date, when available. */
  appliedAt: Date | null;
  /** Preferred attendance mode, when known. */
  attendanceType: ApplicationAttendanceType | null;
  /** Employment type, when known. */
  employmentType: ApplicationEmploymentType | null;
  /** Minimum salary expectation. */
  salaryMin: number | null;
  /** Maximum salary expectation. */
  salaryMax: number | null;
  /** Preferred salary currency code. */
  currency: string | null;
  /** Free-form description or notes. */
  description: string | null;
  /** Notes about the interview process. */
  interviewProcess: string | null;
  /** Additional benefits or compensation notes. */
  benefits: string | null;
  /** Associated tag identifiers. */
  tagIds: string[];
  /** Priority score used for sorting and emphasis. */
  priority: number;
  /** Whether the application has been archived. */
  isArchived: boolean;
}

/**
 * Application entity stored by the domain layer.
 * Extends {@link ApplicationBase} with system-managed and derived fields.
 */
export interface Application extends ApplicationBase {
  /** Unique application identifier. */
  id: string;
  /** Current application status, derived from associated events. */
  status: ApplicationStatus;
  /** Current high-level event flow status, derived from associated events. */
  eventFlowStatus: ApplicationEventFlowStatus;
  /** Whether the application has been soft-deleted. */
  isDeleted: boolean;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create an application record.
 * Derived from {@link ApplicationBase}: `title` is required; all other base
 * fields are optional; location fields accept undefined via {@link LocationFieldsInput}.
 */
export type CreateApplicationInput = Pick<ApplicationBase, "title"> &
  Partial<Omit<ApplicationBase, "title" | keyof LocationFields>> &
  LocationFieldsInput & {
    /** Optional initial application status. */
    status?: ApplicationStatus;
  };
