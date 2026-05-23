import type {
  IStatisticRepository,
  StatisticsOverview,
} from "@modules/statistics/repositories/StatisticRepository";

/**
 * Application service for read-only statistics metrics.
 */
export class StatisticService {
  constructor(private readonly repository: IStatisticRepository) {}

  /**
   * Fetch a dashboard-friendly overview of tracked metrics.
   */
  async getOverview(): Promise<StatisticsOverview> {
    const totalAppliedApplications =
      await this.repository.getTotalAppliedApplications();

    return {
      totalAppliedApplications,
    };
  }
}
