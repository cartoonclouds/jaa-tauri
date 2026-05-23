import { z } from "zod";

export const UuidSchema = z.string().uuid();
export const NullableUuidSchema = UuidSchema.nullable();
export const OptionalNullableUuidSchema = NullableUuidSchema.optional();

export const DateTimeSchema = z.string().datetime();
export const NullableDateTimeSchema = DateTimeSchema.nullable();

export const UrlSchema = z.string().url();
export const NullableUrlSchema = UrlSchema.nullable();

export const NullableStringSchema = z.string().nullable();
export const NullableNumberSchema = z.number().nullable();
export const NullableIntSchema = z.number().int().nullable();
export const OptionalNullableNumberSchema = NullableNumberSchema.optional();
export const OptionalNullableIntSchema = NullableIntSchema.optional();

export const LatitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

export const LongitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

export const NullableLatitudeSchema = LatitudeSchema.nullable();
export const NullableLongitudeSchema = LongitudeSchema.nullable();

export const OptionalNullableLatitudeSchema = NullableLatitudeSchema.optional();
export const OptionalNullableLongitudeSchema =
  NullableLongitudeSchema.optional();



