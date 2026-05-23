import {
  createPersistedConstantRows,
  type PersistedConstantRow,
} from "../../src/shared/constants/persistedConstants";

type ConstantRow = PersistedConstantRow;

/**
 * Create deterministic rows for app constants that should be persisted.
 */
export function createConstantRows(): ConstantRow[] {
  return createPersistedConstantRows();
}
