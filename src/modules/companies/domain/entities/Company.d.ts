export interface Company {
  id: string;
  name: string;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  industry: string | null;
  size: string | null;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  name: string;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}
