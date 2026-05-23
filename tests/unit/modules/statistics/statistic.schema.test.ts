import {
  CreateStatisticSchema,
  StatisticSchema,
} from "@modules/statistics/domain/zod/statistic.schema";
import { describe, expect, it } from "vitest";

describe("statistic.schema", () => {
  it("accepts valid create payload", () => {
    const result = CreateStatisticSchema.safeParse({
      name: "Open positions",
      value: 8,
      scope: "company",
      recordedAt: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid entity payload", () => {
    const result = StatisticSchema.safeParse({
      id: "not-a-uuid",
      name: "",
      value: Number.NaN,
      scope: "invalid",
      recordedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.success).toBe(false);
  });
});
