export interface Profile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  headline: string | null;
  summary: string | null;
  locationText: string | null;
  desiredSalary: number | null;
  salaryCurrency: string;
  preferredLocations: string[];
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  skills: string[];
  workEligibility: string;
  noticePeriodDays: number | null;
  interviewAvailability: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileInput {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  headline?: string | null;
  summary?: string | null;
  locationText?: string | null;
  desiredSalary?: number | null;
  salaryCurrency?: string;
  preferredLocations?: string[];
  remotePreference?: "remote" | "hybrid" | "onsite" | "flexible";
  skills?: string[];
  workEligibility?: string;
  noticePeriodDays?: number | null;
  interviewAvailability?: string;
}
