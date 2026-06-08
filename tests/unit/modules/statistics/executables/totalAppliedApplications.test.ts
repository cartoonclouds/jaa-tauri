import { TotalAppliedApplications } from "@modules/statistics/domain/executables/totalAppliedApplications";
import { createFailingDb, createMockDb } from "../../../shared/utils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TotalAppliedApplications", () => {
  it("returns count and populates trend fields", async () => {
    const { db } = createMockDb([{ totalAppliedApplications: 13 }]);
    const executable = new TotalAppliedApplications(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(13);

    const view = executable.toView();
    expect(view.id).toBe(TotalAppliedApplications.id);
    expect(view.value).toBe(13);
    expect(view.trendLabel).toBe("Change vs total applications");
    expect(view.trendValue).toBe("+13%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new TotalAppliedApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});

