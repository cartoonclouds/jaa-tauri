import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid().nullable(),
  title: z.string().min(1),
  status: z.string().min(1),
  sourceUrl: z.string().url().nullable(),
  appliedAt: z.string().datetime().nullable(),
  locationText: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  attendanceType: z.enum(["remote", "hybrid", "on-site"]).nullable(),
  employmentType: z
    .enum(["part-time", "contract", "internship", "full-time", "volunteer"])
    .nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string().nullable(),
  description: z.string().nullable(),
  interviewProcess: z.string().nullable(),
  benefits: z.string().nullable(),
  priority: z.number(),
  isArchived: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateApplicationSchema = ApplicationSchema.pick({
  companyId: true,
  title: true,
  status: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({
  status: true,
  companyId: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
});

export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
