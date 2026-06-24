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
import type { UserProfile } from "@modules/profile/domain/entities/UserProfile";
import type { ProfileCreatePayload } from "@modules/profile/types";
import type { SettingUpsertPayload } from "@modules/settings/types";
import type { TagCreatePayload } from "@modules/tags/types";

import { ApplicationStatus } from "@modules/applications/domain/enums/ApplicationEnums";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import {
  temporalDateFromUnknown,
  temporalNowIsoString,
} from "@shared/utils/temporal";

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
    url: null,
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
  const now = temporalNowIsoString();

  return {
    id: "app-1",
    company_id: null,
    title: "Frontend Engineer",
    status: "applied",
    url: null,
    event_flow_status: "offer",
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
    created_at: temporalDateFromUnknown("2026-05-20T10:15:30.000Z"),
    updated_at: temporalDateFromUnknown("2026-05-20T10:20:30.000Z"),
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

/** Build a mock company row for mapper tests with optional overrides. */
export function buildCompanyRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "company-1",
    name: "Acme Ltd",
    website_url: "https://acme.example",
    linkedin_url: "https://linkedin.com/company/acme",
    industry: "Software",
    size: "51-200",
    location_text: "London",
    location_lat: 51.5072,
    location_lng: -0.1276,
    notes: "Important client",
    created_at: now,
    updated_at: now,
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

/** Build a mock contact row for mapper tests with optional overrides. */
export function buildContactRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "contact-1",
    company_id: "company-1",
    full_name: "Jane Recruiter",
    email: "jane@example.com",
    phone: "+44 20 7946 0958",
    linkedin_url: "https://linkedin.com/in/jane",
    location_text: "London",
    location_lat: 51.5,
    location_lng: -0.12,
    type: "recruiter",
    notes: "Friendly contact",
    created_at: now,
    updated_at: now,
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
    mimeType: "application/pdf",
    sizeBytes: null,
    checksum: null,
    ...overrides,
  };
}

/** Build a mock document row for mapper tests with optional overrides. */
export function buildDocumentRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "550e8400-e29b-41d4-a716-446655440010",
    title: "CV",
    kind: "cv",
    file_path: "/docs/cv.pdf",
    mime_type: "application/pdf",
    size_bytes: 1024,
    checksum: "abc123",
    created_at: now,
    updated_at: now,
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

/** Build a mock event row for mapper tests with optional overrides. */
export function buildEventRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "event-1",
    application_id: "550e8400-e29b-41d4-a716-446655440111",
    sort_order: 2,
    type: "Interview/Technical Interview",
    title: "Tech interview",
    description: "Pair programming round",
    notes: "Bring portfolio",
    event_at: now,
    created_at: now,
    updated_at: now,
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

/** Build a mock notification row for mapper tests with optional overrides. */
export function buildNotificationRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "550e8400-e29b-41d4-a716-446655440020",
    application_id: null,
    event_id: null,
    severity: "info",
    title: "Reminder",
    body: "Follow up tomorrow",
    is_read: 0,
    scheduled_for: now,
    sent_at: null,
    created_at: now,
    updated_at: now,
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

/** Build a default onboarding user profile with optional overrides. */
export function buildUserProfile(
  overrides: Partial<UserProfile> = {},
): UserProfile {
  return {
    fullName: "Jane Doe",
    email: "jane@example.com",
    targetRole: "Frontend Engineer",
    desiredSalary: 120000,
    salaryCurrency: "USD",
    preferredLocations: ["Berlin"],
    remotePreference: "flexible",
    skills: ["Vue", "TypeScript"],
    linkedInUrl: "https://linkedin.com/in/jane-doe",
    githubUrl: "https://github.com/jane-doe",
    workEligibility: "EU",
    noticePeriodDays: 30,
    interviewAvailability: "Weekdays",
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

/** Build a mock insight row for mapper tests with optional overrides. */
export function buildInsightRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "550e8400-e29b-41d4-a716-446655440030",
    name: "Applications submitted",
    value: 12,
    scope: "global",
    recorded_at: now,
    created_at: now,
    updated_at: now,
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
    insightsVisibility: Record<string, boolean>;
    onboardingCompleted: boolean;
  }> = {},
): {
  theme: "light" | "dark" | "auto";
  notificationsEnabled: boolean;
  developerMode: boolean;
  recentSearches: string[];
  tableColumnVisibility: Record<string, boolean>;
  insightsVisibility: Record<string, boolean>;
  onboardingCompleted: boolean;
} {
  return {
    theme: "light",
    notificationsEnabled: true,
    developerMode: false,
    recentSearches: [],
    tableColumnVisibility: {},
    insightsVisibility: {},
    onboardingCompleted: false,
    ...overrides,
  };
}

/** Build a raw settings row shape consumed by settings persistence mapping. */
export function buildSettingsRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

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
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/** Build a mock tag row for mapper tests with optional overrides. */
export function buildTagRow(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  const now = temporalNowIsoString();

  return {
    id: "550e8400-e29b-41d4-a716-446655440040",
    name: "urgent",
    color: "#ef4444",
    model_type: "general",
    created_at: now,
    updated_at: now,
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
