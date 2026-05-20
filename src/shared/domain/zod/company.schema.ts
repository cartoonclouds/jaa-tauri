import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  websiteUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  industry: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  locationLat: z.number().nullable().optional(),
  locationLng: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Company = z.infer<typeof CompanySchema>;
