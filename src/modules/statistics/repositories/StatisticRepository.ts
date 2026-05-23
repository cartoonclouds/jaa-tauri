import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Statistic } from "@modules/statistics/domain/entities/Statistic";

import { mapStatisticRowToEntity } from "@modules/statistics/application/mappers/mapStatisticRow";
import { StatisticSchema } from "@modules/statistics/domain/zod/statistic.schema";

/**
 * Aggregated read model returned by statistics queries.
 */
export interface StatisticsOverview {
  /** Total applications currently tracked (excluding deleted rows). */
  totalApplications: number;
  /** Total applications currently marked as applied. */
  totalAppliedApplications: number;
  /** Total applications currently in interview pipeline stages. */
  totalInterviewingApplications: number;
  /** Total applications currently marked as offer. */
  totalOffers: number;
  /** Total applications currently marked as rejected. */
  totalRejectedApplications: number;
  /** Total applications created in the last 30 days. */
  applicationsCreatedLast30Days: number;
  /** Total applications with applied date in the last 30 days. */
  applicationsAppliedLast30Days: number;
  /** Total applications created in the 30-day window before the last 30 days. */
  applicationsCreatedPrevious30Days: number;
  /** Total applications applied in the 30-day window before the last 30 days. */
  applicationsAppliedPrevious30Days: number;
  /** Last-30-day applications that reached interview or final response stages. */
  applicationsRespondedLast30Days: number;
  /** Previous-30-day applications that reached interview or final response stages. */
  applicationsRespondedPrevious30Days: number;
  /** Last-30-day applications currently in offer stage. */
  applicationsOfferLast30Days: number;
  /** Previous-30-day applications currently in offer stage. */
  applicationsOfferPrevious30Days: number;
  /** Active pipeline applications excluding offer and rejected outcomes. */
  activePipelineApplications: number;
  /** Percentage of applied applications that advanced to response stages. */
  responseRate: number;
  /** Percentage of applied applications currently in offer stage. */
  offerRate: number;
  /** Percentage of applied applications currently in rejected stage. */
  rejectionRate: number;
  /** Difference between current and previous 30-day created applications. */
  applicationsCreatedDelta30Days: number;
  /** Difference between current and previous 30-day applied applications. */
  applicationsAppliedDelta30Days: number;
  /** Percentage change for created applications compared to previous 30 days. */
  applicationsCreatedDeltaPercent: number;
  /** Percentage change for applied applications compared to previous 30 days. */
  applicationsAppliedDeltaPercent: number;
  /** Last-30-day response rate for applied cohorts. */
  responseRateLast30Days: number;
  /** Previous-30-day response rate for applied cohorts. */
  responseRatePrevious30Days: number;
  /** Delta between last and previous 30-day response rates. */
  responseRateDeltaPercent: number;
  /** Last-30-day offer rate for applied cohorts. */
  offerRateLast30Days: number;
  /** Previous-30-day offer rate for applied cohorts. */
  offerRatePrevious30Days: number;
  /** Delta between last and previous 30-day offer rates. */
  offerRateDeltaPercent: number;
}

/**
 * Base aggregated read model returned by persistence queries.
 */
export type StatisticsOverviewBase = Omit<
  StatisticsOverview,
  | "activePipelineApplications"
  | "responseRate"
  | "offerRate"
  | "rejectionRate"
  | "applicationsCreatedDelta30Days"
  | "applicationsAppliedDelta30Days"
  | "applicationsCreatedDeltaPercent"
  | "applicationsAppliedDeltaPercent"
  | "responseRateLast30Days"
  | "responseRatePrevious30Days"
  | "responseRateDeltaPercent"
  | "offerRateLast30Days"
  | "offerRatePrevious30Days"
  | "offerRateDeltaPercent"
>;

/**
 * Persistence contract for statistics metrics.
 */
export interface IStatisticRepository {
  /** Read all persisted statistic records. */
  list(): Promise<Statistic[]>;
  /** Fetch aggregated statistics for the job applications dashboard. */
  getOverview(): Promise<StatisticsOverviewBase>;
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

  async getOverview(): Promise<StatisticsOverviewBase> {
    const rows = await this.db.select<StatisticsOverviewBase>(
      `SELECT
         COUNT(*) AS totalApplications,
         SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) AS totalAppliedApplications,
         SUM(CASE WHEN status IN ('phone-screening', 'technical', 'interview') THEN 1 ELSE 0 END) AS totalInterviewingApplications,
         SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END) AS totalOffers,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS totalRejectedApplications,
         SUM(CASE WHEN datetime(created_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END) AS applicationsCreatedLast30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END) AS applicationsAppliedLast30Days,
        SUM(CASE WHEN datetime(created_at) >= datetime('now', '-60 day') AND datetime(created_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END) AS applicationsCreatedPrevious30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END) AS applicationsAppliedPrevious30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') AND status IN ('phone-screening', 'technical', 'interview', 'offer', 'rejected') THEN 1 ELSE 0 END) AS applicationsRespondedLast30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') AND status IN ('phone-screening', 'technical', 'interview', 'offer', 'rejected') THEN 1 ELSE 0 END) AS applicationsRespondedPrevious30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') AND status = 'offer' THEN 1 ELSE 0 END) AS applicationsOfferLast30Days,
        SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') AND status = 'offer' THEN 1 ELSE 0 END) AS applicationsOfferPrevious30Days
       FROM applications
       WHERE is_deleted = 0`,
    );

    return {
      totalApplications: rows[0]?.totalApplications ?? 0,
      totalAppliedApplications: rows[0]?.totalAppliedApplications ?? 0,
      totalInterviewingApplications:
        rows[0]?.totalInterviewingApplications ?? 0,
      totalOffers: rows[0]?.totalOffers ?? 0,
      totalRejectedApplications: rows[0]?.totalRejectedApplications ?? 0,
      applicationsCreatedLast30Days:
        rows[0]?.applicationsCreatedLast30Days ?? 0,
      applicationsAppliedLast30Days:
        rows[0]?.applicationsAppliedLast30Days ?? 0,
      applicationsCreatedPrevious30Days:
        rows[0]?.applicationsCreatedPrevious30Days ?? 0,
      applicationsAppliedPrevious30Days:
        rows[0]?.applicationsAppliedPrevious30Days ?? 0,
      applicationsRespondedLast30Days:
        rows[0]?.applicationsRespondedLast30Days ?? 0,
      applicationsRespondedPrevious30Days:
        rows[0]?.applicationsRespondedPrevious30Days ?? 0,
      applicationsOfferLast30Days: rows[0]?.applicationsOfferLast30Days ?? 0,
      applicationsOfferPrevious30Days:
        rows[0]?.applicationsOfferPrevious30Days ?? 0,
    };
  }
}
