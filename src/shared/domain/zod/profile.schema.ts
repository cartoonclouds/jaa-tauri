import { z } from "zod";

export const ProfileSchema = z.object({
  id: z.string().uuid(),
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
  salaryCurrency: z.string(),
  preferredLocations: z.array(z.string()),
  remotePreference: z.enum(["remote", "hybrid", "onsite", "flexible"]),
  skills: z.array(z.string()),
  workEligibility: z.string(),
  noticePeriodDays: z.number().int().nullable(),
  interviewAvailability: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProfileSchema = ProfileSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
  headline: true,
  summary: true,
  locationText: true,
  desiredSalary: true,
  salaryCurrency: true,
  preferredLocations: true,
  remotePreference: true,
  skills: true,
  workEligibility: true,
  noticePeriodDays: true,
  interviewAvailability: true,
}).partial({
  email: true,
  phone: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
  headline: true,
  summary: true,
  locationText: true,
  desiredSalary: true,
  noticePeriodDays: true,
});

export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
