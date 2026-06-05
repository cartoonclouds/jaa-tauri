export const TAG_MODEL_TYPES = {
  application: "application",
  company: "company",
  contact: "contact",
  general: "general",
} as const;

export type TagModelTypeValue =
  (typeof TAG_MODEL_TYPES)[keyof typeof TAG_MODEL_TYPES];
