import type { StatisticCardMetricDefinition } from "../entities/Statistic";

/**
 * Represents an executable statistics class that will calculate a specific statistic metric when executed.
 */
export interface IExecutable<T = unknown> {
  execute(): Promise<T>;
  toView(): StatisticCardMetricDefinition;
}
