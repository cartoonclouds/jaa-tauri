import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

/**
 * Aggregated read model returned by statistics queries.
 */
export interface StatisticsOverview {
  /** Total applications currently marked as applied. */
  totalAppliedApplications: number;
}

/**
 * Persistence contract for statistics metrics.
 */
export interface IStatisticRepository {
  /** Count applications whose status is applied. */
  getTotalAppliedApplications(): Promise<number>;
}

/**
 * SQLite-backed repository for statistics metrics.
 */
export class StatisticRepository implements IStatisticRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async getTotalAppliedApplications(): Promise<number> {
    const rows = await this.db.select<{ total: number }>(
      "SELECT COUNT(*) AS total FROM applications WHERE status = $1 AND is_deleted = 0",
      ["applied"],
    );

    return rows[0]?.total ?? 0;
  }
}
