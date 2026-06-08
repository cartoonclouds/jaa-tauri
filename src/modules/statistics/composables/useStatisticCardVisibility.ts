import type { MetricVisibilityBuckets } from "@modules/statistics/types";

import { getSetting, setSetting } from "@modules/settings";
import { ref } from "vue";

interface StatsVisibilityMeta {
  visible: boolean;
  sortOrder?: number | null;
}

type StatsVisibilityEntry = boolean | StatsVisibilityMeta;

/**
 * Encapsulates card edit mode and persisted visibility state.
 */
export function useStatisticCardVisibility() {
  const isEditMode = ref(false);
  const isPersistingVisibility = ref(false);
  const statsVisibility = ref<Record<string, StatsVisibilityEntry>>({});

  function toEntryVisible(entry: StatsVisibilityEntry | undefined): boolean {
    if (typeof entry === "boolean") {
      return entry;
    }

    return entry?.visible ?? true;
  }

  function toEntrySortOrder(
    entry: StatsVisibilityEntry | undefined,
  ): number | null {
    if (!entry || typeof entry === "boolean") {
      return null;
    }

    if (
      typeof entry.sortOrder === "number" &&
      Number.isInteger(entry.sortOrder)
    ) {
      return entry.sortOrder;
    }

    return null;
  }

  /**
   * Loads persisted stat visibility from settings.
   */
  async function loadStatsVisibility(): Promise<void> {
    const persisted = await getSetting("statsVisibility");
    statsVisibility.value = persisted;
  }

  /**
   * Persists visibility for a specific metric id.
   */
  async function setMetricVisibility(
    metricId: string,
    visible: boolean,
    metricIdsOnScreen: string[],
  ): Promise<void> {
    const updated = {
      ...statsVisibility.value,
    } as Record<string, StatsVisibilityEntry>;

    metricIdsOnScreen.forEach((currentMetricId, index) => {
      const currentEntry = updated[currentMetricId];
      const hasPersistedVisibility = Object.prototype.hasOwnProperty.call(
        updated,
        currentMetricId,
      );

      if (!hasPersistedVisibility) {
        updated[currentMetricId] = {
          visible: true,
          sortOrder: index,
        };
        return;
      }

      updated[currentMetricId] = {
        visible: toEntryVisible(currentEntry),
        sortOrder: index,
      };
    });

    const selectedMetricSortOrder = metricIdsOnScreen.indexOf(metricId);
    const hasSelectedMetricEntry = Object.prototype.hasOwnProperty.call(
      updated,
      metricId,
    );
    const currentSelectedEntry = hasSelectedMetricEntry
      ? updated[metricId]
      : undefined;
    const selectedEntrySortOrder = toEntrySortOrder(currentSelectedEntry);

    updated[metricId] = {
      visible,
      sortOrder:
        selectedMetricSortOrder >= 0
          ? selectedMetricSortOrder
          : (selectedEntrySortOrder ?? null),
    };

    statsVisibility.value = updated;
    isPersistingVisibility.value = true;

    try {
      await setSetting("statsVisibility", updated);
    } finally {
      isPersistingVisibility.value = false;
    }
  }

  /**
   * Persists explicit sort ordering for metric ids.
   */
  async function setMetricOrder(metricIdsInOrder: string[]): Promise<void> {
    if (metricIdsInOrder.length === 0) {
      return;
    }

    const updated = {
      ...statsVisibility.value,
    } as Record<string, StatsVisibilityEntry>;

    metricIdsInOrder.forEach((metricId, index) => {
      const currentEntry = updated[metricId];
      updated[metricId] = {
        visible: toEntryVisible(currentEntry),
        sortOrder: index,
      };
    });

    statsVisibility.value = updated;
    isPersistingVisibility.value = true;

    try {
      await setSetting("statsVisibility", updated);
    } finally {
      isPersistingVisibility.value = false;
    }
  }

  /**
   * Splits a metric list into visible and hidden buckets in one pass.
   */
  function splitByVisibility<TMetric extends { id: string }>(
    metrics: TMetric[],
  ): MetricVisibilityBuckets<TMetric> {
    return metrics.reduce<MetricVisibilityBuckets<TMetric>>(
      (accumulator, metric) => {
        // Metrics are visible by default; only an explicit false hides them.
        const hasPersistedVisibility = Object.prototype.hasOwnProperty.call(
          statsVisibility.value,
          metric.id,
        );

        if (
          hasPersistedVisibility &&
          !toEntryVisible(statsVisibility.value[metric.id])
        ) {
          accumulator.hidden.push(metric);
        } else {
          accumulator.visible.push(metric);
        }

        return accumulator;
      },
      {
        visible: [],
        hidden: [],
      },
    );
  }

  /**
   * Toggles edit mode state.
   */
  function toggleEditMode(): void {
    isEditMode.value = !isEditMode.value;
  }

  return {
    isEditMode,
    isPersistingVisibility,
    loadStatsVisibility,
    setMetricOrder,
    setMetricVisibility,
    splitByVisibility,
    statsVisibility,
    toggleEditMode,
  };
}
