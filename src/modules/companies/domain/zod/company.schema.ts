import {
  DateTimeSchema,
  NullableLatitudeSchema,
  NullableLongitudeSchema,
  NullableStringSchema,
  NullableUrlSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

export const CompanySchema = z.object({
  id: UuidSchema,
  name: z.string().min(1),
  websiteUrl: NullableUrlSchema,
  linkedinUrl: NullableUrlSchema,
  industry: NullableStringSchema,
  size: NullableStringSchema,
  locationText: NullableStringSchema,
  locationLat: NullableLatitudeSchema,
  locationLng: NullableLongitudeSchema,
  notes: NullableStringSchema,
  tagIds: z.array(UuidSchema),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateCompanySchema = CompanySchema.pick({
  name: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({ locationText: true, locationLat: true, locationLng: true });

export const CompanyRepositoryCreateSchema = CreateCompanySchema;

/**
 * Type alias for company.
 */
export type Company = z.infer<typeof CompanySchema>;
/**
 * Type alias for create company input.
 */
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
