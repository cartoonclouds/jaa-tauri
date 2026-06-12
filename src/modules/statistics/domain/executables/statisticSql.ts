/**
 * SQL expression resolving an application's effective stage type.
 */
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

/**
 * SQL predicate identifying interviewing stage applications.
 */
export const INTERVIEWING_STAGE_PREDICATE_SQL = `(
  ${EFFECTIVE_STAGE_TYPE_SQL} = 'Screening/Phone Screen'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Interview/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Assessment/%'
)`;

/**
 * SQL predicate identifying offer stage applications.
 */
export const OFFER_STAGE_PREDICATE_SQL = `(
  ${EFFECTIVE_STAGE_TYPE_SQL} = 'Decision/Accepted'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Offer/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Negotiation/%'
  OR ${EFFECTIVE_STAGE_TYPE_SQL} LIKE 'Post-Offer/%'
)`;

/**
 * SQL predicate identifying rejected applications.
 */
export const REJECTED_STAGE_PREDICATE_SQL = `${EFFECTIVE_STAGE_TYPE_SQL} = 'Decision/Rejected'`;

/**
 * SQL predicate identifying applications that reached a response stage.
 */
export const RESPONDED_STAGE_PREDICATE_SQL = `(
  ${INTERVIEWING_STAGE_PREDICATE_SQL}
  OR ${OFFER_STAGE_PREDICATE_SQL}
  OR ${REJECTED_STAGE_PREDICATE_SQL}
)`;

/**
 * SQL predicate for last-30-day applied cohorts.
 */
export const LAST_30_DAYS_APPLIED_SQL =
  "applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-30 day')";

/**
 * SQL predicate for previous-30-day applied cohorts.
 */
export const PREVIOUS_30_DAYS_APPLIED_SQL =
  "applied_at IS NOT NULL AND datetime(applied_at) >= datetime('now', '-60 day') AND datetime(applied_at) < datetime('now', '-30 day')";
