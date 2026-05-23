import * as applicationDatatableFields from "../../modules/applications/constants/applicationDatatableFields";
import * as applicationFormOptions from "../../modules/applications/presentation/constants/applicationFormOptions";
import * as companyDatatableFields from "../../modules/companies/constants/companyDatatableFields";
import * as companyDatatablePresentation from "../../modules/companies/presentation/constants/companyDatatable";
import * as contactDatatableFields from "../../modules/contacts/constants/contactDatatableFields";
import * as contactDatatablePresentation from "../../modules/contacts/presentation/constants/contactDatatable";
import * as documentDatatableFields from "../../modules/documents/constants/documentDatatableFields";
import * as documentDatatablePresentation from "../../modules/documents/presentation/constants/documentDatatable";
import * as interactionStageConstants from "../../modules/events/domain/constants/interactionStage";
import * as interactionStagePresentationConstants from "../../modules/events/presentation/constants/interactionStages";
import * as notificationDatatableFields from "../../modules/notifications/constants/notificationDatatableFields";
import * as notificationDatatablePresentation from "../../modules/notifications/presentation/constants/notificationDatatable";
import * as onboardingDefaultSkillOptions from "../../modules/onboarding/presentation/constants/defaultSkillOptions";
import * as profileDatatableFields from "../../modules/profile/constants/profileDatatableFields";
import * as profileDatatablePresentation from "../../modules/profile/presentation/constants/profileDatatable";
import * as settingDatatableFields from "../../modules/settings/constants/settingDatatableFields";
import * as settingDatatablePresentation from "../../modules/settings/presentation/constants/settingDatatable";
import * as tagDatatableFields from "../../modules/tags/constants/tagDatatableFields";
import * as tagDatatablePresentation from "../../modules/tags/presentation/constants/tagDatatable";

export interface PersistedConstantRow {
  settingsLabel: string;
  type: string;
  value: string;
  label: string | null;
}

type ConstantModule = Record<string, unknown>;

interface ConstantModuleSource {
  namespace: string;
  module: ConstantModule;
}

const CONSTANT_MODULE_SOURCES: ConstantModuleSource[] = [
  {
    namespace: "applications.constants.applicationDatatableFields",
    module: applicationDatatableFields,
  },
  {
    namespace: "applications.presentation.constants.applicationFormOptions",
    module: applicationFormOptions,
  },
  {
    namespace: "companies.constants.companyDatatableFields",
    module: companyDatatableFields,
  },
  {
    namespace: "companies.presentation.constants.companyDatatable",
    module: companyDatatablePresentation,
  },
  {
    namespace: "contacts.constants.contactDatatableFields",
    module: contactDatatableFields,
  },
  {
    namespace: "contacts.presentation.constants.contactDatatable",
    module: contactDatatablePresentation,
  },
  {
    namespace: "documents.constants.documentDatatableFields",
    module: documentDatatableFields,
  },
  {
    namespace: "documents.presentation.constants.documentDatatable",
    module: documentDatatablePresentation,
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
    namespace: "notifications.constants.notificationDatatableFields",
    module: notificationDatatableFields,
  },
  {
    namespace: "notifications.presentation.constants.notificationDatatable",
    module: notificationDatatablePresentation,
  },
  {
    namespace: "onboarding.presentation.constants.defaultSkillOptions",
    module: onboardingDefaultSkillOptions,
  },
  {
    namespace: "profile.constants.profileDatatableFields",
    module: profileDatatableFields,
  },
  {
    namespace: "profile.presentation.constants.profileDatatable",
    module: profileDatatablePresentation,
  },
  {
    namespace: "settings.constants.settingDatatableFields",
    module: settingDatatableFields,
  },
  {
    namespace: "settings.presentation.constants.settingDatatable",
    module: settingDatatablePresentation,
  },
  {
    namespace: "tags.constants.tagDatatableFields",
    module: tagDatatableFields,
  },
  {
    namespace: "tags.presentation.constants.tagDatatable",
    module: tagDatatablePresentation,
  },
];

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
      settingsLabel,
      type,
      value: serializeConstantValue(stripEmbeddedLabel(entry)),
      label: toConstantLabel(entry),
    }));
  }

  return [
    {
      settingsLabel,
      type,
      value: serializeConstantValue(stripEmbeddedLabel(value)),
      label: toConstantLabel(value),
    },
  ];
}

/**
 * Create deterministic rows for constants persisted in the database.
 */
export function createPersistedConstantRows(): PersistedConstantRow[] {
  const seen = new Set<string>();
  const rows: PersistedConstantRow[] = [];

  for (const source of CONSTANT_MODULE_SOURCES) {
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
