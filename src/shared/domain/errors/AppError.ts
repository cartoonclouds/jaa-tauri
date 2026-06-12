/**
 * Optional metadata used by custom application errors.
 */
export interface AppErrorOptions {
  cause?: unknown;
  code?: string;
}

/**
 * Base application error with optional cause and stable code metadata.
 */
class AppError extends Error {
  readonly code?: string;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.code = options.code;

    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

/**
 * Raised when user input or schema validation fails.
 */
export class ValidationError extends AppError {}

/**
 * Raised when runtime configuration is missing or invalid.
 */
export class ConfigurationError extends AppError {}

/**
 * Raised when code runs in an unsupported runtime environment.
 */
export class RuntimeEnvironmentError extends AppError {}

/**
 * Raised for database connectivity, migration, or persistence failures.
 */
export class DatabaseError extends AppError {}
