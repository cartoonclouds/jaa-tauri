import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";
import { mapContactRowToEntity } from "@modules/contacts/application/mappers/mapContactRow";
import { mapDocumentRowToEntity } from "@modules/documents/application/mappers/mapDocumentRow";
import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import { mapNotificationRowToEntity } from "@modules/notifications/application/mappers/mapNotificationRow";
import { mapProfileRowToEntity } from "@modules/profile/application/mappers/mapProfileRow";
import { mapSettingRowToEntity } from "@modules/settings/repositories/mappers/mapSettingRow";
import { mapInsightRowToEntity } from "@modules/insights/application/mappers/mapInsightRow";
import { mapTagRowToEntity } from "@modules/tags/application/mappers/mapTagRow";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import { describe, expect, it } from "vitest";

import {
  buildCompanyRow,
  buildContactRow,
  buildDocumentRow,
  buildEventRow,
  buildNotificationRow,
  buildProfileRow,
  buildSettingsRow,
  buildInsightRow,
  buildTagRow,
} from "../../fixtures/factories/testPayloadFactories";

describe("module row mappers", () => {
  it("maps company rows", () => {
    const entity = mapCompanyRowToEntity(buildCompanyRow());

    expect(entity.name).toBe("Acme Ltd");
    expect(entity.websiteUrl).toBe("https://acme.example");
    expect(entity.tagIds).toEqual([]);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it("maps contact rows with literal fallback", () => {
    const entity = mapContactRowToEntity(buildContactRow());
    expect(entity.type).toBe("recruiter");

    const fallbackEntity = mapContactRowToEntity(
      buildContactRow({ type: "unknown" }),
    );
    expect(fallbackEntity.type).toBe("company");
  });

  it("maps document rows", () => {
    const entity = mapDocumentRowToEntity(buildDocumentRow());
    expect(entity.mimeType).toBe("application/pdf");
    expect(entity.sizeBytes).toBe(1024);
  });

  it("maps event rows and falls back to the default interaction stage", () => {
    const entity = mapEventRowToEntity(buildEventRow());
    expect(entity.type).toBe("Interview/Technical Interview");
    expect(entity.sortOrder).toBe(2);

    const fallbackEntity = mapEventRowToEntity(
      buildEventRow({ type: "Unknown", sort_order: "bad", event_at: null }),
    );
    expect(fallbackEntity.type).toBe("Application/Saved");
    expect(fallbackEntity.sortOrder).toBe(0);
    expect(fallbackEntity.eventAt).toBeNull();
  });

  it("maps notification rows with aliased severity fallback", () => {
    const entity = mapNotificationRowToEntity(
      buildNotificationRow({ severity: "warn" }),
    );
    expect(entity.severity).toBe("warning");

    const fallbackEntity = mapNotificationRowToEntity(
      buildNotificationRow({ severity: 42, is_read: 1 }),
    );
    expect(fallbackEntity.severity).toBe("info");
    expect(fallbackEntity.isRead).toBe(true);
  });

  it("maps profile rows and normalizes parsed arrays and literal fallbacks", () => {
    const entity = mapProfileRowToEntity(buildProfileRow());
    expect(entity.preferredLocations).toEqual(["Berlin"]);
    expect(entity.skills).toEqual(["Vue", "TypeScript"]);
    expect(entity.remotePreference).toBe("flexible");

    const fallbackEntity = mapProfileRowToEntity(
      buildProfileRow({
        preferred_locations: "invalid-json",
        skills: ["Vue", 1],
        remote_preference: "unknown",
        salary_currency: null,
        work_eligibility: null,
        interview_availability: null,
      }),
    );
    expect(fallbackEntity.preferredLocations).toEqual([]);
    expect(fallbackEntity.skills).toEqual(["Vue"]);
    expect(fallbackEntity.remotePreference).toBe("flexible");
    expect(fallbackEntity.salaryCurrency).toBe("USD");
    expect(fallbackEntity.workEligibility).toBe("");
    expect(fallbackEntity.interviewAvailability).toBe("");
  });

  it("maps settings rows with boolean and theme fallbacks", () => {
    const entity = mapSettingRowToEntity(buildSettingsRow());
    expect(entity.theme).toBe("system");
    expect(entity.notificationsEnabled).toBe(true);

    const fallbackEntity = mapSettingRowToEntity(
      buildSettingsRow({
        theme: "unsupported",
        notifications_enabled: null,
        developer_mode: 1,
      }),
    );
    expect(fallbackEntity.theme).toBe("system");
    expect(fallbackEntity.notificationsEnabled).toBe(true);
    expect(fallbackEntity.developerMode).toBe(true);
  });

  it("maps insight rows and throws on invalid numeric values", () => {
    const entity = mapInsightRowToEntity(buildInsightRow());
    expect(entity.value).toBe(12);
    expect(entity.scope).toBe("global");

    expect(() =>
      mapInsightRowToEntity(
        buildInsightRow({ value: "bad", scope: "weird" }),
      ),
    ).toThrow();
  });

  it("maps tag rows with enum fallback", () => {
    const entity = mapTagRowToEntity(buildTagRow({ model_type: "company" }));
    expect(entity.modelType).toBe(TagModelType.Company);

    const fallbackEntity = mapTagRowToEntity(buildTagRow({ model_type: null }));
    expect(fallbackEntity.modelType).toBe(TagModelType.General);
  });
});

