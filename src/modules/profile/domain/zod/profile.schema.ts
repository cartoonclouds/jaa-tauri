import {
  DateTimeSchema,
  NullableIntSchema,
  NullableStringSchema,
  NullableUrlSchema,
  OptionalNullableIntSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

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

export const ProfileRepositoryCreateSchema = z.object({
  fullName: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  portfolioUrl: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  desiredSalary: OptionalNullableIntSchema,
  salaryCurrency: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  remotePreference: z
    .enum(["remote", "hybrid", "onsite", "flexible"])
    .optional(),
  skills: z.array(z.string()).optional(),
  workEligibility: z.string().optional(),
  noticePeriodDays: OptionalNullableIntSchema,
  interviewAvailability: z.string().optional(),
});

export const ProfileRepositoryUpdateSchema =
  CreateProfileSchema.partial().extend({
    id: z.string().uuid(),
  });

export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
