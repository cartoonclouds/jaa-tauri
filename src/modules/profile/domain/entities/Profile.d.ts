/**
 * Profile entity used for the user's job search profile.
 */
export interface Profile {
  /** Unique profile identifier. */
  id: string;
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
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  /** Skills listed on the profile. */
  skills: string[];
  /** Work eligibility note. */
  workEligibility: string;
  /** Notice period in days, when known. */
  noticePeriodDays: number | null;
  /** Interview availability note. */
  interviewAvailability: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a profile.
 */
export interface CreateProfileInput {
  /** Full name of the profile owner. */
  fullName: string;
  /** Email address, when available. */
  email?: string | null;
  /** Phone number, when available. */
  phone?: string | null;
  /** LinkedIn profile URL, when available. */
  linkedinUrl?: string | null;
  /** GitHub profile URL, when available. */
  githubUrl?: string | null;
  /** Personal portfolio URL, when available. */
  portfolioUrl?: string | null;
  /** Short headline describing the profile owner. */
  headline?: string | null;
  /** Free-form summary text. */
  summary?: string | null;
  /** Free-form location text. */
  locationText?: string | null;
  /** Desired salary value. */
  desiredSalary?: number | null;
  /** Currency code used for salary values. */
  salaryCurrency?: string;
  /** Preferred locations for work. */
  preferredLocations?: string[];
  /** Remote work preference. */
  remotePreference?: "remote" | "hybrid" | "onsite" | "flexible";
  /** Skills listed on the profile. */
  skills?: string[];
  /** Work eligibility note. */
  workEligibility?: string;
  /** Notice period in days, when known. */
  noticePeriodDays?: number | null;
  /** Interview availability note. */
  interviewAvailability?: string;
}



