import { z } from "zod";

/** UUID string schema. */
export const UuidSchema = z.string().uuid();
/** Nullable UUID string schema. */
export const NullableUuidSchema = UuidSchema.nullable();

/** ISO-8601 datetime string schema. */
export const DateTimeSchema = z.string().datetime();
/** Nullable ISO-8601 datetime string schema. */
export const NullableDateTimeSchema = DateTimeSchema.nullable();

/** URL string schema. */
const UrlSchema = z.string().url();
/** Nullable URL string schema. */
export const NullableUrlSchema = UrlSchema.nullable();

/** Nullable string schema. */
export const NullableStringSchema = z.string().nullable();
/** Nullable number schema. */
export const NullableNumberSchema = z.number().nullable();
/** Nullable integer schema. */
export const NullableIntSchema = z.number().int().nullable();
/** Optional nullable integer schema. */
export const OptionalNullableIntSchema = NullableIntSchema.optional();

/** Latitude schema constrained to valid geographic range. */
const LatitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

/** Longitude schema constrained to valid geographic range. */
const LongitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

/** Nullable latitude schema. */
export const NullableLatitudeSchema = LatitudeSchema.nullable();
/** Nullable longitude schema. */
export const NullableLongitudeSchema = LongitudeSchema.nullable();
