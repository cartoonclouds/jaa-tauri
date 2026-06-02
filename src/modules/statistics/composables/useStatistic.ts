import { StatisticRepository } from "@modules/statistics/repositories/StatisticRepository";
import { StatisticService } from "@modules/statistics/services/StatisticService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";
import { onMounted, ref } from "vue";

import { type IExecutable } from "../domain/types/executable";

const STATISTICS_AUTO_REFRESH_MS = 5_000;

function createStatisticService(): StatisticService {
  const database = getNuxtDatabase();
  return new StatisticService(new StatisticRepository(database));
}

let statisticServiceInstance: StatisticService | null = null;

function getStatisticService(): StatisticService {
  statisticServiceInstance ??= createStatisticService();

  return statisticServiceInstance;
}

/**
 * Creates statistic composable.
 */
function createStatisticComposable() {
  const service = getStatisticService();
  const isLoading = ref(false);
  const error = ref<unknown>(null);
  const overview = ref<IExecutable[]>([]);
  
  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      overview.value = await service.getOverview();
    } catch (caughtError) {
      error.value = caughtError;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    overview,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Type alias for statistic composable.
 */
type StatisticComposable = ReturnType<typeof createStatisticComposable>;

let statisticComposableInstance: StatisticComposable | null = null;
let statisticsAutoRefreshTimer: ReturnType<typeof setInterval> | null = null;
let statisticsInitialRefreshStarted = false;

/**
 * Handles start statistics auto refresh.
 */
function startStatisticsAutoRefresh() {
  if (!import.meta.client || statisticsAutoRefreshTimer) {
    return;
  }

  statisticsAutoRefreshTimer = setInterval(() => {
    if (
      !statisticComposableInstance ||
      statisticComposableInstance.isLoading.value
    ) {
      return;
    }

    void statisticComposableInstance.refresh().catch(() => undefined);
  }, STATISTICS_AUTO_REFRESH_MS);
}

/**
 * Create read-only statistics state and handlers.
 */
export function useStatistic() {
  statisticComposableInstance ??= createStatisticComposable();

  onMounted(() => {
    if (!statisticsInitialRefreshStarted) {
      statisticsInitialRefreshStarted = true;
      void statisticComposableInstance?.refresh().catch(() => undefined);
    }

    startStatisticsAutoRefresh();
  });

  return statisticComposableInstance;
}
