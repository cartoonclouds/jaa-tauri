import { z } from "zod";

import {
  DateTimeSchema,
  NullableLatitudeSchema,
  NullableLongitudeSchema,
  NullableStringSchema,
  NullableUrlSchema,
  UuidSchema,
} from "./fields";

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
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateCompanySchema = CompanySchema.pick({
  name: true,
  locationText: true,
  locationLat: true,
  locationLng: true,
}).partial({ locationText: true, locationLat: true, locationLng: true });

export type Company = z.infer<typeof CompanySchema>;
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
