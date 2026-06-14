import type { SettingRow } from "../settings.factory";

import { STATISTIC_METRIC_IDS } from "../../../src/modules/statistics/domain/constants/statisticMetricIds";

/**
 * Build default stats visibility with all metrics enabled.
 */
// fallow-ignore-next-line code-duplication
function createDefaultStatsVisibility(): Record<
  string,
  { visible: boolean; sortOrder: number; sort_order: number }
> {
  return Object.fromEntries(
    STATISTIC_METRIC_IDS.map((metricId, index) => [
      metricId,
      {
        visible: true,
        sortOrder: index,
        sort_order: index,
      },
    ]),
  );
}

/**
 * Create deterministic production settings row payload.
 */
export function createProductionSettingRow(
  timestamp = "2026-01-01T00:00:00.000Z",
): SettingRow {
  return {
    id: "app-settings",
    theme: "system",
    locale: "en-GB",
    notifications_enabled: 1,
    developer_mode: 0,
    semantic_embedding_provider: "ollama",
    semantic_embedding_model: "bge-small-en",
    semantic_embedding_dimensions: 384,
    semantic_embedding_base_url: "http://127.0.0.1:11434",
    semantic_embedding_api_key: null,
    semantic_enable_sqlite_vec: 1,
    recent_searches: JSON.stringify([]),
    table_column_visibility: JSON.stringify({}),
    stats_visibility: JSON.stringify(createDefaultStatsVisibility()),
    onboarding_completed: 0,
    profile_id: null,
    show_overview: 1,
    created_at: timestamp,
    updated_at: timestamp,
  };
}
