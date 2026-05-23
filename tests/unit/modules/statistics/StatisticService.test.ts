import type { IStatisticRepository } from "@modules/statistics/repositories/StatisticRepository";

import { StatisticService } from "@modules/statistics/services/StatisticService";
import { describe, expect, it, vi } from "vitest";

function mockRepository(): IStatisticRepository {
  return {
    list: vi.fn(async () => []),
    getOverview: vi.fn(async () => ({
      totalApplications: 0,
      totalAppliedApplications: 0,
      totalInterviewingApplications: 0,
      totalOffers: 0,
      totalRejectedApplications: 0,
      applicationsCreatedLast30Days: 0,
      applicationsAppliedLast30Days: 0,
      applicationsCreatedPrevious30Days: 0,
      applicationsAppliedPrevious30Days: 0,
      applicationsRespondedLast30Days: 0,
      applicationsRespondedPrevious30Days: 0,
      applicationsOfferLast30Days: 0,
      applicationsOfferPrevious30Days: 0,
    })),
  };
}

describe("StatisticService", () => {
  it("returns overview with derived pipeline and rates", async () => {
    const repository = mockRepository();
    const service = new StatisticService(repository);
    vi.mocked(repository.getOverview).mockResolvedValueOnce({
      totalApplications: 20,
      totalAppliedApplications: 10,
      totalInterviewingApplications: 4,
      totalOffers: 2,
      totalRejectedApplications: 3,
      applicationsCreatedLast30Days: 8,
      applicationsAppliedLast30Days: 6,
      applicationsCreatedPrevious30Days: 4,
      applicationsAppliedPrevious30Days: 3,
      applicationsRespondedLast30Days: 4,
      applicationsRespondedPrevious30Days: 1,
      applicationsOfferLast30Days: 2,
      applicationsOfferPrevious30Days: 0,
    });

    const result = await service.getOverview();

    expect(repository.getOverview).toHaveBeenCalledOnce();
    expect(result.totalApplications).toBe(20);
    expect(result.totalAppliedApplications).toBe(10);
    expect(result.activePipelineApplications).toBe(15);
    expect(result.responseRate).toBe(90);
    expect(result.offerRate).toBe(20);
    expect(result.rejectionRate).toBe(30);
    expect(result.applicationsCreatedDelta30Days).toBe(4);
    expect(result.applicationsAppliedDelta30Days).toBe(3);
    expect(result.applicationsCreatedDeltaPercent).toBe(100);
    expect(result.applicationsAppliedDeltaPercent).toBe(100);
    expect(result.responseRateLast30Days).toBe(67);
    expect(result.responseRatePrevious30Days).toBe(33);
    expect(result.responseRateDeltaPercent).toBe(34);
    expect(result.offerRateLast30Days).toBe(33);
    expect(result.offerRatePrevious30Days).toBe(0);
    expect(result.offerRateDeltaPercent).toBe(33);
  });

  it("returns zero rates when no applications were applied", async () => {
    const repository = mockRepository();
    const service = new StatisticService(repository);
    vi.mocked(repository.getOverview).mockResolvedValueOnce({
      totalApplications: 5,
      totalAppliedApplications: 0,
      totalInterviewingApplications: 0,
      totalOffers: 0,
      totalRejectedApplications: 0,
      applicationsCreatedLast30Days: 2,
      applicationsAppliedLast30Days: 0,
      applicationsCreatedPrevious30Days: 1,
      applicationsAppliedPrevious30Days: 0,
      applicationsRespondedLast30Days: 0,
      applicationsRespondedPrevious30Days: 0,
      applicationsOfferLast30Days: 0,
      applicationsOfferPrevious30Days: 0,
    });

    const result = await service.getOverview();

    expect(result.responseRate).toBe(0);
    expect(result.offerRate).toBe(0);
    expect(result.rejectionRate).toBe(0);
    expect(result.applicationsCreatedDelta30Days).toBe(1);
    expect(result.applicationsAppliedDelta30Days).toBe(0);
    expect(result.applicationsCreatedDeltaPercent).toBe(100);
    expect(result.applicationsAppliedDeltaPercent).toBe(0);
    expect(result.responseRateLast30Days).toBe(0);
    expect(result.responseRatePrevious30Days).toBe(0);
    expect(result.responseRateDeltaPercent).toBe(0);
    expect(result.offerRateLast30Days).toBe(0);
    expect(result.offerRatePrevious30Days).toBe(0);
    expect(result.offerRateDeltaPercent).toBe(0);
  });
});
