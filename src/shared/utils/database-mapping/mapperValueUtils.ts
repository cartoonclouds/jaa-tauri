/**
 * Mapper-focused utility exports used for row-to-entity normalization.
 */
export {
  normalizeAliasedLiteralValue,
  normalizeLiteralValue,
} from "@shared/utils/database-mapping/normalizationUtils";
export {
  toFiniteNumber,
  toNullableNumber,
} from "@shared/utils/database-mapping/numberValueUtils";
export {
  fromDbBoolean,
  parseBooleanRecordValue,
  toDbBooleanInt,
} from "@shared/utils/database-mapping/persistenceValueUtils";
export {
  mapAuditTimestamps,
  mapOptionalRowDate,
  mapRequiredRowDate,
} from "@shared/utils/database-mapping/rowDateUtils";
export {
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/stringValueUtils";
