import type { StatisticCardMetricDefinition } from "./statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

/**
 * Represents an executable statistics class that will calculate a specific statistic metric when executed.
 */
export interface IMetric {
  /**
   * Execute the logic to calculate the statistic metric. The result will be used for rendering and may also be persisted depending on the repository implementation.
   * @returns The calculated metric value.
   */
  execute(): Promise<number>;
  /**
   * Convert the executed metric into a view definition for presentation in the UI. This typically includes formatting and additional metadata for rendering.
   * @returns The view definition of the executed metric.
   */
  toView(): StatisticCardMetricDefinition;
}

/**
 * Constructor signature for classes implementing IMetric, used for type safety in repositories and metric definitions.
 */
export interface ExecutableConstructor {
  new (db: DatabaseDriver): IMetric;
  id: string;
}
