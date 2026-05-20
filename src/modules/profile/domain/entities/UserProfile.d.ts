export interface UserProfile {
  fullName: string;
  email: string;
  targetRole: string;
  desiredSalary: number | null;
  salaryCurrency: string;
  preferredLocations: string[];
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  skills: string[];
  linkedInUrl: string;
  githubUrl: string;
  workEligibility: string;
  noticePeriodDays: number | null;
  interviewAvailability: string;
}
