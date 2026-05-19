export interface Application {
  id: string;
  companyId: string | null;
  title: string;
  status: string;
  sourceUrl: string | null;
  appliedAt: string | null;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  attendanceType: "remote" | "hybrid" | "on-site" | null;
  employmentType:
    | "part-time"
    | "contract"
    | "internship"
    | "full-time"
    | "volunteer"
    | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string | null;
  interviewProcess: string | null;
  benefits: string | null;
  priority: number;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  companyId?: string | null;
  title: string;
  status?: string;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}
