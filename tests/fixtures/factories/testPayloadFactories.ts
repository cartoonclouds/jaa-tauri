import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type {
  CompanyCreatePayload,
  CompanyUpdatePayload,
} from "@modules/companies/types";
import type {
  ContactCreatePayload,
  ContactUpdatePayload,
} from "@modules/contacts/repositories/ContactRepository";
import type { DocumentCreatePayload } from "@modules/documents/types";
import type {
  EventCreatePayload,
  EventUpdatePayload,
} from "@modules/events/types";
import type { NotificationCreatePayload } from "@modules/notifications/types";
import type { ProfileCreatePayload } from "@modules/profile/types";
import type { SettingUpsertPayload } from "@modules/settings/types";
import type { TagCreatePayload } from "@modules/tags/types";

import { ApplicationStatus } from "@modules/applications/domain/enums/ApplicationEnums";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";

/** Build a default application create payload with optional overrides. */
export function buildApplicationCreatePayload(
  overrides: Partial<ApplicationCreatePayload> = {},
): ApplicationCreatePayload {
  return {
    title: "Frontend Engineer",
    ...overrides,
  };
}

/** Build a default application update payload with optional overrides. */
export function buildApplicationUpdatePayload(
  overrides: Partial<ApplicationUpdatePayload> = {},
): ApplicationUpdatePayload {
  return {
    id: "app-1",
    companyId: null,
    title: "Frontend Engineer",
    status: ApplicationStatus.Applied,
    sourceUrl: null,
    appliedAt: null,
    locationText: null,
    locationLat: null,
    locationLng: null,
    attendanceType: null,
    employmentType: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    description: null,
    interviewProcess: null,
    benefits: null,
    tagIds: [],
    priority: 3,
    isArchived: false,
    ...overrides,
  };
}

/** Build a mock application row for mapper tests with optional overrides. */
export function buildApplicationRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = new Date().toISOString();

  return {
    id: "app-1",
    company_id: null,
    title: "Frontend Engineer",
    status: "applied",
    event_flow_status: "offer",
    source_url: null,
    applied_at: now,
    location_text: null,
    location_lat: null,
    location_lng: null,
    attendance_type: "remote",
    employment_type: "full-time",
    salary_min: null,
    salary_max: null,
    currency: null,
    description: null,
    interview_process: null,
    benefits: null,
    priority: 3,
    is_archived: 0,
    deleted_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/** Build a mock profile row for mapper tests with optional overrides. */
export function buildProfileRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    full_name: "Jane Doe",
    email: "jane@example.com",
    phone: null,
    linkedin_url: null,
    github_url: null,
    portfolio_url: null,
    headline: "Frontend Engineer",
    summary: null,
    location_text: null,
    desired_salary: 120000,
    salary_currency: "USD",
    preferred_locations: '["Berlin"]',
    remote_preference: "flexible",
    skills: '["Vue","TypeScript"]',
    work_eligibility: "EU",
    notice_period_days: 30,
    interview_availability: "Weekdays",
    created_at: new Date("2026-05-20T10:15:30.000Z"),
    updated_at: new Date("2026-05-20T10:20:30.000Z"),
    ...overrides,
  };
}

/** Build a lightweight associated-application row for company repository tests. */
export function buildCompanyAssociatedApplicationRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    id: "app-1",
    title: "Frontend Engineer",
    status: "offer",
    applied_at: "2026-05-01T10:00:00.000Z",
    ...overrides,
  };
}

/** Build a default company create payload with optional overrides. */
export function buildCompanyCreatePayload(
  overrides: Partial<CompanyCreatePayload> = {},
): CompanyCreatePayload {
  return {
    name: "Acme Ltd",
    locationText: null,
    locationLat: null,
    locationLng: null,
    ...overrides,
  };
}

/** Build a default company update payload with optional overrides. */
export function buildCompanyUpdatePayload(
  overrides: Partial<CompanyUpdatePayload> = {},
): CompanyUpdatePayload {
  return {
    id: "company-1",
    name: "Acme Ltd",
    locationText: null,
    locationLat: null,
    locationLng: null,
    ...overrides,
  };
}

/** Build a default contact create payload with optional overrides. */
export function buildContactCreatePayload(
  overrides: Partial<ContactCreatePayload> = {},
): ContactCreatePayload {
  return {
    companyId: null,
    fullName: "Jane Recruiter",
    type: "recruiter",
    email: null,
    phone: null,
    linkedinUrl: null,
    locationText: null,
    locationLat: null,
    locationLng: null,
    notes: null,
    ...overrides,
  };
}

/** Build a default contact update payload with optional overrides. */
export function buildContactUpdatePayload(
  overrides: Partial<ContactUpdatePayload> = {},
): ContactUpdatePayload {
  return {
    id: "contact-1",
    locationText: null,
    locationLat: null,
    locationLng: null,
    ...overrides,
  };
}

/** Build a default document create payload with optional overrides. */
export function buildDocumentCreatePayload(
  overrides: Partial<DocumentCreatePayload> = {},
): DocumentCreatePayload {
  return {
    title: "CV",
    kind: "cv",
    filePath: "/docs/cv.pdf",
    mimeType: null,
    sizeBytes: null,
    checksum: null,
    ...overrides,
  };
}

/** Build a default event create payload with optional overrides. */
export function buildEventCreatePayload(
  overrides: Partial<EventCreatePayload> = {},
): EventCreatePayload {
  return {
    applicationId: "11111111-1111-4111-8111-111111111111",
    type: "Interview/Technical Interview",
    title: "Tech interview",
    description: null,
    ...overrides,
  };
}

/** Build a default event update payload with optional overrides. */
export function buildEventUpdatePayload(
  overrides: Partial<EventUpdatePayload> = {},
): EventUpdatePayload {
  return {
    id: "11111111-1111-4111-8111-111111111111::Interview/Technical Interview",
    ...overrides,
  };
}

/** Build a default notification create payload with optional overrides. */
export function buildNotificationCreatePayload(
  overrides: Partial<NotificationCreatePayload> = {},
): NotificationCreatePayload {
  return {
    applicationId: null,
    eventId: null,
    severity: "info",
    title: "Reminder",
    body: "Follow up tomorrow",
    isRead: false,
    scheduledFor: null,
    sentAt: null,
    ...overrides,
  };
}

/** Build a default profile create payload with optional overrides. */
export function buildProfileCreatePayload(
  overrides: Partial<ProfileCreatePayload> = {},
): ProfileCreatePayload {
  return {
    fullName: "John Doe",
    ...overrides,
  };
}

/** Build a default setting upsert payload with optional overrides. */
export function buildSettingUpsertPayload(
  overrides: Partial<SettingUpsertPayload> = {},
): SettingUpsertPayload {
  return {
    ...overrides,
  };
}

/** Build a settings DTO shape returned by settings persistence helpers. */
export function buildSettingsDto(
  overrides: Partial<{
    theme: "light" | "dark" | "auto";
    notificationsEnabled: boolean;
    developerMode: boolean;
    recentSearches: string[];
    tableColumnVisibility: Record<string, boolean>;
    statsVisibility: Record<string, boolean>;
    onboardingCompleted: boolean;
  }> = {},
): {
  theme: "light" | "dark" | "auto";
  notificationsEnabled: boolean;
  developerMode: boolean;
  recentSearches: string[];
  tableColumnVisibility: Record<string, boolean>;
  statsVisibility: Record<string, boolean>;
  onboardingCompleted: boolean;
} {
  return {
    theme: "light",
    notificationsEnabled: true,
    developerMode: false,
    recentSearches: [],
    tableColumnVisibility: {},
    statsVisibility: {},
    onboardingCompleted: false,
    ...overrides,
  };
}

/** Build a raw settings row shape consumed by settings persistence mapping. */
export function buildSettingsRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    id: "app-settings",
    theme: "auto",
    locale: "en-GB",
    notifications_enabled: 1,
    developer_mode: 0,
    recent_searches: "[]",
    table_column_visibility: "{}",
    stats_visibility: "{}",
    onboarding_completed: 0,
    profile_id: null,
    ...overrides,
  };
}

/** Build a default tag create payload with optional overrides. */
export function buildTagCreatePayload(
  overrides: Partial<TagCreatePayload> = {},
): TagCreatePayload {
  return {
    name: "urgent",
    color: null,
    modelType: TagModelType.General,
    ...overrides,
  };
}
