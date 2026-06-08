import type { IMetric } from "@/modules/statistics/domain/types/metric";
import type { StatisticCardMetricDefinition } from "@/modules/statistics/domain/types/statistic";
import type { StatisticMetricId } from "@/modules/statistics/domain/types/statistic";
import type { IStatisticRepository } from "@modules/statistics/types";

// eslint-disable-next-line no-restricted-imports
import { StatisticService } from "@modules/statistics/services/StatisticService";
import { describe, expect, it, vi } from "vitest";

function createExecutable(id: StatisticMetricId, value = 0): IMetric {
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

function mockRepositoryWithMocks(): {
  repository: IStatisticRepository;
  listMock: ReturnType<typeof vi.fn>;
  getOverviewMock: ReturnType<typeof vi.fn>;
} {
  const listMock = vi.fn(() => Promise.resolve([]));
  const getOverviewMock = vi.fn(() =>
    Promise.resolve([createExecutable("totalApplications")]),
  );

  return {
    repository: {
      list: listMock,
      getOverview: getOverviewMock,
    },
    listMock,
    getOverviewMock,
  };
}

describe("StatisticService", () => {
  it("returns executable overview from repository", async () => {
    const { repository, getOverviewMock } = mockRepositoryWithMocks();
    const service = new StatisticService(repository);
    const executableA = createExecutable("totalApplications", 20);
    const executableB = createExecutable("totalAppliedApplications", 10);
    const expectedOverview = [executableA, executableB];
    getOverviewMock.mockResolvedValueOnce(expectedOverview);

    const result = await service.getOverview();

    expect(getOverviewMock).toHaveBeenCalledOnce();
    expect(result).toBe(expectedOverview);
  });

  it("returns an empty overview when repository returns none", async () => {
    const { repository, getOverviewMock } = mockRepositoryWithMocks();
    const service = new StatisticService(repository);
    getOverviewMock.mockResolvedValueOnce([]);

    const result = await service.getOverview();

    expect(result).toEqual([]);
  });
});
