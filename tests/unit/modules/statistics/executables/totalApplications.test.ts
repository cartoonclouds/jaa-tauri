import { TotalApplications } from "@modules/statistics/domain/executables/totalApplications";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TotalApplications", () => {
  it("returns count and populates card view", async () => {
    const { db, selectMock } = createMockDb([{ totalApplications: 42 }]);
    const executable = new TotalApplications(db);

    expect(executable.toView().trendValue).toBeUndefined();

    await expect(executable.execute()).resolves.toBe(42);

    expect(selectMock).toHaveBeenCalledOnce();

    const view = executable.toView();
    expect(view.id).toBe(TotalApplications.id);
    expect(view.value).toBe(42);
    expect(view.trendValue).toBe("+42%");
    expect(view.trendTone).toBe("positive");
  });

  it("propagates database errors", async () => {
    const executable = new TotalApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
