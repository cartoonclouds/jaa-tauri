import { z } from "zod";

/** UUID string schema. */
export const UuidSchema = z.string().uuid();
/** Nullable UUID string schema. */
export const NullableUuidSchema = UuidSchema.nullable();
/** Optional nullable UUID string schema. */
export const OptionalNullableUuidSchema = NullableUuidSchema.optional();

/** ISO-8601 datetime string schema. */
export const DateTimeSchema = z.string().datetime();
/** Nullable ISO-8601 datetime string schema. */
export const NullableDateTimeSchema = DateTimeSchema.nullable();

/** URL string schema. */
export const UrlSchema = z.string().url();
/** Nullable URL string schema. */
export const NullableUrlSchema = UrlSchema.nullable();

/** Nullable string schema. */
export const NullableStringSchema = z.string().nullable();
/** Nullable number schema. */
export const NullableNumberSchema = z.number().nullable();
/** Nullable integer schema. */
export const NullableIntSchema = z.number().int().nullable();
/** Optional nullable number schema. */
export const OptionalNullableNumberSchema = NullableNumberSchema.optional();
/** Optional nullable integer schema. */
export const OptionalNullableIntSchema = NullableIntSchema.optional();

/** Latitude schema constrained to valid geographic range. */
export const LatitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

/** Longitude schema constrained to valid geographic range. */
export const LongitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

/** Nullable latitude schema. */
export const NullableLatitudeSchema = LatitudeSchema.nullable();
/** Nullable longitude schema. */
export const NullableLongitudeSchema = LongitudeSchema.nullable();

/** Optional nullable latitude schema. */
export const OptionalNullableLatitudeSchema = NullableLatitudeSchema.optional();
/** Optional nullable longitude schema. */
export const OptionalNullableLongitudeSchema =
  NullableLongitudeSchema.optional();
