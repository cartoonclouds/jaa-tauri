/**
 * Factory contract for enum-like classes that resolve an instance from a raw value.
 */
export interface EnumFromValue<TEnum> {
  fromValue(value: string | null | undefined): TEnum | null;
}

/**
 * Interface for enum-like classes that can convert their value to a human-readable label.
 */
interface EnumToLabel {
  toLabel(): string;
}

/**
 * Shared base class for string-backed enum-style domain values.
 */
export abstract class EnumValue implements EnumToLabel {
  private static readonly valuesCache = new WeakMap<
    object,
    readonly EnumValue[]
  >();

  protected constructor(public readonly value: string) {}

  toString(): string {
    return this.value;
  }

  toLabel(): string {
    return this.value;
  }

  protected static resolveByValue<TEnum extends EnumValue>(
    values: readonly TEnum[],
    value: string | null | undefined,
  ): TEnum | null {
    if (!value) {
      return null;
    }

    return values.find((instance) => instance.value === value) ?? null;
  }

  /**
   * Reflect static enum instances defined on the subclass and return them in declaration order.
   */
  static values<TEnum extends EnumValue>(this: { prototype: TEnum }): TEnum[] {
    const cached = EnumValue.valuesCache.get(this) as
      | readonly TEnum[]
      | undefined;

    if (cached) {
      return [...cached];
    }

    const reflected = Object.values(
      this as unknown as Record<string, unknown>,
    ).filter(
      (entry): entry is TEnum =>
        entry instanceof EnumValue &&
        Object.getPrototypeOf(entry) === this.prototype,
    );

    EnumValue.valuesCache.set(this, reflected);

    return [...reflected];
  }

  /**
   * Resolve a typed enum instance from its raw string value using the subclass `values()` list.
   */
  static fromValue<TEnum extends EnumValue>(
    this: { values(): readonly TEnum[] },
    value: string | null | undefined,
  ): TEnum | null {
    if (!value) {
      return null;
    }

    return this.values().find((instance) => instance.value === value) ?? null;
  }

  /**
   * Normalize a raw persistence value and resolve it through an enum `fromValue` factory.
   */
  static mapFromDbValue<TEnum>(
    value: unknown,
    enumType: EnumFromValue<TEnum>,
  ): TEnum | null {
    if (typeof value !== "string") {
      return null;
    }

    return enumType.fromValue(value);
  }
}
