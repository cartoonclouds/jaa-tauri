export interface EnumFromValue<TEnum> {
  fromValue(value: string | null | undefined): TEnum | null;
}

/**
 * Normalize raw database values and map them through enum `fromValue` factories.
 */
export function mapEnumFromDbValue<TEnum>(
  value: unknown,
  enumType: EnumFromValue<TEnum>,
): TEnum | null {
  if (typeof value !== "string") {
    return null;
  }

  return enumType.fromValue(value);
}
