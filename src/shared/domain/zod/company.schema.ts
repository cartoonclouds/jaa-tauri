import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  websiteUrl: z.string().url().nullable(),
  linkedinUrl: z.string().url().nullable(),
  industry: z.string().nullable(),
  size: z.string().nullable(),
  locationText: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCompanySchema = CompanySchema.pick({
  name: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({ locationText: true, locationLat: true, locationLng: true });

export type Company = z.infer<typeof CompanySchema>;
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
