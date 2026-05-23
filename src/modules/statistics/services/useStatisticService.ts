import { StatisticRepository } from "@modules/statistics/repositories/StatisticRepository";
import { StatisticService } from "@modules/statistics/services/StatisticService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let statisticServiceInstance: StatisticService | null = null;

/**
 * Create a singleton statistic service backed by the Nuxt database provider.
 */
export function useStatisticService(): StatisticService {
  if (!statisticServiceInstance) {
    const database = getNuxtDatabase();
    statisticServiceInstance = new StatisticService(
      new StatisticRepository(database),
    );
  }

  return statisticServiceInstance;
}



