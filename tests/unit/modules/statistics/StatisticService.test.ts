import type { StatisticCardMetricDefinition } from "@/modules/statistics/domain/types/statistic";
import type { IExecutable } from "@modules/statistics/domain/types/executable";
import type { IStatisticRepository } from "@modules/statistics/repositories/StatisticRepository";

// eslint-disable-next-line no-restricted-imports
import { StatisticService } from "@modules/statistics/services/StatisticService";
import { describe, expect, it, vi } from "vitest";

function createExecutable(id: string, value = 0): IExecutable {
  return {
    execute: vi.fn(() => Promise.resolve(value)),
    toView: vi.fn(
      (): StatisticCardMetricDefinition => ({
        id,
        title: id,
        description: id,
        icon: "heroicons:chart-bar",
        tone: "info",
        value,
      }),
    ),
  };
}

function mockRepository(): IStatisticRepository {
  const list = vi.fn(() => Promise.resolve([]));
  const getOverview = vi.fn(() =>
    Promise.resolve([createExecutable("metric")]),
  );

  return {
    list,
    getOverview,
  };
}

describe("StatisticService", () => {
  it("returns executable overview from repository", async () => {
    const repository = mockRepository();
    const service = new StatisticService(repository);
    const getOverviewMock = vi.mocked(repository.getOverview);
    const executableA = createExecutable("totalApplications", 20);
    const executableB = createExecutable("totalAppliedApplications", 10);
    const expectedOverview = [executableA, executableB];
    getOverviewMock.mockResolvedValueOnce(expectedOverview);

    const result = await service.getOverview();

    expect(getOverviewMock).toHaveBeenCalledOnce();
    expect(result).toBe(expectedOverview);
  });

  it("returns an empty overview when repository returns none", async () => {
    const repository = mockRepository();
    const service = new StatisticService(repository);
    const getOverviewMock = vi.mocked(repository.getOverview);
    getOverviewMock.mockResolvedValueOnce([]);

    const result = await service.getOverview();

    expect(result).toEqual([]);
  });
});
