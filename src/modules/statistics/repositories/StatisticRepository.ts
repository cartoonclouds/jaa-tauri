import type {
  ExecutableConstructor,
  IExecutable,
} from "../domain/types/executable";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import { mapStatisticRowToEntity } from "@modules/statistics/application/mappers/mapStatisticRow";
import { StatisticSchema } from "@modules/statistics/domain/zod/statistic.schema";

import { ActivePipelineApplications } from "../domain/executables/activePipelineApplications";
import { ApplicationsAppliedLast30Days } from "../domain/executables/applicationsAppliedLast30Days";
import { ApplicationsAppliedPrevious30Days } from "../domain/executables/applicationsAppliedPrevious30Days";
import { ApplicationsCreatedLast30Days } from "../domain/executables/applicationsCreatedLast30Days";
import { ApplicationsCreatedPrevious30Days } from "../domain/executables/applicationsCreatedPrevious30Days";
import { ApplicationsOfferLast30Days } from "../domain/executables/applicationsOfferLast30Days";
import { ApplicationsOfferPrevious30Days } from "../domain/executables/applicationsOfferPrevious30Days";
import { ApplicationsRespondedLast30Days } from "../domain/executables/applicationsRespondedLast30Days";
import { ApplicationsRespondedPrevious30Days } from "../domain/executables/applicationsRespondedPrevious30Days";
import { OfferRate } from "../domain/executables/offerRate";
import { RejectionRate } from "../domain/executables/rejectionRate";
import { ResponseRate } from "../domain/executables/responseRate";
import { TotalApplications } from "../domain/executables/totalApplications";
import { TotalAppliedApplications } from "../domain/executables/totalAppliedApplications";
import { TotalInterviewingApplications } from "../domain/executables/totalInterviewingApplications";
import { TotalOffers } from "../domain/executables/totalOffers";
import { TotalRejectedApplications } from "../domain/executables/totalRejectedApplications";

/** Metrics intended for card rendering in the statistics dashboard. */
export const CARD_METRIC_DEFINITIONS: readonly ExecutableConstructor[] = [
  TotalApplications,
  TotalAppliedApplications,
  TotalInterviewingApplications,
  TotalOffers,
  TotalRejectedApplications,
  ApplicationsCreatedLast30Days,
  ApplicationsAppliedLast30Days,
  ActivePipelineApplications,
  ResponseRate,
  OfferRate,
  RejectionRate,
];

/** Internal supporting metrics used for derived calculations and diagnostics. */
export const INTERNAL_METRIC_DEFINITIONS: readonly ExecutableConstructor[] = [
  ApplicationsCreatedPrevious30Days,
  ApplicationsAppliedPrevious30Days,
  ApplicationsRespondedLast30Days,
  ApplicationsRespondedPrevious30Days,
  ApplicationsOfferLast30Days,
  ApplicationsOfferPrevious30Days,
];

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

    const metricDefinitions: readonly ExecutableConstructor[] =
      CARD_METRIC_DEFINITIONS.concat(INTERNAL_METRIC_DEFINITIONS);

    for (const ExecutableClass of metricDefinitions) {
      try {
        const executable: IExecutable = new ExecutableClass(this.db);
        await executable.execute();
        overview.push(executable);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const metricId = ExecutableClass.id;
        console.error(`Error executing metric ${metricId}:`, message);
      }
    }

    return overview;
  }
}
