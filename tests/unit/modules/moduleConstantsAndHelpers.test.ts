import {
  APPLICATION_ATTENDANCE_OPTIONS,
  APPLICATION_EMPLOYMENT_OPTIONS,
  APPLICATION_SEARCH_FIELD_OPTIONS,
  APPLICATION_SEARCH_FIELDS,
  APPLICATION_SORTABLE_COLUMN_MAP,
  APPLICATION_SORTABLE_FIELDS,
  APPLICATION_STATUS_OPTIONS,
} from "@modules/applications/constants";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
  ApplicationStatus,
} from "@modules/applications/domain/enums/ApplicationEnums";
import { scrollDrawerContentToTop } from "@modules/applications/presentation/utils/drawerScrollUtils";
import {
  companiesGlobalFilterFields,
  companiesSearchPlaceholder,
  COMPANY_SEARCH_FIELDS,
} from "@modules/companies/constants";
import {
  CONTACT_SEARCH_FIELDS,
  contactsGlobalFilterFields,
  contactsSearchPlaceholder,
} from "@modules/contacts/constants";
import {
  DOCUMENT_SEARCH_FIELDS,
  documentsGlobalFilterFields,
  documentsSearchPlaceholder,
} from "@modules/documents/constants";
import {
  DEFAULT_INTERACTION_STAGE,
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_STAGE_SET,
  EVENT_NOTIFICATION_BODY_PREFIX,
  EVENT_NOTIFICATION_SEVERITY_BY_PREFIX,
  EVENT_NOTIFICATION_SEVERITY_BY_STAGE,
  INTERACTION_STAGES,
  isInteractionStage,
  toInteractionStage,
} from "@modules/events/constants";
import {
  NOTIFICATION_SEARCH_FIELDS,
  notificationsGlobalFilterFields,
  notificationsSearchPlaceholder,
} from "@modules/notifications/constants";
import { defaultSkillOptions } from "@modules/onboarding/constants";
import {
  PROFILE_SEARCH_FIELDS,
  profileGlobalFilterFields,
  profileSearchPlaceholder,
} from "@modules/profile/constants";
import {
  SETTING_SEARCH_FIELDS,
  settingsGlobalFilterFields,
  settingsSearchPlaceholder,
} from "@modules/settings/constants";
import { STATISTIC_METRIC_IDS } from "@modules/statistics/domain/constants/statisticMetricIds";
import {
  TAG_SEARCH_FIELDS,
  tagsGlobalFilterFields,
  tagsSearchPlaceholder,
} from "@modules/tags/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("module constants and helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("defines application search, sort, and select option constants", () => {
    expect(APPLICATION_SEARCH_FIELDS).toEqual([
      "title",
      "status",
      "event_flow_status",
      "attendance_type",
      "location_text",
      "employment_type",
    ]);
    expect(APPLICATION_SEARCH_FIELD_OPTIONS).toEqual([
      { label: "Title", value: "title" },
      { label: "Status", value: "status" },
      { label: "Event Flow", value: "event_flow_status" },
      { label: "Attendance Type", value: "attendance_type" },
      { label: "Employment Type", value: "employment_type" },
      { label: "Location", value: "location_text" },
    ]);
    expect(APPLICATION_SORTABLE_COLUMN_MAP.eventFlowStatus).toBe(
      "event_flow_status",
    );
    expect(APPLICATION_SORTABLE_FIELDS).toEqual([
      "title",
      "status",
      "eventFlowStatus",
      "attendanceType",
      "locationText",
      "priority",
      "employmentType",
      "createdAt",
      "updatedAt",
    ]);
    expect(APPLICATION_STATUS_OPTIONS).toEqual(
      ApplicationStatus.values().map((value) => ({
        label: value.toLabel(),
        value,
      })),
    );
    expect(APPLICATION_ATTENDANCE_OPTIONS).toEqual(
      ApplicationAttendanceType.values().map((value) => ({
        label: value.toLabel(),
        value,
      })),
    );
    expect(APPLICATION_EMPLOYMENT_OPTIONS).toEqual(
      ApplicationEmploymentType.values().map((value) => ({
        label: value.toLabel(),
        value,
      })),
    );
  });

  it("defines module datatable constants for company, contact, document, notification, profile, setting, and tag modules", () => {
    expect(COMPANY_SEARCH_FIELDS).toEqual(["name", "location_text"]);
    expect(companiesGlobalFilterFields).toEqual(["name", "locationText"]);
    expect(companiesSearchPlaceholder).toBe("Search companies");

    expect(CONTACT_SEARCH_FIELDS).toEqual(["full_name", "email", "type"]);
    expect(contactsGlobalFilterFields).toEqual(["fullName", "type", "email"]);
    expect(contactsSearchPlaceholder).toBe("Search contacts");

    expect(DOCUMENT_SEARCH_FIELDS).toEqual(["title", "kind", "file_path"]);
    expect(documentsGlobalFilterFields).toEqual(["title", "kind", "filePath"]);
    expect(documentsSearchPlaceholder).toBe("Search documents");

    expect(NOTIFICATION_SEARCH_FIELDS).toEqual(["title", "body", "severity"]);
    expect(notificationsGlobalFilterFields).toEqual([
      "title",
      "body",
      "severity",
    ]);
    expect(notificationsSearchPlaceholder).toBe("Search notifications");

    expect(PROFILE_SEARCH_FIELDS).toEqual(["full_name", "email", "headline"]);
    expect(profileGlobalFilterFields).toEqual([
      "fullName",
      "email",
      "headline",
    ]);
    expect(profileSearchPlaceholder).toBe("Search profiles");

    expect(SETTING_SEARCH_FIELDS).toEqual(["theme", "locale"]);
    expect(settingsGlobalFilterFields).toEqual(["theme", "locale"]);
    expect(settingsSearchPlaceholder).toBe("Search settings");

    expect(TAG_SEARCH_FIELDS).toEqual(["name", "color"]);
    expect(tagsGlobalFilterFields).toEqual(["name", "color"]);
    expect(tagsSearchPlaceholder).toBe("Search tags");
  });

  it("defines onboarding defaults and statistics metric ids", () => {
    expect(defaultSkillOptions).toContain("TypeScript");
    expect(defaultSkillOptions).toContain("Vue");
    expect(defaultSkillOptions).toHaveLength(15);

    expect(STATISTIC_METRIC_IDS).toEqual([
      "totalApplications",
      "totalAppliedApplications",
      "totalInterviewingApplications",
      "totalOffers",
      "totalRejectedApplications",
      "applicationsCreatedLast30Days",
      "applicationsAppliedLast30Days",
      "activePipelineApplications",
      "responseRate",
      "offerRate",
      "rejectionRate",
      "applicationsCreatedPrevious30Days",
      "applicationsAppliedPrevious30Days",
      "applicationsRespondedLast30Days",
      "applicationsRespondedPrevious30Days",
      "applicationsOfferLast30Days",
      "applicationsOfferPrevious30Days",
    ]);
  });

  it("normalizes and classifies event stages and notification metadata", () => {
    expect(INTERACTION_STAGES[0]).toBe(DEFAULT_INTERACTION_STAGE);
    expect(EVENT_FLOW_STAGE_SET.has("Interview/Technical Interview")).toBe(
      true,
    );
    expect(isInteractionStage("Interview/Technical Interview")).toBe(true);
    expect(isInteractionStage(undefined)).toBe(false);
    expect(isInteractionStage("Unknown")).toBe(false);

    expect(toInteractionStage("  Interview/Panel Interview  ")).toBe(
      "Interview/Panel Interview",
    );
    expect(toInteractionStage(42)).toBe(DEFAULT_INTERACTION_STAGE);
    expect(toInteractionStage("Unknown", "Decision/Rejected")).toBe(
      "Decision/Rejected",
    );

    expect(EVENT_COPY_BY_STAGE["Application/Saved"].title).toBe(
      "Application saved",
    );
    expect(EVENT_COPY_BY_STAGE["Decision/Rejected"].description).toContain(
      "process concluded",
    );
    expect(
      EVENT_NOTIFICATION_SEVERITY_BY_STAGE["Assessment/Take-home Assignment"],
    ).toBe("warning");
    expect(EVENT_NOTIFICATION_SEVERITY_BY_STAGE["Decision/Accepted"]).toBe(
      "success",
    );
    expect(EVENT_NOTIFICATION_SEVERITY_BY_PREFIX).toEqual([
      { prefix: "Offer/", severity: "success" },
      { prefix: "Post-Offer/", severity: "success" },
      { prefix: "Assessment/", severity: "warning" },
    ]);
    expect(EVENT_NOTIFICATION_BODY_PREFIX).toBe("Flow update");
  });

  it("scrolls drawer content to the top only when a drawer content element exists", () => {
    const drawerRoot = document.createElement("div");
    drawerRoot.className = "application-drawer";
    const drawerContent = document.createElement("div");
    drawerContent.className = "p-drawer-content";
    const scrollTo = vi.fn();
    Object.defineProperty(drawerContent, "scrollTo", {
      value: scrollTo,
      configurable: true,
    });
    drawerRoot.appendChild(drawerContent);
    document.body.appendChild(drawerRoot);

    scrollDrawerContentToTop("application-drawer");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    scrollTo.mockClear();
    scrollDrawerContentToTop("missing-drawer");
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
