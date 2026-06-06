import type { ExecutableConstructor, IMetric } from "../domain/types/metric";
import type { Statistic } from "@/modules/statistics/domain/types/statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

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
  getOverview(): Promise<IMetric[]>;
}

/**
 * SQLite-backed repository for statistics metrics.
 */
export class StatisticRepository implements IStatisticRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private async getStatsVisibility(): Promise<
    Record<string, { visible: boolean; sortOrder: number | null }>
  > {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT stats_visibility
       FROM settings
       WHERE id = $1
       LIMIT 1`,
      ["app-settings"],
    );

    const value = rows[0]?.stats_visibility;

    if (typeof value !== "string") {
      return {};
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }

      return Object.entries(parsed).reduce<
        Record<string, { visible: boolean; sortOrder: number | null }>
      >((accumulator, [key, mapValue]) => {
        if (typeof mapValue === "boolean") {
          accumulator[key] = {
            visible: mapValue,
            sortOrder: null,
          };
          return accumulator;
        }

        if (
          mapValue &&
          typeof mapValue === "object" &&
          !Array.isArray(mapValue)
        ) {
          const candidate = mapValue as Record<string, unknown>;
          if (typeof candidate.visible === "boolean") {
            accumulator[key] = {
              visible: candidate.visible,
              sortOrder:
                typeof candidate.sortOrder === "number" &&
                Number.isInteger(candidate.sortOrder)
                  ? candidate.sortOrder
                  : null,
            };
            return accumulator;
          }
        }

        accumulator[key] = {
          visible: Boolean(mapValue),
          sortOrder: null,
        };
        return accumulator;
      }, {});
    } catch {
      return {};
    }
  }

  async list(): Promise<Statistic[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM statistics ORDER BY created_at DESC",
    );

    const mapped = rows.map((row) => mapStatisticRowToEntity(row));
    try {
      const validated = StatisticSchema.array().parse(mapped);
      return validated;
    } catch (error) {
      console.error("StatisticRepository.list validation failed", {
        mapped,
        error,
      });
      throw error;
    }
  }

  async getOverview(): Promise<IMetric[]> {
    const overview: IMetric[] = [];
    const visibilityByMetricId = await this.getStatsVisibility();
    const hasVisibilitySettings = Object.keys(visibilityByMetricId).length > 0;

    const metricDefinitions: readonly ExecutableConstructor[] =
      CARD_METRIC_DEFINITIONS.concat(INTERNAL_METRIC_DEFINITIONS).filter(
        (metricDefinition) => {
          if (!hasVisibilitySettings) {
            return true;
          }

          const hasPersistedVisibility = Object.prototype.hasOwnProperty.call(
            visibilityByMetricId,
            metricDefinition.id,
          );

          return (
            hasPersistedVisibility &&
            visibilityByMetricId[metricDefinition.id].visible
          );
        },
      );

    const metricDefinitionOrder = new Map<string, number>(
      metricDefinitions.map((metricDefinition, index) => [
        metricDefinition.id,
        index,
      ]),
    );

    const sortedMetricDefinitions = [...metricDefinitions].sort(
      (left, right) => {
        const leftHasConfig = Object.prototype.hasOwnProperty.call(
          visibilityByMetricId,
          left.id,
        );
        const rightHasConfig = Object.prototype.hasOwnProperty.call(
          visibilityByMetricId,
          right.id,
        );

        const leftSortOrder = leftHasConfig
          ? visibilityByMetricId[left.id].sortOrder
          : null;
        const rightSortOrder = rightHasConfig
          ? visibilityByMetricId[right.id].sortOrder
          : null;

        const leftHasSortOrder = typeof leftSortOrder === "number";
        const rightHasSortOrder = typeof rightSortOrder === "number";

        if (
          leftHasSortOrder &&
          rightHasSortOrder &&
          leftSortOrder !== rightSortOrder
        ) {
          return leftSortOrder - rightSortOrder;
        }

        if (leftHasSortOrder && !rightHasSortOrder) {
          return -1;
        }

        if (!leftHasSortOrder && rightHasSortOrder) {
          return 1;
        }

        return (
          (metricDefinitionOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (metricDefinitionOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
        );
      },
    );

    for (const ExecutableClass of sortedMetricDefinitions) {
      try {
        const executable: IMetric = new ExecutableClass(this.db);
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
