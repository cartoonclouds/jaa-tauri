import type { IStatisticRepository } from "@modules/statistics/repositories/StatisticRepository";

import { StatisticService } from "@modules/statistics/services/StatisticService";
import { describe, expect, it, vi } from "vitest";

function mockRepository(): IStatisticRepository {
  return {
    getTotalAppliedApplications: vi.fn(async () => 0),
  };
}

describe("StatisticService", () => {
  it("returns overview with applied applications total", async () => {
    const repository = mockRepository();
    const service = new StatisticService(repository);
    vi.mocked(repository.getTotalAppliedApplications).mockResolvedValueOnce(7);

    const result = await service.getOverview();

    expect(repository.getTotalAppliedApplications).toHaveBeenCalledOnce();
    expect(result.totalAppliedApplications).toBe(7);
  });
});
