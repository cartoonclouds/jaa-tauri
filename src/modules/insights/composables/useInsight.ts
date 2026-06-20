import type { IMetric } from "@modules/insights/domain/types/metric";

import { InsightRepository } from "@modules/insights/repositories/InsightRepository";
import { InsightService } from "@modules/insights/services/InsightService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";
import { onBeforeUnmount, onMounted, ref } from "vue";

const INSIGHTS_AUTO_REFRESH_MS = 5_000;

function createInsightService(): InsightService {
  const database = getNuxtDatabase();
  return new InsightService(new InsightRepository(database));
}

let insightServiceInstance: InsightService | null = null;

function getInsightService(): InsightService {
  insightServiceInstance ??= createInsightService();

  return insightServiceInstance;
}

/**
 * Create state and handlers for the insights overview.
 */
function createInsightComposable() {
  const service = getInsightService();
  const overview = ref<IMetric[]>([]);
  const isLoading = ref(false);

  let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  async function refreshOverview(): Promise<void> {
    isLoading.value = true;

    try {
      overview.value = await service.getOverview();
    } finally {
      isLoading.value = false;
    }
  }

  function startAutoRefresh(): void {
    if (refreshIntervalId !== null) {
      return;
    }

    refreshIntervalId = setInterval(() => {
      void refreshOverview();
    }, INSIGHTS_AUTO_REFRESH_MS);
  }

  function stopAutoRefresh(): void {
    if (refreshIntervalId === null) {
      return;
    }

    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }

  onMounted(() => {
    void refreshOverview();
    startAutoRefresh();
  });

  onBeforeUnmount(() => {
    stopAutoRefresh();
  });

  return {
    overview,
    isLoading,
    refreshOverview,
  };
}

/**
 * Type alias for insight composable.
 */
type InsightComposable = ReturnType<typeof createInsightComposable>;

let insightComposableInstance: InsightComposable | null = null;

/**
 * Shared composable for dashboard insight metrics.
 */
export function useInsight(): InsightComposable {
  insightComposableInstance ??= createInsightComposable();

  return insightComposableInstance;
}
