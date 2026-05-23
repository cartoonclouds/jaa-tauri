import type { StatisticsOverview } from "@modules/statistics/repositories/StatisticRepository";

import { useStatisticService } from "@modules/statistics";
import { onMounted, ref } from "vue";

const STATISTICS_AUTO_REFRESH_MS = 5_000;

/**
 * Creates statistic composable.
 */
function createStatisticComposable() {
  const service = useStatisticService();
  const isLoading = ref(false);
  const error = ref<unknown>(null);
  const overview = ref<StatisticsOverview>({
    totalApplications: 0,
    totalAppliedApplications: 0,
    totalInterviewingApplications: 0,
    totalOffers: 0,
    totalRejectedApplications: 0,
    applicationsCreatedLast30Days: 0,
    applicationsAppliedLast30Days: 0,
    applicationsCreatedPrevious30Days: 0,
    applicationsAppliedPrevious30Days: 0,
    applicationsRespondedLast30Days: 0,
    applicationsRespondedPrevious30Days: 0,
    applicationsOfferLast30Days: 0,
    applicationsOfferPrevious30Days: 0,
    activePipelineApplications: 0,
    responseRate: 0,
    offerRate: 0,
    rejectionRate: 0,
    applicationsCreatedDelta30Days: 0,
    applicationsAppliedDelta30Days: 0,
    applicationsCreatedDeltaPercent: 0,
    applicationsAppliedDeltaPercent: 0,
    responseRateLast30Days: 0,
    responseRatePrevious30Days: 0,
    responseRateDeltaPercent: 0,
    offerRateLast30Days: 0,
    offerRatePrevious30Days: 0,
    offerRateDeltaPercent: 0,
  });

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








