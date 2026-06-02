import type { ZodType } from "zod";

/**
 * Options for standardized Zod parse error handling.
 */
export interface ParseWithSchemaOptions {
  /** Prefix used when composing full Zod error output. */
  messagePrefix?: string;
  /** Fallback message when no issue message is available. */
  fallbackMessage?: string;
  /** Whether to throw only the first issue message instead of full parse details. */
  useFirstIssueMessage?: boolean;
}

/**
 * Parse unknown input with a Zod schema and throw a normalized Error on failure.
 */
export function parseWithSchema<TOutput>(
  schema: ZodType<TOutput>,
  input: unknown,
  options: ParseWithSchemaOptions = {},
): TOutput {
  const parseResult = schema.safeParse(input);
  if (parseResult.success) {
    return parseResult.data;
  }

  const firstIssueMessage = parseResult.error.issues[0]?.message;

  if (options.useFirstIssueMessage) {
    throw new Error(
      firstIssueMessage ?? options.fallbackMessage ?? "Validation failed",
    );
  }

  const messagePrefix = options.messagePrefix ?? "Validation failed";
  throw new Error(`${messagePrefix}: ${parseResult.error.message}`);
}

/**
 * Trim selected string fields before parsing with a Zod schema.
 */
export function parseTrimmedWithSchema<
  TOutput extends Record<string, unknown>,
  TInput extends Record<string, unknown>,
>(
  schema: ZodType<TOutput>,
  input: TInput,
  trimKeys: readonly (keyof TInput)[],
  options: ParseWithSchemaOptions = {},
): TOutput {
  const normalizedInput: Record<string, unknown> = { ...input };

  for (const key of trimKeys) {
    const keyAsString = String(key);
    const value = normalizedInput[keyAsString];
    if (typeof value === "string") {
      normalizedInput[keyAsString] = value.trim();
    }
  }

  return parseWithSchema(schema, normalizedInput, options);
}
