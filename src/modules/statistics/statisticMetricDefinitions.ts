/**
 * Type alias for statistic card tone.
 */
export type StatisticCardTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";
/**
 * Type alias for statistic trend value format.
 */
export type StatisticTrendValueFormat = "percent" | "points";

/**
 * Defines statistic card definition.
 */
export interface StatisticCardDefinition {
  title: string;
  description: string;
  icon: string;
  tone: StatisticCardTone;
  valueField?: string;
  suffix?: string;
  trendLabel?: string;
  trendValueField?: string;
  trendToneField?: string;
  trendValueFormat?: StatisticTrendValueFormat;
}

/**
 * Defines statistic metric definition.
 */
export interface StatisticMetricDefinition {
  id: string;
  aggregateSql?: string;
  card?: StatisticCardDefinition;
}

const EFFECTIVE_STAGE_TYPE_SQL = `
COALESCE(
  (
    SELECT e.type
    FROM application_events ae
    INNER JOIN events e ON e.id = ae.event_id
    WHERE ae.application_id = applications.id
      AND ae.event_at IS NOT NULL
    ORDER BY ae.sort_order DESC
    LIMIT 1
  ),
  'Application/Saved'
)
`;
const INTERVIEWING_STAGE_PREDICATE_SQL = `(
  ${EFFECTIVE_STAGE_TYPE_SQL} = 'Screening/Phone Screen'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Interview/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Assessment/%'
)`;
const OFFER_STAGE_PREDICATE_SQL = `(
  ${EFFECTIVE_STAGE_TYPE_SQL} = 'Decision/Accepted'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Offer/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Negotiation/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Post-Offer/%'
)`;
const REJECTED_STAGE_PREDICATE_SQL = `${EFFECTIVE_STAGE_TYPE_SQL} = 'Decision/Rejected'`;
const RESPONDED_STAGE_PREDICATE_SQL = `(
  ${INTERVIEWING_STAGE_PREDICATE_SQL}
  OR ${OFFER_STAGE_PREDICATE_SQL}
  OR ${REJECTED_STAGE_PREDICATE_SQL}
)`;
const LAST_30_DAYS_APPLIED_SQL =
  "applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day')";
const PREVIOUS_30_DAYS_APPLIED_SQL =
  "applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day')";

/**
 * Shared single-source metric definitions for repository aggregates and UI cards.
 */
export const STATISTIC_METRIC_DEFINITIONS: readonly StatisticMetricDefinition[] =
  [
    {
      id: "totalInterviewingApplications",
      aggregateSql: `SUM(CASE WHEN ${INTERVIEWING_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
      card: {
        title: "Interviewing",
        description: "Phone screening, technical, and interview",
        icon: "heroicons:chat-bubble-left-right",
        tone: "warning",
      },
    },
    {
      id: "totalOffers",
      aggregateSql: `SUM(CASE WHEN ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
      card: {
        title: "Offers",
        description: "Current opportunities at offer stage",
        icon: "heroicons:star",
        tone: "success",
      },
    },
    {
      id: "totalRejectedApplications",
      aggregateSql: `SUM(CASE WHEN ${REJECTED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
      card: {
        title: "Rejections",
        description: "Applications closed as rejected",
        icon: "heroicons:x-circle",
        tone: "danger",
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
      aggregateSql: `SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
    },
    {
      id: "applicationsRespondedPrevious30Days",
      aggregateSql: `SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} AND ${RESPONDED_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
    },
    {
      id: "applicationsOfferLast30Days",
      aggregateSql: `SUM(CASE WHEN ${LAST_30_DAYS_APPLIED_SQL} AND ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
    },
    {
      id: "applicationsOfferPrevious30Days",
      aggregateSql: `SUM(CASE WHEN ${PREVIOUS_30_DAYS_APPLIED_SQL} AND ${OFFER_STAGE_PREDICATE_SQL} THEN 1 ELSE 0 END)`,
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
