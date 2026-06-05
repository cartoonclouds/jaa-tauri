/**
 * Base error for seed/factory scripts.
 */
export class FactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * Raised when sqlite URL or path settings are invalid.
 */
export class FactoryConfigurationError extends FactoryError {}

/**
 * Raised when required seed schema/tables are missing.
 */
export class FactoryDatabaseError extends FactoryError {}

/**
 * Raised when generated seed data violates expected invariants.
 */
export class FactoryDataError extends FactoryError {}
