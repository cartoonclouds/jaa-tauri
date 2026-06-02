import { ApplicationsCreatedPrevious30Days } from "@modules/statistics/domain/executables/applicationsCreatedPrevious30Days";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsCreatedPrevious30Days", () => {
  it("returns count and neutral trend for zero", async () => {
    const { db } = createMockDb([{ applicationsCreatedPrevious30Days: null }]);
    const executable = new ApplicationsCreatedPrevious30Days(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(0);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsCreatedPrevious30Days.id);
    expect(view.value).toBe(0);
    expect(view.trendTone).toBe("neutral");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsCreatedPrevious30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
