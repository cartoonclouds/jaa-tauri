import { TotalInterviewingApplications } from "@modules/statistics/domain/executables/totalInterviewingApplications";
import { createFailingDb, createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("TotalInterviewingApplications", () => {
  it("returns count and neutral trend for zero", async () => {
    const { db } = createMockDb([{ totalInterviewingApplications: "invalid" }]);
    const executable = new TotalInterviewingApplications(db);

    const initialView = executable.toView();
    expect(initialView.value).toBe(0);
    expect(initialView.trendTone).toBe("neutral");

    await expect(executable.execute()).resolves.toBe(0);

    const view = executable.toView();
    expect(view.id).toBe(TotalInterviewingApplications.id);
    expect(view.value).toBe(0);
    expect(view.trendTone).toBe("neutral");
  });

  it("propagates database errors", async () => {
    const executable = new TotalInterviewingApplications(
      createFailingDb(new Error("select failed")),
    );

    await expect(executable.execute()).rejects.toThrow("select failed");
  });
});
