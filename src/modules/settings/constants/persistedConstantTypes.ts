/**
 * Persisted constants `type` identifiers stored in the `constants` table.
 */
export const PERSISTED_CONSTANT_TYPES = {
  APPLICATION_SEARCH_FIELDS:
    "applications.constants.applicationDatatableFields.APPLICATION_SEARCH_FIELDS",
  APPLICATION_SEARCH_FIELD_OPTIONS:
    "applications.constants.applicationDatatableFields.APPLICATION_SEARCH_FIELD_OPTIONS",
  APPLICATION_SORTABLE_COLUMN_MAP:
    "applications.constants.applicationDatatableFields.APPLICATION_SORTABLE_COLUMN_MAP",
  APPLICATION_SORTABLE_FIELDS:
    "applications.constants.applicationDatatableFields.APPLICATION_SORTABLE_FIELDS",
  APPLICATION_STATUS_OPTIONS:
    "applications.presentation.constants.applicationFormOptions.APPLICATION_STATUS_OPTIONS",
  APPLICATION_ATTENDANCE_OPTIONS:
    "applications.presentation.constants.applicationFormOptions.APPLICATION_ATTENDANCE_OPTIONS",
  APPLICATION_EMPLOYMENT_OPTIONS:
    "applications.presentation.constants.applicationFormOptions.APPLICATION_EMPLOYMENT_OPTIONS",
  COMPANY_SEARCH_FIELDS:
    "companies.constants.companyDatatableFields.COMPANY_SEARCH_FIELDS",
  CONTACT_SEARCH_FIELDS:
    "contacts.constants.contactDatatableFields.CONTACT_SEARCH_FIELDS",
  DOCUMENT_SEARCH_FIELDS:
    "documents.constants.documentDatatableFields.DOCUMENT_SEARCH_FIELDS",
  INTERACTION_STAGES:
    "events.domain.constants.interactionStage.INTERACTION_STAGES",
  DEFAULT_INTERACTION_STAGE:
    "events.domain.constants.interactionStage.DEFAULT_INTERACTION_STAGE",
  EVENT_FLOW_BY_APPLICATION_STATUS:
    "events.presentation.constants.interactionStages.EVENT_FLOW_BY_APPLICATION_STATUS",
  FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS:
    "events.presentation.constants.interactionStages.FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS",
  EVENT_COPY_BY_STAGE:
    "events.presentation.constants.interactionStages.EVENT_COPY_BY_STAGE",
  EVENT_NOTIFICATION_SEVERITY_BY_STAGE:
    "events.presentation.constants.interactionStages.EVENT_NOTIFICATION_SEVERITY_BY_STAGE",
  EVENT_NOTIFICATION_SEVERITY_BY_PREFIX:
    "events.presentation.constants.interactionStages.EVENT_NOTIFICATION_SEVERITY_BY_PREFIX",
  EVENT_NOTIFICATION_BODY_PREFIX:
    "events.presentation.constants.interactionStages.EVENT_NOTIFICATION_BODY_PREFIX",
  NOTIFICATION_SEARCH_FIELDS:
    "notifications.constants.notificationDatatableFields.NOTIFICATION_SEARCH_FIELDS",
  DEFAULT_SKILL_OPTIONS:
    "onboarding.presentation.constants.defaultSkillOptions.defaultSkillOptions",
  PROFILE_SEARCH_FIELDS:
    "profile.constants.profileDatatableFields.PROFILE_SEARCH_FIELDS",
  SETTING_SEARCH_FIELDS:
    "settings.constants.settingDatatableFields.SETTING_SEARCH_FIELDS",
  TAG_SEARCH_FIELDS: "tags.constants.tagDatatableFields.TAG_SEARCH_FIELDS",
} as const;

/**
 * Union of persisted constants `type` identifiers.
 */
export type PersistedConstantType =
  (typeof PERSISTED_CONSTANT_TYPES)[keyof typeof PERSISTED_CONSTANT_TYPES];
