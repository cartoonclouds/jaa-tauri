import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { describe, expect, it } from "vitest";

import { InMemoryDriver } from "@/services/database/InMemoryDriver";

describe("applications module scaffold", () => {
  it("throws when company name is empty on create", () => {
    const service = new ApplicationService(new InMemoryDriver());

    expect(() =>
      service.createApplication({
        companyNameSnapshot: "  ",
        jobTitle: "Frontend Engineer",
      }),
    ).toThrow("Company name is required");
  });

  it("throws when job title is empty on update", () => {
    const service = new ApplicationService(new InMemoryDriver());

    expect(() =>
      service.updateApplication({
        id: "app-1",
        jobTitle: "   ",
      }),
    ).toThrow("Job title cannot be empty");
  });
});
