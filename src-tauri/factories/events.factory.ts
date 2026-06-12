import type { EventStageCopy } from "../../src/modules/events/constants";

import { faker } from "@faker-js/faker";

import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_STAGE_SET,
} from "../../src/modules/events/constants";

export interface EventRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function createEventRows(seed = 1500): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return [...EVENT_FLOW_STAGE_SET].map((type, index) => {
    faker.seed(seed + index);
    const anchorDate = faker.date.recent({ days: 60 });
    const createdAt = new Date(anchorDate);
    const stageCopy: EventStageCopy = EVENT_COPY_BY_STAGE[type];

    return {
      id: faker.string.uuid(),
      type,
      title: stageCopy.title,
      description: stageCopy.description,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  });
}
