import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import { mapStatisticRowToEntity } from "@modules/statistics/application/mappers/mapStatisticRow";
import { StatisticSchema } from "@modules/statistics/domain/zod/statistic.schema";

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
  /** Read all persisted statistic records. */
  list(): Promise<Statistic[]>;
  /** Count applications whose status is applied. */
  getTotalAppliedApplications(): Promise<number>;
}

/**
 * SQLite-backed repository for statistics metrics.
 */
export class StatisticRepository implements IStatisticRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Statistic[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM statistics ORDER BY created_at DESC",
    );

    const mapped = rows.map((row) => mapStatisticRowToEntity(row));
    return StatisticSchema.array().parse(mapped);
  }

  async getTotalAppliedApplications(): Promise<number> {
    const rows = await this.db.select<{ total: number }>(
      "SELECT COUNT(*) AS total FROM applications WHERE status = $1 AND is_deleted = 0",
      ["applied"],
    );

    return rows[0]?.total ?? 0;
  }
}
