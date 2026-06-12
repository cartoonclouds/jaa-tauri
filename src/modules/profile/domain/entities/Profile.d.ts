import type { TemporalDateTime } from "@shared/utils/temporal";

/**
/** Remote work preference options for a profile. */
export type ProfileRemotePreference =
  | "remote"
  | "hybrid"
  | "onsite"
  | "flexible";

/**
 * All mutable data fields shared across profile read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface ProfileBase {
  /** Full name of the profile owner. */
  fullName: string;
  /** Email address, when available. */
  email: string | null;
  /** Phone number, when available. */
  phone: string | null;
  /** LinkedIn profile URL, when available. */
  linkedinUrl: string | null;
  /** GitHub profile URL, when available. */
  githubUrl: string | null;
  /** Personal portfolio URL, when available. */
  portfolioUrl: string | null;
  /** Short headline describing the profile owner. */
  headline: string | null;
  /** Free-form summary text. */
  summary: string | null;
  /** Free-form location text. */
  locationText: string | null;
  /** Desired salary value. */
  desiredSalary: number | null;
  /** Currency code used for salary values. */
  salaryCurrency: string;
  /** Preferred locations for work. */
  preferredLocations: string[];
  /** Remote work preference. */
  remotePreference: ProfileRemotePreference;
  /** Skills listed on the profile. */
  skills: string[];
  /** Work eligibility note. */
  workEligibility: string;
  /** Notice period in days, when known. */
  noticePeriodDays: number | null;
  /** Interview availability note. */
  interviewAvailability: string;
}

/**
 * Profile entity used for the user's job search profile.
 * Extends {@link ProfileBase} with system-managed fields.
 */
export interface Profile extends ProfileBase {
  /** Unique profile identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: TemporalDateTime;
  /** Last update timestamp. */
  updatedAt: TemporalDateTime;
}

/**
 * Input required to create a profile.
 * Derived from {@link ProfileBase}: `fullName` is required; all other base
 * fields are optional.
 */
export type CreateProfileInput = Pick<ProfileBase, "fullName"> &
  Partial<Omit<ProfileBase, "fullName">>;
