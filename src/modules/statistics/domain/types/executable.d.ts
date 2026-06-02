import type { StatisticCardMetricDefinition } from "../entities/Statistic";
import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

/**
 * Represents an executable statistics class that will calculate a specific statistic metric when executed.
 */
export interface IExecutable<T = unknown> {
  execute(): Promise<T>;
  toView(): StatisticCardMetricDefinition;
}

/**
 * Constructor signature for classes implementing IExecutable, used for type safety in repositories and metric definitions.
 */
export interface ExecutableConstructor {
  new (db: DatabaseDriver): IExecutable;
  id: string;
}
