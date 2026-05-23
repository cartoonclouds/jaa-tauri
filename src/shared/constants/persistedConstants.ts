import * as applicationFormOptions from "../../modules/applications/presentation/constants/applicationFormOptions";
import * as interactionStageConstants from "../../modules/events/domain/constants/interactionStage";
import * as interactionStagePresentationConstants from "../../modules/events/presentation/constants/interactionStages";
import * as onboardingDefaultSkillOptions from "../../modules/onboarding/presentation/constants/defaultSkillOptions";

/**
 * Normalized row payload persisted into the constants table.
 */
export interface PersistedConstantRow {
  settings_label: string;
  type: string;
  value: string;
  label: string | null;
  is_visible: 0 | 1;
}

type ConstantModule = Record<string, unknown>;

/**
 * Source module descriptor for collecting constants into persistence rows.
 */
export interface ConstantModuleSource {
  namespace: string;
  module: ConstantModule;
}

/**
 * Canonical list of modules whose constant exports are seeded into persistence.
 */
export const CONSTANT_MODULE_SOURCES = [
  {
    namespace: "applications.presentation.constants.applicationFormOptions",
    module: applicationFormOptions,
  },
  {
    namespace: "events.domain.constants.interactionStage",
    module: interactionStageConstants,
  },
  {
    namespace: "events.presentation.constants.interactionStages",
    module: interactionStagePresentationConstants,
  },
  {
    namespace: "onboarding.presentation.constants.defaultSkillOptions",
    module: onboardingDefaultSkillOptions,
  },
] as const satisfies readonly ConstantModuleSource[];

type ConstantModuleNamespace =
  (typeof CONSTANT_MODULE_SOURCES)[number]["namespace"];

/**
 * Fully-qualified key used to identify a persisted constant source.
 */
export type PersistedConstantSourceType =
  `${ConstantModuleNamespace}.${string}`;

function isPersistableExport(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  const valueType = typeof value;
  return (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean" ||
    valueType === "bigint" ||
    valueType === "object"
  );
}

function toSerializableValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Set) {
      return Array.from(value.values()).map((entry) =>
        toSerializableValue(entry),
      );
    }

    if (value instanceof Map) {
      return Array.from(value.entries()).map(([key, mapValue]) => [
        String(key),
        toSerializableValue(mapValue),
      ]);
    }

    if (
      Object.prototype.hasOwnProperty.call(value, "value") &&
      typeof (value as { value?: unknown }).value === "string"
    ) {
      return (value as { value: string }).value;
    }
  }

  return value;
}

function serializeConstantValue(value: unknown): string {
  const serialized = toSerializableValue(value);

  if (serialized === null) {
    return "null";
  }

  if (
    typeof serialized === "string" ||
    typeof serialized === "number" ||
    typeof serialized === "boolean" ||
    typeof serialized === "bigint"
  ) {
    return String(serialized);
  }

  return JSON.stringify(serialized);
}

function toConstantLabel(value: unknown): string | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value && typeof value === "object") {
    if (
      Object.prototype.hasOwnProperty.call(value, "label") &&
      typeof (value as { label?: unknown }).label === "string"
    ) {
      return (value as { label: string }).label;
    }
  }

  return null;
}

function stripEmbeddedLabel(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;
  if (
    !Object.prototype.hasOwnProperty.call(record, "label") ||
    typeof record.label !== "string"
  ) {
    return value;
  }

  const { label: _label, ...rest } = record;
  return rest;
}

function toConstantRows(
  namespace: string,
  exportName: string,
  value: unknown,
): PersistedConstantRow[] {
  const settingsLabel = exportName
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const type = `${namespace}.${exportName}`;

  if (Array.isArray(value)) {
    return value.map((entry) => ({
      settings_label: settingsLabel,
      type,
      value: serializeConstantValue(stripEmbeddedLabel(entry)),
      label: toConstantLabel(entry),
      is_visible: 1,
    }));
  }

  return [
    {
      settings_label: settingsLabel,
      type,
      value: serializeConstantValue(stripEmbeddedLabel(value)),
      label: toConstantLabel(value),
      is_visible: 1,
    },
  ];
}

/**
 * Create deterministic rows for constants persisted in the database.
 */
export function createPersistedConstantRows(): PersistedConstantRow[] {
  return createPersistedConstantRowsFromSources(CONSTANT_MODULE_SOURCES);
}

/**
 * Create deterministic rows from an explicit list of constant module sources.
 */
export function createPersistedConstantRowsFromSources(
  sources: readonly ConstantModuleSource[],
): PersistedConstantRow[] {
  const seen = new Set<string>();
  const rows: PersistedConstantRow[] = [];

  for (const source of sources) {
    for (const [exportName, value] of Object.entries(source.module)) {
      if (!isPersistableExport(value)) {
        continue;
      }

      const constantRows = toConstantRows(source.namespace, exportName, value);
      for (const row of constantRows) {
        const dedupeKey = `${row.type}::${row.value}`;
        if (seen.has(dedupeKey)) {
          continue;
        }

        seen.add(dedupeKey);
        rows.push(row);
      }
    }
  }

  return rows;
}
