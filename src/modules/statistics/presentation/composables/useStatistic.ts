import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

import { useStatisticService } from "@modules/statistics";
import { ref } from "vue";

function createStatisticComposable() {
  const service = useStatisticService();
  const isLoading = ref(false);
  const error = ref<unknown>(null);
  const overview = ref<StatisticsOverview>({
    totalAppliedApplications: 0,
  });

  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      overview.value = await service.getOverview();
    } catch (caughtError) {
      error.value = caughtError;
      throw caughtError;
    } finally {
      isLoading.value = false;
    }
  }

  void refresh();

  return {
    overview,
    isLoading,
    error,
    refresh,
  };
}

type StatisticComposable = ReturnType<typeof createStatisticComposable>;

let statisticComposableInstance: StatisticComposable | null = null;

/**
 * Create read-only statistics state and handlers.
 */
export function useStatistic() {
  statisticComposableInstance ??= createStatisticComposable();

  return statisticComposableInstance;
}
