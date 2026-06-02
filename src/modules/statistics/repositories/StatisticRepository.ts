import type { IExecutable } from "../domain/types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import { mapStatisticRowToEntity } from "@modules/statistics/application/mappers/mapStatisticRow";
import { StatisticSchema } from "@modules/statistics/domain/zod/statistic.schema";

import { ApplicationsAppliedLast30Days } from "../domain/executables/applicationsAppliedLast30Days";
import { ApplicationsCreatedLast30Days } from "../domain/executables/applicationsCreatedLast30Days";
import { TotalApplications } from "../domain/executables/totalApplications";
import { TotalAppliedApplications } from "../domain/executables/totalAppliedApplications";

export const METRIC_DEFINITIONS = [
  TotalApplications,
  TotalAppliedApplications,
  ApplicationsCreatedLast30Days,
  ApplicationsAppliedLast30Days,
];

// export type StatisticsOverviewMetric = keyof StatisticsOverview;

// /**
//  * Aggregated read model returned by statistics queries.
//  */
// export interface StatisticsOverview {
//   /** Total applications currently tracked (excluding deleted rows). */
//   totalApplications: number;
//   /** Total applications currently marked as applied. */
//   totalAppliedApplications: number;
//   /** Total applications currently in interview pipeline stages. */
//   totalInterviewingApplications: number;
//   /** Total applications currently marked as offer. */
//   totalOffers: number;
//   /** Total applications currently marked as rejected. */
//   totalRejectedApplications: number;
//   /** Total applications created in the last 30 days. */
//   applicationsCreatedLast30Days: number;
//   /** Total applications with applied date in the last 30 days. */
//   applicationsAppliedLast30Days: number;
//   /** Total applications created in the 30-day window before the last 30 days. */
//   applicationsCreatedPrevious30Days: number;
//   /** Total applications applied in the 30-day window before the last 30 days. */
//   applicationsAppliedPrevious30Days: number;
//   /** Last-30-day applications that reached interview or final response stages. */
//   applicationsRespondedLast30Days: number;
//   /** Previous-30-day applications that reached interview or final response stages. */
//   applicationsRespondedPrevious30Days: number;
//   /** Last-30-day applications currently in offer stage. */
//   applicationsOfferLast30Days: number;
//   /** Previous-30-day applications currently in offer stage. */
//   applicationsOfferPrevious30Days: number;
//   /** Active pipeline applications excluding offer and rejected outcomes. */
//   activePipelineApplications: number;
//   /** Percentage of applied applications that advanced to response stages. */
//   responseRate: number;
//   /** Percentage of applied applications currently in offer stage. */
//   offerRate: number;
//   /** Percentage of applied applications currently in rejected stage. */
//   rejectionRate: number;
//   /** Difference between current and previous 30-day created applications. */
//   applicationsCreatedDelta30Days: number;
//   /** Difference between current and previous 30-day applied applications. */
//   applicationsAppliedDelta30Days: number;
//   /** Percentage change for created applications compared to previous 30 days. */
//   applicationsCreatedDeltaPercent: number;
//   /** Percentage change for applied applications compared to previous 30 days. */
//   applicationsAppliedDeltaPercent: number;
//   /** Last-30-day response rate for applied cohorts. */
//   responseRateLast30Days: number;
//   /** Previous-30-day response rate for applied cohorts. */
//   responseRatePrevious30Days: number;
//   /** Delta between last and previous 30-day response rates. */
//   responseRateDeltaPercent: number;
//   /** Last-30-day offer rate for applied cohorts. */
//   offerRateLast30Days: number;
//   /** Previous-30-day offer rate for applied cohorts. */
//   offerRatePrevious30Days: number;
//   /** Delta between last and previous 30-day offer rates. */
//   offerRateDeltaPercent: number;
// }

/**
 * Persistence contract for statistics metrics.
 */
export interface IStatisticRepository {
  /** Read all persisted statistic records. */
  list(): Promise<Statistic[]>;
  /** Fetch aggregated statistics for the job applications dashboard. */
  getOverview(): Promise<IExecutable[]>;
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

  async getOverview(): Promise<IExecutable[]> {
    const overview: IExecutable[] = [];

    await Promise.allSettled(
      METRIC_DEFINITIONS.map(async (ExecutableClass) => {
        try {
          const executable = new ExecutableClass(this.db);

          await executable.execute();

          overview.push(executable);
        } catch (error) {
          console.error(`Error executing metric ${ExecutableClass.id}:`, error);
        }
      }),
    );

    return overview;
  }
}
