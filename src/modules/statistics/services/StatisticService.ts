import type {
  IStatisticRepository,
  StatisticsOverview,
} from "@modules/statistics/repositories/StatisticRepository";

/**
 * Application service for read-only statistics metrics.
 */
export class StatisticService {
  constructor(private readonly repository: IStatisticRepository) {}

  private toRate(numerator: number, denominator: number): number {
    if (denominator <= 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100);
  }

  private toTrendPercent(current: number, previous: number): number {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Fetch a dashboard-friendly overview of tracked metrics.
   */
  async getOverview(): Promise<StatisticsOverview> {
    const baseOverview = await this.repository.getOverview();
    const terminalOutcomes =
      baseOverview.totalOffers + baseOverview.totalRejectedApplications;
    const responseStages =
      baseOverview.totalInterviewingApplications + terminalOutcomes;
    const responseRate =
      baseOverview.totalAppliedApplications > 0
        ? Math.round(
            (responseStages / baseOverview.totalAppliedApplications) * 100,
          )
        : 0;
    const offerRate =
      baseOverview.totalAppliedApplications > 0
        ? Math.round(
            (baseOverview.totalOffers / baseOverview.totalAppliedApplications) *
              100,
          )
        : 0;
    const rejectionRate =
      baseOverview.totalAppliedApplications > 0
        ? Math.round(
            (baseOverview.totalRejectedApplications /
              baseOverview.totalAppliedApplications) *
              100,
          )
        : 0;
    const activePipelineApplications =
      baseOverview.totalApplications - terminalOutcomes;
    const applicationsCreatedDelta30Days =
      baseOverview.applicationsCreatedLast30Days -
      baseOverview.applicationsCreatedPrevious30Days;
    const applicationsAppliedDelta30Days =
      baseOverview.applicationsAppliedLast30Days -
      baseOverview.applicationsAppliedPrevious30Days;
    const applicationsCreatedDeltaPercent = this.toTrendPercent(
      baseOverview.applicationsCreatedLast30Days,
      baseOverview.applicationsCreatedPrevious30Days,
    );
    const applicationsAppliedDeltaPercent = this.toTrendPercent(
      baseOverview.applicationsAppliedLast30Days,
      baseOverview.applicationsAppliedPrevious30Days,
    );
    const responseRateLast30Days = this.toRate(
      baseOverview.applicationsRespondedLast30Days,
      baseOverview.applicationsAppliedLast30Days,
    );
    const responseRatePrevious30Days = this.toRate(
      baseOverview.applicationsRespondedPrevious30Days,
      baseOverview.applicationsAppliedPrevious30Days,
    );
    const offerRateLast30Days = this.toRate(
      baseOverview.applicationsOfferLast30Days,
      baseOverview.applicationsAppliedLast30Days,
    );
    const offerRatePrevious30Days = this.toRate(
      baseOverview.applicationsOfferPrevious30Days,
      baseOverview.applicationsAppliedPrevious30Days,
    );
    const responseRateDeltaPercent =
      responseRateLast30Days - responseRatePrevious30Days;
    const offerRateDeltaPercent = offerRateLast30Days - offerRatePrevious30Days;

    return {
      ...baseOverview,
      activePipelineApplications,
      responseRate,
      offerRate,
      rejectionRate,
      applicationsCreatedDelta30Days,
      applicationsAppliedDelta30Days,
      applicationsCreatedDeltaPercent,
      applicationsAppliedDeltaPercent,
      responseRateLast30Days,
      responseRatePrevious30Days,
      responseRateDeltaPercent,
      offerRateLast30Days,
      offerRatePrevious30Days,
      offerRateDeltaPercent,
    };
  }
}
