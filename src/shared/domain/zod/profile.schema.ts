import { z } from "zod";

export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  linkedinUrl: z.string().url().nullable(),
  githubUrl: z.string().url().nullable(),
  portfolioUrl: z.string().url().nullable(),
  headline: z.string().nullable(),
  summary: z.string().nullable(),
  locationText: z.string().nullable(),
  desiredSalary: z.number().int().nullable(),
  salaryCurrency: z.string().default("USD"),
  preferredLocations: z.array(z.string()).default([]),
  remotePreference: z
    .enum(["remote", "hybrid", "onsite", "flexible"])
    .default("flexible"),
  skills: z.array(z.string()).default([]),
  workEligibility: z.string().default("").nullable(),
  noticePeriodDays: z.number().int().nullable(),
  interviewAvailability: z.string().default("").nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
