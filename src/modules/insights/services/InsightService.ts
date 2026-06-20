import type { IInsightRepository } from "@modules/insights/types";

/**
 * Application service for read-only insight metrics.
 */
export class InsightService {
  constructor(private readonly repository: IInsightRepository) {}

  /**
   * Fetch a dashboard-friendly overview of tracked metrics.
   */
  async getOverview() {
    return await this.repository.getOverview();
  }
}
