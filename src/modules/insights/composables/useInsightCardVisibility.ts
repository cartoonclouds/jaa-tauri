import type { MetricVisibilityBuckets } from "@modules/insights/types";
import type {
  InsightsVisibilityMap,
  InsightVisibilityState,
} from "@modules/settings/types";

import { getSetting, setSetting } from "@modules/settings";
import { ref } from "vue";

interface InsightVisibilityMeta {
  visible: boolean;
  sortOrder?: number | null;
}

type InsightVisibilityEntry = boolean | InsightVisibilityMeta;

/**
 * Normalize persisted visibility entries to metadata shape.
 */
function normalizeEntry(
  entry: InsightVisibilityEntry | undefined,
): InsightVisibilityMeta {
  if (typeof entry === "boolean") {
    return { visible: entry };
  }

  if (entry && typeof entry === "object") {
    return {
      visible: entry.visible,
      sortOrder: entry.sortOrder ?? null,
    };
  }

  return { visible: true };
}

/**
 * Create settings-backed visibility state and helpers for insight cards.
 */
function createInsightCardVisibilityComposable() {
  const isEditMode = ref(false);
  const isPersistingVisibility = ref(false);
  const insightsVisibility = ref<InsightsVisibilityMap>({});

  async function loadInsightsVisibility(): Promise<void> {
    const value = await getSetting("insightsVisibility");
    insightsVisibility.value = value ?? {};
  }

  function splitByVisibility<TMetric extends { id: string }>(
    metrics: TMetric[],
  ): MetricVisibilityBuckets<TMetric> {
    const visible: TMetric[] = [];
    const hidden: TMetric[] = [];

    const orderById = new Map<string, number>();
    Object.entries(insightsVisibility.value).forEach(([metricId, entry]) => {
      const normalized = normalizeEntry(entry);
      if (typeof normalized.sortOrder === "number") {
        orderById.set(metricId, normalized.sortOrder);
      }
    });

    const sorted = [...metrics].sort((left, right) => {
      const leftOrder = orderById.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = orderById.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });

    sorted.forEach((metric) => {
      const normalized = normalizeEntry(insightsVisibility.value[metric.id]);

      if (normalized.visible) {
        visible.push(metric);
      } else {
        hidden.push(metric);
      }
    });

    return { visible, hidden };
  }

  async function persistInsightsVisibility(
    nextVisibility: InsightsVisibilityMap,
  ): Promise<void> {
    isPersistingVisibility.value = true;

    try {
      await setSetting("insightsVisibility", nextVisibility);
      insightsVisibility.value = nextVisibility;
    } finally {
      isPersistingVisibility.value = false;
    }
  }

  async function setMetricOrder(orderedMetricIds: string[]): Promise<void> {
    const nextVisibility: InsightsVisibilityMap = {
      ...insightsVisibility.value,
    };

    orderedMetricIds.forEach((metricId, index) => {
      const existing = normalizeEntry(nextVisibility[metricId]);
      const nextEntry: InsightVisibilityState = {
        visible: existing.visible,
        sortOrder: index,
      };
      nextVisibility[metricId] = nextEntry;
    });

    await persistInsightsVisibility(nextVisibility);
  }

  async function setMetricVisibility(
    metricId: string,
    visible: boolean,
    orderedMetricIds?: string[],
  ): Promise<void> {
    const nextVisibility: InsightsVisibilityMap = {
      ...insightsVisibility.value,
    };

    const previous = normalizeEntry(nextVisibility[metricId]);

    const explicitSortOrder = orderedMetricIds?.findIndex(
      (id) => id === metricId,
    );
    const sortOrder =
      explicitSortOrder !== undefined && explicitSortOrder >= 0
        ? explicitSortOrder
        : (previous.sortOrder ?? null);

    nextVisibility[metricId] = {
      visible,
      sortOrder,
    };

    await persistInsightsVisibility(nextVisibility);
  }

  function toggleEditMode(): void {
    isEditMode.value = !isEditMode.value;
  }

  return {
    insightsVisibility,
    isEditMode,
    isPersistingVisibility,
    loadInsightsVisibility,
    setMetricOrder,
    setMetricVisibility,
    splitByVisibility,
    toggleEditMode,
  };
}

/**
 * Type alias for insight card visibility composable.
 */
type InsightCardVisibilityComposable = ReturnType<
  typeof createInsightCardVisibilityComposable
>;

let insightCardVisibilityComposableInstance: InsightCardVisibilityComposable | null =
  null;

/**
 * Shared composable for insight card visibility and ordering.
 */
export function useInsightCardVisibility(): InsightCardVisibilityComposable {
  insightCardVisibilityComposableInstance ??=
    createInsightCardVisibilityComposable();

  return insightCardVisibilityComposableInstance;
}
