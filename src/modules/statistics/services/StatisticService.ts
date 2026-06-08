import type { IStatisticRepository } from "@modules/statistics/types";

/**
 * Application service for read-only statistics metrics.
 */
export class StatisticService {
  constructor(private readonly repository: IStatisticRepository) {}

  /**
   * Fetch a dashboard-friendly overview of tracked metrics.
   */
  async getOverview() {
    return await this.repository.getOverview();
  }
}
