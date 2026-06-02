import { ApplicationsAppliedLast30Days } from "@modules/statistics/domain/executables/applicationsAppliedLast30Days";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("ApplicationsAppliedLast30Days", () => {
  it("computes value and negative trend percentage", async () => {
    const { db } = createMockDb([
      {
        applicationsAppliedLast30Days: 5,
        applicationsAppliedPrevious30Days: 10,
      },
    ]);
    const executable = new ApplicationsAppliedLast30Days(db);

    expect(executable.toView().trendValue).toBe("0%");

    await expect(executable.execute()).resolves.toBe(5);

    const view = executable.toView();
    expect(view.id).toBe(ApplicationsAppliedLast30Days.id);
    expect(view.value).toBe(5);
    expect(view.trendValue).toBe("-50%");
    expect(view.trendTone).toBe("negative");
  });

  it("propagates database errors", async () => {
    const executable = new ApplicationsAppliedLast30Days(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
