/**
 * User-facing profile shape used in onboarding and forms.
 */
export interface UserProfile {
  /** Full name of the profile owner. */
  fullName: string;
  /** Email address. */
  email: string;
  /** Target role being pursued. */
  targetRole: string;
  /** Desired salary value. */
  desiredSalary: number | null;
  /** Currency code used for salary values. */
  salaryCurrency: string;
  /** Preferred locations for work. */
  preferredLocations: string[];
  /** Remote work preference. */
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  /** Skills listed by the user. */
  skills: string[];
  /** LinkedIn profile URL. */
  linkedInUrl: string;
  /** GitHub profile URL. */
  githubUrl: string;
  /** Work eligibility note. */
  workEligibility: string;
  /** Notice period in days, when known. */
  noticePeriodDays: number | null;
  /** Interview availability note. */
  interviewAvailability: string;
}
