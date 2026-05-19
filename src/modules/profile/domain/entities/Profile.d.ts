export interface Profile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  headline: string | null;
  summary: string | null;
  locationText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  fullName: string;
  email?: string | null;
}
