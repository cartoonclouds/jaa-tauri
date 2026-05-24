import {
  CONSTANT_MODULE_SOURCES,
  createPersistedConstantRowsFromSources,
  type PersistedConstantRow,
} from "../../../src/shared/constants/persistedConstants";

/**
 * Persisted constant row payload for production bootstrap.
 */
export type ProductionConstantRow = PersistedConstantRow;

/**
 * Create deterministic production rows for persisted constants.
 */
export function createProductionConstantRows(): ProductionConstantRow[] {
  return createPersistedConstantRowsFromSources(CONSTANT_MODULE_SOURCES);
}
