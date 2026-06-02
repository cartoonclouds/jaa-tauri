import { ApplicationsCreatedLast30Days } from "@modules/statistics/domain/executables/applicationsCreatedLast30Days";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsCreatedLast30Days", () => {
  it("computes value and positive trend percentage", async () => {
    const { db } = createMockDb([
      {
        applicationsCreatedLast30Days: 12,
        applicationsCreatedPrevious30Days: 6,
      },
    ]);
    const executable = new ApplicationsCreatedLast30Days(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(12);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsCreatedLast30Days.id);
    expect(view.value).toBe(12);
    expect(view.trendValue).toBe("+100%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsCreatedLast30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
