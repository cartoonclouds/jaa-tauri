import type {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "../../types/enums";

/**
 * Application entity stored by the domain layer.
 */
export interface Application {
  /** Unique application identifier. */
  id: string;
  /** Related company identifier, when available. */
  companyId: string | null;
  /** Application title. */
  title: string;
  /** Current application status. */
  status: string;
  /** Source URL where the application was discovered, when available. */
  sourceUrl: string | null;
  /** Application submission date, when available. */
  appliedAt: Date | null;
  /** Free-form location text. */
  locationText: string | null;
  /** Latitude for geocoded location data. */
  locationLat: number | null;
  /** Longitude for geocoded location data. */
  locationLng: number | null;
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
  /** Priority score used for sorting and emphasis. */
  priority: number;
  /** Whether the application has been archived. */
  isArchived: boolean;
  /** Whether the application has been soft-deleted. */
  isDeleted: boolean;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Minimal input required to create an application record.
 */
export interface CreateApplicationInput {
  /** Related company identifier, when available. */
  companyId?: string | null;
  /** Application title. */
  title: string;
  /** Application status. */
  status?: string;
  /** Free-form location text. */
  locationText?: string | null;
  /** Latitude for geocoded location data. */
  locationLat?: number | null;
  /** Longitude for geocoded location data. */
  locationLng?: number | null;
}
