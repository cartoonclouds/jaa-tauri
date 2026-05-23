import type {
  StatisticsOverview,
  StatisticsOverviewBase,
} from "@modules/statistics/repositories/StatisticRepository";

export type StatisticMetricId = keyof StatisticsOverview;
export type StatisticAggregateField = keyof StatisticsOverviewBase;
export type StatisticCardTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type StatisticTrendValueFormat = "percent" | "points";

export interface StatisticCardDefinition {
  title: string;
  description: string;
  icon: string;
  tone: StatisticCardTone;
  valueField?: StatisticMetricId;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: StatisticMetricId;
  trendToneField?: StatisticMetricId;
  trendValueFormat?: StatisticTrendValueFormat;
}

export interface StatisticMetricDefinition {
  id: StatisticMetricId;
  aggregateSql?: string;
  card?: StatisticCardDefinition;
}

/**
 * Shared single-source metric definitions for repository aggregates and UI cards.
 */
export const STATISTIC_METRIC_DEFINITIONS: readonly StatisticMetricDefinition[] =
  [
    {
      id: "totalApplications",
      aggregateSql: "COUNT(*)",
      card: {
        title: "Total applications",
        description: "All active records in your tracker",
        icon: "heroicons:briefcase",
        tone: "info",
      },
    },
    {
      id: "totalAppliedApplications",
      aggregateSql: "SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END)",
      card: {
        title: "Applied applications",
        description: "Applications currently in applied stage",
        icon: "heroicons:paper-airplane",
        tone: "default",
      },
    },
    {
      id: "totalInterviewingApplications",
      aggregateSql:
        "SUM(CASE WHEN status IN ('phone-screening', 'technical', 'interview') THEN 1 ELSE 0 END)",
      card: {
        title: "Interviewing",
        description: "Phone screening, technical, and interview",
        icon: "heroicons:chat-bubble-left-right",
        tone: "warning",
      },
    },
    {
      id: "totalOffers",
      aggregateSql: "SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END)",
      card: {
        title: "Offers",
        description: "Current opportunities at offer stage",
        icon: "heroicons:star",
        tone: "success",
      },
    },
    {
      id: "totalRejectedApplications",
      aggregateSql: "SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)",
      card: {
        title: "Rejections",
        description: "Applications closed as rejected",
        icon: "heroicons:x-circle",
        tone: "danger",
      },
    },
    {
      id: "applicationsCreatedLast30Days",
      aggregateSql:
        "SUM(CASE WHEN datetime(created_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END)",
      card: {
        title: "Created last 30 days",
        description: "New opportunities added this month",
        icon: "heroicons:calendar-days",
        tone: "info",
        trendLabel: "vs previous 30 days",
        trendValueField: "applicationsCreatedDeltaPercent",
        trendToneField: "applicationsCreatedDelta30Days",
        trendValueFormat: "percent",
      },
    },
    {
      id: "applicationsAppliedLast30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') THEN 1 ELSE 0 END)",
      card: {
        title: "Applied last 30 days",
        description: "Recent application cadence",
        icon: "heroicons:calendar",
        tone: "info",
        trendLabel: "vs previous 30 days",
        trendValueField: "applicationsAppliedDeltaPercent",
        trendToneField: "applicationsAppliedDelta30Days",
        trendValueFormat: "percent",
      },
    },
    {
      id: "applicationsCreatedPrevious30Days",
      aggregateSql:
        "SUM(CASE WHEN datetime(created_at) >= datetime('now', '-60 day') AND datetime(created_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END)",
    },
    {
      id: "applicationsAppliedPrevious30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') THEN 1 ELSE 0 END)",
    },
    {
      id: "applicationsRespondedLast30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') AND status IN ('phone-screening', 'technical', 'interview', 'offer', 'rejected') THEN 1 ELSE 0 END)",
    },
    {
      id: "applicationsRespondedPrevious30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') AND status IN ('phone-screening', 'technical', 'interview', 'offer', 'rejected') THEN 1 ELSE 0 END)",
    },
    {
      id: "applicationsOfferLast30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day') AND status = 'offer' THEN 1 ELSE 0 END)",
    },
    {
      id: "applicationsOfferPrevious30Days",
      aggregateSql:
        "SUM(CASE WHEN applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day') AND status = 'offer' THEN 1 ELSE 0 END)",
    },
    {
      id: "activePipelineApplications",
      card: {
        title: "Active pipeline",
        description: "Open opportunities excluding offer/rejected",
        icon: "heroicons:queue-list",
        tone: "success",
      },
    },
    {
      id: "responseRate",
      card: {
        title: "Response rate",
        description: "Interview or final outcome after applying",
        icon: "heroicons:presentation-chart-line",
        tone: "success",
        suffix: "%",
        trendLabel: "vs previous 30-day response rate",
        trendValueField: "responseRateDeltaPercent",
        trendToneField: "responseRateDeltaPercent",
        trendValueFormat: "points",
      },
    },
    {
      id: "offerRate",
      card: {
        title: "Offer rate",
        description: "Offers as a share of applied applications",
        icon: "heroicons:hand-thumb-up",
        tone: "success",
        suffix: "%",
        trendLabel: "vs previous 30-day offer rate",
        trendValueField: "offerRateDeltaPercent",
        trendToneField: "offerRateDeltaPercent",
        trendValueFormat: "points",
      },
    },
    {
      id: "rejectionRate",
      card: {
        title: "Rejection rate",
        description: "Rejections as a share of applied applications",
        icon: "heroicons:chart-bar",
        tone: "danger",
        suffix: "%",
      },
    },
  ];
