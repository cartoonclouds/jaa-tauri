export type ContactType = "company" | "recruiter";

export interface Contact {
  id: string;
  companyId: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  type: ContactType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactInput {
  companyId?: string | null;
  fullName: string;
  type: ContactType;
}
