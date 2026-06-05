import { EnumValue } from "@shared/domain/enums";

/**
 * Tag model type enum.
 */
class TagModelTypeEnum extends EnumValue {
  private constructor(value: string) {
    super(value);
  }

  override toLabel(): string {
    switch (this.value) {
      case "application":
        return "Application";
      case "company":
        return "Company";
      case "contact":
        return "Contact";
      case "general":
        return "General";
      default:
        return this.value;
    }
  }

  static readonly Application = new TagModelTypeEnum("application");
  static readonly Company = new TagModelTypeEnum("company");
  static readonly Contact = new TagModelTypeEnum("contact");
  static readonly General = new TagModelTypeEnum("general");
}

/** Public enum facade for tag model type values. */
export const TagModelType = TagModelTypeEnum;

/**
 * Type alias for tag model type.
 */
export type TagModelType =
  | typeof TagModelTypeEnum.Application
  | typeof TagModelTypeEnum.Company
  | typeof TagModelTypeEnum.Contact
  | typeof TagModelTypeEnum.General;

/**
 * Raw string values for tag model type persistence and validation.
 */
export const TAG_MODEL_TYPE_VALUES = [
  TagModelType.Application.value,
  TagModelType.Company.value,
  TagModelType.Contact.value,
  TagModelType.General.value,
] as const;
