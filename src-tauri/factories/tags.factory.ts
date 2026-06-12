import type { TagModelTypeValue } from "../../src/modules/tags/types";

import { faker } from "@faker-js/faker";

import { TAG_MODEL_TYPES } from "../../src/modules/tags/domain/enums/TagModelType";

export interface TagRow {
  id: string;
  name: string;
  color: string;
  model_type: TagModelTypeValue;
  created_at: string;
  updated_at: string;
}

export function createTagRows(count = 8, seed = 1300): TagRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const names = [
    "urgent",
    "referral",
    "dream-role",
    "remote",
    "hybrid",
    "junior",
    "senior",
    "follow-up",
  ];

  const modelTypeByName: Record<string, TagModelTypeValue> = {
    urgent: TAG_MODEL_TYPES.general,
    "follow-up": TAG_MODEL_TYPES.general,
    referral: TAG_MODEL_TYPES.application,
    "dream-role": TAG_MODEL_TYPES.application,
    remote: TAG_MODEL_TYPES.application,
    hybrid: TAG_MODEL_TYPES.application,
    junior: TAG_MODEL_TYPES.application,
    senior: TAG_MODEL_TYPES.application,
  };

  const resolvedNames =
    count <= names.length
      ? names.slice(0, count)
      : [
          ...names,
          ...Array.from(
            { length: count - names.length },
            (_, index) => "tag-" + String(index + 1),
          ),
        ];

  return resolvedNames.map((name, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.recent({ days: 90 }).toISOString();

    return {
      id: faker.string.uuid(),
      name,
      color: faker.color.rgb(),
      model_type: modelTypeByName[name] ?? TAG_MODEL_TYPES.general,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
