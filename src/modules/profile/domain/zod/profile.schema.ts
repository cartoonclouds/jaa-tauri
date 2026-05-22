import { z } from "zod";

import {
  DateTimeSchema,
  NullableIntSchema,
  NullableStringSchema,
  NullableUrlSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";

export const ProfileSchema = z.object({
  id: UuidSchema,
  fullName: z.string().min(1),
  email: z.string().email().nullable(),
  phone: NullableStringSchema,
  linkedinUrl: NullableUrlSchema,
  githubUrl: NullableUrlSchema,
  portfolioUrl: NullableUrlSchema,
  headline: NullableStringSchema,
  summary: NullableStringSchema,
  locationText: NullableStringSchema,
  desiredSalary: NullableIntSchema,
  salaryCurrency: z.string(),
  preferredLocations: z.array(z.string()),
  remotePreference: z.enum(["remote", "hybrid", "onsite", "flexible"]),
  skills: z.array(z.string()),
  workEligibility: z.string(),
  noticePeriodDays: NullableIntSchema,
  interviewAvailability: z.string(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
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
